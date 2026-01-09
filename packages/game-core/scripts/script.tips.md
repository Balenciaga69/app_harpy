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

---

- `code --list-extensions`: 列出已安裝的擴充套件

`cloc` 支援多種語法與參數，以下是常用的幾個：

- **指定語言**

  ```sh
  cloc --include-lang=TypeScript .
  ```

  只統計 TypeScript。

- **排除資料夾**

  ```sh
  cloc . --exclude-dir=node_modules,dist
  ```

  排除 node_modules 和 dist。

- **輸出為 JSON**

  ```sh
  cloc . --json
  ```

- **統計多種語言**

  ```sh
  cloc --include-lang=TypeScript,JavaScript .
  ```

- **只顯示總結**

  ```sh
  cloc . --report-file=summary.txt
  ```

- **統計特定副檔名**

  ```sh
  cloc . --include-ext=ts,tsx
  ```

- **顯示每個檔案的統計**

  ```sh
  cloc . --by-file
  ```

- **顯示詳細說明**

  ```sh
  cloc --help
  ```

- 我個人使用:`cloc --include-lang=TypeScript . --exclude-dir=data`
