import React from 'react';
import '../css/songForm.css';
import { fetchTabForSong, fetchVideosForSong, editSong, createNewSong } from '../services/api';

const MAX_VIDEOS = 5;

const EditSong = ({ user, song, setCurrentPage, setCurrentSong, type }) => {
  const [tab, setTab] = React.useState('');
  const [videos, setVideos] = React.useState([{ video_type: '', url: '' }]);
  const [title, setTitle] = React.useState(song?.title || '');
  const [artist, setArtist] = React.useState(song?.artist || '');

  React.useEffect(() => {
    if (!song) return;
    const fetchTab = async () => {
      const fetchedTab = await fetchTabForSong(user, song.id);
      const fetchedVideos = await fetchVideosForSong(user, song.id);
      setTab(fetchedTab.text);
      setVideos(fetchedVideos);
    };
    fetchTab();
    setTitle(song?.title || '');
    setArtist(song?.artist || '');
  }, [song?.id]);

  const updateVideo = (index, field, value) => {
    setVideos(prev => prev.map((video, i) => i === index ? { ...video, [field]: value } : video));
  };

  const addVideo = () => {
    if (videos.length < MAX_VIDEOS) {
      setVideos(prev => [...prev, { video_type: '', url: '' }]);
    }
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="song-form">
      <div className="song-info">
        <label>Title:</label>
        <input 
          type="text"
          value={title}
          id="song-title"
          className="input" 
          onChange={e => setTitle(e.target.value)}
        />
        <label>Artist:</label>
        <input 
          type="text" 
          value={artist} 
          id="song-artist" 
          className="input" 
          onChange={e => setArtist(e.target.value)}
        />
        <label>Videos:</label>
        <div className="video-inputs">
          {videos.map((video, index) => (
            <div key={index} className="video-input-row">
              <input
                type="text"
                className="input video-type-input"
                placeholder="Type (e.g. tutorial)"
                value={video.video_type}
                onChange={e => updateVideo(index, 'video_type', e.target.value)}
              />
              <input
                type="text"
                className="input video-url-input"
                placeholder="URL"
                value={video.url}
                onChange={e => updateVideo(index, 'url', e.target.value)}
              />
              {videos.length > 1 && (
                <button type="button" className="remove-video-btn" onClick={() => removeVideo(index)}>Remove</button>
              )}
            </div>
          ))}
          {videos.length < MAX_VIDEOS && (
            <button type="button" className="add-video-btn" onClick={addVideo}>+ Add Video</button>
          )}
          <button type="button" className="submit-button" onClick={async () => {
            try {
              let response = null;
              const completedVideos = videos.filter(video => video.video_type && video.url);
              if (type === 'Edit') {
                response = await editSong(user, song.id, { title, artist, tab_text: tab, videos: completedVideos });
              } else {
                response = await createNewSong(user, { title, artist, tab_text: tab, videos: completedVideos });
              }
              setCurrentSong(response.song);
              setCurrentPage('songDisplay');
            } catch (error) {
              console.error("Error submitting song:", error);
            }
          }}>Submit</button>
        </div>
      </div>
      <div className="tab-section">
        <label>Tab</label>
        <textarea 
          value={tab} 
          className="tab" 
          id="song-tab"
          onChange={(e) => setTab(e.target.value)} />
      </div>
    </div>
  );
};

export default EditSong;