# Search Workflow

## Request Shape

`miku-grep` accepts JSON on stdin and writes JSON to stdout.

`miku-grep` is a local filesystem search tool, comparable in access scope to `rg`, `grep`, or `find` when run by the same agent process. It does not create an additional sandbox boundary. It can search any path that the host environment and filesystem permissions allow the agent process to read.

The confirmation step for searches outside the current repository or declared workspace is a consent gate for normal agent use, not an OS-level access restriction.

This confirmation is currently handled by the agent workflow as an in-conversation consent gate. It is not the same as a host UI permission prompt such as a VS Code Allow button, and it is not enforced by the filesystem sandbox unless the host environment separately restricts the command.

Because this gate is prompt-driven, it can fail to trigger if the agent does not follow the skill workflow or if another execution path invokes the runtime directly. Do not rely on it as a hard enforcement mechanism.

Minimum request:

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": { "targets": ["content"], "recursive": true },
  "output": { "mode": "summary" }
}
```

## Preferred Behavior

- Use `summary` for broad repository context.
- Use `detail` when the user needs exact lines and columns.
- Keep `maxMatches`, `maxMatchesPerFile`, and `maxDepth` bounded for agent workflows.
- Prefer the narrowest practical `root`.
- If the requested `root` is outside the current repository or declared workspace, ask for explicit user confirmation before running the search. The confirmation should show the requested `root`, target, query type, and practical limits such as `maxDepth`, `includeFileNamePatterns`, and `maxMatches`.
- Use `includeFileNamePatterns` when the user has named file types.
- Treat `excludeFileNamePatterns` and `excludeDirNamePatterns` as replacement values for the corresponding default exclude presets. Omit them to keep defaults; use an empty array to disable that exclude category for the request.
- Use `filepath` and `directory` targets for path discovery before switching to content search.
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
