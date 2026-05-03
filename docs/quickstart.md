# Quickstart

This document explains the shortest current path for trying `miku-grep-skills`.

## Summary

1. Keep this repository open as the workspace root.
2. Confirm runtime artifacts exist under `skills/miku-grep/runtime/`.
3. Run `npm test`.
4. Run `npm run build:bundle`.
5. Install `bundle/miku-grep-skills/skills/miku-grep` into your skill home.
6. Start a request with `miku-grep`.

## Execution Policy

The default policy is `cli-preferred`.

- `cli-only`: use the bundled CLI runtime only
- `cli-preferred`: use the bundled CLI runtime first, then visible handoff if CLI is unavailable
- `handoff-only`: do not execute CLI; return request JSON guidance or steps

MCP server integration is intentionally out of scope for this repository.

## Access Scope

`miku-grep` is a local filesystem search tool, comparable in access scope to `rg`, `grep`, or `find` when run by the same agent process. It does not create an additional sandbox boundary. It can search any path that the host environment and filesystem permissions allow the agent process to read.

The skill workflow asks for user confirmation before searching outside the current repository or declared workspace. This is a consent gate for normal agent use, not an OS-level access restriction.

This confirmation is currently handled by the agent workflow as an in-conversation consent gate. It is not the same as a host UI permission prompt such as a VS Code Allow button, and it is not enforced by the filesystem sandbox unless the host environment separately restricts the command.

Because this gate is prompt-driven, it can fail to trigger if the agent does not follow the skill workflow or if another execution path invokes the runtime directly. Do not rely on it as a hard enforcement mechanism.

## Runtime Artifacts

Expected runtime files:

```text
skills/miku-grep/runtime/
  miku-grep-<version>.jar
  miku-grep-<version>.mjs
```

Source artifacts may also be present:

```text
skills/miku-grep/runtime/
  miku-grep-sources-<version>.jar
  miku-grep-sources-<version>.tgz
```

The file-name version and `--version` output may differ.

## Exclude Presets

When `search.excludeFileNamePatterns` or `search.excludeDirNamePatterns` is omitted, `miku-grep` uses the corresponding default exclude preset.
When either field is specified, that request value replaces the corresponding default preset.
An empty array such as `excludeFileNamePatterns: []` means no file-name excludes for that request.

## Example Request

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": { "targets": ["content"], "recursive": true, "maxDepth": 8 },
  "output": { "mode": "summary", "maxMatches": 50 }
}
```

For direct CLI use:

```bash
java -jar skills/miku-grep/runtime/miku-grep-<version>.jar < request.json > result.json
```

or:

```bash
node skills/miku-grep/runtime/miku-grep-<version>.mjs < request.json > result.json
```

## Output Location

Keep generated request and result files under a product-specific local directory instead of scattering them in the repository root.

Recommended shape:

```text
miku-grep/
  state/
  output/
  tmp/
```

- `miku-grep/state/`: reusable request JSON and result JSON
- `miku-grep/output/`: user-facing summaries or exported search reports
- `miku-grep/tmp/`: short-lived local work
