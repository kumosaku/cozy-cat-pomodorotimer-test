# 初回のみ実行するGitHub初期セットアップスクリプト
# 2回目以降の更新は gitpush.ps1 を使用してください
#
#
# 【実行前にやること】
#   1. ブラウザで github.com にログインする
#   2. 右上の「+」→「New repository」でリポジトリを作成する
#      - 「Initialize this repository」は チェックしない
#   3. 作成後に表示される URL をコピーしておく
#      例: https://github.com/ユーザー名/リポジトリ名.git
#
# 【確認用URL】
#   クリックして、リンク移動できるように自分のGITのリンクをここにコピペしておくと便利ですよ

$repoUrl = Read-Host "GitHubリポジトリのURL"

git init
git add .
git commit -m "Initial commit"
git remote add origin $repoUrl
git push -u origin master

Write-Host ""
Write-Host "完了！GitHubへのアップロードが完了しました。" -ForegroundColor Green
Write-Host "次回以降の更新は .\gitpush.ps1 を使用してください。" -ForegroundColor Cyan
