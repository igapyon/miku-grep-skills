import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("SKILL keeps activation explicit and excludes MCP", () => {
  const skill = fs.readFileSync("skills/igapyon-miku-grep/SKILL.md", "utf8");

  assert.match(skill, /explicitly says `igapyon-miku-grep` or `miku-grep`/);
  assert.match(skill, /Do not add MCP server behavior/);
  assert.match(skill, /Do not call MCP tools as fallback/);
});

test("SKILL pushes agents toward args-first before request JSON", () => {
  const skill = fs.readFileSync("skills/igapyon-miku-grep/SKILL.md", "utf8");

  const decisionPathIndex = skill.indexOf("## Agent Decision Path");
  const requestJsonIndex = skill.indexOf("Build stdin request JSON");

  assert.ok(decisionPathIndex > 0, "SKILL should contain an agent decision path");
  assert.ok(requestJsonIndex > decisionPathIndex, "request JSON should be after args-first guidance");
  assert.match(skill, /miku-grep TODO \./);
  assert.match(skill, /miku-grep RepositoryMap \. --agent/);
  assert.match(skill, /Do not start with request JSON only because JSON is available/);
});

test("reference index links runtime and examples", () => {
  const index = fs.readFileSync("skills/igapyon-miku-grep/references/INDEX.md", "utf8");

  assert.match(index, /runtime\/operations-map\.md/);
  assert.match(index, /examples\/search-examples\.md/);
});

test("README points to developer documents", () => {
  const readme = fs.readFileSync("README.md", "utf8");

  assert.match(readme, /docs\/quickstart\.md/);
  assert.match(readme, /docs\/development\.md/);
  assert.match(readme, /MCP server integration/);
});
