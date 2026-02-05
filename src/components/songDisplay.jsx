import React from 'react';
import '../css/songDisplay.css';
import { fetchTabForSong } from '../services/api';
import VideoPanel from './videoPanel';

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

  function handleTransposeUp() {
    setTab(prevTab => transposeTab(prevTab, 1));
  }

  function handleTransposeDown() {
    setTab(prevTab => transposeTab(prevTab, -1));
  }

  return (
    <div className="song-display">
      <h2>{song.title} - {song.artist}</h2>
      <div className="song-content-wrapper">
        <div className="tab-container">
          <div className="buttons">
            <h3 className="button-heading">Transpose:</h3>
            <div className="transpose-buttons">
              <button className="transpose-up" onClick={handleTransposeUp}>Up +</button>
              <button className="transpose-down" onClick={handleTransposeDown}>Down -</button>
            </div>
            <h3 className="button-heading">Scrolling:</h3>
            <div className="plus-minus">
              <div className="plus" onClick={() => setScrollSpeed(prev => prev + 10)}>+</div>
              <div className="minus" onClick={() => setScrollSpeed(prev => Math.max(5, prev - 10))}>-</div>
            </div>
            <button onClick={() => toggleScrolling()}>{isScrolling ? 'Stop' : 'Start'}</button>
            <h3 className="button-heading">Videos:</h3>
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
              {isVideoPanelOpen ? 'Hide' : 'Show'}
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
