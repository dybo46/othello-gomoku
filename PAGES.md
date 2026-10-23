# GitHub PagesでCPU専用デモを公開する

公開リポジトリは https://github.com/dybo46/othello-gomoku です。CPU専用デモは https://dybo46.github.io/othello-gomoku/ で遊べます。Pagesへ配信するのは `docs/` だけです。`self-host/` や運用資料を公開サイトへ混ぜません。

1. `LICENSE-STATUS.md`の現在の利用条件表示を確認します。条件未選定の状態から、AIが勝手にライセンスを追加しないでください。
2. この独立したプロジェクトをGitHubのリポジトリへ保存します。作者の運用フォルダー全体や個人の設定を追加しないでください。
3. リポジトリの Settings → Pages → Build and deployment で「Deploy from a branch」を選択します。
4. 対象ブランチをmain、公開フォルダーを `/docs` に指定します。
5. GitHubが表示するPagesのURLを開きます。CPU戦とCPU観戦を確認します。

無料プランでのPages公開には通常、公開リポジトリを使います。プランや表示項目はGitHub公式の案内も確認してください。

公式説明： https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

デモはサブパスでも動く相対URLを使用します。公開デモのURLは `https://dybo46.github.io/othello-gomoku/` です。作者のゲームサーバーへの接続先は記入しません。

Pagesはブラウザ用の画像・プログラムを配信します。このCPUデモにネット対戦機能や外部ゲームサーバーの設定を追加しないでください。利用者自身のサーバーへの設置は別の `self-host/` で行います。
