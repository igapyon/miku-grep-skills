import assert from "node:assert/strict";
import test from "node:test";

import {
  planBackendExecution,
  resolveBackendPolicy
} from "../skills/miku-grep/lib/backend-policy.mjs";

test("resolves default backend policy", () => {
  assert.equal(resolveBackendPolicy(), "cli-preferred");
});

test("cli-only does not fall back to handoff", () => {
  const plan = planBackendExecution({
    policy: "cli-only",
    operation: "search",
    cliAvailable: false
  });

  assert.equal(plan.mode, "error");
  assert.equal(plan.selectedBackend, null);
  assert.deepEqual(plan.attemptedBackends, ["cli"]);
  assert.equal(plan.error.reason, "cli_unavailable");
});

test("cli-preferred falls back to visible handoff when CLI is unavailable", () => {
  const plan = planBackendExecution({
    policy: "cli-preferred",
    operation: "search",
    cliAvailable: false
  });

  assert.equal(plan.mode, "handoff");
  assert.equal(plan.selectedBackend, null);
  assert.deepEqual(plan.attemptedBackends, ["cli"]);
  assert.deepEqual(plan.fallback, {
    from: "cli",
    to: "handoff",
    reason: "cli_unavailable"
  });
});

test("handoff-only does not execute CLI", () => {
  const plan = planBackendExecution({
    policy: "handoff-only",
    operation: "search",
    cliAvailable: true
  });

  assert.equal(plan.mode, "handoff");
  assert.equal(plan.selectedBackend, null);
  assert.deepEqual(plan.attemptedBackends, []);
});
