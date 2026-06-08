# Miku Grep Skill Installation

## Target

Install the generated `igapyon-miku-grep` skill into an agent skill home.

## Build

From the repository root:

```bash
npm run build:bundle
```

This creates:

```text
bundle/miku-grep-skills/
  skills/
    igapyon-miku-grep/
      SKILL.md
      references/
      runtime/
```

## Install

Copy the generated `skills/igapyon-miku-grep` directory under your skill home `skills/` directory.

Do not copy only `SKILL.md`.
The `runtime/` directory is required for normal CLI execution.

## Verify

After installation, start with an explicit request such as:

```text
miku-grep, search this workspace for TODO and summarize matching files.
```

The skill should not activate for generic search requests that do not name `igapyon-miku-grep` or `miku-grep`.
