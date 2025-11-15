// src/context/GlobalAudioContext.jsx
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
  const [currentTrack, setCurrentTrack] = useState(null); // { url, title, id }
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      } catch (e) {}
    };
  }, []);

  const bindAudioEvents = (audio) => {
    if (!audio) return;
    const onLoaded = () =>
      setDuration(typeof audio.duration === "number" ? audio.duration : 0);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  };

  // create and start playing a new audio
  const _createAndPlay = (url, title, id) => {
    if (!url) return;
    // cleanup old audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch (e) {}
      audioRef.current = null;
    }

    const a = new Audio(url);
    a.preload = "metadata";
    a.crossOrigin = "anonymous";
    a.volume = volume;

    // set ref and states
    audioRef.current = a;
    setCurrentTrack({ url, title, id });
    setDuration(0);
    setCurrentTime(0);

    // bind events
    bindAudioEvents(a);

    // try play
    a.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn("GlobalAudio: play() failed:", err);
        setIsPlaying(false);
      });
  };

  const playAudio = (url, title = "", id = "") => {
    if (!url) return;
    // if same track and paused -> resume
    if (currentTrack?.url === url && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn("resume failed", e));
      return;
    }
    _createAndPlay(url, title, id);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn("toggle play failed", e));
    }
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekTo = (timeInSeconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
  };

  const changeVolume = (v) => {
    const vol = Math.max(0, Math.min(1, v));
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
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
