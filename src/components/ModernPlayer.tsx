import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import RadioWorker from "../workers/radio.worker?worker";

const STREAM_URL = import.meta.env.VITE_STREAM_URL || "";
const METADATA_URL = "/api/metadata";

const bars = Array.from({ length: 20 });

type PlayerProps = {
  currentLive?: {
    title: string;
    time: string;
    description: string;
    host: string;
  } | null;
};

const Player: React.FC<PlayerProps> = ({ currentLive }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const reconnectTimer = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  // Guardamos el último tiempo conocido para detectar stalls
  const lastTimeRef = useRef<number>(0);
  const stallCountRef = useRef<number>(0);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<{ title: string; artist: string; cover: string | null }>({ title: 'Cargando...', artist: '', cover: null });
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'stalled' | 'error'>('idle');

  // Inicializar Worker
  useEffect(() => {
    workerRef.current = new RadioWorker();

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'tick') {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));

        // Ejecutar lógica de stall detection aquí
        checkStall();
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []); // Dependencias vacías, el checkStall usará refs

  // Función para chequear stalls (ejecutada por el Worker cada 60s)
  const checkStall = useCallback(() => {
    if (!audioRef.current || audioRef.current.paused) {
      stallCountRef.current = 0;
      return;
    }

    const audio = audioRef.current;
    const currentPos = audio.currentTime;

    // Si el tiempo no ha avanzado nada desde el último tick...
    if (Math.abs(currentPos - lastTimeRef.current) < 0.1) {
      stallCountRef.current++;
      console.warn(`[Worker Watchdog] Stall detectado ${stallCountRef.current}`);

      // Si 1 tick (60s) estamos igual -> RECONECTAR
      // Dado que el intervalo es largo, con 1 fallo ya es grave.
      if (stallCountRef.current >= 1) {
        console.error("[Worker Watchdog] Stream congelado. Forzando reconexión...");
        stallCountRef.current = 0;
        attemptReconnect();
      }
    } else {
      // Si avanza, reseteamos
      stallCountRef.current = 0;

      // Recuperación visual automática si estaba en error
      setStatus(prev => (prev !== 'playing' ? 'playing' : prev));
      setError(null);
    }

    lastTimeRef.current = currentPos;
  }, []);

  const playStream = async () => {
    if (!audioRef.current) return false;
    try {
      audioRef.current.src = STREAM_URL + '?t=' + Date.now();
      audioRef.current.load();
      await audioRef.current.play();
      setPlaying(true);
      setStatus('playing');
      setError(null);
      reconnectAttempts.current = 0;
      return true;
    } catch (err) {
      console.error("Error playing:", err);
      setStatus('error');
      return false;
    }
  };

  const attemptReconnect = () => {
    setStatus('loading');
    setError("Reconectando señal...");

    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    reconnectTimer.current = window.setTimeout(async () => {
      await playStream();
    }, 1000);
  };

  const togglePlay = async () => {
    if (playing) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.src = "";
      setPlaying(false);
      setStatus('idle');
    } else {
      setStatus('loading');
      await playStream();
    }
  };

  // Listeners nativos (mantenemos para feedback rápido)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => attemptReconnect();
    const onError = () => attemptReconnect();

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(METADATA_URL);
        if (!res.ok) return;
        const data = await res.json();
        let title = 'Desconocido', artist = '';
        const rawTitle = data.title || '';
        if (rawTitle.includes(' - ')) {
          [artist, title] = rawTitle.split(' - ').map((s: string) => s.trim());
        } else { title = rawTitle; }
        setSong({ title: title || 'Música en vivo', artist, cover: data.art || null });
      } catch { }
    };
    fetchMetadata();
    const interval = window.setInterval(fetchMetadata, 10000);
    return () => clearInterval(interval);
  }, []);


  const isReconnecting = status === 'loading' || status === 'stalled';

  return (
    <motion.div
      className="radio-3d p-8 max-w-xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      {/* --- MOTORES INVISIBLES --- */}
      <audio ref={engineARef} preload="none" crossOrigin="anonymous" className="hidden" />
      <audio ref={engineBRef} preload="none" crossOrigin="anonymous" className="hidden" />

      <div className="bg-black rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20"></div>
        <div className="relative z-10 mb-4">
          <div className="flex justify-end items-center mb-2">
            <span className="text-cyan-400 text-sm font-mono">{currentTime}</span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2 min-h-[56px]">
            {song.cover ? (
              <img src={song.cover} alt={`Portada: ${song.title}`} className="w-14 h-14 rounded shadow border-2 border-custom-orange bg-slate-900 object-cover" loading="lazy" />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center rounded bg-slate-800 border-2 border-custom-orange">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#F97316" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" /></svg>
              </div>
            )}
            <div className="text-left">
              <div className="text-white text-base font-bold leading-tight truncate max-w-[180px]">{song.title}</div>
              <div className="text-cyan-300 text-xs truncate max-w-[180px]">{song.artist}</div>
            </div>
          </div>
          <div className="text-center mt-2 min-h-[60px]">
            <h3 className="text-white text-lg font-bold orbitron">RADIO GO</h3>
            {isReconnecting ? (
              <p className="text-yellow-400 text-sm animate-pulse">{error || 'Reconectando...'}</p>
            ) : currentLive ? (
              <>
                <p className="text-custom-orange text-base font-bold animate-pulse">EN VIVO: {currentLive.title}</p>
                <p className="text-cyan-300 text-xs">{currentLive.time} | {currentLive.host}</p>
              </>
            ) : (
              <p className="text-cyan-300 text-sm">Música en vivo</p>
            )}
            {/* Indicador de debugging discreto (opcional) */}
            {/* <div className="hidden">{activeEngine} | {timeSinceLastSwitch.current}</div> */}
          </div>
        </div>
        <div className="flex items-end justify-center gap-1 h-16 mb-4">
          {bars.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t"
              animate={{ height: playing && status === 'playing' ? [8, 32, 16, 24, 40, 12, 36, 20, 28, 44][i % 10] : 8 }}
              transition={{ repeat: Infinity, duration: 0.8 + (i * 0.1), repeatType: "reverse" }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center gap-6 mb-6">
        <motion.button
          onClick={togglePlay}
          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={status === 'loading'}
        >
          {playing ? (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
          ) : (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
          )}
        </motion.button>
      </div>
      <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="text-cyan-400"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolume} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
        <span className="text-cyan-400 text-sm font-mono w-12">{Math.round(volume * 100)}%</span>
      </div>
    </motion.div>
  );
};

export default Player;
