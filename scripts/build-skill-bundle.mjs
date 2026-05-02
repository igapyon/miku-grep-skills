#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRuntimeArtifact } from "../skills/miku-grep/lib/runtime-artifacts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const bundleRoot = path.resolve(repoRoot, "bundle/miku-grep-skills");
const bundleSkillsRoot = path.resolve(bundleRoot, "skills");
const sourceSkillRoot = path.resolve(repoRoot, "skills/miku-grep");
const sourceRuntimeRoot = path.resolve(sourceSkillRoot, "runtime");

main();

function main() {
  ensureSourceExists(sourceSkillRoot, "skills/miku-grep");
  ensureSourceExists(sourceRuntimeRoot, "skills/miku-grep/runtime");

  const javaRuntime = resolveRequiredArtifact("java");
  const nodeRuntime = resolveRequiredArtifact("node");
  const optionalArtifacts = [
    resolveOptionalArtifact("java-sources"),
    resolveOptionalArtifact("node-sources")
  ].filter(Boolean);

  fs.rmSync(bundleRoot, { recursive: true, force: true });
  fs.mkdirSync(bundleSkillsRoot, { recursive: true });

  fs.cpSync(sourceSkillRoot, path.resolve(bundleSkillsRoot, "miku-grep"), {
    recursive: true
  });

  const included = [
    `  - skills/miku-grep/runtime/${javaRuntime.name}`,
    `  - skills/miku-grep/runtime/${nodeRuntime.name}`,
    ...optionalArtifacts.map((artifact) => `  - skills/miku-grep/runtime/${artifact.name}`)
  ];

  process.stdout.write([
    "[build:bundle] generated bundle/miku-grep-skills",
    "[build:bundle] copy this directory's contents under your skill home root",
    "[build:bundle] included:",
    "  - skills/miku-grep",
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
