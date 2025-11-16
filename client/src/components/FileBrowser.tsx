import React, { useState, useEffect } from 'react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isVideo: boolean;
  size: number;
  modified: string;
}

interface BrowseResult {
  path: string;
  parent: string;
  items: FileItem[];
}

interface FileBrowserProps {
  onVideoSelect: (path: string) => void;
}

// Helper function to check if path is root directory
function isNotRoot(path: string): boolean {
  // On Windows: "C:\", "D:\", etc. are root
  // On Unix: "/" is root
  if (path.match(/^[A-Z]:\\$/i)) return false; // Windows root like "C:\"
  if (path === '/') return false; // Unix root
  return true;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ onVideoSelect }) => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDirectory(currentPath || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDirectory = async (path?: string) => {
    setLoading(true);
    setError('');
    try {
      const queryParam = path ? `?path=${encodeURIComponent(path)}` : '';
      const response = await fetch(`/api/browse${queryParam}`);
      if (!response.ok) {
        throw new Error('Failed to load directory');
      }
      const data: BrowseResult = await response.json();
      setCurrentPath(data.path);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      loadDirectory(item.path);
    } else if (item.isVideo) {
      onVideoSelect(item.path);
    }
  };

  const handleParentClick = async () => {
    if (currentPath) {
      try {
        const queryParam = currentPath ? `?path=${encodeURIComponent(currentPath)}` : '';
        const response = await fetch(`/api/browse${queryParam}`);
        if (response.ok) {
          const data: BrowseResult = await response.json();
          loadDirectory(data.parent || undefined);
        }
      } catch (err) {
        console.error('Error getting parent:', err);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-browser bg-gray-900 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          {currentPath && isNotRoot(currentPath) && (
            <button
              onClick={handleParentClick}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => loadDirectory()}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Home
          </button>
        </div>
        <div className="text-sm text-gray-400 truncate" title={currentPath}>
          {currentPath || 'Root Directory'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No items found</div>
        ) : (
          <div className="p-2">
            {items.map((item, index) => (
              <div
                key={index}
                onClick={() => handleItemClick(item)}
                className={`
                  p-3 mb-1 rounded cursor-pointer transition-colors
                  ${item.isDirectory 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : item.isVideo 
                    ? 'bg-gray-800 hover:bg-blue-900 border-l-4 border-blue-500' 
                    : 'bg-gray-800 hover:bg-gray-700 opacity-50'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">
                      {item.isDirectory ? '📁' : item.isVideo ? '🎬' : '📄'}
                    </span>
                    <span className="truncate font-medium">{item.name}</span>
                  </div>
                  {!item.isDirectory && (
                    <span className="text-xs text-gray-400 ml-2">
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowser;

