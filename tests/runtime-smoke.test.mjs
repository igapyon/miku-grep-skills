import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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

test("Java runtime executes args-first text search", () => {
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));
  const tempRoot = createSearchFixture();
  try {
    const output = execFileSync("java", ["-jar", javaRuntimePath, "needle", ".", "--limit", "5"], {
      cwd: tempRoot,
      encoding: "utf8"
    });

    assert.match(output, /matches: 1/);
    assert.match(output, /src\/app\.txt/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("Node.js runtime executes args-first JSON search", () => {
  const nodeRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "node" }));
  const tempRoot = createSearchFixture();
  try {
    const output = execFileSync("node", [nodeRuntimePath, "needle", ".", "--format", "json"], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    const result = JSON.parse(output);

    assert.equal(result.ok, true);
    assert.equal(result.summary.filesMatched, 1);
    assert.equal(result.matches[0].file, "src/app.txt");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("Java runtime executes a structured content search", () => {
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));
  const tempRoot = createSearchFixture();
  try {
    const result = runSearch({
      command: "java",
      args: ["-jar", javaRuntimePath],
      cwd: tempRoot
    });

    assert.equal(result.ok, true);
    assert.equal(result.summary.filesMatched, 1);
    assert.equal(result.summary.matches, 1);
    assert.equal(result.matches[0].file, "src/app.txt");
    assert.deepEqual(result.matches[0].lines, [1]);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("Node.js runtime executes a structured filepath search", () => {
  const nodeRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "node" }));
  const tempRoot = createSearchFixture();
  try {
    const request = {
      version: 1,
      root: ".",
      query: { type: "regex", text: "notes\\.md$" },
      search: { targets: ["filepath"], recursive: true, maxDepth: 4 },
      output: { mode: "detail", maxMatches: 10 }
    };
    const result = runSearch({
      command: "node",
      args: [nodeRuntimePath],
      cwd: tempRoot,
      request
    });

    assert.equal(result.ok, true);
    assert.equal(result.summary.filesMatched, 1);
    assert.equal(result.matches[0].type, "filepath");
    assert.equal(result.matches[0].file, "docs/notes.md");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("runtime returns expected failure JSON for empty query", () => {
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));
  const tempRoot = createSearchFixture();
  try {
    const result = runSearchAllowFailure({
      command: "java",
      args: ["-jar", javaRuntimePath],
      cwd: tempRoot,
      request: {
        version: 1,
        root: ".",
        query: { type: "literal", text: "" },
        search: { targets: ["content"] }
      }
    });

    assert.equal(result.status, 1);
    assert.equal(result.json.ok, false);
    assert.equal(result.json.error.code, "empty_query");
    assert.equal(result.json.diagnostics[0].severity, "error");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("runtime returns expected failure JSON for invalid regex", () => {
  const nodeRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "node" }));
  const tempRoot = createSearchFixture();
  try {
    const result = runSearchAllowFailure({
      command: "node",
      args: [nodeRuntimePath],
      cwd: tempRoot,
      request: {
        version: 1,
        root: ".",
        query: { type: "regex", text: "[" },
        search: { targets: ["content"] }
      }
    });

    assert.equal(result.status, 1);
    assert.equal(result.json.ok, false);
    assert.equal(result.json.error.code, "invalid_regex");
    assert.equal(result.json.diagnostics[0].severity, "error");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("runtime returns expected failure JSON for missing root", () => {
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));
  const tempRoot = createSearchFixture();
  try {
    const result = runSearchAllowFailure({
      command: "java",
      args: ["-jar", javaRuntimePath],
      cwd: tempRoot,
      request: {
        version: 1,
        root: "missing-root",
        query: { type: "literal", text: "needle" },
        search: { targets: ["content"] }
      }
    });

    assert.equal(result.status, 1);
    assert.equal(result.json.ok, false);
    assert.equal(result.json.error.code, "root_not_found");
    assert.equal(result.json.diagnostics[0].severity, "error");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

function createSearchFixture() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-grep-search-test-"));
  fs.mkdirSync(path.join(tempRoot, "src"), { recursive: true });
  fs.mkdirSync(path.join(tempRoot, "docs"), { recursive: true });
  fs.writeFileSync(path.join(tempRoot, "src/app.txt"), "needle alpha\nplain beta\n", "utf8");
  fs.writeFileSync(path.join(tempRoot, "docs/notes.md"), "project notes\n", "utf8");
  return tempRoot;
}

function runSearch({
  command,
  args,
  cwd,
  request = {
    version: 1,
    root: ".",
    query: { type: "literal", text: "needle" },
    search: { targets: ["content"], recursive: true, maxDepth: 4 },
    output: { mode: "summary", maxMatches: 10 }
  }
}) {
  const stdout = execFileSync(command, args, {
    cwd,
    input: `${JSON.stringify(request)}\n`,
    encoding: "utf8"
  });
  return JSON.parse(stdout);
}

function runSearchAllowFailure({
  command,
  args,
  cwd,
  request
}) {
  try {
    const stdout = execFileSync(command, args, {
      cwd,
      input: `${JSON.stringify(request)}\n`,
      encoding: "utf8"
    });
    return {
      status: 0,
      json: JSON.parse(stdout)
    };
  } catch (error) {
    return {
      status: error.status,
      json: JSON.parse(error.stdout)
    };
  }
}
