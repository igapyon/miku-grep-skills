import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const docs = {
  readme: read("README.md"),
  skill: read("skills/miku-grep/SKILL.md"),
  quickstart: read("docs/quickstart.md"),
  development: read("docs/development.md"),
  operationsMap: read("skills/miku-grep/references/runtime/operations-map.md"),
  workflow: read("skills/miku-grep/references/workflow/search-workflow.md")
};

test("documents consistently declare CLI and handoff policies without MCP policies", () => {
  for (const [name, text] of Object.entries(docs)) {
    assert.match(text, /cli-preferred|CLI|runtime|miku-grep/, `${name} should mention runtime usage`);
    assert.doesNotMatch(text, /mcp-only|mcp-preferred/, `${name} must not document MCP backend policies`);
  }

  for (const policy of ["cli-only", "cli-preferred", "handoff-only"]) {
    assert.match(docs.skill, new RegExp(policy), `SKILL.md should mention ${policy}`);
    assert.match(docs.quickstart, new RegExp(policy), `quickstart should mention ${policy}`);
  }
});

test("documents consistently use the expected runtime artifact names", () => {
  const expected = [
    "miku-grep-<version>.jar",
    "miku-grep-<version>.mjs"
  ];

  for (const artifact of expected) {
    assert.match(docs.readme, new RegExp(escapeRegExp(artifact)));
    assert.match(docs.quickstart, new RegExp(escapeRegExp(artifact)));
    assert.match(docs.operationsMap, new RegExp(escapeRegExp(artifact)));
  }
});

test("operation and artifact role vocabulary is stable across docs", () => {
  for (const operation of ["search", "version", "help"]) {
    assert.match(docs.operationsMap, new RegExp(`\`${operation}\``));
  }

  for (const role of ["search_request_json", "search_result_json", "search_result_summary"]) {
    assert.match(docs.operationsMap, new RegExp(role));
  }

  assert.match(docs.workflow, /search_result_json/);
  assert.match(docs.workflow, /search_result_summary/);
});

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
