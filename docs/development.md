# Development Notes

## Documents

- [quickstart.md](quickstart.md)
- [skill-installation.md](skill-installation.md)
- [../TODO.md](../TODO.md)
- [../skills/miku-grep/SKILL.md](../skills/miku-grep/SKILL.md)
- [../skills/miku-grep/references/INDEX.md](../skills/miku-grep/references/INDEX.md)

## Runtime Artifact Operation

`miku-grep-skills` uses runtime artifacts under `skills/miku-grep/runtime/`.
Normal skill operation should not depend on an upstream source tree.

Expected artifacts:

- `miku-grep-<version>.jar`
- `miku-grep-<version>.mjs`

Optional source artifacts:

- `miku-grep-sources-<version>.jar`
- `miku-grep-sources-<version>.tgz`

The file-name version is used to select the newest artifact.
The runtime `--version` output is only a startup smoke check and does not need to match the file-name version exactly.

## Local Work

Use repository-root `workplace/` for local scratch files, upstream checks, generated outputs, and temporary verification files.
Only `workplace/.gitkeep` should be tracked.

For product workflow artifacts, prefer a workspace-local `miku-grep/` tree:

```text
miku-grep/
  state/
  output/
  tmp/
```

## Tests

Run:

```bash
npm test
```

The tests cover:

- runtime artifact resolution
- CLI/handoff backend policy
- CLI invocation shape
- runtime smoke checks
- bundle generation
- documentation links and boundary wording

## Bundle

Run:

```bash
npm run build:bundle
```

The generated installable tree is:

```text
bundle/miku-grep-skills/
  skills/
    miku-grep/
```

Run this for a zip:

```bash
npm run build:bundle:zip
```
