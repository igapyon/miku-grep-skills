# Operations Map

Use this reference when you need the supported operation list or the preferred CLI runtime surface.

## Operations

- `search`: run a `miku-grep` request JSON through stdin and receive result JSON through stdout
- `version`: check that a runtime artifact starts and identifies itself as `miku-grep`
- `help`: read the runtime CLI contract

## Runtime Search Order

Prefer bundled runtime artifacts:

- `skills/miku-grep/runtime/miku-grep-<version>.jar`
- `skills/miku-grep/runtime/miku-grep-<version>.mjs`

Resolve the actual versioned artifact under `runtime/` before invoking the CLI.
Do not search broadly for alternate copies before checking these expected locations.

## Preferred Runtime Surface

List Java examples before Node.js examples so agents see the Java runtime first.

```bash
java -jar skills/miku-grep/runtime/miku-grep-<version>.jar < request.json > result.json
node skills/miku-grep/runtime/miku-grep-<version>.mjs < request.json > result.json
```

Meta commands:

```bash
java -jar skills/miku-grep/runtime/miku-grep-<version>.jar --version
node skills/miku-grep/runtime/miku-grep-<version>.mjs --version
```

## CLI Operation Correspondence

| Agent Skill operation | CLI backend shape | Notes |
| --- | --- | --- |
| `search` | `< request.json > result.json` | Primary JSON-in / JSON-out operation. |
| `version` | `--version` | Smoke check only. Do not require exact file-name version match. |
| `help` | `--help` | Runtime contract reference. |

## Artifact Roles

- `search_request_json`
- `search_result_json`
- `operation_summary`
- `diagnostics_log`

Do not treat every JSON document as the same artifact role. A request JSON and result JSON are different contracts.
