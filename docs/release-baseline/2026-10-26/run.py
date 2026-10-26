#!/usr/bin/env python3
"""Run one explicit baseline command with a bounded duration and preserved log."""
import argparse
import datetime
import json
import os
import pathlib
import signal
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument("label")
parser.add_argument("--timeout", type=int, default=300)
parser.add_argument("--node-bin")
parser.add_argument("command", nargs=argparse.REMAINDER)
args = parser.parse_args()
command = args.command[1:] if args.command[:1] == ["--"] else args.command
here = pathlib.Path(__file__).resolve().parent
root = here.parents[2]
env = dict(os.environ)
if args.node_bin:
    env["PATH"] = args.node_bin + os.pathsep + env["PATH"]
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
clock = time.monotonic()
timed_out = False
with (here / "logs" / (args.label + ".log")).open("w") as output:
    process = subprocess.Popen(command, cwd=root, env=env, stdout=output,
                               stderr=subprocess.STDOUT, start_new_session=True)
    try:
        code = process.wait(timeout=args.timeout)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGTERM)
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
        code = None
        timed_out = True
result = {"command": command, "cwd": str(root), "nodeBin": args.node_bin,
          "startedAt": started, "elapsedSeconds": round(time.monotonic() - clock, 3),
          "timeoutSeconds": args.timeout, "timedOut": timed_out,
          "exitCode": code, "status": "passed" if code == 0 else "failed",
          "log": "logs/" + args.label + ".log"}
(here / (args.label + ".json")).write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result), flush=True)
