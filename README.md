# miku-grep-skills

`miku-grep-skills` is an Agent Skills package for using `miku-grep` from agent workflows.

`miku-grep` is a local-first structured grep runtime for AI agents and automation. It accepts JSON requests through stdin and returns structured JSON results through stdout.

## Quick Start

1. Put runtime artifacts under `skills/miku-grep/runtime/`.
2. Run `npm test`.
3. Run `npm run build:bundle`.
4. Install the generated `bundle/miku-grep-skills/skills/miku-grep` directory into your skill home.
5. In conversation, explicitly start with `miku-grep`.

Typical requests:

- search file contents with a literal query
- search filenames with a regex query
- return file-level summaries for agent context
- return detailed matches for focused inspection

## Notes

- This repository does not provide MCP server integration.
- The skill is opt-in and should not activate for generic search or code investigation requests.
- The skill uses bundled CLI runtime artifacts before broad workspace exploration.
- Java and Node.js runtime artifact file versions may differ from the `--version` output.
- With current runtime artifacts, `excludeFileNamePatterns` and `excludeDirNamePatterns` replace the corresponding default exclude presets when specified. If they are omitted, default excludes are used.

Expected runtime artifact names:

- `skills/miku-grep/runtime/miku-grep-<version>.jar`
- `skills/miku-grep/runtime/miku-grep-<version>.mjs`

## Developer Documents

- [docs/quickstart.md](docs/quickstart.md)
- [docs/development.md](docs/development.md)
- [docs/skill-installation.md](docs/skill-installation.md)
- [skills/miku-grep/references/INDEX.md](skills/miku-grep/references/INDEX.md)

## License

Apache License 2.0. See [LICENSE](LICENSE).
