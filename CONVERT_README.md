# MKV to MP4 Batch Conversion Scripts

This folder contains scripts to batch convert MKV files to MP4 format.

## Prerequisites

**FFmpeg must be installed** on your system.

### Install FFmpeg on Windows:

1. **Using Chocolatey** (recommended):
   ```powershell
   choco install ffmpeg
   ```

2. **Manual Installation**:
   - Download from: https://ffmpeg.org/download.html
   - Extract and add to PATH
   - Or download from: https://www.gyan.dev/ffmpeg/builds/

3. **Verify Installation**:
   ```powershell
   ffmpeg -version
   ```

## Scripts Available

### 1. PowerShell Script (Recommended) - `convert-mkv-to-mp4.ps1`

**Features:**
- ✅ Recursive directory scanning
- ✅ Progress indicators
- ✅ File size comparison
- ✅ Option to delete originals
- ✅ Skip existing MP4 files
- ✅ Detailed error reporting

**Usage:**

```powershell
# Convert MKV files in current directory
.\convert-mkv-to-mp4.ps1

# Convert MKV files in specific directory
.\convert-mkv-to-mp4.ps1 -SourcePath "D:\Videos"

# Convert recursively (all subdirectories)
.\convert-mkv-to-mp4.ps1 -SourcePath "D:\Videos" -Recursive

# Convert and delete original MKV files
.\convert-mkv-to-mp4.ps1 -SourcePath "D:\Videos" -DeleteOriginal
```

**Parameters:**
- `-SourcePath`: Directory to search for MKV files (default: current directory)
- `-Recursive`: Search subdirectories too
- `-DeleteOriginal`: Delete MKV file after successful conversion

### 2. Batch Script - `convert-mkv-to-mp4.bat`

**Features:**
- ✅ Simple double-click to run
- ✅ Converts all MKV files in current directory
- ✅ Basic progress reporting

**Usage:**

1. Place the `.bat` file in the folder with your MKV files
2. Double-click to run
3. Or run from command prompt:
   ```cmd
   convert-mkv-to-mp4.bat
   ```

## How It Works

Both scripts use FFmpeg with the `-c copy` flag, which means:
- ⚡ **Fast**: Only changes the container (MKV → MP4)
- 🎯 **No Quality Loss**: No re-encoding, preserves original quality
- 💾 **Same Size**: File size remains approximately the same

## Example Output

```
Found 5 MKV file(s) to convert

🔄 Converting: video1.mkv
   Output: video1.mp4
✅ Success: video1.mp4
   Size: 1024.5 MB → 1024.3 MB

🔄 Converting: video2.mkv
   Output: video2.mp4
✅ Success: video2.mp4
   Size: 512.8 MB → 512.6 MB

═══════════════════════════════════════
Conversion Complete!
✅ Successful: 5
═══════════════════════════════════════
```

## Troubleshooting

### "FFmpeg is not installed"
- Install FFmpeg (see Prerequisites above)
- Make sure FFmpeg is in your system PATH
- Restart your terminal after installation

### "Access Denied" Error
- Run PowerShell as Administrator
- Or right-click script → "Run with PowerShell"

### Script Execution Policy Error (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Files Not Converting
- Check if FFmpeg can access the files
- Verify file permissions
- Check if files are locked by another program

## Notes

- The conversion is **fast** because it only remuxes (changes container)
- Original files are **preserved** unless you use `-DeleteOriginal`
- Existing MP4 files are **skipped** automatically
- The script works with any MKV file using x264/AAC codecs

