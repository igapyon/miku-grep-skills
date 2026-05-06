# References Index

Use this index when you need detailed guidance beyond the core rules in `SKILL.md`.

## Workflow

- [workflow/search-workflow.md](workflow/search-workflow.md)
  - request construction
  - file inventory requests
  - agent candidate output
  - result handling
  - diagnostics

## Runtime

- [runtime/operations-map.md](runtime/operations-map.md)
  - operation list
  - CLI runtime correspondence

## Examples

- [examples/search-examples.md](examples/search-examples.md)
  - content search
  - filepath and directory search
  - glob path search
  - file inventory
  - agent candidate search
  - detail output

When Node.js helpers are unavailable, use the Java-only flow in
[workflow/search-workflow.md](workflow/search-workflow.md). In that mode, the
agent prepares `request.json` explicitly from these Markdown instructions and
then runs the Java jar directly.

Repo-local `.mikusoft/miku-grep.json` defaults are documented in the repository
README and docs. In installed skill bundles, use `SKILL.md` and
`workflow/search-workflow.md` for the operational summary.
