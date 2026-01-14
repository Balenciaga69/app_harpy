$paths = @(
   "G:\Coding\app_harpy\packages\backend-nest\src",
   "G:\Coding\app_harpy\packages\game-core\src"
   # "C:\Users\wits\Desktop\GitRepo\app_harpy\packages\backend-nest\src",
   # "C:\Users\wits\Desktop\GitRepo\app_harpy\packages\game-core\src"
)
foreach ($path in $paths) {
   if (-not (Test-Path $path)) {
      Write-Host "Path not found: $path" -ForegroundColor Yellow
      continue
   }

   Get-ChildItem -Path $path -Recurse -Include *.ts | ForEach-Object {
      $content = Get-Content $_.FullName -Raw -Encoding utf8

      if ([string]::IsNullOrWhiteSpace($content)) {
         return
      }

      $newContent = $content -replace '(\r?\n)\r?\n', '$1'

      if ($content -ne $newContent) {
         $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
         [System.IO.File]::WriteAllText($_.FullName, $newContent, $utf8NoBom)
         Write-Host "Updated: $($_.FullName)" -ForegroundColor Green
      }
   }
}