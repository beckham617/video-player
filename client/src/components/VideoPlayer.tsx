import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type Player = ReturnType<typeof videojs>;

interface VideoPlayerProps {
  videoPath: string;
  onClose: () => void;
  lastPosition?: number;
  onPositionUpdate?: (position: number) => void;
}

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

// Helper function to get MIME type from file extension
function getMimeType(ext: string): string {
  const mimeTypes: { [key: string]: string } = {
    'mp4': 'video/mp4',
    'm4v': 'video/mp4',
    'webm': 'video/webm',
    'ogv': 'video/ogg',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'mkv': 'video/x-matroska',
    '3gp': 'video/3gpp'
  };
  return mimeTypes[ext] || 'video/mp4';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath, onClose, lastPosition, onPositionUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string>('');
  const [fileExtension, setFileExtension] = React.useState<string>('');
  const positionUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef<boolean>(false);
  const onPositionUpdateRef = useRef(onPositionUpdate);
  const lastPositionRef = useRef<number | undefined>(lastPosition);
  
  // Keep the callback ref up to date without triggering re-renders
  React.useEffect(() => {
    onPositionUpdateRef.current = onPositionUpdate;
  }, [onPositionUpdate]);
  
  // Update lastPosition ref when lastPosition changes, but only if player not initialized
  React.useEffect(() => {
    if (!initializedRef.current) {
      lastPositionRef.current = lastPosition;
    }
  }, [lastPosition]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let currentPlayer: Player | null = null;

    // Clean up any existing player first when videoPath changes
    if (playerRef.current) {
      try {
        // Reset the player instead of disposing to preserve the element
        if (!playerRef.current.isDisposed()) {
          playerRef.current.pause();
          playerRef.current.reset();
        }
      } catch (e) {
        // If reset fails, try dispose
        try {
          if (!playerRef.current.isDisposed()) {
            playerRef.current.dispose();
          }
        } catch (e2) {
          // Ignore disposal errors
        }
      }
      playerRef.current = null;
      initializedRef.current = false;
    }

    // Wait for the element to be in the DOM
    if (!videoRef.current) {
      // If element doesn't exist, wait a bit and try again
      timer = setTimeout(() => {
        if (videoRef.current && !initializedRef.current) {
          initializePlayer();
        }
      }, 100);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
    
    // Use a small delay to ensure DOM is ready
    timer = setTimeout(() => {
      if (!videoRef.current || initializedRef.current) return;
      
      // Check if element is actually in the DOM
      if (!document.body.contains(videoRef.current)) {
        return;
      }

      initializePlayer();
    }, 100);

    function initializePlayer() {
      if (!videoRef.current || initializedRef.current) return;
      
      // Make sure element is still in DOM
      if (!document.body.contains(videoRef.current)) {
        console.error('Video element not in DOM');
        return;
      }

      setError('');

      // Initialize Video.js player
      const player = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      preload: 'metadata',
      html5: {
        vhs: {
          overrideNative: true
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false
      }
    });

      playerRef.current = player;
      currentPlayer = player;
      initializedRef.current = true;

    // Set video source
    const videoUrl = `/api/video?path=${encodeURIComponent(videoPath)}`;
    const ext = videoPath.split('.').pop()?.toLowerCase() || '';
    setFileExtension(ext);
    
    // For formats that browsers support natively, specify MIME type
    // For others, let the browser try to auto-detect (may not work for AVI, MKV, etc.)
    const browserSupportedFormats = ['mp4', 'm4v', 'webm', 'ogv', 'mov'];
    const shouldSpecifyType = ext && browserSupportedFormats.includes(ext);
    
    if (shouldSpecifyType) {
      const mimeType = getMimeType(ext);
      player.src({
        src: videoUrl,
        type: mimeType
      });
    } else {
      // Let browser auto-detect for formats like AVI, MKV, etc.
      // Some browsers might be able to play them with the right codecs
      player.src(videoUrl);
    }

    // Error handling with more details
    player.on('error', () => {
      const error = player.error();
      if (error) {
        console.error('Video.js error:', error);
        let errorMessage = 'Unable to play this video. ';
        
        // Error code meanings:
        // 1 = MEDIA_ERR_ABORTED - fetching aborted
        // 2 = MEDIA_ERR_NETWORK - network error
        // 3 = MEDIA_ERR_DECODE - decoding error
        // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED - format not supported
        
        if (error.code === 1) {
          errorMessage += 'Video loading was aborted.';
        } else if (error.code === 2) {
          errorMessage += 'Network error while loading video. Check your connection.';
        } else if (error.code === 3) {
          errorMessage += 'Error decoding video. The file may be corrupted or the codec is not supported.';
        } else if (error.code === 4) {
          if (ext === 'mkv') {
            errorMessage += `MKV format is not supported by browsers. Your file uses x264/AAC codecs which are compatible. Convert to MP4 container format (this is fast - just remuxing, not re-encoding).`;
          } else {
            errorMessage += `The video format (${ext || 'unknown'}) is not supported by your browser. MP4 (H.264) format is recommended.`;
          }
        } else {
          errorMessage += `Error code: ${error.code}`;
        }
        
        if (error.message) {
          errorMessage += ` Details: ${error.message}`;
        }
        
        setError(errorMessage);
      }
    });

    // Listen for loadedmetadata to ensure duration is available
    player.on('loadedmetadata', () => {
      // Restore last position if available (use ref to get initial value)
      const positionToRestore = lastPositionRef.current;
      if (positionToRestore !== undefined && positionToRestore > 0) {
        const duration = player.duration();
        // Only restore if position is valid (not at the end)
        if (duration && positionToRestore < duration - 5) {
          player.currentTime(positionToRestore);
          
          // Show a notification
          const notification = document.createElement('div');
          notification.textContent = `Resumed from ${formatTime(positionToRestore)}`;
          notification.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:8px 16px;border-radius:4px;z-index:10000;font-size:14px;';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        }
      }
    });

    // Listen for canplay to verify video can be played
    player.on('canplay', () => {
      setError('');
    });

    // Save position periodically while playing (every 5 seconds)
    const savePosition = () => {
      if (playerRef.current && onPositionUpdateRef.current) {
        const currentTime = playerRef.current.currentTime();
        if (currentTime !== undefined && currentTime > 0) {
          onPositionUpdateRef.current(currentTime);
        }
      }
    };

    // Start saving position when video starts playing
    player.on('play', () => {
      // Save position every 5 seconds
      positionUpdateIntervalRef.current = setInterval(savePosition, 5000);
    });

    // Save position when paused
    player.on('pause', () => {
      savePosition();
    });

    // Save position when seeking
    player.on('seeked', () => {
      savePosition();
    });
    }

    // Cleanup function for useEffect
    return () => {
      if (timer) clearTimeout(timer);
      // Save final position before cleanup
      if (playerRef.current && onPositionUpdateRef.current) {
        const currentTime = playerRef.current.currentTime();
        if (currentTime !== undefined && currentTime > 0) {
          onPositionUpdateRef.current(currentTime);
        }
      }
      
      // Clear interval
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
        positionUpdateIntervalRef.current = null;
      }
      
      // Only dispose if this is a cleanup (not a videoPath change)
      if (currentPlayer && currentPlayer === playerRef.current) {
        try {
          // Don't dispose - just pause and reset to preserve the element
          if (!currentPlayer.isDisposed()) {
            currentPlayer.pause();
            currentPlayer.reset();
          }
        } catch (e) {
          // If that fails, dispose
          try {
            currentPlayer.dispose();
          } catch (e2) {
            // Ignore disposal errors
          }
        }
        playerRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [videoPath]); // Only depend on videoPath - lastPosition is handled via ref

  return (
    <div className="video-player-container fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <div className="text-white font-medium truncate flex-1 mr-4" title={videoPath}>
          {videoPath.split('\\').pop() || videoPath.split('/').pop()}
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
        >
          Close
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-900 text-white p-4 rounded max-w-2xl z-10">
            <p className="font-bold mb-2">Playback Error</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 text-gray-300">
              <strong>Supported formats:</strong> MP4 (H.264 codec), WebM, OGG
            </p>
            {fileExtension === 'mkv' && (
              <div className="text-xs mt-2 p-2 bg-blue-900 rounded">
                <p className="font-semibold mb-1">💡 MKV to MP4 Conversion:</p>
                <p className="mb-1">Your MKV file uses x264/AAC codecs. Convert to MP4 using:</p>
                <code className="block bg-black p-1 rounded mt-1 text-xs">
                  ffmpeg -i input.mkv -c copy output.mp4
                </code>
                <p className="mt-1 text-gray-400">This is fast (remuxing only, no re-encoding)</p>
              </div>
            )}
            {fileExtension && fileExtension !== 'mkv' && !['mp4', 'm4v', 'webm', 'ogv'].includes(fileExtension) && (
              <p className="text-xs mt-2 text-gray-400">
                Format {fileExtension.toUpperCase()} is not supported. Convert to MP4 for best compatibility.
              </p>
            )}
          </div>
        )}
        <div ref={containerRef} data-vjs-player className="w-full max-w-7xl" style={{ minHeight: '400px' }}>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
            preload="metadata"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

