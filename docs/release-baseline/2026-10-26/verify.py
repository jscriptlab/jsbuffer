#!/usr/bin/env python3
"""Verify the frozen audit evidence, without claiming release acceptance."""
import ast
import base64
import hashlib
import json
import pathlib
import re
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
checks = 0


def require(condition, message):
    global checks
    assert condition, message
    checks += 1


for path in HERE.rglob("*.json"):
    json.loads(path.read_text())
    checks += 1
for path in HERE.glob("*.py"):
    ast.parse(path.read_text())
    checks += 1
for entry in json.loads((HERE / "input-provenance.json").read_text()):
    data = (HERE / entry["path"]).read_bytes()
    require(hashlib.sha256(data).hexdigest() == entry["sha256"], entry["path"])
    if "sourceCommit" in entry:
        original = subprocess.check_output(["git", "show", entry["sourceCommit"] + ":" + entry["sourcePath"]], cwd=ROOT)
        require(data == original, "Original input changed: " + entry["path"])
for package in json.loads((HERE / "package-provenance.json").read_text())["packages"]:
    archive = ROOT / package["localAcquisition"]
    if archive.exists():
        data = archive.read_bytes()
        require(hashlib.sha256(data).hexdigest() == package["sha256"], str(archive))
        require(hashlib.sha1(data).hexdigest() == package["verifiedSha1"], str(archive))
        require("sha512-" + base64.b64encode(hashlib.sha512(data).digest()).decode() == package["verifiedSha512"], str(archive))
probes = json.loads((HERE / "reference-probes.json").read_text())
require(len(probes["runs"]) == 27, "Expected 27 bounded probe runs")
require(all(run["exitCode"] == 0 for run in probes["runs"]), "Reference probe failed")
original = next(run for run in probes["runs"] if run["profile"] == "original-1.0.28" and run["scenario"] == "default")
frozen = HERE / "original-default-output"
inventory = {str(p.relative_to(frozen)): {"bytes": p.stat().st_size, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()} for p in frozen.rglob("*") if p.is_file()}
require(inventory == original["files"], "Frozen reference file set or bytes changed")
require(len(inventory) == 24, "Expected 24 original output files")
comparison = next(row for row in probes["comparisons"] if row["scenario"] == "default" and row["comparedToOriginal"] == "candidate-legacy")
require(len(comparison["differentBytes"]) == 12 and not comparison["missing"] and not comparison["extra"], "Measured fidelity baseline changed")
require(json.loads((HERE / "build.json").read_text())["exitCode"] == 0, "Build result changed")
require(json.loads((HERE / "npm-test.json").read_text())["exitCode"] == 1, "Full suite result changed")
require("79 tests passed" in (HERE / "logs/non-native-tests.log").read_text(), "Missing passing count")
require("20 tests skipped" in (HERE / "logs/non-native-tests.log").read_text(), "Missing skipped count")
require((HERE / "logs/metadata-ts-build.log").read_text().count(": error TS") == 190, "Backend diagnostic count changed")
require("ENOENT" in (HERE / "logs/c99-generation-tail.log").read_text(), "Missing formatter failure")
require(json.loads((HERE / "c99-generation-tail.json").read_text())["exitCode"] == 0, "Hidden formatter failure result changed")
for target in re.findall(r"\]\(([^)]+)\)", (HERE / "README.md").read_text()):
    if not target.startswith("https://"):
        require((HERE / target).exists(), "Missing report link: " + target)
require(json.loads((HERE / "contract.json").read_text())["releaseReadiness"] is False, "Audit cannot pass release acceptance")
manifest = HERE / "artifact-manifest.json"
if manifest.exists():
    for item in json.loads(manifest.read_text())["files"]:
        path = HERE / item["path"]
        require(hashlib.sha256(path.read_bytes()).hexdigest() == item["sha256"], "Evidence changed: " + item["path"])
require(not subprocess.check_output(["git", "diff", "--name-only", "--", "package.json", "package-lock.json", "cli", "code-generator", "src", "test", "scripts"], cwd=ROOT).strip(), "Production/test sources changed during audit")
print("Verified", checks, "evidence checks; release acceptance remains open.")
