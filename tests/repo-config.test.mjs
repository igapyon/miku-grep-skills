import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  applyMikuGrepRepoConfig,
  loadMikuGrepRepoConfig
} from "../skills/miku-grep/lib/repo-config.mjs";

test("loads repo-local miku-grep config from request root", () => {
  const tempRoot = createTempRepo({
    search: { targets: ["content"], recursive: true, maxDepth: 6 }
  });

  try {
    const loaded = loadMikuGrepRepoConfig({ root: ".", cwd: tempRoot });

    assert.equal(loaded.found, true);
    assert.equal(loaded.config.version, 1);
    assert.match(loaded.path, /\.mikusoft\/miku-grep\.json$/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("applies config defaults while preserving explicit request values", () => {
  const tempRoot = createTempRepo({
    search: {
      targets: ["filepath"],
      recursive: true,
      maxDepth: 9,
      includeFileNamePatterns: ["*.md"]
    },
    output: {
      mode: "summary",
      maxMatches: 100,
      maxLineLength: 300
    },
    ignore: {
      mode: "auto"
    }
  });

  try {
    const request = {
      version: 1,
      root: ".",
      query: { type: "literal", text: "TODO" },
      search: {
        targets: ["content"],
        maxDepth: 3
      },
      output: {
        mode: "detail"
      }
    };

    const result = applyMikuGrepRepoConfig(request, { cwd: tempRoot });

    assert.equal(result.applied, true);
    assert.deepEqual(result.appliedFields, ["search", "output", "ignore"]);
    assert.deepEqual(result.request.search, {
      targets: ["content"],
      recursive: true,
      maxDepth: 3,
      includeFileNamePatterns: ["*.md"]
    });
    assert.deepEqual(result.request.output, {
      mode: "detail",
      maxMatches: 100,
      maxLineLength: 300
    });
    assert.deepEqual(result.request.ignore, {
      mode: "auto"
    });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("rejects hidden root or query defaults in repo config", () => {
  const tempRoot = createTempRepo({
    root: ".",
    search: { targets: ["content"] }
  });

  try {
    assert.throws(
      () => applyMikuGrepRepoConfig(defaultRequest(), { cwd: tempRoot }),
      /unsupported field: root/
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("returns unchanged request when repo config is absent", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-grep-config-test-"));
  const request = defaultRequest();

  try {
    const result = applyMikuGrepRepoConfig(request, { cwd: tempRoot });

    assert.equal(result.applied, false);
    assert.equal(result.request, request);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

function createTempRepo(config) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-grep-config-test-"));
  fs.mkdirSync(path.join(tempRoot, ".mikusoft"), { recursive: true });
  fs.writeFileSync(
    path.join(tempRoot, ".mikusoft", "miku-grep.json"),
    `${JSON.stringify({ version: 1, ...config }, null, 2)}\n`,
    "utf8"
  );
  return tempRoot;
}

function defaultRequest() {
  return {
    version: 1,
    root: ".",
    query: { type: "literal", text: "TODO" },
    search: { targets: ["content"] }
  };
}
