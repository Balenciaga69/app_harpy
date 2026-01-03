# script.tips.md

## Windows PowerShell 常用遞迴檔案列舉指令

- 列出資料夾下所有檔案 (絕對路徑):

  ```powershell
  Get-ChildItem -Recurse -File "G:\Coding\app_harpy\packages\game-core\src" | Select-Object -ExpandProperty FullName
  ```

- 列出資料夾下所有檔案 (相對路徑):

  ```powershell
  Get-ChildItem -Recurse -File "你的資料夾路徑" | ForEach-Object { $_.FullName.Replace((Get-Location).Path + "\", "") }
  ```

- 只列出特定副檔名 (如 .ts):
  ```powershell
  Get-ChildItem -Recurse -File -Include *.ts "你的資料夾路徑"
  ```

最後更新:2025-12-11

## VS Code

- `code --list-extensions`: 列出已安裝的擴充套件
