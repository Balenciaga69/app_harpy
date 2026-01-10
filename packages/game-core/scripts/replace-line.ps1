# 定義要處理的路徑
$paths = @(
   "g:\Coding\app_harpy\packages\backend-nest\src",
   "g:\Coding\app_harpy\packages\game-core\src"
)

# 遍歷每個路徑並處理檔案
foreach ($path in $paths) {
   Get-ChildItem -Path $path -Recurse -Include *.ts | ForEach-Object {
      (Get-Content $_.FullName) -join "`n" -replace "`n`n", "`n" | Set-Content $_.FullName
   }
}