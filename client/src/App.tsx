import React, { useState, useEffect, useCallback } from 'react';
import FileBrowser from './components/FileBrowser';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

interface LastPlayedVideo {
  path: string;
  name: string;
  timestamp: number;
  position?: number;
}

const STORAGE_KEY = 'lastPlayedVideo';

// Helper function to format time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function App() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [lastPlayed, setLastPlayed] = useState<LastPlayedVideo | null>(null);

  // Load last played video from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const lastPlayedData: LastPlayedVideo = JSON.parse(stored);
        setLastPlayed(lastPlayedData);
      } catch (e) {
        console.error('Error loading last played video:', e);
      }
    }
  }, []);

  const handleVideoSelect = (path: string) => {
    setSelectedVideo(path);
    // Save to localStorage
    const videoName = path.split('\\').pop() || path.split('/').pop() || 'Unknown';
    const lastPlayedData: LastPlayedVideo = {
      path: path,
      name: videoName,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lastPlayedData));
    setLastPlayed(lastPlayedData);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const handleResumeVideo = () => {
    if (lastPlayed) {
      setSelectedVideo(lastPlayed.path);
    }
  };

  const handleClearLastPlayed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLastPlayed(null);
  };

  // Memoize the position update callback to prevent unnecessary re-renders
  const handlePositionUpdate = useCallback((position: number) => {
    if (lastPlayed && lastPlayed.path === selectedVideo) {
      const updated: LastPlayedVideo = { ...lastPlayed, position };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setLastPlayed(updated);
    }
  }, [lastPlayed, selectedVideo]);

  return (
    <div className="App h-screen flex flex-col bg-gray-950">
      <header className="bg-gray-900 text-white p-4 border-b border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Local Video Player</h1>
            <p className="text-sm text-gray-400 mt-1">
              Browse and play videos from your local network
            </p>
          </div>
          {lastPlayed && !selectedVideo && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResumeVideo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium text-sm whitespace-nowrap"
                title={lastPlayed.name + (lastPlayed.position ? ` (at ${formatTime(lastPlayed.position)})` : '')}
              >
                ▶ {lastPlayed.position && lastPlayed.position > 10 ? 'Resume' : 'Play'}: {lastPlayed.name.length > 25 ? lastPlayed.name.substring(0, 25) + '...' : lastPlayed.name}
              </button>
              <button
                onClick={handleClearLastPlayed}
                className="px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                title="Clear last played"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {selectedVideo ? (
          <VideoPlayer 
            videoPath={selectedVideo} 
            onClose={handleClosePlayer}
            lastPosition={lastPlayed?.path === selectedVideo ? lastPlayed.position : undefined}
            onPositionUpdate={handlePositionUpdate}
          />
        ) : (
          <FileBrowser onVideoSelect={handleVideoSelect} />
        )}
      </main>
    </div>
  );
}

export default App;
