# Search Examples

## Content Search

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": { "target": "content", "recursive": true, "maxDepth": 8 },
  "output": { "mode": "file-summary", "maxMatches": 50 }
}
```

## Filename Search

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "regex", "text": ".*\\.md$" },
  "search": { "target": "filename", "recursive": true, "maxDepth": 6 },
  "output": { "mode": "detail", "maxMatches": 100 }
}
```

## Focused Detail Search

```json
{
  "version": 1,
  "root": "src",
  "query": { "type": "literal", "text": "RepositoryMap" },
  "search": {
    "target": "content",
    "recursive": true,
    "includeFileNamePatterns": ["*.java", "*.ts", "*.js"]
  },
  "output": { "mode": "detail", "maxMatches": 40, "maxLineLength": 300 }
}
```
