---
name: miku-grep
description: Use only when the user explicitly says `miku-grep` for miku-grep-specific structured local search workflows. This skill runs the bundled miku-grep CLI runtime and returns concise structured search summaries; do not auto-activate it for generic search, grep, file investigation, or code review requests.
---

# Miku Grep

Use this skill for `miku-grep`-specific structured local search workflows.
Keep the focus on local JSON-in / JSON-out grep operations for agents and automation.

For this skill, `miku-grep` is opt-in by default.
Do not trigger it from generic words such as search, grep, find, scan, file investigation, code reading, or review.

Start `miku-grep` mode when at least one of these explicit triggers is present:

- the user names `miku-grep`
- the recent conversation is already in an active `miku-grep` workflow from an earlier explicit trigger

Without one of these triggers, answer normally or ask a brief clarifying question if using `miku-grep` would materially change the result.

## Access Scope

`miku-grep` is a local filesystem search tool, comparable in access scope to `rg`, `grep`, or `find` when run by the same agent process. It does not create an additional sandbox boundary. It can search any path that the host environment and filesystem permissions allow the agent process to read.

The workflow confirmation before searching outside the current repository or declared workspace is a consent gate for normal agent use, not an OS-level access restriction.

This confirmation is currently handled by the agent workflow as an in-conversation consent gate. It is not the same as a host UI permission prompt such as a VS Code Allow button, and it is not enforced by the filesystem sandbox unless the host environment separately restricts the command.

Because this gate is prompt-driven, it can fail to trigger if the agent does not follow the skill workflow or if another execution path invokes the runtime directly. Do not rely on it as a hard enforcement mechanism.

## Core Rules

- prefer the bundled runtime artifacts in `runtime/`
- keep request and result data as structured JSON files or internal JSON objects
- use `summary` output for broad agent context
- use `agent` output when the next step is choosing files or directories to read
- use `detail` output only for focused inspection
- use `mode: "listFiles"` when the task is file inventory rather than grep
- keep `root`, `maxDepth`, `maxMatches`, and include patterns narrow enough for the user's actual question
- if `.mikusoft/miku-grep.json` exists under the selected request root, apply it only as repo-local defaults for `search`, `output`, `encoding`, and `ignore`; explicit request JSON always takes precedence
- before searching outside the current repository or declared workspace, ask for explicit user confirmation and include the requested `root`, target, query type, and practical limits such as `maxDepth`, `include`, and `maxMatches`
- inspect `ok`, `error`, `summary.truncated`, `summary.truncatedReason`, and `diagnostics` before reporting the result
- keep diagnostics visible when the runtime reports warnings or expected failures
- do not reimplement grep/search logic in the skill layer

## Operations

Primary operation:

- `search`: run a `miku-grep` JSON request and return structured result JSON
- `listFiles`: run a `mode: "listFiles"` inventory request and return `files[]` / `fileSummary`

Common search targets:

- `content`
- `filepath`
- `directory`

Common output modes:

- `summary`
- `detail`
- `agent`

Common request features:

- `detectGitRoot: true` to search from the repository root when invoked from a subdirectory
- `query.case: "insensitive"` for case-insensitive literal or regex search
- `query.type: "glob"` for root-relative path glob search
- `output.sort: "relevance"` for deterministic candidate ordering in `summary` or `agent` output
- `output.includeReadfileRequestHints: true` to produce `miku-readfile` handoff hints
- `output.contextLines`, `contextLinesBefore`, or `contextLinesAfter` for focused `detail` content hits
- `encoding.preset: "japanese-legacy"` for common Japanese legacy text file patterns

## Runtime Discipline

For explicit `miku-grep` requests, first check the bundled runtime artifacts before broad workspace exploration or generic tool discovery.

Unless the user or environment states another execution policy, use `cli-preferred`.

Policy values:

- `cli-only`: use only the bundled CLI backend; do not fall back to visible handoff
- `cli-preferred`: use the bundled CLI backend first; if CLI is unavailable, return visible handoff material
- `handoff-only`: do not execute backend operations; return visible JSON request guidance or handoff steps

For `cli-only` and `cli-preferred`, use this runtime order:

1. read this `SKILL.md`
2. check versioned runtime artifacts matching `skills/miku-grep/runtime/miku-grep-*.jar` and `skills/miku-grep/runtime/miku-grep-*.mjs`
3. prefer the newest Java jar for operations it supports
4. use the newest Node.js `.mjs` when the Java runtime is missing or unsuitable
5. only if the declared path is missing or unusable, report the runtime-path problem

Runtime artifact file versions may differ from the text returned by `--version`.
Use file-name versions for artifact selection, and use `--version` only as a smoke check that the runtime starts.

## Java-Only Operation

The helper files under `lib/*.mjs` require Node.js. They are convenience helpers
for runtime lookup, CLI invocation, result formatting, and tests. They are not
part of the Java runtime.

If the active environment has Java but does not have Node.js, use the Java jar
directly:

```bash
java -jar skills/miku-grep/runtime/miku-grep-<version>.jar < request.json > result.json
```

In Java-only mode, follow this `SKILL.md` and the references manually. The Java
runtime remains responsible for request validation, filesystem traversal,
matching content, matching file paths or directory paths, exclude handling, and
diagnostics.

When Node.js helpers are unavailable, the agent must do the helper work
explicitly:

1. read [references/workflow/search-workflow.md](references/workflow/search-workflow.md)
2. check whether the target repository has `.mikusoft/miku-grep.json`
3. prepare `request.json` with explicit `version`, `root`, `query`, `search`,
   and `output`
4. copy repo-local config values into `request.json` when needed
5. run the Java jar directly
6. inspect `result.json` and report truncation or diagnostics without hiding
   runtime messages

## Error Handling

Treat missing runtime artifacts, invalid JSON request shape, inaccessible root paths, malformed regex, and unsupported policy values as hard errors.
Treat runtime diagnostics such as unreadable files, skipped binary files, decode errors, and truncation as soft warnings when the result JSON has `ok: true`.

## Boundaries

- Do not add MCP server behavior in this repository.
- Do not call MCP tools as fallback.
- Do not present this as a generic grep skill that captures ordinary search requests.
- Do not replace the upstream `miku-grep` runtime implementation with skill-local search logic.
- Do not hide diagnostics or truncation from the runtime result.
- Do not put `root` or `query` defaults in `.mikusoft/miku-grep.json`; those belong in each request.

## References

Read these only when needed:

- [references/INDEX.md](references/INDEX.md) for detailed workflow, runtime, and examples
