# PowerShell script to rename files: 航海王第01集_1920x1080.mp4 -> 航海王第001集_1920x1080.mp4
# Usage: .\rename_files.ps1 [directory_path]

param(
    [string]$TargetDir = $PWD
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Renaming files in: $TargetDir"
Write-Host "Pattern: 航海王第##集_1920x1080.mp4 -> 航海王第0##集_1920x1080.mp4 (where ## is exactly 2 digits)"
Write-Host ""

# Hard-coded regex pattern - match any characters before 第, then 2 digits, then 集, then _1920x1080.mp4
$pattern = [regex]::new('^(.*)第(\d{2})集_1920x1080\.mp4$')

Write-Host "Looking for files matching pattern: ^(.*)第(\d{2})集_1920x1080\.mp4$"
$files = Get-ChildItem -Path $TargetDir -File
Write-Host "Found $($files.Count) files in directory"
Write-Host ""

foreach ($file in $files) {
    Write-Host "Checking: $($file.Name)"
    if ($pattern.IsMatch($file.Name)) {
        $match = $pattern.Match($file.Name)
        $beforePart = $match.Groups[1].Value
        $twoDigitNumber = $match.Groups[2].Value
        $newFileName = $beforePart + '第0' + $twoDigitNumber + '集_1920x1080.mp4'
        Write-Host "  Match found! Digits: $twoDigitNumber"
        if ($file.Name -ne $newFileName) {
            Write-Host "  Renaming: $($file.Name) -> $newFileName"
            try {
                Rename-Item -Path $file.FullName -NewName $newFileName -ErrorAction Stop
                Write-Host "  Success!" -ForegroundColor Green
            } catch {
                Write-Host "  Error: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "  Already renamed, skipping" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  No match"
    }
    Write-Host ""
}

Write-Host "Done!"

