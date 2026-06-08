export const BACKEND_POLICIES = [
  "cli-only",
  "cli-preferred",
  "handoff-only"
];

export function resolveBackendPolicy({
  userRequestPolicy,
  environmentPolicy,
  skillConfigPolicy,
  repositoryDefaultPolicy = "cli-preferred"
} = {}, config = {}) {
  const allowedPolicies = config.allowed_policies ?? BACKEND_POLICIES;
  const policy =
    userRequestPolicy ??
    environmentPolicy ??
    skillConfigPolicy ??
    config.default_policy ??
    repositoryDefaultPolicy;

  assertAllowedPolicy(policy, allowedPolicies);
  return policy;
}

export function planBackendExecution({
  policy,
  operation,
  cliAvailable = true,
  supportedOperations = ["search", "version", "help"]
} = {}) {
  assertAllowedPolicy(policy, BACKEND_POLICIES);

  if (!operation) {
    throw new Error("operation is required");
  }

  if (!supportedOperations.includes(operation)) {
    return hardError(policy, operation, [], "unknown_operation");
  }

  if (policy === "handoff-only") {
    return {
      policy,
      operation,
      mode: "handoff",
      selectedBackend: null,
      attemptedBackends: [],
      fallback: null,
      error: null
    };
  }

  if (cliAvailable) {
    return {
      policy,
      operation,
      mode: "execute",
      selectedBackend: "cli",
      attemptedBackends: ["cli"],
      fallback: null,
      error: null
    };
  }

  if (policy === "cli-preferred") {
    return {
      policy,
      operation,
      mode: "handoff",
      selectedBackend: null,
      attemptedBackends: ["cli"],
      fallback: {
        from: "cli",
        to: "handoff",
        reason: "cli_unavailable"
      },
      error: null
    };
  }

  return hardError(policy, operation, ["cli"], "cli_unavailable");
}

function hardError(policy, operation, attemptedBackends, reason) {
  return {
    policy,
    operation,
    mode: "error",
    selectedBackend: null,
    attemptedBackends,
    fallback: null,
    error: {
      reason
    }
  };
}

function assertAllowedPolicy(policy, allowedPolicies) {
  if (!allowedPolicies.includes(policy)) {
    throw new Error(`unsupported backend policy: ${policy}`);
  }
}
