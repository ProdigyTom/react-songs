import React from 'react';
import '../css/songDisplay.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons'; 
import { fetchTabForSong, saveScrollSpeed } from '../services/api';
import VideoPanel from './videoPanel';
import { useToast } from '../context/ToastContext';

// Chromatic scale using conventional notation (sharps except Eb)
const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];

// Map flat notes to their sharp equivalents for lookup
const NOTE_TO_INDEX = {
  'A': 0, 'A#': 1, 'Bb': 1,
  'B': 2, 'Cb': 2,
  'C': 3, 'B#': 3,
  'C#': 4, 'Db': 4,
  'D': 5,
  'D#': 6, 'Eb': 6,
  'E': 7, 'Fb': 7,
  'F': 8, 'E#': 8,
  'F#': 9, 'Gb': 9,
  'G': 10,
  'G#': 11, 'Ab': 11
};

// Regex to match a chord: root note (A-G with optional # or b) followed by modifiers
// Uses negative lookahead instead of \b at end because # and b are not word characters
const CHORD_REGEX = /\b([A-G][#b]?)(maj|min|dim|aug|add|sus[24]?|m|M)?(\d+)?(\/[A-G][#b]?)?(?![a-zA-Z])/g;

function transposeNote(note, semitones) {
  const index = NOTE_TO_INDEX[note];
  if (index === undefined) return note;
  const newIndex = (index + semitones + 12) % 12;
  return NOTES[newIndex];
}

function transposeTab(text, semitones) {
  // Process line by line to preserve structure
  return text.split('\n').map(line => {
    // Use a more targeted replacement to avoid partial matches
    return line.replace(CHORD_REGEX, (match, root, modifier = '', number = '', bass = '') => {
      const newRoot = transposeNote(root, semitones);
      let newBass = bass;
      if (bass) {
        const bassNote = bass.slice(1);
        newBass = '/' + transposeNote(bassNote, semitones);
      }
      return newRoot + modifier + number + newBass;
    });
  }).join('\n');
}

const SongDisplay = ({ user, song, setCurrentPage }) => {
  const showToast = useToast();
  const [tab, setTab] = React.useState('');
  const [originalTab, setOriginalTab] = React.useState('');
  const [error, setError] = React.useState(null);
  const [scrollSpeed, setScrollSpeed] = React.useState(20);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const [isVideoPanelOpen, setIsVideoPanelOpen] = React.useState(false);
  const [videoPanelWidth, setVideoPanelWidth] = React.useState(200);
  const [hasOpenedVideoPanel, setHasOpenedVideoPanel] = React.useState(false);
  const [isOptionsPanelOpen, setIsOptionsPanelOpen] = React.useState(true);
  const [hasOpenedOptionsPanel, setHasOpenedOptionsPanel] = React.useState(true);

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
      setError(null);
      try {
        const fetchedTab = await fetchTabForSong(song.id);
        setTab(fetchedTab.text);
        setOriginalTab(fetchedTab.text);
        setScrollSpeed(fetchedTab.scroll_speed ?? 20);
      } catch (err) {
        showToast('Failed to load tab');
        setError('Failed to load tab');
      }
    };

    getTab();
  }, [user, song.id]);

  async function handleSaveScrollSpeed() {
    try {
      await saveScrollSpeed(song.id, scrollSpeed);
      showToast('Scroll speed saved', 'success');
    } catch {
      showToast('Failed to save scroll speed');
    }
  }

  function handleTransposeUp() {
    setTab(prevTab => transposeTab(prevTab, 1));
  }

  function handleTransposeDown() {
    setTab(prevTab => transposeTab(prevTab, -1));
  }

  return (
    <div className="song-display">
      <div className="title-area">
        <div className="title-left">
          <FontAwesomeIcon icon={faClipboardList} className="options-toggle-btn" onClick={() => {
            if (!isOptionsPanelOpen) {
              setHasOpenedOptionsPanel(true);
              requestAnimationFrame(() => setIsOptionsPanelOpen(true));
            } else {
              setIsOptionsPanelOpen(false);
            }
          }} />
          <div className="scroll-controls">
            <span className="scroll-label">Scroll Controls:</span>
            <div className="scroll-speed-adjust scroll-speed-minus" onClick={() => setScrollSpeed(prev => Math.max(5, prev - 10))}>-</div>
            <div className="scroll-speed-adjust scroll-speed-plus" onClick={() => setScrollSpeed(prev => prev + 10)}>+</div>
            <button className="scroll-toggle-btn" onClick={toggleScrolling}>{isScrolling ? 'Stop' : 'Start'}</button>
          </div>
        </div>
        <h2 className="title">{song.title} - {song.artist}</h2>
        <FontAwesomeIcon icon={faVideo} className="video-toggle-btn" onClick={() => {
          if (!isVideoPanelOpen) {
            setHasOpenedVideoPanel(true);
            requestAnimationFrame(() => setIsVideoPanelOpen(true));
          } else {
            setIsVideoPanelOpen(false);
          }
        }} />
      </div>
      <div className="song-content-wrapper">
        <div className="tab-container">
          {hasOpenedOptionsPanel && (
            <div className={`buttons${!isOptionsPanelOpen ? ' buttons-closed' : ''}`}>
              <button className="edit-tab" onClick={() => setCurrentPage('editSong')}>Edit Song</button>
              <button onClick={handleSaveScrollSpeed}>Save Speed</button>
              <h3 className="button-heading">Transpose:</h3>
              <div className="transpose-buttons">
                <div className="transpose-up" onClick={handleTransposeUp}>+</div>
                <div className="transpose-down" onClick={handleTransposeDown}>-</div>
              </div>
              <button className="reset-tab" onClick={() => setTab(originalTab)}>Reset</button>
            </div>
          )}

          {error ? (
            <div className="tab-error">{error}</div>
          ) : (
            <textarea
              className="tab"
              value={tab}
              ref={tabRef}
              readOnly
            />
          )}
        </div>

        {hasOpenedVideoPanel && (
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
