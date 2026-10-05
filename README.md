# タイ暮らし：アプリ・GAS一式

公開済みプロトタイプの最新版です。

- docs/：HTML・CSS・JavaScript、画像、地域データ、PM2.5取得、2026年銀行休日、サンプル為替・数字、PWA設定
- gas/：スプレッドシートに貼るGASと手動運用手順書

## Codexへの引き継ぎ
GitHubのSettings → Pagesで、Sourceを「Deploy from a branch」、Branchをコードのあるブランチ（通常main）、Folderを「/docs」に設定する。
公開URLは https://rinyan-thai23.github.io/---Thai-Life-App/ 。URLの末尾にdocs/は付けない。
manifest.webmanifestのid・start_url・scopeは相対パス（./）に設定済み。Service Workerとアセットも相対パスで参照する。
Googleスプレッドシート本体はGoogle側に置く。GASコードのコピーをリポジトリで管理する。実行場所はGoogle Apps Script。
GAS運用手順はgas/README.mdを読む。「タイ暮らし」はシート名ではなく、上部メニュー。PCブラウザでシートを開き直すか、onOpenを実行する。
為替・ランダム数字・銀行休日はGASの個別関数で手動更新できる。宝くじ分析は廃止。トリガーは未設定で、作成処理もない。アプリ接続にはWebアプリ公開後にdocs/config.jsのdailyUrlを設定する。手順はgas/README.mdを参照。

## 動作確認
HTTPサーバーでdocs/を配信して確認する。ファイルを直接開くとJSON読込やService Workerが動作しない。
例：python -m http.server 8000 --directory docs
本番PWAはHTTPSで公開する。

## 公開データ
同梱daily.jsonの為替とラッキーナンバーはサンプル。GAS接続後は手動更新した実レートとランダム数字を表示する。天気・PM2.5はOpen-Meteoのモデルデータ。休日は2026年BOT銀行休業日。官公庁の休業日は含まない。
地域・個人の期限は利用者ブラウザに保存されるため、このZIPに個人の登録内容は含まれない。
