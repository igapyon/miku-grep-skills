import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import { resolveRuntimeArtifactPath } from "../skills/miku-grep/lib/runtime-artifacts.mjs";

test("Java runtime starts and prints miku-grep version", () => {
  const javaRuntimePath = resolveRuntimeArtifactPath({ kind: "java" });
  const output = execFileSync("java", ["-jar", javaRuntimePath, "--version"], {
    encoding: "utf8"
  });

  assert.match(output, /^miku-grep\s+\d+\.\d+\.\d+/);
});

test("Node.js runtime starts and prints miku-grep version", () => {
  const nodeRuntimePath = resolveRuntimeArtifactPath({ kind: "node" });
  const output = execFileSync("node", [nodeRuntimePath, "--version"], {
    encoding: "utf8"
  });

  assert.match(output, /^miku-grep\s+\d+\.\d+\.\d+/);
});
