import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const ROOT = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8"));
const zipPath = path.resolve(ROOT, `bundle/igapyon-miku-grep-skills-${packageJson.version}.zip`);

test("release zip contains skill files and excludes development-only files", () => {
  execFileSync("npm", ["run", "build:bundle:zip"], {
    cwd: ROOT,
    encoding: "utf8"
  });

  assert.equal(fs.existsSync(zipPath), true);

  const entries = execFileSync("unzip", ["-Z1", zipPath], {
    cwd: ROOT,
    encoding: "utf8"
  }).trim().split(/\n/).filter(Boolean);

  assertIncludes(entries, "skills/miku-grep/SKILL.md");
  assertIncludes(entries, "skills/miku-grep/references/INDEX.md");
  assertIncludes(entries, "skills/miku-grep/references/runtime/operations-map.md");
  assertIncludes(entries, "skills/miku-grep/lib/runtime-artifacts.mjs");
  assertIncludes(entries, "skills/miku-grep/lib/backend-policy.mjs");
  assertIncludes(entries, "skills/miku-grep/lib/backend-operations.mjs");
  assertIncludes(entries, "skills/miku-grep/lib/cli-runner.mjs");
  assertIncludes(entries, "skills/miku-grep/lib/result-formatter.mjs");
  assertIncludes(entries, "skills/miku-grep/runtime/miku-grep-0.5.0.3.jar");
  assertIncludes(entries, "skills/miku-grep/runtime/miku-grep-0.5.0.2.mjs");

  assert.equal(entries.some((entry) => entry.includes(".DS_Store")), false);
  assert.equal(entries.some((entry) => entry.startsWith("tests/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("docs/")), false);
  assert.equal(entries.some((entry) => entry.startsWith("bundle/")), false);
  assert.equal(entries.some((entry) => entry.includes("node_modules/")), false);
});

function assertIncludes(entries, expected) {
  assert.ok(entries.includes(expected), `missing zip entry: ${expected}`);
}
