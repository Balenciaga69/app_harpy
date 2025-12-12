# script.tips.md

## Windows PowerShell 常用遞迴檔案列舉指令

- 列出資料夾下所有檔案（絕對路徑）：

  ```powershell
  Get-ChildItem -Recurse -File "C:\Users\wits\Desktop\GitRepo\app_harpy\packages\backend\src\features\combat" | Select-Object -ExpandProperty FullName
  ```

- 列出資料夾下所有檔案（相對路徑）：

  ```powershell
  Get-ChildItem -Recurse -File "你的資料夾路徑" | ForEach-Object { $_.FullName.Replace((Get-Location).Path + "\", "") }
  ```

- 只列出特定副檔名（如 .ts）：
  ```powershell
  Get-ChildItem -Recurse -File -Include *.ts "你的資料夾路徑"
  ```

## macOS/Linux (bash/zsh) 常用遞迴檔案列舉指令

- 列出所有檔案（flat）：

  ```bash
  find ./你的資料夾 -type f
  ```

- 只列出特定副檔名（如 .ts）：
  ```bash
  find ./你的資料夾 -type f -name "*.ts"
  ```

## 小技巧

- 這些指令可快速攤平專案結構，方便做批次處理、搜尋、或產生清單。
- 可搭配 grep、Select-String 等工具進行內容篩選。
- 在 VS Code 也可用全域搜尋（Ctrl+Shift+F）達到類似效果。

---

最後更新：2025-12-11
