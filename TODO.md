# TODO

`miku-grep-skills` を Agent Skills repository として整えるための作業メモです。

参考対象は `workplace/mikuproject-skills-devel` です。ただし、`miku-grep-skills` では少なくとも現時点で MCP サーバー対応は不要です。
そのため、MCP backend、MCP tool 対応表、`mcp-only` / `mcp-preferred` policy、MCP resource URI、MCP server setup はこの TODO の対象外とします。

## 1. Skill の基本境界を決める

- [x] skill 名を決める
  - 採用: `miku-grep`
- [x] upstream product 名と semantic center を明記する
- [x] activation rule を明示 opt-in にする
  - ユーザーが `miku-grep` を明示した場合だけ起動する
- [x] generic な検索、grep、ファイル調査、コード調査だけでは自動起動しないことを書く
- [x] product boundary と non-goals を `SKILL.md` に書く

## 2. Repository 形を整える

- [x] `README.md` を作る
- [x] `package.json` を作る
- [x] `skills/miku-grep/SKILL.md` を作る
- [x] `skills/miku-grep/references/INDEX.md` を作る
- [x] `skills/miku-grep/runtime/` を作る
- [x] `skills/miku-grep/lib/` を作る
- [x] `scripts/` を作る
- [x] `tests/` を作る
- [x] `workplace/` を作る
- [x] `workplace/.gitkeep` を置く
- [x] `.gitignore` で `workplace/*` を除外し、`workplace/.gitkeep` だけ例外にする

現在の形:

```text
skills/
  miku-grep/
    SKILL.md
    references/
      INDEX.md
      examples/
      runtime/
      workflow/
    runtime/
      miku-grep-<version>.jar
      miku-grep-<version>.mjs
    lib/
      runtime-artifacts.mjs
      backend-policy.mjs
      backend-operations.mjs
```

## 3. Runtime artifact 運用を真似る

- [x] upstream runtime artifact を `skills/miku-grep/runtime/` に置く方針を決める
- [x] Java CLI runtime がある場合は single jar として扱う
- [x] Node.js CLI runtime がある場合は single JavaScript file として扱う
- [x] version 付き artifact 名にする
  - `miku-grep-<version>.jar`
  - `miku-grep-<version>.mjs`
- [x] sources artifact を同梱するか決める
  - `miku-grep-sources-<version>.jar`
  - `miku-grep-sources-<version>.tgz`
- [x] broad workspace search より先に skill-local runtime を見る、と `SKILL.md` に書く
- [x] runtime artifact 更新手順を `docs/development.md` に書く
- [x] artifact のファイル名 version と `--version` 出力が一致しない場合があることを書く

## 4. Runtime artifact resolver を作る

- [x] `skills/miku-grep/lib/runtime-artifacts.mjs` を作る
- [x] `runtime/` 内の version 付き artifact を解決する
- [x] Java runtime、Node.js runtime、sources artifact を kind で解決できるようにする
- [x] version 比較で最新 artifact を選ぶ
- [x] artifact が無い場合は hard error にする
- [x] resolver の unit test を追加する

## 5. CLI-only / CLI-preferred 相当の backend policy を作る

MCP は対象外なので、backend policy は CLI と handoff だけに絞る。

- [x] policy 値を最小化する
  - `cli-only`
  - `cli-preferred`
  - `handoff-only`
- [x] default policy を決める
  - 採用: `cli-preferred`
- [x] `cli-only` では handoff に逃げない strict policy として扱う
- [x] `handoff-only` では CLI を実行しない
- [x] `cli-preferred` で CLI が使えない場合の扱いを決める
  - visible handoff に fallback する
- [x] `skills/miku-grep/lib/backend-policy.mjs` を作る
- [x] policy selector の unit test を追加する

対象外:

- `mcp-only`
- `mcp-preferred`
- MCP fallback
- MCP tool discovery

## 6. Operation map を作る

- [x] `skills/miku-grep/references/runtime/operations-map.md` を作る
- [x] skill operation 名を artifact role ベースで決める
- [x] operation から CLI command / args を引ける registry を作る
- [x] `skills/miku-grep/lib/backend-operations.mjs` を作る
- [x] CLI invocation builder は command / args を返すだけにする
- [x] 実際の process 実行は別責務にする
- [x] required input / output path の不足を hard error にする
- [x] operation registry の unit test を追加する

## 7. References を分割する

- [x] `SKILL.md` は短く保つ
- [x] 詳細は `references/` に逃がす
- [x] `references/INDEX.md` から参照できるようにする
- [x] runtime 操作は `references/runtime/` に置く
- [x] workflow は `references/workflow/` に置く
- [x] examples は `references/examples/` に置く
- [x] prompt が必要な場合だけ `references/prompts/` に置く
  - 現時点では prompt は不要なので作らない

## 8. Bundle script を作る

- [x] `scripts/build-skill-bundle.mjs` を作る
- [x] `bundle/miku-grep-skills/skills/miku-grep` を生成する
- [x] required runtime artifact が無い場合は build を失敗させる
- [x] `scripts/build-skill-bundle-zip.mjs` を作る
- [x] zip の root は `skills/` にする
- [x] `package.json` に script を追加する
  - `test`
  - `build:bundle`
  - `build:bundle:zip`
  - `build`
- [x] bundle smoke test を追加する

## 9. Smoke tests を作る

- [x] `npm test` で skill layer の契約を確認できるようにする
- [x] runtime artifact が存在することを確認する
- [x] Java runtime がある場合は `java -jar ... --version` を確認する
- [x] Node.js runtime がある場合は `node ... --version` を確認する
- [x] bundle を一時ディレクトリへコピーして孤立環境で起動確認する
- [x] README / SKILL / references の重要導線を test で確認する
- [x] policy selector の strict behavior を test で固定する

## 10. Documentation を整える

- [x] `README.md` を利用者入口にする
- [x] `docs/quickstart.md` を作る
- [x] `docs/development.md` を作る
- [x] `docs/skill-installation.md` を作る
- [x] runtime artifact 更新手順を書く
- [x] bundle 配布手順を書く
- [x] generated file の置き場所を決める
- [x] `workplace/` は local scratch であり通常 Git 管理しない、と書く

## 11. miku-soft 文書との整合

- [x] `miku-soft-40-agentskills-design` の方針に合わせる
- [x] upstream semantic center を skill 側で再定義しない
- [x] skill-local product logic を増やしすぎない
- [x] upstream public API / CLI / runtime artifact を優先する
- [x] hard error と soft warning を分ける
- [x] artifact role をファイル拡張子だけで判断しない
- [x] generated files は product-specific directory に置く

## 12. 現時点でやらないこと

- [x] MCP server を `miku-grep-skills` に入れない
- [x] MCP backend policy を入れない
- [x] MCP tool / resource / prompt 対応表を作らない
- [x] Agent Skill 側で upstream の grep / search logic を再実装しない
- [x] ブラウザ UI 操作を前提にしない
- [x] generic grep skill として広く自動起動する設計にしない

## 13. 次の強化

- [x] skill-local CLI runner を追加する
  - `skills/miku-grep/lib/cli-runner.mjs`
  - request JSON を stdin に渡し、stdout JSON / stderr / exit status を扱う
  - search logic は実装しない
- [x] Java / Node.js runtime の同一 request parity test を追加する
- [x] JSON result を agent 向けに短く要約する formatter を追加する
  - 入力: `search_result_json`
  - 出力: concise summary text
  - 注意: 元 result JSON は捨てず、要約は表示用 artifact として扱う
- [x] invalid request / expected failure の smoke test を追加する
  - 空 query
  - invalid regex
- [x] invalid request / expected failure の smoke test を追加する
  - root not found
- [x] runner と formatter を組み合わせる利用例 test を追加する

## 14. 品質強化

- [x] `README` / `SKILL.md` / docs の整合テストを強くする
  - policy 値
  - runtime artifact 名
  - operation 名
  - artifact role
  - MCP backend policy を入れないこと
- [x] release bundle zip の中身を検査する test を追加する
  - `skills/miku-grep/SKILL.md`
  - runtime jar / mjs
  - references
  - lib
  - `.DS_Store`、`tests/`、`docs/`、`bundle/`、`node_modules/` の除外
- [x] request JSON -> runner -> result JSON -> formatter summary の workflow test を追加する
