# Wedding Invitation

Akira & Hinako の結婚式Web招待状プロジェクトです。

## Development

- HTML
- CSS
- Vanilla JavaScript
- Google Apps Script
- Google Spreadsheet

ローカル確認は VS Code の Live Server を使用します。

## Sprint 1: RSVP

RSVPは通常のHTMLフォームを非表示iframeへPOSTし、Google Apps Scriptから`postMessage`で結果を返します。ブラウザの`fetch()`を使わないため、GASのCORS制約を回避できます。

### Apps Script更新手順

1. スプレッドシートの「拡張機能」→「Apps Script」を開く
2. `gas/Code.gs` の全文をApps Scriptへ貼り付けて保存
3. 「デプロイ」→「デプロイを管理」→鉛筆アイコン
4. バージョンを「新バージョン」に変更してデプロイ
5. ウェブアプリURLが `js/script.js` の `GAS_URL` と一致していることを確認

### RSVPシートの列

1行目は次の順番です。

`回答日時 / 出欠 / 名前 / アレルギー / お子様 / 配慮事項 / メッセージ`

空のシートであれば、初回送信時に見出しを自動作成します。

## Branches

- `main`: 本番
- `develop`: 開発

## RSVP応答がタイムアウトする場合

`gas/Code.gs` の `createResponse_()` は `XFrameOptionsMode.ALLOWALL` を設定しています。変更後はApps Scriptを必ず「新しいバージョン」として再デプロイしてください。

また、`js/script.js` の `GAS_URL` が現在のウェブアプリURLと一致していることを確認してください。

## Sprint 2: Experience & Design

- 封筒オープン演出（同一タブでは初回のみ）
- Hero写真スライドショー / Ken Burns演出
- スクロール表示アニメーション
- Storyタイムライン
- 写真ライトボックス
- THE CONDER HOUSEの会場情報とGoogle Maps
- スマートフォン向けレスポンシブ調整

写真を変更する場合は `images/hero.jpg` と `images/photo1.jpg`〜`photo3.jpg` を同じファイル名で置き換えてください。

## Sprint 3A: Preview & Finalization Setup

### 変更しやすい設定

名前、日付、会場、GAS URL、使用画像は `js/config.js` に集約しています。
写真は同じファイル名で置き換える方法でも、`heroImages` / `galleryImages` のパスを変更する方法でも更新できます。

### GitHub Pagesで確認用公開

`.github/workflows/pages.yml` は `develop` へのpushでサイトをGitHub Pagesへ自動公開します。
初回のみGitHubリポジトリの **Settings → Pages → Source** を **GitHub Actions** に設定してください。

```bash
git add .
git commit -m "chore(release): prepare preview deployment and finalization"
git push origin develop
```

Actionsが完了すると、確認用URLがworkflowのDeployment欄に表示されます。
本番確定時はworkflowの対象ブランチを `develop` から `main` に変更します。

### 本番前確認

`FINAL_CHECKLIST.md` を上から確認してください。


## 和モダン試作 / Our Story写真

- `body.wa-modern` で和モダンテーマを適用しています。
- Our Storyの写真は `images/story/story1.jpg`〜`story3.jpg` です。
- 同名ファイルへ差し替えるだけで更新できます。
- 画像パスを変更する場合は `js/config.js` の `storyImages` を編集してください。
