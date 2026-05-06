# Operations Map

Use this reference when you need the supported operation list or the preferred CLI runtime surface.

## Operations

- `search`: run a `miku-grep` request JSON through stdin and receive result JSON through stdout
- `listFiles`: run a `mode: "listFiles"` request and receive file inventory in `files[]` / `fileSummary`
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
| `listFiles` | `< request.json > result.json` | Inventory operation using top-level `mode: "listFiles"`. |
| `version` | `--version` | Smoke check only. Do not require exact file-name version match. |
| `help` | `--help` | Runtime contract reference. |

## Skill-Local Runner

The helper `skills/miku-grep/lib/cli-runner.mjs` is a thin adapter over the CLI runtime.
It may execute the bundled Java or Node.js artifact, but it must not implement search logic itself.

The helper is optional. It requires Node.js. In a Java-only environment, skip the
helper and call the Java runtime directly:

```bash
java -jar skills/miku-grep/runtime/miku-grep-<version>.jar < request.json > result.json
```

Runner responsibilities:

- build the CLI invocation from the operation registry
- pass request JSON to stdin
- collect stdout / stderr / exit status
- optionally write stdout JSON to an output file

Runtime responsibilities:

- validate request JSON
- traverse files
- match content, file paths, or directory paths
- emit result JSON and diagnostics

Repo-local config merge responsibility:

- Node.js helper may read `.mikusoft/miku-grep.json`
- helper may merge `search`, `output`, `encoding`, and `ignore` defaults into
  request JSON before runtime invocation
- runtime remains responsible for validating the effective request

## Artifact Roles

- `search_request_json`
- `search_result_json`
- `search_result_summary`
- `file_inventory_result_json`
- `operation_summary`
- `diagnostics_log`

Do not treat every JSON document as the same artifact role. A request JSON and result JSON are different contracts.
`search_result_summary` is display text derived from the result JSON and must not replace the original result artifact.
