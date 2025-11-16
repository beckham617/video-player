# Batch Convert MKV to MP4 Script
# This script converts all MKV files in a directory to MP4 format using FFmpeg
# It uses -c copy for fast remuxing (no re-encoding)

param(
    [string]$SourcePath = ".",
    [switch]$Recursive = $false,
    [switch]$DeleteOriginal = $false
)

# Check if FFmpeg is available
$ffmpegPath = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegPath) {
    Write-Host "ERROR: FFmpeg is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install FFmpeg from: https://ffmpeg.org/download.html" -ForegroundColor Yellow
    Write-Host "Or use: choco install ffmpeg (if you have Chocolatey)" -ForegroundColor Yellow
    exit 1
}

# Get all MKV files
if ($Recursive) {
    $mkvFiles = Get-ChildItem -Path $SourcePath -Filter "*.mkv" -Recurse -File
} else {
    $mkvFiles = Get-ChildItem -Path $SourcePath -Filter "*.mkv" -File
}

if ($mkvFiles.Count -eq 0) {
    Write-Host "No MKV files found in: $SourcePath" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($mkvFiles.Count) MKV file(s) to convert" -ForegroundColor Green
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $mkvFiles) {
    $outputPath = $file.FullName -replace '\.mkv$', '.mp4'
    
    # Skip if MP4 already exists
    if (Test-Path $outputPath) {
        Write-Host "⏭️  Skipping (MP4 already exists): $($file.Name)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "🔄 Converting: $($file.Name)" -ForegroundColor Cyan
    Write-Host "   Output: $([System.IO.Path]::GetFileName($outputPath))" -ForegroundColor Gray
    
    # Run FFmpeg conversion
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList "-i", "`"$($file.FullName)`"", "-c", "copy", "-y", "`"$outputPath`"" -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ Success: $([System.IO.Path]::GetFileName($outputPath))" -ForegroundColor Green
        
        # Get file sizes for comparison
        $originalSize = (Get-Item $file.FullName).Length / 1MB
        $newSize = (Get-Item $outputPath).Length / 1MB
        Write-Host "   Size: $([math]::Round($originalSize, 2)) MB → $([math]::Round($newSize, 2)) MB" -ForegroundColor Gray
        
        $successCount++
        
        # Delete original if requested
        if ($DeleteOriginal) {
            Remove-Item $file.FullName
            Write-Host "   🗑️  Original file deleted" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed: $($file.Name)" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

# Summary
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Conversion Complete!" -ForegroundColor Green
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "❌ Failed: $failCount" -ForegroundColor Red
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

