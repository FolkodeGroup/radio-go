import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

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
  // --- SINGLE ENGINE: Motor Único Robusto ---
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<{ title: string; artist: string; cover: string | null }>({ title: 'Cargando...', artist: '', cover: null });
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error' | 'reconnecting'>('idle');

  // Ref para intentos de reconexión
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<number | null>(null);

  // --- CONTROL DE TIEMPO (RELOJ) ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- API METADATA ---
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

        const newSong = { title: title || 'Música en vivo', artist, cover: data.art || null };
        setSong(newSong);

        // Actualizar MediaSession si está reproduciendo
        if (navigator.mediaSession && (status === 'playing' || status === 'loading')) {
          updateMediaSession(newSong);
        }

      } catch { } // Silencioso para no saturar logs
    };

    fetchMetadata();
    const interval = window.setInterval(fetchMetadata, 10000);
    return () => clearInterval(interval);
  }, [status]); // Actualizar si cambia el status también

  // --- MEDIA SESSION UPDATE HELPER ---
  const updateMediaSession = (currentSong: { title: string; artist: string; cover: string | null }) => {
    if (!navigator.mediaSession) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist || "Radio Go",
      album: "En Vivo",
      artwork: currentSong.cover ? [{ src: currentSong.cover, sizes: "512x512", type: "image/jpeg" }] : []
    });

    navigator.mediaSession.setActionHandler('play', () => {
      playStream();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      stopStream();
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      stopStream();
    });
  };

  // --- LÓGICA DE REPRODUCCIÓN ---

  const playStream = async (isReconnect = false) => {
    if (!audioRef.current) return;

    if (!isReconnect) {
      setStatus('loading');
      setError("Conectando...");
      reconnectAttempts.current = 0;
    }

    try {
      // Cache busting para asegurar stream fresco
      const streamUrl = `${STREAM_URL}?t=${Date.now()}`;

      // Si ya tiene src y es reconnect, a veces mejor no cambiarlo si solo fue stalled, 
      // pero para stream en vivo un error suele requerir reconectar.
      audioRef.current.src = streamUrl;
      audioRef.current.volume = volume;

      await audioRef.current.play();

      setPlaying(true);
      setStatus('playing');
      setError(null);
      reconnectAttempts.current = 0; // Reset intentos exitosos
      updateMediaSession(song);

    } catch (err) {
      console.error("Error reproduciendo:", err);
      if (!isReconnect) {
        setStatus('error');
        setError("Error de conexión");
      } else {
        handleAutoReconnect();
      }
    }
  };

  const stopStream = () => {
    if (!audioRef.current) return;

    // Limpiar timeouts de reconexión pendientes
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    audioRef.current.pause();
    audioRef.current.src = ""; // Liberar recursos
    audioRef.current.removeAttribute('src'); // Forzar limpieza
    audioRef.current.load(); // Resetear elemento

    setPlaying(false);
    setStatus('idle');
    setError(null);
  };

  const togglePlay = () => {
    if (playing) stopStream();
    else playStream();
  };

  // --- AUTOMATED RECOVERY SYSTEM ---

  const handleAutoReconnect = useCallback(() => {
    if (status === 'idle') return; // Si el usuario lo paró, no reconectar.

    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current += 1;

      // Intento 1: Casi inmediato (50ms) para que el usuario no note el corte.
      // Intentos siguientes: Backoff exponencial (1s, 2s, 4s...)
      const delay = reconnectAttempts.current === 1
        ? 50
        : Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);

      console.log(`🔄 Reintentando en ${delay}ms (Intento ${reconnectAttempts.current}/${maxReconnectAttempts})`);
      setStatus('reconnecting');
      setError(`Reconectando... (${reconnectAttempts.current})`);

      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);

      reconnectTimeoutRef.current = window.setTimeout(() => {
        playStream(true);
      }, delay);

    } else {
      console.error("❌ Se agotaron los intentos de reconexión.");
      setStatus('error');
      setError("Sin conexión. Toca para reintentar.");
      setPlaying(false);
    }
  }, [status]); // Dependencia vital para saber si debe reconectar

  // Listeners del Audio Element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onWaiting = () => {
      console.log("⚠️ Audio buffering/stalled...");
      if (playing) setStatus('loading');
    };

    const onPlaying = () => {
      console.log("✅ Audio playing");
      setStatus('playing');
      setError(null);
      reconnectAttempts.current = 0;
    };

    const onError = (_e: Event) => {
      console.error("❌ Audio Error Event:", audio.error);
      handleAutoReconnect();
    };

    const onEnded = () => {
      // En radio en vivo, 'ended' suele significar corte de stream
      console.warn("⚠️ Stream ended unexpected.");
      handleAutoReconnect();
    };

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    // 'stalled' a veces dispara falsos positivos en mobile, mejor fiarse de 'waiting' o 'error'

    return () => {
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, [playing, handleAutoReconnect]);

  // Network Online/Offline Handler
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Conexión restaurada. Intentando reconectar si estaba activo...");
      if (status === 'reconnecting' || (playing && status === 'error')) {
        reconnectAttempts.current = 0; // Resetear intentos al volver internet
        playStream(true);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [status, playing]);


  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const isBuffering = status === 'loading' || status === 'reconnecting';

  return (
    <motion.div
      className="radio-3d p-8 max-w-xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      {/* SINGLE ENGINE */}
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" className="hidden" />

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
            {isBuffering ? (
              <p className="text-yellow-400 text-sm animate-pulse">{error || 'Conectando...'}</p>
            ) : status === 'error' ? (
              <p className="text-red-500 text-sm font-bold">{error || 'Error'}</p>
            ) : currentLive ? (
              <>
                <p className="text-custom-orange text-base font-bold animate-pulse">EN VIVO: {currentLive.title}</p>
                <p className="text-cyan-300 text-xs">{currentLive.time} | {currentLive.host}</p>
              </>
            ) : (
              <p className="text-cyan-300 text-sm">Música en vivo</p>
            )}
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
          disabled={status === 'loading' && !playing} // Permitir parar si está loading pero playing activado
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
