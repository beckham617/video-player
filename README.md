# Local Video Player

A web application that allows you to browse and play local video files on your local network. Perfect for streaming videos from your computer to mobile devices via WiFi.

## Features

- 🎬 **Comprehensive Video Player**: Built with Video.js, featuring:
  - Play/pause controls
  - Seek/scrub functionality
  - Volume control
  - Fullscreen mode
  - Playback speed control (0.5x to 2x)
  - Mobile-friendly touch controls

- 📁 **File Browser**: 
  - Navigate through directories
  - Visual indicators for folders and video files
  - File size display
  - Quick navigation with back button

- 📱 **Network Access**: 
  - Accessible on local network (WiFi)
  - Mobile device support
  - Responsive design

- 🔒 **Security**: 
  - Path traversal protection
  - Controlled file access

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + TypeScript
- **Video Player**: Video.js
- **Styling**: Tailwind CSS
- **Network**: Express server bound to 0.0.0.0 for LAN access

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone or download this repository

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

## Usage

### Development Mode

Run both server and client in development mode:
```bash
npm run dev
```

Or run them separately:

**Terminal 1** (Backend):
```bash
npm run server
```

**Terminal 2** (Frontend):
```bash
npm run client
```

### Production Mode

**Option 1: One command (recommended)**
```bash
npm run start:prod
```
This will build the frontend and start the server automatically.

**Option 2: Step by step**

1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable:
```bash
PORT=8080 npm start
```

**Note:** In production mode, the backend serves the built React app from the `client/build` directory. Both frontend and backend run from a single server process.

## Network Access

When you start the server, it will display:
- Local URL: `http://localhost:3000`
- Network URL: `http://YOUR_IP:3000`

To access from your mobile device:
1. Make sure your mobile device is on the same WiFi network
2. Open a browser on your mobile device
3. Navigate to the Network URL shown in the console (e.g., `http://192.168.1.100:3000`)

## Supported Video Formats

- MP4
- AVI
- MKV
- MOV
- WMV
- FLV
- WebM
- M4V
- 3GP
- OGV

## Project Structure

```
video-player/
├── server.js              # Express backend server
├── package.json           # Backend dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileBrowser.tsx
│   │   │   └── VideoPlayer.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json       # Frontend dependencies
└── README.md
```

## Configuration

### Change Default Port

Set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

### Change Starting Directory

By default, the file browser starts at the project root. You can modify the starting directory in `server.js` by changing the default path in the `/api/browse` endpoint.

## Security Notes

- The application includes basic path traversal protection
- Only files on Windows drives or within the project directory are accessible
- For production use, consider adding authentication and more robust security measures

## Troubleshooting

### Can't access from mobile device

1. **Check firewall**: Make sure your firewall allows connections on port 3000
2. **Check network**: Ensure both devices are on the same WiFi network
3. **Check IP address**: Verify the IP address shown in the console matches your computer's local IP

### Videos not playing

1. **Check format**: Ensure the video format is supported
2. **Check path**: Make sure the file path is accessible
3. **Check browser**: Try a different browser (Chrome, Firefox, Safari)

### Port already in use

Change the port:
```bash
PORT=3001 npm start
```

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

