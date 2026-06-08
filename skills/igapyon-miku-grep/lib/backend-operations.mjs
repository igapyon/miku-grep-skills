import { resolveRuntimeArtifactPath } from "./runtime-artifacts.mjs";

export const DEFAULT_JAVA_RUNTIME_KIND = "java";
export const DEFAULT_NODE_RUNTIME_KIND = "node";

export const operationRegistry = {
  search: {
    cliArgs: [],
    requires: ["inputPath", "outputPath"],
    artifactRoles: {
      input: "search_request_json",
      output: "search_result_json"
    }
  },
  version: {
    cliArgs: ["--version"],
    requires: [],
    artifactRoles: {
      output: "operation_summary"
    }
  },
  help: {
    cliArgs: ["--help"],
    requires: [],
    artifactRoles: {
      output: "operation_summary"
    }
  }
};

export const operationCapabilities = Object.fromEntries(
  Object.entries(operationRegistry).map(([operation]) => [
    operation,
    { cli: true, handoff: true }
  ])
);

export function buildCliInvocation({
  operation,
  runtime = "java",
  inputPath,
  outputPath,
  javaRuntimePath,
  nodeRuntimePath
} = {}) {
  const definition = operationRegistry[operation];
  if (!definition?.cliArgs) {
    throw new Error(`unsupported CLI operation: ${operation}`);
  }

  assertRequiredFields(definition.requires, {
    inputPath,
    outputPath
  }, operation);

  const operationArgs = [...definition.cliArgs];

  if (runtime === "java") {
    return {
      command: "java",
      args: [
        "-jar",
        javaRuntimePath ?? resolveRuntimeArtifactPath({ kind: DEFAULT_JAVA_RUNTIME_KIND }),
        ...operationArgs
      ],
      stdinPath: inputPath ?? null,
      stdoutPath: outputPath ?? null
    };
  }

  if (runtime === "node") {
    return {
      command: "node",
      args: [
        nodeRuntimePath ?? resolveRuntimeArtifactPath({ kind: DEFAULT_NODE_RUNTIME_KIND }),
        ...operationArgs
      ],
      stdinPath: inputPath ?? null,
      stdoutPath: outputPath ?? null
    };
  }

  throw new Error(`unsupported CLI runtime: ${runtime}`);
}

function assertRequiredFields(requiredFields, values, operation) {
  for (const field of requiredFields) {
    if (!values[field]) {
      throw new Error(`missing ${field} for operation: ${operation}`);
    }
  }
}
