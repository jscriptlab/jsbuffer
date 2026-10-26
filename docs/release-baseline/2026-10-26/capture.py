#!/usr/bin/env python3
"""Capture read-only release baseline evidence; does not publish or update refs."""
import base64
import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def save(name, value):
    (HERE / name).write_text(json.dumps(value, indent=2) + "\n")


def command(args):
    p = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, timeout=60)
    return {"command": args, "exitCode": p.returncode,
            "stdout": p.stdout, "stderr": p.stderr}


def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read()


if __name__ == "__main__":
    save("snapshot.json", {
        "observedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "candidate": command(["git", "rev-parse", "HEAD"]),
        "remoteRefs": command(["git", "ls-remote", "--heads", "--tags", "origin"]),
        "prs": command(["gh", "pr", "list", "--repo", "jscriptlab/jsbuffer",
                        "--state", "all", "--limit", "60", "--json",
                        "number,title,state,url,baseRefName,headRefName,headRefOid,mergeCommit,mergedAt,mergeable,mergeStateStatus,statusCheckRollup"]),
        "tools": {name: {"path": shutil.which(name),
                         "version": command([name, flag]) if shutil.which(name) else None}
                  for name, flag in [("node", "--version"), ("npm", "--version"),
                                     ("clang", "--version"), ("clang++", "--version"),
                                     ("gcc", "--version"), ("g++", "--version"),
                                     ("cmake", "--version"), ("ctest", "--version"),
                                     ("clang-format", "--version"), ("avr-gcc", "--version"),
                                     ("simavr", "--help"), ("kotlinc", "-version"),
                                     ("java", "-version")]},
    })
    registry_url = "https://registry.npmjs.org/jsbuffer"
    raw = fetch(registry_url)
    (HERE / "registry-original.json").write_bytes(raw)
    registry = json.loads(raw)
    versions = ["1.0.2", "1.0.28", "1.0.40", registry["dist-tags"]["latest"]]
    packages = []
    oracle_dir = ROOT / ".audit-vq38/oracles"
    oracle_dir.mkdir(parents=True, exist_ok=True)
    for version in dict.fromkeys(versions):
        metadata = registry["versions"][version]
        dist = metadata["dist"]
        tarball = fetch(dist["tarball"])
        integrity = "sha512-" + base64.b64encode(hashlib.sha512(tarball).digest()).decode()
        sha1 = hashlib.sha1(tarball).hexdigest()
        assert integrity == dist["integrity"], version
        assert sha1 == dist["shasum"], version
        filename = "jsbuffer-" + version + ".tgz"
        (oracle_dir / filename).write_bytes(tarball)
        packages.append({"name": "jsbuffer", "version": version,
                         "registryGitHead": metadata.get("gitHead"),
                         "publishedAt": registry["time"][version],
                         "dist": dist, "acquiredBytes": len(tarball),
                         "sha256": hashlib.sha256(tarball).hexdigest(),
                         "verifiedSha512": integrity, "verifiedSha1": sha1,
                         "localAcquisition": ".audit-vq38/oracles/" + filename,
                         "gitHeadAvailable": command(["git", "cat-file", "-t", metadata["gitHead"]])})
    save("package-provenance.json", {
        "registryUrl": registry_url, "registrySnapshotSha256": hashlib.sha256(raw).hexdigest(),
        "distTags": registry["dist-tags"], "packages": packages,
        "limits": "Hashes establish acquired package identity. Registry gitHead is publisher metadata; it is not an independent build attestation. Source-map and generation comparisons are recorded separately."
    })
    print("Captured refs, PRs, tools, registry bytes and verified", len(packages), "tarballs.")
