import './App.css';
import { useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyC65Hn3Zzri-0moWShsj9M8lqYJylVnMZg';
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const BEARER_TOKEN = "BQBOV14GYUB524BsTJThE2JcdF0g_zJpWNBaL4OlZBECROyf-zhH-ONGbs3Gev01Lx4XPn3RtObOOiS2R1JIKJRet1sWLtLKEqBWUjZOXu4zUa5Za5CTFbnHj2Zt6XugmVlLLW1z7NI";

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [songDetails, setSongDetails] = useState({ name: "", artist: "" });
  const [image, setImage] = useState(undefined);
  const [topic, setTopic] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const searchArtists = async (searchTokens) => {
    if (!searchTokens) return [];

    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        params: { q: searchTokens, type: "track", limit: 5, market: "US" }
      });
      return data.tracks.items.map(item => ({
        name: item.name,
        artist: item.artists[0].name,
        image: item.album.images[0]?.url
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleSearchChange = async (value) => {
    const data = await searchArtists(value);
    setSuggestions(data);
  };

  const debouncedResults = useMemo(() => debounce(handleSearchChange, 1000), []);

  useEffect(() => {
    return () => debouncedResults.cancel();
  }, [debouncedResults]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedResults(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSongDetails({ name: suggestion.name, artist: suggestion.artist });
    setImage(suggestion.image);
    setSuggestions([]);
    setSearchTerm("");
  };

  const handleTopicChange = (event) => setTopic(event.target.value);

  const handleCreateSong = async () => {
    setLoading(true);
    try {
      const chatSession = model.startChat({ generationConfig });
      const result = await chatSession.sendMessage(
        `Write lyrics for an educational song about ${topic} in the style of ${songDetails.name} by ${songDetails.artist}. Do not write anything explicit and if you can't then reply saying that you're not able to. Respond with only the lyrics and nothing else. Double check that you only responded with the lyrics.`
      );
      setLyrics(result.response.text());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Song Lyric Generator</h1>
        {image && <img src={image} className="App-logo" alt="logo" />}
        <div className="App-search-container">
          <input
            type="text"
            className="App-search"
            placeholder="Search for a song..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          {suggestions.length > 0 && (
            <ul className="App-suggestions">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {`${suggestion.name} by ${suggestion.artist}`}
                </li>
              ))}
            </ul>
          )}
        </div>
        {songDetails.name && (
          <div className="App-song-details">
            <h3>Selected Song</h3>
            <p>{`Name: ${songDetails.name}`}</p>
            <p>{`Artist: ${songDetails.artist}`}</p>
            <p>
              Create a song about <input type="text" value={topic} onChange={handleTopicChange} /> in the style of {songDetails.name} by {songDetails.artist}.
            </p>
            <button onClick={handleCreateSong} disabled={!topic || loading}>
              {loading ? 'Creating...' : 'Create!'}
            </button>
          </div>
        )}
        {lyrics && (
          <>
            <h3>Generated Lyrics</h3>
            <div className="App-lyrics">
              {lyrics.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
