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

  // NUEVO: Una 'key' para forzar la recreación del elemento <audio>
  const [audioKey, setAudioKey] = useState(Date.now());

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [song, setSong] = useState<{ title: string; artist: string; cover: string | null }>({ title: 'Cargando...', artist: '', cover: null });
  const [isLoading, setIsLoading] = useState(false);

  // --- Lógica de Reconexión Automática ---
  const attemptReconnect = () => {
    if (isLoading) return; // Ya está en proceso

    // No reconectar si el usuario pausó intencionalmente
    if (audioRef.current?.dataset.manualPause === 'true') return;

    console.log("Iniciando intento de reconexión...");
    setIsLoading(true);
    setStatusMessage("Conexión inestable. Reconectando...");

    // Limpiar timers antiguos
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    reconnectTimer.current = window.setTimeout(() => {
      console.log("Forzando la recreación del elemento de audio.");
      // MODIFICADO: Cambiamos la key para destruir y crear un nuevo <audio>
      setAudioKey(Date.now());
    }, 3000); // Espera 3 segundos
  };

  // --- Efectos para manejar el ciclo de vida del audio ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let lastPlaybackTime = 0;

    const handleError = (e: Event) => {
      console.error('Evento de error de audio:', e);
      attemptReconnect();
    };

    const handleStalled = () => {
      console.warn('El stream se ha detenido (stalled).');
      attemptReconnect();
    };

    const handleCanPlay = () => {
        console.log("Stream listo para reproducir (canplay).");
        setIsLoading(false);
        setStatusMessage(null);
        // Si no fue una pausa manual, darle play
        if (audio.dataset.manualPause !== 'true') {
            audio.play().catch(e => console.error("Autoplay bloqueado tras reconexión:", e));
        }
    };

    const handlePlaying = () => {
        setPlaying(true);
        setIsLoading(false);
        setStatusMessage(null);
    }

    const handlePause = () => {
        // Solo marcar como "no reproduciendo" si no estamos en medio de una reconexión
        if (!isLoading) {
            setPlaying(false);
        }
    }

    // Monitor de congelamiento
    stallChecker.current = window.setInterval(() => {
      if (audio.paused || isLoading) return;

      if (audio.currentTime === lastPlaybackTime && audio.currentTime > 0) {
        console.warn('Stream congelado detectado (currentTime no avanza). Forzando reconexión.');
        attemptReconnect();
      }
      lastPlaybackTime = audio.currentTime;
    }, 4000); // Revisa cada 4 segundos

    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (stallChecker.current) clearInterval(stallChecker.current);
    };
  }, [audioKey, isLoading]); // Se re-ejecuta cuando el audio se recrea

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
    const metaInterval = setInterval(fetchMetadata, 8000);
    return () => clearInterval(metaInterval);
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

    if (isLoading) return; // No permitir interacción mientras se reconecta

    if (playing) {
      audioRef.current.pause();
      audioRef.current.dataset.manualPause = 'true';
      setPlaying(false);
    } else {
      audioRef.current.dataset.manualPause = 'false';
      setIsLoading(true);
      setStatusMessage("Conectando al stream...");
      try {
        // En algunos navegadores, es más seguro recargar la fuente antes de play
        audioRef.current.src = STREAM_URL;
        await audioRef.current.play();
        // El estado 'playing' se actualizará con el evento 'onPlaying'
      } catch (err) {
        console.error('Error al intentar reproducir:', err);
        setStatusMessage("No se pudo iniciar el stream.");
        setIsLoading(false);
      }
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  // Mensaje a mostrar en la UI
  const displayMessage = isLoading
    ? statusMessage
    : (currentLive ? `EN VIVO: ${currentLive.title}` : 'Música en vivo');
  const messageColorClass = isLoading
    ? 'text-yellow-400 animate-pulse'
    : (currentLive ? 'text-custom-orange animate-pulse' : 'text-cyan-300');


  return (
    <motion.div
      className="radio-3d p-8 max-w-xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      {/* MODIFICADO: Se añade la 'key' para forzar la recreación */}
      <audio ref={audioRef} key={audioKey} preload="auto" crossOrigin="anonymous" />

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
            <p className={`text-base font-bold ${messageColorClass}`}>
                {displayMessage}
            </p>
            {currentLive && !isLoading && <p className="text-cyan-300 text-xs">{currentLive.time} | {currentLive.host}</p>}
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
          disabled={isLoading}
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