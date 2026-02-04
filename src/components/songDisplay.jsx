import React from 'react';
import '../css/songDisplay.css';
import { fetchTabForSong } from '../services/api';
import VideoPanel from './videoPanel';

const SongDisplay = ({ user, song }) => {
  const [tab, setTab] = React.useState('');
  const [scrollSpeed, setScrollSpeed] = React.useState(20);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const [isVideoPanelOpen, setIsVideoPanelOpen] = React.useState(false);
  const [videoPanelWidth, setVideoPanelWidth] = React.useState(200);
  const [hasOpenedPanel, setHasOpenedPanel] = React.useState(false);

  const tabRef = React.useRef(null);
  const intervalRef = React.useRef(null);

  const toggleScrolling = () => {
    setIsScrolling(prev => !prev);
  };

  React.useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isScrolling) {
      intervalRef.current = setInterval(() => {
        if (tabRef.current) tabRef.current.scrollBy({
          top: 0.5,
          left: 0,
          behavior: 'smooth'
        });
      }, 3000 / Math.max(0.1, scrollSpeed));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isScrolling, scrollSpeed]);

  React.useEffect(() => {
    const getTab = async () => {
      try {
        const fetchedTab = await fetchTabForSong(user, song.id);
        setTab(fetchedTab.text);
      } catch (error) {
        console.error(error);
      }
    };

    getTab();
  }, [user, song.id]);

  return (
    <div className="song-display">
      <h2>{song.title} - {song.artist}</h2>
      <div className="song-content-wrapper">
        <div className="tab-container">
          <div className="buttons">
            <div className="plus-minus">
              <div className="plus" onClick={() => setScrollSpeed(prev => prev + 10)}>+</div>
              <div className="minus" onClick={() => setScrollSpeed(prev => Math.max(5, prev - 10))}>-</div>
            </div>
            <button onClick={() => toggleScrolling()}>{isScrolling ? 'Stop' : 'Start'} Scrolling</button>
            <button
              className="video-toggle-btn"
              onClick={() => {
                if (!isVideoPanelOpen) {
                  setHasOpenedPanel(true);
                  // Delay opening so component mounts first, then animates
                  requestAnimationFrame(() => setIsVideoPanelOpen(true));
                } else {
                  setIsVideoPanelOpen(false);
                }
              }}
            >
              {isVideoPanelOpen ? 'Hide Videos' : 'Show Videos'}
            </button>
          </div>
          <textarea
            className="tab"
            value={tab}
            ref={tabRef}
            readOnly
          />
        </div>

        {hasOpenedPanel && (
          <VideoPanel
            user={user}
            songId={song.id}
            isOpen={isVideoPanelOpen}
            panelWidth={videoPanelWidth}
            onPanelWidthChange={setVideoPanelWidth}
          />
        )}
      </div>
    </div>
  );
};

export default SongDisplay;
