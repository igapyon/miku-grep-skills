# Search Examples

## Args-First Search

```bash
miku-grep TODO .
miku-grep TODO . --files
miku-grep TODO . --agent
miku-grep TODO . --context 2
miku-grep TODO . --format json
```

Use args-first commands for quick exploration. Use request JSON when the search
needs a reusable structured artifact or handoff.

## Content Search

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": { "targets": ["content"], "recursive": true, "maxDepth": 8 },
  "output": { "mode": "summary", "maxMatches": 50 }
}
```

## File Path Search

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "regex", "text": ".*\\.md$" },
  "search": { "targets": ["filepath"], "recursive": true, "maxDepth": 6 },
  "output": { "mode": "detail", "maxMatches": 100 }
}
```

## Glob Path Search

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "glob", "text": "**/*.md" },
  "search": { "targets": ["filepath"], "recursive": true, "maxDepth": 8 },
  "output": { "mode": "summary", "maxMatches": 100 }
}
```

## Directory Search

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "docs" },
  "search": { "targets": ["directory"], "recursive": true, "maxDepth": 6 },
  "output": { "mode": "summary", "maxMatches": 100 }
}
```

## Focused Detail Search

```json
{
  "version": 1,
  "root": "src",
  "query": { "type": "literal", "text": "RepositoryMap" },
  "search": {
    "targets": ["content"],
    "recursive": true,
    "includeFileNamePatterns": ["*.java", "*.ts", "*.js"]
  },
  "output": {
    "mode": "detail",
    "maxMatches": 40,
    "maxLineLength": 300,
    "contextLines": 2
  }
}
```

## Agent Candidate Search

```json
{
  "version": 1,
  "root": ".",
  "detectGitRoot": true,
  "query": { "type": "literal", "text": "RepositoryMap", "case": "insensitive" },
  "search": { "targets": ["filepath", "content"], "recursive": true, "maxDepth": 8 },
  "output": {
    "mode": "agent",
    "sort": "relevance",
    "includeReadfileRequestHints": true,
    "maxMatches": 50
  }
}
```

## File Inventory

```json
{
  "version": 1,
  "root": ".",
  "mode": "listFiles",
  "query": { "type": "glob", "text": "**/*.md" }
}
```

## Japanese Legacy Encoding Preset

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "検索語" },
  "search": {
    "targets": ["content"],
    "includeFileNamePatterns": ["*.txt", "*.csv"]
  },
  "encoding": { "preset": "japanese-legacy" },
  "output": { "mode": "summary", "maxMatches": 50 }
}
```

## Runner Summary Flow

Skill-local helper flow:

```js
import { runSearchJson } from "../../lib/cli-runner.mjs";
import { formatSearchResultSummary } from "../../lib/result-formatter.mjs";

const result = runSearchJson({
  runtime: "java",
  cwd: process.cwd(),
  request
});

const visibleSummary = formatSearchResultSummary(result.json);
```

Keep `result.json` available as the structured artifact.
Use `visibleSummary` only as concise display text for the conversation.
