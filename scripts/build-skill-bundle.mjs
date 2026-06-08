#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRuntimeArtifact } from "../skills/igapyon-miku-grep/lib/runtime-artifacts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const bundleRoot = path.resolve(repoRoot, "bundle/miku-grep-skills");
const bundleSkillsRoot = path.resolve(bundleRoot, "skills");
const sourceSkillRoot = path.resolve(repoRoot, "skills/igapyon-miku-grep");
const sourceRuntimeRoot = path.resolve(sourceSkillRoot, "runtime");

main();

function main() {
  ensureSourceExists(sourceSkillRoot, "skills/igapyon-miku-grep");
  ensureSourceExists(sourceRuntimeRoot, "skills/igapyon-miku-grep/runtime");

  const javaRuntime = resolveRequiredArtifact("java");
  const nodeRuntime = resolveRequiredArtifact("node");
  const optionalArtifacts = [
    resolveOptionalArtifact("java-sources"),
    resolveOptionalArtifact("node-sources")
  ].filter(Boolean);

  fs.rmSync(bundleRoot, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100
  });
  fs.mkdirSync(bundleSkillsRoot, { recursive: true });

  const bundleSkillRoot = path.resolve(bundleSkillsRoot, "igapyon-miku-grep");
  fs.mkdirSync(bundleSkillRoot, { recursive: true });
  fs.cpSync(sourceSkillRoot, bundleSkillRoot, {
    recursive: true,
    filter: shouldCopyBundleEntry
  });

  const included = [
    `  - skills/igapyon-miku-grep/runtime/${javaRuntime.name}`,
    `  - skills/igapyon-miku-grep/runtime/${nodeRuntime.name}`,
    ...optionalArtifacts.map((artifact) => `  - skills/igapyon-miku-grep/runtime/${artifact.name}`)
  ];

  process.stdout.write([
    "[build:bundle] generated bundle/miku-grep-skills",
    "[build:bundle] copy this directory's contents under your skill home root",
    "[build:bundle] included:",
    "  - skills/igapyon-miku-grep",
    ...included
  ].join("\n"));
  process.stdout.write("\n");
}

function ensureSourceExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`missing source directory: ${label}`);
  }
}

function resolveRequiredArtifact(kind) {
  return resolveRuntimeArtifact({
    kind,
    runtimeRoot: sourceRuntimeRoot
  });
}

function resolveOptionalArtifact(kind) {
  try {
    return resolveRequiredArtifact(kind);
  } catch {
    return null;
  }
}

function shouldCopyBundleEntry(sourcePath) {
  const name = path.basename(sourcePath);
  if (name === ".DS_Store") {
    return false;
  }
  if (name === "tmp" || name === "output" || name === "state") {
    const relativePath = path.relative(sourceSkillRoot, sourcePath);
    return relativePath.split(path.sep).length > 1;
  }
  return true;
}
