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

File inventory request:

```json
{
  "version": 1,
  "root": ".",
  "mode": "listFiles",
  "query": { "type": "glob", "text": "**/*.md" }
}
```

## Preferred Behavior

- Use `summary` for broad repository context.
- Use `agent` when the next step is selecting files or directories for reading.
- Use `detail` when the user needs exact lines and columns.
- Use `mode: "listFiles"` for file inventory; read top-level `files[]` and `fileSummary` instead of `matches[]`.
- Keep `maxMatches`, `maxMatchesPerFile`, and `maxDepth` bounded for agent workflows.
- Prefer the narrowest practical `root`.
- Use `detectGitRoot: true` when the user asks for repository-wide search from a subdirectory.
- If `.mikusoft/miku-grep.json` exists under the selected request root, use it only for repo-local defaults for `search`, `output`, `encoding`, and `ignore`. Explicit request JSON values always win.
- If the requested `root` is outside the current repository or declared workspace, ask for explicit user confirmation before running the search. The confirmation should show the requested `root`, target, query type, and practical limits such as `maxDepth`, `includeFileNamePatterns`, and `maxMatches`.
- Use `includeFileNamePatterns` when the user has named file types.
- Treat `excludeFileNamePatterns` and `excludeDirNamePatterns` as replacement values for the corresponding default exclude presets. Omit them to keep defaults; use an empty array to disable that exclude category for the request.
- Use `filepath` and `directory` targets for path discovery before switching to content search.
- Use `query.type: "glob"` only for root-relative path search. In `search` mode, combine it with `filepath` or `directory`, not `content`.
- Use `output.sort: "relevance"` only as deterministic heuristic ordering, not semantic ranking.
- Use `output.includeReadfileRequestHints: true` when the next workflow is `miku-readfile`.
- Use `output.contextLines`, `contextLinesBefore`, or `contextLinesAfter` only with `detail` content searches.
- Use `encoding.preset: "japanese-legacy"` when common Japanese legacy text patterns should be treated as Shift_JIS; it is not auto detection.
- Report `summary.truncated` and diagnostics concisely.

## Java-Only Flow

If Node.js is unavailable, do not use the `lib/*.mjs` helpers. Prepare
`request.json` and invoke the Java runtime directly:

```bash
java -jar skills/miku-grep/runtime/miku-grep-<version>.jar < request.json > result.json
```

Then inspect `result.json`. The runtime result is the authoritative artifact.
The helper-generated summary is a convenience, not a required product artifact.

Agent checklist for Java-only mode:

1. Read this workflow before building the request.
2. Use the selected repository or workspace root as request `root`.
3. Check whether `.mikusoft/miku-grep.json` exists under the selected root.
4. Copy applicable `search`, `output`, `encoding`, and `ignore` defaults into
   `request.json` where the request does not already define them.
5. Keep `query`, `search.targets`, `maxDepth`, `maxMatches`, and include
   patterns narrow enough for the task.
6. Run the Java command.
7. Treat `result.json` as the authoritative artifact and inspect `ok`, `error`,
   `summary.truncated`, `summary.truncatedReason`, and `diagnostics`.

Minimal Java-only request:

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": { "targets": ["content"], "recursive": true, "maxDepth": 8 },
  "output": { "mode": "summary", "maxMatches": 50 }
}
```

Agent candidate request:

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "RepositoryMap" },
  "search": { "targets": ["filepath", "content"], "recursive": true, "maxDepth": 8 },
  "output": {
    "mode": "agent",
    "sort": "relevance",
    "includeReadfileRequestHints": true,
    "maxMatches": 50
  }
}
```

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
- `files[]` and `fileSummary` when `effectiveRequest.mode` is `listFiles`
- `readfileHints[]` when `output.includeReadfileRequestHints` is true

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
