@echo off
REM Batch Convert MKV to MP4 Script (Windows Batch)
REM This script converts all MKV files in the current directory to MP4 format

echo ========================================
echo MKV to MP4 Batch Converter
echo ========================================
echo.

REM Check if FFmpeg is available
where ffmpeg >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: FFmpeg is not installed or not in PATH
    echo Please install FFmpeg from: https://ffmpeg.org/download.html
    pause
    exit /b 1
)

REM Count MKV files
set COUNT=0
for %%f in (*.mkv) do set /a COUNT+=1

if %COUNT%==0 (
    echo No MKV files found in current directory
    pause
    exit /b 0
)

echo Found %COUNT% MKV file(s) to convert
echo.
echo Starting conversion...
echo.

set SUCCESS=0
set FAILED=0

for %%f in (*.mkv) do (
    set "INPUT=%%f"
    set "OUTPUT=%%~nf.mp4"
    
    REM Check if MP4 already exists
    if exist "%%~nf.mp4" (
        echo [SKIP] %%f - MP4 already exists
        goto :next
    )
    
    echo [CONVERTING] %%f
    echo            to %%~nf.mp4
    
    REM Run FFmpeg conversion
    ffmpeg -i "%%f" -c copy -y "%%~nf.mp4" >nul 2>&1
    
    if %ERRORLEVEL%==0 (
        echo [SUCCESS] %%~nf.mp4
        set /a SUCCESS+=1
    ) else (
        echo [FAILED] %%f
        set /a FAILED+=1
    )
    echo.
    
    :next
)

echo ========================================
echo Conversion Complete!
echo Successful: %SUCCESS%
if %FAILED% GTR 0 echo Failed: %FAILED%
echo ========================================
pause

