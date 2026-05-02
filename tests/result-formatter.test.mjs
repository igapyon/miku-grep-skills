import assert from "node:assert/strict";
import test from "node:test";

import { formatSearchResultSummary } from "../skills/miku-grep/lib/result-formatter.mjs";

test("formats successful file-summary result concisely", () => {
  const text = formatSearchResultSummary({
    ok: true,
    summary: {
      filesVisited: 12,
      filesMatched: 1,
      matches: 2,
      truncated: false
    },
    matches: [
      {
        type: "file",
        file: "src/app.txt",
        lines: [1, 3],
        matchCount: 2,
        snippets: [
          { line: 1, text: "needle alpha" },
          { line: 3, text: "needle gamma" }
        ]
      }
    ],
    diagnostics: []
  });

  assert.match(text, /1 files matched/);
  assert.match(text, /2 matches/);
  assert.match(text, /src\/app\.txt - lines 1, 3 - 2 matches/);
  assert.match(text, /src\/app\.txt:1: needle alpha/);
});

test("formats failure result with error and diagnostics", () => {
  const text = formatSearchResultSummary({
    ok: false,
    error: {
      code: "empty_query",
      message: "query.text must not be empty"
    },
    summary: {
      diagnostics: 1
    },
    matches: [],
    diagnostics: [
      {
        severity: "error",
        code: "empty_query",
        message: "query.text must not be empty"
      }
    ]
  });

  assert.match(text, /miku-grep failed: empty_query/);
  assert.match(text, /query\.text must not be empty/);
  assert.match(text, /Errors: 1/);
});

test("reports truncation and limits file count", () => {
  const text = formatSearchResultSummary({
    ok: true,
    summary: {
      filesVisited: 20,
      filesMatched: 2,
      matches: 2,
      truncated: true,
      truncatedReason: "max_matches"
    },
    matches: [
      { type: "file", file: "a.txt", lines: [1], matchCount: 1, snippets: [] },
      { type: "file", file: "b.txt", lines: [2], matchCount: 1, snippets: [] }
    ],
    diagnostics: [
      { severity: "warning", code: "max_matches", message: "maximum matches reached" }
    ]
  }, { maxFiles: 1 });

  assert.match(text, /Warning: result truncated \(max_matches\)/);
  assert.match(text, /a\.txt/);
  assert.doesNotMatch(text, /b\.txt - lines/);
  assert.match(text, /1 more matched files omitted/);
  assert.match(text, /Warnings: 1/);
});
