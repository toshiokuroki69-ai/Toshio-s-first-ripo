# Grammar Pocket

iPhone で使える英文法の学習アプリです（PWA / Webアプリ）。App Store や Mac は不要で、Safari から「ホーム画面に追加」するとアプリのように使えます。

## できること

- 10単元：現在完了・過去完了・仮定法・関係詞・冠詞・前置詞・受動態・不定詞と動名詞・比較・助動詞
- 各単元のポイント解説 → 4択クイズ（日本語の解説つき）
- ランダム10問、間違えた問題だけを解く「苦手を復習」
- 連続日数・正答率・単元ごとのベストスコア（端末内に保存）
- 例文の読み上げ（iPhone の音声合成）
- ダークモード対応、2回目以降はオフラインでも起動

## iPhone で使う手順（GitHub Pages）

1. GitHub でこのリポジトリの **Settings → Pages** を開く
2. **Source** を「Deploy from a branch」、ブランチを選んでフォルダは `/ (root)` にして保存
3. 数分後に表示される URL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）を iPhone の Safari で開く
4. 共有ボタン →「ホーム画面に追加」

## 問題を追加するには

`index.html` の `TOPICS` 配列に追加します。`q` の `___` が空欄、`a` は正解の選択肢の番号（0始まり）です。

```js
{ q: "I ___ to London three times.", c: ["have been", "went", "have gone", "am going"], a: 0, e: "解説" }
```

## ファイル構成

- `index.html` … アプリ本体（HTML / CSS / JS と問題データ）
- `manifest.webmanifest` … ホーム画面アイコンなどの設定
- `sw.js` … オフライン用キャッシュ
- `icons/` … アプリアイコン
