# タイ暮らし：アプリ・GAS一式

公開済みプロトタイプの最新版です。

- pwa/：HTML・CSS・JavaScript、画像、地域データ、PM2.5取得、2026年銀行休日、サンプル為替・数字、PWA設定
- gas/：スプレッドシートに貼るGASと手動運用手順書

## Codexへの引き継ぎ
このZIPを展開してリポジトリを作成する。pwa/をGitHub Pagesの公開対象にし、必要ならdocs/へ移す。
GitHub PagesのプロジェクトURLは /リポジトリ名/ 配下になるため、manifest.webmanifestのid・start_url・scopeを相対パスまたは公開先のパスへ調整する。Service Workerの登録・スコープ・キャッシュも確認する。現在のManifestはサイト直下を想定している。
Googleスプレッドシート本体はGoogle側に置く。GASコードのコピーをリポジトリで管理する。実行場所はGoogle Apps Script。
GAS運用手順はgas/README.mdを読む。「タイ暮らし」はシート名ではなく、上部メニュー。PCブラウザでシートを開き直すか、onOpenを実行する。
完成までは手動運用。為替API自動取得・宝くじ履歴の分析・公開データの自動アップロードは未実装。自動トリガーは有効にしない。

## 動作確認
HTTPサーバーでpwa/を配信して確認する。ファイルを直接開くとJSON読込やService Workerが動作しない。
例：python -m http.server 8000 --directory pwa
本番PWAはHTTPSで公開する。

## 公開データ
為替とラッキーナンバーはサンプル。天気・PM2.5はOpen-Meteoのモデルデータ。休日は2026年BOT銀行休業日。官公庁の休業日は含まない。
地域・個人の期限は利用者ブラウザに保存されるため、このZIPに個人の登録内容は含まれない。
