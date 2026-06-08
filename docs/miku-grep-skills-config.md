# miku-grep-skills Config Specification

This document defines the repo-local configuration policy for
`miku-grep-skills`.

## Purpose

`miku-grep` searches through structured request JSON. In many repositories,
search limits, include patterns, ignore behavior, and encoding rules are stable
repository properties.

`miku-grep-skills` may use a repo-local config file to help agents build request
JSON consistently without repeating the same default search settings in every
conversation.

## Config Directory

Use `.mikusoft/` at the repository root as the shared miku-series configuration
directory.

Recommended shape:

```text
<repo root>/
  .mikusoft/
    miku-grep.json
    miku-readfile.json
    mikuproject.json
```

For `miku-grep-skills`, the config file is:

```text
.mikusoft/miku-grep.json
```

## miku-grep Config Shape

Example:

```json
{
  "version": 1,
  "search": {
    "targets": ["content"],
    "recursive": true,
    "maxDepth": 8,
    "includeFileNamePatterns": ["*.md", "*.js", "*.ts", "*.java"]
  },
  "output": {
    "mode": "summary",
    "maxMatches": 100,
    "maxMatchesPerFile": 20,
    "maxLineLength": 300
  },
  "encoding": {
    "default": "utf-8",
    "rules": [
      { "fileNamePattern": "*.java", "encoding": "shift_jis" }
    ],
    "onDecodeError": "skip"
  },
  "ignore": {
    "mode": "auto"
  }
}
```

Fields:

- `version`: config schema version. The current version is `1`.
- `search`: optional default search settings.
- `output`: optional default output settings.
- `encoding`: optional default encoding policy.
- `ignore`: optional default ignore-file policy.

The config is not a replacement for request JSON. It is a repo-local default
used when preparing request JSON.

Do not put `root` or `query` in `.mikusoft/miku-grep.json`. Those fields express
the current search target and search intent, so they must be written explicitly
in each request JSON.

## Precedence

Request policy precedence is:

1. fields explicitly written in request JSON
2. repo-local `.mikusoft/miku-grep.json`
3. runtime default

Request JSON is always the strongest source. A user or agent can override the
repo-local config by writing `search`, `output`, `encoding`, or `ignore` fields
directly in the request.

Section objects are merged shallowly. For example, config `output.maxMatches`
can combine with request `output.mode`, while request `output.maxMatches`
overrides the config value.

## Exclude Presets

`miku-grep` runtime default excludes are used only when
`search.excludeFileNamePatterns` or `search.excludeDirNamePatterns` is omitted
from the effective request.

If `.mikusoft/miku-grep.json` supplies either field, that config value becomes
part of the effective request and replaces the corresponding runtime default
exclude preset. Use this deliberately.

## Node.js Helper Behavior

When Node.js helpers are available, `miku-grep-skills` reads
`.mikusoft/miku-grep.json` from the selected request root and merges supported
config fields into request JSON before invoking the runtime.

The helper must not change runtime semantics. It should only make the effective
request explicit before calling the bundled Java or Node.js runtime.

Unsupported top-level config fields are errors. This prevents accidental hidden
defaults for fields such as `root` or `query`.

## Java-Only Behavior

The bundled Java runtime does not automatically load `.mikusoft/miku-grep.json`
unless the upstream `miku-grep` CLI later adds that feature.

In Java-only direct execution, use this document and the workflow references to
copy the needed config values into `request.json` manually.

Agent behavior in Java-only mode:

1. Check whether `.mikusoft/miku-grep.json` exists under the selected request
   root.
2. Keep explicit request values.
3. Copy applicable `search`, `output`, `encoding`, and `ignore` defaults from
   config only where the request does not already define them.
4. Do not copy `root` or `query` from config.
5. Run the Java jar with the prepared request JSON.

Example Java-only request derived from `.mikusoft/miku-grep.json`:

```json
{
  "version": 1,
  "root": ".",
  "query": { "type": "literal", "text": "TODO" },
  "search": {
    "targets": ["content"],
    "recursive": true,
    "maxDepth": 8,
    "includeFileNamePatterns": ["*.md", "*.js", "*.ts", "*.java"]
  },
  "output": {
    "mode": "summary",
    "maxMatches": 100
  }
}
```

Then run:

```bash
java -jar skills/igapyon-miku-grep/runtime/miku-grep-<version>.jar < request.json > result.json
```

## Git Tracking Policy

Whether `.mikusoft/miku-grep.json` should be tracked by Git depends on the
repository.

Track it when search defaults, encoding policy, or ignore behavior are
repository-level facts shared by the team. Do not track it when the setting is a
local, personal, or temporary workflow preference.

## Current Scope

This specification defines the config location, shape, precedence, and helper
merge behavior.

Implementation status:

- Documented config policy: yes
- Node.js helper auto-merge: yes
- Java runtime auto-load: not implemented
