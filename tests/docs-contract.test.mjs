import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const docs = {
  readme: read("README.md"),
  skill: read("skills/miku-grep/SKILL.md"),
  quickstart: read("docs/quickstart.md"),
  development: read("docs/development.md"),
  config: read("docs/miku-grep-skills-config.md"),
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
  for (const operation of ["search", "jsonSearch", "version", "help"]) {
    assert.match(docs.operationsMap, new RegExp(`\`${operation}\``));
  }

  for (const role of ["search_request_json", "search_result_json", "search_result_summary"]) {
    assert.match(docs.operationsMap, new RegExp(role));
  }

  assert.match(docs.workflow, /search_result_json/);
  assert.match(docs.workflow, /search_result_summary/);
});

test("documents keep Java-only direct runtime operation explicit", () => {
  for (const [name, text] of Object.entries({
    readme: docs.readme,
    skill: docs.skill,
    operationsMap: docs.operationsMap,
    workflow: docs.workflow
  })) {
    assert.match(text, /Java-[Oo]nly|Java jar|java -jar/, `${name} should document Java-only runtime use`);
    assert.match(text, /request\.json/, `${name} should mention explicit request JSON`);
    assert.match(text, /result\.json/, `${name} should mention runtime result JSON`);
  }

  assert.match(docs.skill, /lib\/\*\.mjs/);
  assert.match(docs.operationsMap, /helper is optional/i);
  assert.match(docs.workflow, /authoritative artifact/i);
});

test("documents v0.10 args-first search and explicit JSON output", () => {
  for (const [name, text] of Object.entries({
    readme: docs.readme,
    skill: docs.skill,
    quickstart: docs.quickstart,
    operationsMap: docs.operationsMap,
    workflow: docs.workflow
  })) {
    assert.match(text, /TODO \./, `${name} should show args-first search`);
    assert.match(text, /--agent/, `${name} should show agent search`);
    assert.match(text, /--format json/, `${name} should show explicit JSON output`);
  }
});

test("documents repo-local miku-grep config contract", () => {
  for (const [name, text] of Object.entries({
    readme: docs.readme,
    skill: docs.skill,
    quickstart: docs.quickstart,
    config: docs.config,
    workflow: docs.workflow
  })) {
    assert.match(text, /\.mikusoft\/miku-grep\.json/, `${name} should mention repo-local config`);
  }

  assert.match(docs.config, /request JSON[\s\S]*repo-local `\.mikusoft\/miku-grep\.json`[\s\S]*runtime default/);
  assert.match(docs.config, /Do not put `root` or `query`/);
  assert.match(docs.config, /search[\s\S]*output[\s\S]*encoding[\s\S]*ignore/);
  assert.match(docs.operationsMap, /Repo-local config merge responsibility/);
});

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
