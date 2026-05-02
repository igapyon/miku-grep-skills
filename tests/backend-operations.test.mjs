import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCliInvocation,
  operationCapabilities
} from "../skills/miku-grep/lib/backend-operations.mjs";

test("builds Java CLI invocation for search", () => {
  const invocation = buildCliInvocation({
    operation: "search",
    runtime: "java",
    inputPath: "request.json",
    outputPath: "result.json",
    javaRuntimePath: "runtime/miku-grep.jar"
  });

  assert.equal(invocation.command, "java");
  assert.deepEqual(invocation.args, ["-jar", "runtime/miku-grep.jar"]);
  assert.equal(invocation.stdinPath, "request.json");
  assert.equal(invocation.stdoutPath, "result.json");
});

test("builds Node.js CLI invocation for version", () => {
  const invocation = buildCliInvocation({
    operation: "version",
    runtime: "node",
    nodeRuntimePath: "runtime/miku-grep.mjs"
  });

  assert.equal(invocation.command, "node");
  assert.deepEqual(invocation.args, ["runtime/miku-grep.mjs", "--version"]);
  assert.equal(invocation.stdinPath, null);
  assert.equal(invocation.stdoutPath, null);
});

test("requires request and result paths for search operation", () => {
  assert.throws(
    () => buildCliInvocation({ operation: "search", runtime: "java" }),
    /missing inputPath/
  );
});

test("declares CLI and handoff capabilities only", () => {
  assert.deepEqual(operationCapabilities.search, { cli: true, handoff: true });
  assert.equal(Object.hasOwn(operationCapabilities.search, "mcp"), false);
});
