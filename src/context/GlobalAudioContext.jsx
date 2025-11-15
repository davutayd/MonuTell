import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

const GlobalAudioContext = createContext();
export const useGlobalAudio = () => useContext(GlobalAudioContext);

export const GlobalAudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const playAudio = (url, title = "", id = "") => {
    if (!url) return;

    if (currentTrack?.url === url && audioRef.current && !isPlaying) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn("resume failed", e));
      return;
    }
    if (currentTrack?.url === url && audioRef.current && isPlaying) {
      return;
    }
    _createAndPlay(url, title, id);
  };

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      pauseAudio();
    } else {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.warn("toggle play failed", e));
      }
    }
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <GlobalAudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        duration,
        currentTime,
        volume,
        playAudio,
        pauseAudio,
        togglePlay,
        stopAudio,
        seekTo,
        changeVolume,
      }}
    >
      {children}
    </GlobalAudioContext.Provider>
  );
};
