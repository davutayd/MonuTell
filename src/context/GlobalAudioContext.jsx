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

  const _createAndPlay = (url, title, id) => {
    if (!url) return;
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

    audioRef.current = a;
    setCurrentTrack({ url, title, id });
    setDuration(0);
    setCurrentTime(0);
    bindAudioEvents(a);
    a.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn("GlobalAudio: play() failed:", err);
        setIsPlaying(false);
      });
  };

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
