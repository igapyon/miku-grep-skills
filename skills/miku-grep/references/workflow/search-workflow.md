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
- Report `summary.truncated` and diagnostics concisely.

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
