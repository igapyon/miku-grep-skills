import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runSearchJson } from "../skills/miku-grep/lib/cli-runner.mjs";
import { formatSearchResultSummary } from "../skills/miku-grep/lib/result-formatter.mjs";
import { resolveRuntimeArtifactPath } from "../skills/miku-grep/lib/runtime-artifacts.mjs";

test("runs the normal skill workflow from request JSON to visible summary", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-grep-workflow-test-"));
  const javaRuntimePath = path.resolve(resolveRuntimeArtifactPath({ kind: "java" }));

  try {
    fs.mkdirSync(path.join(tempRoot, "src"), { recursive: true });
    fs.writeFileSync(path.join(tempRoot, "src/alpha.txt"), "target one\nplain\n", "utf8");
    fs.writeFileSync(path.join(tempRoot, "src/beta.txt"), "target two\n", "utf8");

    const request = {
      version: 1,
      root: ".",
      query: { type: "literal", text: "target" },
      search: {
        targets: ["content"],
        recursive: true,
        maxDepth: 4,
        includeFileNamePatterns: ["*.txt"]
      },
      output: {
        mode: "summary",
        maxMatches: 10,
        maxSnippetsPerFile: 1
      }
    };

    const result = runSearchJson({
      request,
      runtime: "java",
      cwd: tempRoot,
      javaRuntimePath
    });
    const visibleSummary = formatSearchResultSummary(result.json);

    assert.equal(result.status, 0);
    assert.equal(result.json.ok, true);
    assert.equal(result.json.summary.filesMatched, 2);
    assert.match(visibleSummary, /miku-grep result:/);
    assert.match(visibleSummary, /2 files matched/);
    assert.match(visibleSummary, /src\/alpha\.txt/);
    assert.match(visibleSummary, /src\/beta\.txt/);
    assert.doesNotMatch(visibleSummary, /"matches"/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
