# Project: 栄養管理物品発注システム 本番実運用向け総合品質検証・堅牢化 (PROJECT.md)

## Architecture
- **フロントエンド正本**: `docs/index.html` (GitHub Pages公開用), `index.html`, `standalone.html` (React 18 + Tailwind CSS + Babel Standalone)
- **バックエンド / 永続化**: Google Apps Script (`gas_backend.js`) + Googleスプレッドシート（正本データ）
- **エッジ / 代替基盤**: Cloudflare Pages Functions (`functions/api/`) + D1 (`schema.sql`)
- **テストハーネス**: Node.js 自動検証スクリプト (`tests/run.mjs`, `tests/e2e_verification.mjs`)

## Feature Inventory & Issue Matrix (調査結果統合)

| # | 課題 / 機能項目 | 区分 | 深刻度 | 担当ロール | 対象ファイル |
|---|---|---|---|---|---|
| F1 | 複数業者FAXステータス更新競合の完全解消 (1社完了で他社明細が消失するバグ) | 承認・FAX | **P0 (致命的)** | 🪓 シュタルク & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html`, `gas_backend.js` |
| F2 | FAX/PDF印刷時の白紙化・包含ブロック破壊の完全解消 (@media print適正化) | 印刷 | **P0 (致命的)** | 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F3 | 発注送信ボタンの二重送信ガード (ダブルサブミット防止・loading表示) | 現場発注 | **P0 (致命的)** | 🪓 シュタルク & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F4 | 外部FAX注文書備考欄における入居者実名マスキング (PII保護・個人情報保護法遵守) | セキュリティ | **P0 (致命的)** | 🛡️ メトーデ & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F5 | 設定画面 Step 5 (GASシステム設定) タブのUIナビゲーション復元 | 設定管理 | **P1 (高)** | 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F6 | 数量手入力時のBackSpaceによる個人名メモ即時消滅バグの修正 | 現場発注 | **P1 (高)** | 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F7 | 全角数字入力の半角自動正規化 (全角入力で0リセットされる問題の解消) | 現場発注 | **P1 (高)** | 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F8 | FAX様式Bにおける異なる単位 (本＋個) の不正合算防止 | FAX集計 | **P1 (高)** | 🪓 シュタルク & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F9 | 発注送信前確認ダイアログの新設 (ユニット誤送信・誤発注防止) | 現場発注 | **P1 (高)** | 🍷 ハイター & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F10 | 「前回の発注を呼び出す」の重複加算防止 (上書き確認ダイアログ化) | 現場発注 | **P1 (高)** | 🍷 ハイター & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F11 | 管理栄養士画面における未提出ユニット一覧バッジ表示 (締切前確認UI) | 承認 | **P1 (高)** | 🍷 ハイター & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F12 | FAX確認者「(なし・印字しない)」選択肢の復元 | FAX出力 | **P1 (高)** | 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F13 | ユニット・管理栄養士の無効化（active:false）時の一覧保持 (GAS側修正) | マスター管理 | **P2 (中)** | 🪓 シュタルク | `gas_backend.js` |
| F14 | タブレット操作性向上 (数量増減ボタン 44px への拡大、重複className解消) | UX / UI | **P2 (中)** | 🍷 ハイター & 🪄 フリーレン | `index.html`, `docs/index.html`, `standalone.html` |
| F15 | CSVエクスポートのRFC 4180準拠 (ダブルクォートエスケープ) | データ出力 | **P2 (中)** | 🪓 シュタルク | `index.html`, `docs/index.html`, `standalone.html` |
| F16 | 全HTMLファイル (`index.html`, `docs/index.html`, `standalone.html`) の完全同期保証 | インフラ | **P0 (致命的)** | 🪓 シュタルク | 全体 |

## Milestones

| # | Milestone Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | P0 & P1 コアバグ修正・堅牢化 (F1〜F15) | Frontend / Backend / Security / UX の全致命的・高優先課題の解消 | none | IN_PROGRESS |
| M2 | ファイル同期・一貫性保証 (F16) | `docs/index.html`, `index.html`, `standalone.html` の完全同一化・コミット準備 | M1 | PLANNED |
| M3 | 自動E2Eテスト検証 & 辛口QAレビュー | テストスクリプト作成・実行、フェルン辛口レビュー、ハイターUX・メトーデセキュリティ検証 | M2 | PLANNED |
| M4 | 監査・ステータス更新・Obsidianログ記録 | Forensic Auditor整合性検証、status.md EXP加算、Obsidian Vaultログ記録、Sentinel報告 | M3 | PLANNED |

## Code Layout
- `docs/index.html`: 本番GitHub Pages配信ファイル（主たる編集対象）
- `index.html`: ルート開発用ファイル（`docs/index.html`と同一内容に同期）
- `standalone.html`: スタンドアロン配布用（`docs/index.html`と同一内容に同期）
- `gas_backend.js`: Google Apps Scriptバックエンドコード
- `tests/`: 自動テストコード (`tests/run.mjs`, `tests/test_audit.mjs` 等)

## Interface Contracts
- **GAS Web App API**:
  - `action: 'updateOrderStatusByVendor'`: `{ vendorId: Number, status: String, sender: String }`
  - `action: 'bulkSubmit'`: `{ requestId: String, order: Object }` (二重送信防止用 requestId 必須)
  - `action: 'getInitialData'`: ユニット・栄養士の `active: false` も含めて返却（設定画面で有効化トグル可能にする）
- **FAX注文書印字仕様**:
  - 備考欄: 個人名（山田太郎様等）は印字せず、`[ユニット名] (個人分)` と印字。施設内画面・CSV・スプレッドシートには個人名フル保持。
