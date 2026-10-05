# タイ暮らし / Thai Life

GitHub Pagesで配信するPWA。データはGitHub Actionsで更新します。GAS・スプレッドシート・個人アクセストークンは不要です。

## 初回移行

1. ローカル変更（削除ファイル、新規.github/workflowsとscripts、testsも含む）をcommitしてmainへpush。
2. GitHubの Settings → Pages → Source を **GitHub Actions** に変更。従来のmain /docs設定から切り替えます。
3. Actions → **Update data and publish** → Run workflow → main / all を選んで実行。
4. build と deploy の成功を確認し、公開サイトを開き直します。

公開先: https://rinyan-thai23.github.io/---Thai-Life-App/
公開対象フォルダーは引き続きdocsです。GASへのpushやWebアプリの再デプロイは不要です。

## 手動更新

| update | 内容 |
|---|---|
| all | 為替・数字・休日すべて |
| daily | 為替と数字 |
| fx | 為替のみ |
| lucky | 数字のみ（実行ごとに再抽選） |
| holidays | 当年・翌年の銀行休日 |
| none | データを変えず公開のみ |

**定期実行は設定していません。** 将来はdailyを毎日タイ時間3時ごろ、holidaysを毎月1日に実行する想定です。
mainへの通常pushではデータは更新せず、テストとサイト公開だけを行います。
Actions内蔵のGITHUB_TOKENを使用します。Secretsへの登録や個人トークンは不要です。
ブランチ保護で直接commitを禁止している場合、更新のpushが失敗します。前回公開サイトは残ります。
Actionsがdaily.jsonをcommitするため、PCで作業する前にPullしてください。

## データ

- 為替: Frankfurter / ECBの参考レート。営業日ベース。10日より古い値は拒否。
- 数字: 00〜99から重複なしで3つ。宝くじ分析は行いません。
- 休日: BOT公式の当年・翌年の銀行休業日。日本語訳がない名称は英語表示。バンコク限定日を区別。南部の注記のみの追加休日、官公庁・入管の休日は自動取得しません。
- 天気・PM2.5: ブラウザーからOpen-Meteoへ直接アクセス。
- 個人の期限・地域: ブラウザー内のみ保存。

更新元すべてを検証してからJSONを書き換えます。取得失敗時は保存・公開せず前回値を保持します。翌年が空リストの場合は既存の翌年分を保持します。別出典・手動追加の休日も残します。
アプリは取得中表示と通信失敗時の前回データ表示に対応します。Pages公開後、既存タブを閉じて開き直すと古いアプリコードが残りにくくなります。

## ローカル実行

Node.js 22以上。追加パッケージは不要です。

```sh
node --test tests/*.test.cjs tests/*.test.mjs
node scripts/update-data.mjs all
python -m http.server 8000 --directory docs
```

## 旧GASの片付け

ローカルのGASとclasp設定は廃止しました。Google側のスクリプト・シート・デプロイは変更していません。
今回発行したThai-Life-GAS個人トークンはGitHub側で失効させ、GASのGITHUB_TOKENプロパティも削除できます。旧GASに登録済みトリガーがある場合は停止してください。

## 出典

- https://frankfurter.dev/
- https://www.bot.or.th/en/financial-institutions-holiday.html
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
