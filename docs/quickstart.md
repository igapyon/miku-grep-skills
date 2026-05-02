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

## Example Request

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": { "target": "content", "recursive": true, "maxDepth": 8 },
  "output": { "mode": "file-summary", "maxMatches": 50 }
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
