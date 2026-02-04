import React from 'react';
import '../css/videoPanel.css';
import { fetchVideosForSong } from '../services/api';

const VideoPanel = ({ user, songId, isOpen, panelWidth, onPanelWidthChange }) => {
  const [videos, setVideos] = React.useState([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = React.useState('');
  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    setVideos([]);
    setSelectedVideoUrl('');
  }, [songId]);

  React.useEffect(() => {
    const getVideos = async () => {
      try {
        const result = await fetchVideosForSong(user, songId);
        const videoList = result || [];
        setVideos(videoList);
        if (videoList.length > 0) {
          setSelectedVideoUrl(videoList[0].url);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideos([]);
      }
    };

    getVideos();
  }, [user, songId]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      onPanelWidthChange(Math.min(Math.max(newWidth, 200), 600));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      className="video-panel"
      style={{
        width: isOpen ? `${panelWidth}px` : 0,
        borderLeftWidth: isOpen ? 2 : 0,
        marginLeft: isOpen ? 10 : 0,
      }}
    >
      <div
        className="video-panel-resize-handle"
        onMouseDown={handleMouseDown}
      />
      <div className="video-panel-content" style={isResizing ? { pointerEvents: 'none' } : undefined}>
        <div className="video-iframe-container">
          <iframe
            src={selectedVideoUrl || undefined}
            title="YouTube video"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="video-buttons">
          {videos.length === 0 && (
            <div className="no-videos">No videos available</div>
          )}
          {videos.map((video) => (
            <button
              key={video.id}
              className={`video-btn ${selectedVideoUrl === video.url ? 'active' : ''}`}
              onClick={() => setSelectedVideoUrl(video.url)}
            >
              {video.video_type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPanel;
