import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  runCliOperation,
  runSearchJson
} from "../skills/miku-grep/lib/cli-runner.mjs";
import { formatSearchResultSummary } from "../skills/miku-grep/lib/result-formatter.mjs";
import { resolveRuntimeArtifactPath } from "../skills/miku-grep/lib/runtime-artifacts.mjs";

test("runs search operation through file paths", () => {
  const tempRoot = createSearchFixture();
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));
  const requestPath = path.join(tempRoot, "request.json");
  const resultPath = path.join(tempRoot, "result.json");

  fs.writeFileSync(requestPath, `${JSON.stringify(defaultRequest())}\n`, "utf8");

  try {
    const result = runCliOperation({
      operation: "search",
      runtime: "java",
      inputPath: requestPath,
      outputPath: resultPath,
      cwd: tempRoot,
      javaRuntimePath
    });
    const parsed = JSON.parse(fs.readFileSync(resultPath, "utf8"));

    assert.equal(result.status, 0);
    assert.equal(result.stdoutPath, resultPath);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.matches[0].file, "src/app.txt");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("keeps Java and Node.js result shape aligned for the same request", () => {
  const tempRoot = createSearchFixture();
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));
  const nodeRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "node" }));

  try {
    const javaResult = runSearchJson({
      request: defaultRequest(),
      runtime: "java",
      cwd: tempRoot,
      javaRuntimePath
    });
    const nodeResult = runSearchJson({
      request: defaultRequest(),
      runtime: "node",
      cwd: tempRoot,
      nodeRuntimePath
    });

    assert.equal(javaResult.status, 0);
    assert.equal(nodeResult.status, 0);
    assert.deepEqual(normalizeResult(javaResult.json), normalizeResult(nodeResult.json));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("formats runner JSON result into an agent-facing summary", () => {
  const tempRoot = createSearchFixture();
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));

  try {
    const result = runSearchJson({
      request: defaultRequest(),
      runtime: "java",
      cwd: tempRoot,
      javaRuntimePath
    });
    const summary = formatSearchResultSummary(result.json);

    assert.equal(result.status, 0);
    assert.match(summary, /miku-grep result:/);
    assert.match(summary, /1 files matched/);
    assert.match(summary, /src\/app\.txt/);
    assert.doesNotMatch(summary, /"effectiveRequest"/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

function createSearchFixture() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-grep-runner-test-"));
  fs.mkdirSync(path.join(tempRoot, "src"), { recursive: true });
  fs.writeFileSync(path.join(tempRoot, "src/app.txt"), "needle alpha\nplain beta\n", "utf8");
  fs.writeFileSync(path.join(tempRoot, "src/other.txt"), "plain gamma\n", "utf8");
  return tempRoot;
}

function defaultRequest() {
  return {
    version: 1,
    root: ".",
    query: { type: "literal", text: "needle" },
    search: {
      targets: ["content"],
      recursive: true,
      maxDepth: 4,
      includeFileNamePatterns: ["*.txt"]
    },
    output: { mode: "summary", maxMatches: 10 }
  };
}

function normalizeResult(result) {
  return {
    ok: result.ok,
    error: result.error,
    filesMatched: result.summary.filesMatched,
    matches: result.summary.matches,
    firstMatch: {
      type: result.matches[0]?.type,
      file: result.matches[0]?.file,
      matchTypes: result.matches[0]?.matchTypes,
      lines: result.matches[0]?.lines,
      matchCount: result.matches[0]?.matchCount
    }
  };
}
