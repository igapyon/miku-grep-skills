# Search Workflow

## Request Shape

`miku-grep` accepts JSON on stdin and writes JSON to stdout.

Minimum request:

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": { "target": "content", "recursive": true },
  "output": { "mode": "file-summary" }
}
```

## Preferred Behavior

- Use `file-summary` for broad repository context.
- Use `detail` when the user needs exact lines and columns.
- Keep `maxMatches`, `maxMatchesPerFile`, and `maxDepth` bounded for agent workflows.
- Prefer the narrowest practical `root`.
- Use `includeFileNamePatterns` when the user has named file types.
- Use `filename` target for path discovery before switching to content search.
- Report `summary.truncated` and diagnostics concisely.

## Result Handling

Before answering, check:

- `ok`
- `error`
- `summary.filesVisited`
- `summary.filesMatched`
- `summary.matches`
- `summary.truncated`
- `summary.truncatedReason`
- `diagnostics`

If `ok` is false, treat the runtime result as a hard operation failure and report the error code and message.
If `ok` is true but diagnostics or truncation are present, report the result and include a concise warning summary.

Do not paste the whole result JSON into the conversation unless the user asks for it.
Prefer a compact summary with the most relevant files, line numbers, and diagnostic counts.

The helper `skills/miku-grep/lib/result-formatter.mjs` provides the default concise display summary.
Treat that `search_result_summary` as a display artifact derived from `search_result_json`, not as a replacement for the original result JSON.

## Hard Errors

- missing runtime artifact
- malformed request JSON
- invalid query type
- invalid regex
- inaccessible root

## Soft Warnings

- skipped binary files
- unreadable files
- decode errors
- result truncation
