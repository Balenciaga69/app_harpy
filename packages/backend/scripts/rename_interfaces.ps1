# PowerShell script to check and rename interface files to PascalCase matching content names

param (
    [string]$RootPath = "src/features/combat/interfaces"
)

$filesToRename = @()

function Get-ExportedName {
    param ([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    if ($content -match 'export\s+(class|interface|type)\s+(\w+)') {
        return $matches[2]
    }
    return $null
}

function IsPascalCase {
    param ([string]$name)
    return $name -cmatch '^[A-Z][a-zA-Z0-9]*$'
}

Get-ChildItem -Path $RootPath -Recurse -Filter "*.ts" | ForEach-Object {
    $filePath = $_.FullName
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $exportedName = Get-ExportedName -filePath $filePath
    
    if ($exportedName -and (IsPascalCase -name $exportedName)) {
        if ($fileName -ne $exportedName) {
            $filesToRename += @{
                Path = $filePath
                CurrentName = $fileName
                NewName = $exportedName
            }
        }
    }
}

Write-Host "Files to rename:"
$filesToRename | ForEach-Object {
    Write-Host "$($_.Path): $($_.CurrentName).ts => $($_.NewName).ts"
}

# Now rename the files
$filesToRename | ForEach-Object {
    $newPath = [System.IO.Path]::Combine([System.IO.Path]::GetDirectoryName($_.Path), "$($_.NewName).ts")
    Rename-Item -Path $_.Path -NewName "$($_.NewName).ts" -Force
    Write-Host "Renamed $($_.Path) to $newPath"
}