import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  resolveRuntimeArtifact,
  resolveRuntimeArtifactPath
} from "../skills/miku-grep/lib/runtime-artifacts.mjs";

test("resolves newest runtime artifacts by file-name version", () => {
  const java = resolveRuntimeArtifact({ kind: "java" });
  const node = resolveRuntimeArtifact({ kind: "node" });
  const javaSources = resolveRuntimeArtifact({ kind: "java-sources" });
  const nodeSources = resolveRuntimeArtifact({ kind: "node-sources" });

  assert.equal(java.name, "miku-grep-0.9.0.jar");
  assert.equal(node.name, "miku-grep-0.9.0.2.mjs");
  assert.equal(javaSources.name, "miku-grep-sources-0.9.0.jar");
  assert.equal(nodeSources.name, "miku-grep-sources-0.9.0.2.tgz");
  assert.equal(resolveRuntimeArtifactPath({ kind: "java" }), java.path);
});

test("throws when an artifact kind is missing", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-grep-runtime-test-"));
  try {
    assert.throws(
      () => resolveRuntimeArtifact({ kind: "java", runtimeRoot: tempRoot }),
      /missing Java runtime artifact/
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
