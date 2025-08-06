import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const STREAM_URL = import.meta.env.VITE_STREAM_URL || "";

const bars = Array.from({ length: 20 });

const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState("00:00");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <motion.div 
      className="radio-3d p-8 max-w-xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <audio ref={audioRef} src={STREAM_URL} preload="none" />
      
      {/* Pantalla Principal */}
      <div className="bg-black rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20"></div>
        
        {/* Display Superior */}
        <div className="relative z-10 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-cyan-400 text-sm font-mono">FM 91.6</span>
            <span className="text-cyan-400 text-sm font-mono">{currentTime}</span>
          </div>
          <div className="text-center">
            <h3 className="text-white text-lg font-bold orbitron">RADIO GO</h3>
            <p className="text-cyan-300 text-sm">En Vivo - {playing ? "Transmitiendo" : "Detenido"}</p>
          </div>
        </div>
        
        {/* Ecualizador */}
        <div className="flex items-end justify-center gap-1 h-16 mb-4">
          {bars.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t"
              animate={{ 
                height: playing ? [8, 32, 16, 24, 40, 12, 36, 20, 28, 44][i % 10] : 8 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.8 + (i * 0.1), 
                repeatType: "reverse" 
              }}
            />
          ))}
        </div>
        
        {/* Información de la canción */}
        <div className="text-center">
          <p className="text-white text-sm font-medium">Reproduciendo ahora</p>
          <p className="text-cyan-300 text-xs">Música en Vivo</p>
        </div>
      </div>
      
      {/* Controles Principales */}
      <div className="flex justify-center items-center gap-6 mb-6">
        <motion.button
          className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm10 0h2v12h-2z"/>
          </svg>
        </motion.button>
        
        <motion.button
          onClick={togglePlay}
          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all pulse-glow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {playing ? (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </motion.button>
        
        <motion.button
          className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </motion.button>
      </div>
      
      {/* Control de Volumen */}
      <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="text-cyan-400">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-cyan-400 text-sm font-mono w-12">{Math.round(volume * 100)}%</span>
      </div>
    </motion.div>
  );
};

export default Player;
