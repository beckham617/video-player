@echo off
chcp 65001 >nul
REM Batch file to rename files: 航海王第01集_1920x1080.mp4 -> 航海王第001集_1920x1080.mp4
REM Usage: rename_files.bat [directory_path]
REM If no directory is specified, uses current directory

set "TARGET_DIR=%~1"
if "%TARGET_DIR%"=="" set "TARGET_DIR=%CD%"

echo Renaming files in: %TARGET_DIR%
echo Pattern: 航海王第##集_1920x1080.mp4 -^> 航海王第0##集_1920x1080.mp4 (where ## is exactly 2 digits)
echo.

REM Execute PowerShell directly - pattern matches any text before 第, then 2 digits, then 集, then _1920x1080.mp4
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $dir = '%TARGET_DIR%'; $pattern = [regex]::new('^(.*)第(\d{2})集_1920x1080\.mp4$'); Write-Host 'Looking for files matching pattern: ^(.*)第(\d{2})集_1920x1080\.mp4$'; $files = Get-ChildItem -Path $dir -File; Write-Host \"Found $($files.Count) files in directory\"; Write-Host ''; foreach ($file in $files) { Write-Host \"Checking: $($file.Name)\"; if ($pattern.IsMatch($file.Name)) { $match = $pattern.Match($file.Name); $beforePart = $match.Groups[1].Value; $twoDigitNumber = $match.Groups[2].Value; $newFileName = $beforePart + '第0' + $twoDigitNumber + '集_1920x1080.mp4'; Write-Host \"  Match found! Digits: $twoDigitNumber\"; if ($file.Name -ne $newFileName) { Write-Host \"  Renaming: $($file.Name) -> $newFileName\"; Rename-Item -Path $file.FullName -NewName $newFileName -ErrorAction Stop; Write-Host \"  Success!\" -ForegroundColor Green } else { Write-Host \"  Already renamed, skipping\" -ForegroundColor Yellow } } else { Write-Host \"  No match\" }; Write-Host '' }"

echo.
echo Done!
pause

