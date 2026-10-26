#!/usr/bin/env python3
"""Bounded reference probes, not the metadata-backend acceptance harness."""
import hashlib
import json
import os
import pathlib
import shutil
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
NODE = ROOT / ".audit-vq38/toolchains/node-v20.17.0-darwin-arm64/bin/node"
WORK = ROOT / ".audit-vq38/probe-work"
RESULTS = ROOT / ".audit-vq38/probe-results"
profiles = {
    "original-1.0.28": ROOT / ".audit-vq38/oracles/1.0.28/node_modules/jsbuffer/cli/index.js",
    "later-1.0.40": ROOT / ".audit-vq38/oracles/1.0.40/node_modules/jsbuffer/cli/index.js",
    "candidate-legacy": ROOT / "cli/index.js",
}
scenarios = {
    "default": [],
    "indent2": ["--indentation-size", "2"],
    "sort": ["--sort-properties"],
    "unique-name": ["--unique-name-property-name", "kind"],
    "no-tsconfig": ["--no-ts-config"],
    "extends-parent": ["--extends", "base.json"],
    "extends-sibling": ["--extends", "config/base.json"],
    "extends-same-directory": ["--extends", "output/base.json"],
    "wire-names": [],
}


def files(directory):
    return {str(p.relative_to(directory)): {
        "bytes": p.stat().st_size, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()
    } for p in sorted(directory.rglob("*")) if p.is_file()}


if __name__ == "__main__":
    provenance = json.loads((HERE / "package-provenance.json").read_text())
    for package in provenance["packages"]:
        tarball = ROOT / package["localAcquisition"]
        assert hashlib.sha256(tarball.read_bytes()).hexdigest() == package["sha256"], tarball
    results = []
    for profile, cli in profiles.items():
        for scenario, flags in scenarios.items():
            if WORK.exists():
                shutil.rmtree(WORK)
            shutil.copytree(HERE / "inputs/original-1x", WORK / "source")
            shutil.copy(HERE / "inputs/WireNames.jsb", WORK / "source/WireNames.jsb")
            output = WORK / ("schema" if scenario == "default" else "output")
            main = "source/WireNames.jsb" if scenario == "wire-names" else "source/schema"
            preexisting = []
            if scenario.startswith("extends-"):
                config = WORK / flags[1]
                config.parent.mkdir(parents=True, exist_ok=True)
                config.write_bytes(b'{"compilerOptions":{"target":"ES2020"}}\n')
                if config.parent == output:
                    preexisting.append(config.name)
            command = [str(NODE), str(cli), main]
            if scenario != "default":
                command += ["-o", "output"]
            command += flags
            env = dict(os.environ)
            env["PATH"] = str(NODE.parent) + os.pathsep + env["PATH"]
            run = subprocess.run(command, cwd=WORK, env=env, capture_output=True, timeout=30)
            destination = RESULTS / profile / scenario
            destination.mkdir(parents=True, exist_ok=True)
            (destination / "stdout.log").write_bytes(run.stdout)
            (destination / "stderr.log").write_bytes(run.stderr)
            manifest = files(output) if output.exists() else {}
            for name in preexisting:
                del manifest[name]
            side_effect = WORK / "source/jsbufferconfig.json"
            row = {"profile": profile, "scenario": scenario, "command": command,
                   "exitCode": run.returncode, "files": manifest,
                   "preexistingOutputInputs": preexisting,
                   "cliSideEffect": side_effect.read_text() if side_effect.exists() else None,
                   "tsconfig": (output / "tsconfig.json").read_text() if (output / "tsconfig.json").exists() else None}
            results.append(row)
            if output.exists():
                shutil.copytree(output, destination / "output", dirs_exist_ok=True)
            if profile == "original-1.0.28" and scenario == "default" and run.returncode == 0:
                frozen = HERE / "original-default-output"
                if frozen.exists():
                    assert files(frozen) == manifest, "Frozen original output changed; preserve and investigate the mismatch."
                else:
                    shutil.copytree(output, frozen)
            print(profile, scenario, "exit", run.returncode, "files", len(manifest), flush=True)
    comparisons = []
    for scenario in scenarios:
        original = next(r for r in results if r["profile"] == "original-1.0.28" and r["scenario"] == scenario)
        for profile in ["later-1.0.40", "candidate-legacy"]:
            other = next(r for r in results if r["profile"] == profile and r["scenario"] == scenario)
            left, right = original["files"], other["files"]
            comparisons.append({"scenario": scenario, "comparedToOriginal": profile,
                                "bothExitedZero": original["exitCode"] == other["exitCode"] == 0,
                                "missing": sorted(left.keys() - right.keys()),
                                "extra": sorted(right.keys() - left.keys()),
                                "differentBytes": sorted(k for k in left.keys() & right.keys() if left[k] != right[k])})
    (HERE / "reference-probes.json").write_text(json.dumps({"runs": results, "comparisons": comparisons}, indent=2) + "\n")
