import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

import { resolveRuntimeArtifactPath } from "../skills/miku-grep/lib/runtime-artifacts.mjs";

const ROOT = process.cwd();
const buildScriptPath = path.resolve(ROOT, "scripts/build-skill-bundle.mjs");

test("builds bundle and runs runtime artifacts from isolated install tree", () => {
  execFileSync("node", [buildScriptPath], {
    cwd: ROOT,
    encoding: "utf8"
  });

  const builtRuntimeRoot = path.resolve(
    ROOT,
    "bundle/miku-grep-skills/skills/miku-grep/runtime"
  );
  assert.ok(fs.existsSync(resolveRuntimeArtifactPath({
    kind: "java",
    runtimeRoot: builtRuntimeRoot
  })));
  assert.ok(fs.existsSync(resolveRuntimeArtifactPath({
    kind: "node",
    runtimeRoot: builtRuntimeRoot
  })));

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-grep-bundle-test-"));
  try {
    const isolatedSkillRoot = path.resolve(tempRoot, "skills");
    fs.cpSync(path.resolve(ROOT, "bundle/miku-grep-skills/skills"), isolatedSkillRoot, {
      recursive: true
    });

    const isolatedRuntimeRoot = path.resolve(isolatedSkillRoot, "miku-grep/runtime");
    const isolatedJavaRuntimePath = resolveRuntimeArtifactPath({
      kind: "java",
      runtimeRoot: isolatedRuntimeRoot
    });
    const isolatedNodeRuntimePath = resolveRuntimeArtifactPath({
      kind: "node",
      runtimeRoot: isolatedRuntimeRoot
    });

    const javaVersion = execFileSync("java", ["-jar", isolatedJavaRuntimePath, "--version"], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    const nodeVersion = execFileSync("node", [isolatedNodeRuntimePath, "--version"], {
      cwd: tempRoot,
      encoding: "utf8"
    });

    assert.match(javaVersion, /^miku-grep\s+\d+\.\d+\.\d+/);
    assert.match(nodeVersion, /^miku-grep\s+\d+\.\d+\.\d+/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
