RSVP 郵便番号・住所追加

変更内容
- 「お名前」の直後に必須の郵便番号・住所を追加
- 郵便番号は 123-4567 / 1234567 の両方に対応
- GASで郵便番号・住所を検証して保存
- スプレッドシート末尾に「郵便番号」「住所」を追加
- 既存7列の回答データはずらさない
- プライバシー文言にも郵便番号・住所と案内送付目的を追記

GitHub側
1. developブランチでこのZIPを展開
2. リポジトリ直下で以下を実行
   git apply index-address.patch
3. 確認後にコミット
   git add index.html
   git commit -m "feat(rsvp): add postal code and address fields"
   git push origin develop

Apps Script側
1. gas/Code.gsをApps Scriptへ全文貼り替え
2. 保存
3. デプロイを管理 → 鉛筆 → 新バージョン → デプロイ
4. テスト送信し、RSVPシートのH列とI列に郵便番号・住所が入ることを確認
