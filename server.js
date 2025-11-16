const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { createReadStream, statSync } = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces for network access

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.ogv'];

// Helper function to check if file is a video
function isVideoFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

// Helper function to get MIME type from file extension
function getVideoMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.m4v': 'video/mp4',
    '.webm': 'video/webm',
    '.ogv': 'video/ogg',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv',
    '.mkv': 'video/x-matroska',
    '.3gp': 'video/3gpp'
  };
  return mimeTypes[ext] || 'video/mp4';
}

// Helper function to get root directory
function getRootDirectory() {
  const os = require('os');
  const platform = os.platform();
  
  if (platform === 'win32') {
    // On Windows, return the root of the current drive (e.g., "C:\")
    const cwd = process.cwd();
    const driveLetter = cwd.match(/^([A-Z]):/i);
    if (driveLetter) {
      return driveLetter[1].toUpperCase() + ':\\';
    }
    return 'C:\\';
  } else {
    // On Unix-like systems, return "/"
    return '/';
  }
}

// API endpoint to browse directory
app.get('/api/browse', async (req, res) => {
  try {
    // If no path specified, start at root directory
    const dirPath = req.query.path || getRootDirectory();
    
    // Security: prevent directory traversal - allow any Windows drive or current directory
    const resolvedPath = path.resolve(dirPath);
    const isWindowsPath = /^[A-Z]:\\/.test(resolvedPath);
    const isInCurrentDir = resolvedPath.startsWith(process.cwd());
    
    if (!isInCurrentDir && !isWindowsPath) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    // Determine parent directory
    let parentDir = path.dirname(dirPath);
    // On Windows, if we're at root (e.g., "C:\"), parent is the same
    // On Unix, if we're at root ("/"), parent is still "/"
    if (parentDir === dirPath) {
      parentDir = dirPath; // Stay at root
    }
    
    const result = {
      path: dirPath,
      parent: parentDir,
      items: []
    };

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      try {
        const stats = await fs.stat(fullPath);
        result.items.push({
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          isVideo: !item.isDirectory() && isVideoFile(item.name),
          size: stats.size,
          modified: stats.mtime
        });
      } catch (err) {
        // Skip files we can't access
        console.error(`Error accessing ${fullPath}:`, err.message);
      }
    }

    // Sort: directories first, then videos, then other files
    result.items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      if (a.isVideo && !b.isVideo) return -1;
      if (!a.isVideo && b.isVideo) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json(result);
  } catch (error) {
    console.error('Error browsing directory:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to stream video files
app.get('/api/video', (req, res) => {
  const videoPath = req.query.path;
  
  if (!videoPath) {
    return res.status(400).json({ error: 'Video path is required' });
  }

  // Security: prevent directory traversal - allow any Windows drive or current directory
  const resolvedPath = path.resolve(videoPath);
  const isWindowsPath = /^[A-Z]:\\/.test(resolvedPath);
  const isInCurrentDir = resolvedPath.startsWith(process.cwd());
  
  if (!isInCurrentDir && !isWindowsPath) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const stat = statSync(resolvedPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const mimeType = getVideoMimeType(resolvedPath);
    console.log('Serving video:', {
      path: resolvedPath,
      size: fileSize,
      mimeType: mimeType,
      hasRange: !!range
    });
    
    if (range) {
      // Handle range requests for video seeking
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      // Validate range
      if (start >= fileSize || end >= fileSize || start > end) {
        res.writeHead(416, {
          'Content-Range': `bytes */${fileSize}`,
          'Accept-Ranges': 'bytes',
        });
        return res.end();
      }
      
      const chunksize = (end - start) + 1;
      const file = createReadStream(resolvedPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      };
      res.writeHead(200, head);
      createReadStream(resolvedPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${getLocalIP()}:${PORT}`);
  console.log(`\n📱 Access from mobile: http://${getLocalIP()}:${PORT}\n`);
});

// Get local IP address
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

