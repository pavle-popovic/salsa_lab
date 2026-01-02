"use client";

import { useState, useEffect, useRef } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function GlobalAudioPlayer() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume to low (20%)
    audio.volume = 0.2;
    audio.loop = true;

    // Try to play on mount
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Autoplay was prevented, user interaction required
        console.log("Audio autoplay prevented:", error);
      });
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Audio play failed:", error);
        });
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio ref={audioRef} src="/assets/Mambo_Inn.mp3" preload="auto" />
      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-mambo-panel border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-lg"
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
      >
        {isMuted ? (
          <FaVolumeMute className="text-gray-400 text-lg" />
        ) : (
          <FaVolumeUp className="text-mambo-blue text-lg" />
        )}
      </button>
    </>
  );
}

