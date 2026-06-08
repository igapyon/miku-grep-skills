import fs from "node:fs";
import { spawnSync } from "node:child_process";

import { buildCliInvocation } from "./backend-operations.mjs";
import { applyMikuGrepRepoConfig } from "./repo-config.mjs";

export function runCliOperation({
  operation,
  runtime = "java",
  inputPath,
  outputPath,
  cwd,
  javaRuntimePath,
  nodeRuntimePath
} = {}) {
  const invocation = buildCliInvocation({
    operation,
    runtime,
    inputPath,
    outputPath,
    javaRuntimePath,
    nodeRuntimePath
  });

  const input = invocation.stdinPath
    ? fs.readFileSync(invocation.stdinPath)
    : undefined;

  const result = spawnSync(invocation.command, invocation.args, {
    cwd,
    input,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });

  if (result.error) {
    throw result.error;
  }

  if (invocation.stdoutPath) {
    fs.writeFileSync(invocation.stdoutPath, result.stdout ?? "", "utf8");
  }

  return {
    command: invocation.command,
    args: invocation.args,
    stdinPath: invocation.stdinPath,
    stdoutPath: invocation.stdoutPath,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

export function runSearchJson({
  request,
  runtime = "java",
  cwd,
  javaRuntimePath,
  nodeRuntimePath,
  applyRepoConfig = true,
  repoConfigPath
} = {}) {
  const prepared = applyRepoConfig
    ? applyMikuGrepRepoConfig(request, { cwd, configPath: repoConfigPath })
    : {
        request,
        configPath: null,
        applied: false,
        appliedFields: []
      };

  const invocation = buildCliInvocation({
    operation: "version",
    runtime,
    javaRuntimePath,
    nodeRuntimePath
  });
  const args = invocation.args.slice(0, -1);
  const result = spawnSync(invocation.command, args, {
    cwd,
    input: `${JSON.stringify(prepared.request)}\n`,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    json: parseJsonResult(result.stdout ?? ""),
    request: prepared.request,
    repoConfig: {
      path: prepared.configPath,
      applied: prepared.applied,
      appliedFields: prepared.appliedFields
    }
  };
}

function parseJsonResult(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`failed to parse miku-grep JSON result: ${message}`);
  }
}
