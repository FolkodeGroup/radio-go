import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const STREAM_URL = import.meta.env.VITE_STREAM_URL || "";
const METADATA_URL = "https://cast4.prosandoval.com/api/nowplaying/9";

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
  const reconnectTimer = useRef<number | null>(null);
  const stallChecker = useRef<number | null>(null);
  const lastTimeUpdate = useRef<number>(Date.now());

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<{ title: string; artist: string; cover: string | null }>({ title: 'Cargando...', artist: '', cover: null });
  const [isReconnecting, setIsReconnecting] = useState(false);

  // --- Lógica de Reconexión Automática ---
  const attemptReconnect = () => {
    // Evitar múltiples intentos de reconexión simultáneos
    if (isReconnecting || (reconnectTimer.current !== null)) return;

    // No reconectar si el usuario pausó intencionalmente
    if (audioRef.current?.dataset.manualPause === 'true') return;

    setIsReconnecting(true);
    setError("Conexión perdida. Reconectando...");
    console.log("Iniciando intento de reconexión...");

    reconnectTimer.current = window.setTimeout(() => {
      if (audioRef.current) {
        console.log("Intentando reconectar...");
        audioRef.current.src = ""; // Desvincular fuente para forzar recarga
        audioRef.current.src = STREAM_URL;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => {
            console.log("Reconexión exitosa.");
            setIsReconnecting(false);
            setError(null);
            setPlaying(true);
          })
          .catch((err) => {
            console.error("Fallo al reconectar.", err);
            setError("No se pudo reconectar.");
            setIsReconnecting(false);
            setPlaying(false);
          });
      }
      reconnectTimer.current = null; // Limpiar el timer ID
    }, 3000); // Espera 3 segundos antes de reintentar
  };

  // --- Efectos para manejar el ciclo de vida del audio ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = (e: Event) => {
      console.error('Evento de error de audio:', e);
      setPlaying(false);
      attemptReconnect();
    };

    const handleStalled = () => {
      console.warn('El stream se ha detenido (stalled).');
      setPlaying(false);
      attemptReconnect();
    };

    // **NUEVO: Detector de congelamiento**
    const handleTimeUpdate = () => {
        lastTimeUpdate.current = Date.now();
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // Iniciar el monitor de congelamiento
    stallChecker.current = window.setInterval(() => {
        if (audio.paused || isReconnecting) return;

        const timeSinceLastUpdate = Date.now() - lastTimeUpdate.current;

        // Si han pasado más de 4 segundos sin que el tiempo de audio avance, es un congelamiento
        if (timeSinceLastUpdate > 4000) {
            console.warn('Stream congelado detectado (sin timeupdate). Forzando reconexión.');
            attemptReconnect();
        }
    }, 2000); // Revisa cada 2 segundos

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (stallChecker.current) clearInterval(stallChecker.current);
    };
  }, [isReconnecting]);

  // --- Efecto para buscar metadatos de la canción ---
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(METADATA_URL);
        if (!res.ok) return;
        const data = await res.json();
        const np = data.now_playing || data;
        setSong({
          title: np.song?.title || 'Sin información',
          artist: np.song?.artist || '',
          cover: np.song?.art || null
        });
      } catch {
        // Silencio en caso de error para no interrumpir
      }
    };
    fetchMetadata();
    const interval = window.setInterval(fetchMetadata, 8000);
    return () => clearInterval(interval);
  }, []);

  // --- Efecto para el reloj ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Función para Play/Pause ---
  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;
    setIsReconnecting(false);

    try {
      if (playing) {
        audioRef.current.pause();
        audioRef.current.dataset.manualPause = 'true';
        setPlaying(false);
      } else {
        audioRef.current.dataset.manualPause = 'false';
        audioRef.current.src = STREAM_URL;
        await audioRef.current.play();
        setPlaying(true);
        setError(null);
        lastTimeUpdate.current = Date.now(); // Resetear el contador al dar play
      }
    } catch (err) {
      console.error('Error al intentar reproducir:', err);
      setError("No se pudo iniciar el stream.");
      setPlaying(false);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  return (
    <motion.div
      className="radio-3d p-8 max-w-xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />

      <div className="bg-black rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20"></div>
        <div className="relative z-10 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-cyan-400 text-sm font-mono">FM 91.6</span>
            <span className="text-cyan-400 text-sm font-mono">{currentTime}</span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2 min-h-[56px]">
            {song.cover ? (
              <img src={song.cover} alt="cover" className="w-14 h-14 rounded shadow border-2 border-custom-orange bg-slate-900 object-cover" />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center rounded bg-slate-800 border-2 border-custom-orange">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#F97316" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
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
                <p className="text-yellow-400 text-sm animate-pulse">{error}</p>
            ) : currentLive ? (
              <>
                <p className="text-custom-orange text-base font-bold animate-pulse">EN VIVO: {currentLive.title}</p>
                <p className="text-cyan-300 text-xs">{currentLive.time} | {currentLive.host}</p>
              </>
            ) : (
              <p className="text-cyan-300 text-sm">
                {error ? <span className="text-red-400">{error}</span> : `Música en vivo`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-end justify-center gap-1 h-16 mb-4">
          {bars.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t"
              animate={{ height: playing ? [8, 32, 16, 24, 40, 12, 36, 20, 28, 44][i % 10] : 8 }}
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
          disabled={isReconnecting}
        >
          {playing ? (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
          ) : (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
          )}
        </motion.button>
      </div>
      <div className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="text-cyan-400"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolume} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider" />
        <span className="text-cyan-400 text-sm font-mono w-12">{Math.round(volume * 100)}%</span>
      </div>
    </motion.div>
  );
};

export default Player;