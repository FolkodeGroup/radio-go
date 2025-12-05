import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const STREAM_URL = import.meta.env.VITE_STREAM_URL || "";

const bars = Array.from({ length: 12 });

const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    if (audioRef.current) {
      audioRef.current.volume = Number(e.target.value);
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-tr from-gray-900 via-blue-900 to-cyan-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full max-w-md mx-auto border-4 border-gray-800"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <audio ref={audioRef} src={STREAM_URL} preload="none" />
      {/* Pantalla tipo ecualizador */}
      <div className="w-full bg-black rounded-lg p-4 mb-6 flex flex-col items-center relative" style={{ height: 120 }}>
        <div className="absolute top-2 right-4 text-xs text-cyan-300 font-mono">91.6 MHz</div>
        <div className="flex items-end justify-center gap-1 h-16 w-full">
          {bars.map((_, i) => (
            <motion.div
              key={i}
              className="w-3 rounded bg-cyan-400"
              animate={{ height: [16, 48, 24, 40, 32, 56, 20, 44, 28, 52, 36, 60][i % 12] }}
              transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse", delay: i * 0.1 }}
              style={{ minHeight: 16 }}
            />
          ))}
        </div>
        <div className="mt-4 text-cyan-200 text-sm font-semibold">Streaming: {playing ? "Activo" : "Detenido"}</div>
      </div>
      {/* Controles */}
      <div className="flex items-center gap-6 mb-4">
        <button
          onClick={togglePlay}
          className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full p-4 shadow-lg transition-all"
        >
          {playing ? (
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          className="w-24 accent-cyan-400"
        />
      </div>
      <div className="flex gap-2 text-xs text-cyan-300">
        <span>Volumen</span>
        <span>{Math.round(volume * 100)}%</span>
      </div>
    </motion.div>
  );
};

export default Player;
