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
  const audioRef = useRef<HTMLAudioElement>(null);
  const watchdogRef = useRef<number | null>(null);

  // Estado que controla si el usuario DECIDIÓ pausar.
  // Si esto es false, el audio DEBE estar sonando. SIEMPRE.
  const [manualPause, setManualPause] = useState(true);

  const [playing, setPlaying] = useState(false); // Estado visual (¿suena o no?)
  const [volume, setVolume] = useState(0.1);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<{ title: string; artist: string; cover: string | null }>({ title: 'Cargando...', artist: '', cover: null });
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');

  // Función NUCLEAR de reconexión: Destruye y reconstruye
  const forceReconnect = useCallback(() => {
    if (!audioRef.current || manualPause) return;

    console.warn("🔄 [Player] Forzando reconexión limpia...");
    setStatus('loading');
    setError("Reconectando señal...");
    setPlaying(false);

    try {
      const audio = audioRef.current;
      audio.pause();
      audio.src = ""; // Limpieza total
      audio.load();

      // Breve pausa para asegurar que el navegador limpie el buffer
      setTimeout(() => {
        if (manualPause) return; // Chequeo de seguridad por si el usuario pausó en el intermedio
        console.log("▶️ [Player] Iniciando nueva conexión...");
        audio.src = STREAM_URL + '?t=' + Date.now(); // Cache buster nuevo
        audio.load();
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ [Player] Reconexión exitosa");
              setStatus('playing');
              setPlaying(true);
              setError(null);
            })
            .catch(err => {
              console.error("❌ [Player] Falló play() en reconexión:", err);
              // Si falla, reintentamos en 2 segundos recursivamente
              if (!manualPause) {
                setTimeout(forceReconnect, 2000);
              }
            });
        }
      }, 500);
    } catch (e) {
      console.error("❌ [Player] Error crítico en forceReconnect:", e);
    }
  }, [manualPause]);

  // Watchdog: El perro guardián que vigila el silencio
  useEffect(() => {
    if (manualPause) {
      if (watchdogRef.current) clearInterval(watchdogRef.current);
      return;
    }

    let lastTime = 0;
    let stuckCount = 0;

    console.log("👀 [Watchdog] Iniciando vigilancia...");
    watchdogRef.current = window.setInterval(() => {
      if (!audioRef.current || manualPause) return;

      const audio = audioRef.current;
      const nowTime = audio.currentTime;

      // Si el tiempo no avanza...
      if (Math.abs(nowTime - lastTime) < 0.1) {
        stuckCount++;
        console.warn(`⚠️ [Watchdog] Audio estancado (${stuckCount}/3)`);

        // Si estancado por 3 checks (3 segundos) -> REINICIAR
        if (stuckCount >= 3) {
          console.error("🚨 [Watchdog] DETECTADO CORTE: Reiniciando ahora.");
          forceReconnect();
          stuckCount = 0;
        }
      } else {
        stuckCount = 0; // Todo bien, reseteamos contador
        if (status !== 'playing') {
          setStatus('playing'); // Recuperación visual automática
          setPlaying(true);
          setError(null);
        }
      }
      lastTime = nowTime;

      // Doble chequeo: Si el audio dice que está pausado pero manualPause es false -> PLAY
      if (audio.paused && !manualPause && stuckCount === 0) {
        console.warn("⚠️ [Watchdog] Audio pausado sin permiso. Dando Play...");
        audio.play().catch(() => { });
      }

    }, 1000); // Check cada 1 segundo

    return () => {
      if (watchdogRef.current) clearInterval(watchdogRef.current);
    };
  }, [manualPause, forceReconnect, status]);


  // Controles de Usuario
  const togglePlay = useCallback(() => {
    if (manualPause) {
      // Usuario quiere PLAY
      setManualPause(false);
      // Damos un empujón inicial
      setTimeout(() => forceReconnect(), 10);
    } else {
      // Usuario quiere PAUSE
      setManualPause(true);
      setStatus('idle');
      setPlaying(false);
      setError(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Liberar conexión
      }
    }
  }, [manualPause, forceReconnect]);

  // Event Listeners Nativos (Como backup y triggers rápidos)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEvent = (e: Event) => {
      if (manualPause) return;

      switch (e.type) {
        case 'ended':
        case 'error':
          console.warn(`⚡ [Event] ${e.type} detectado. Reconectando...`);
          forceReconnect(); // Reacción inmediata sin esperar al watchdog
          break;
        case 'waiting':
        case 'stalled':
          setStatus('loading');
          break;
        case 'playing':
          setStatus('playing');
          setPlaying(true);
          setError(null);
          break;
      }
    };

    const loadStart = () => { if (!manualPause) setStatus('loading'); };

    audio.addEventListener('ended', handleEvent);
    audio.addEventListener('error', handleEvent);
    audio.addEventListener('waiting', handleEvent);
    audio.addEventListener('stalled', handleEvent);
    audio.addEventListener('playing', handleEvent);
    audio.addEventListener('loadstart', loadStart);

    return () => {
      audio.removeEventListener('ended', handleEvent);
      audio.removeEventListener('error', handleEvent);
      audio.removeEventListener('waiting', handleEvent);
      audio.removeEventListener('stalled', handleEvent);
      audio.removeEventListener('playing', handleEvent);
      audio.removeEventListener('loadstart', loadStart);
    };
  }, [manualPause, forceReconnect]);

  // Manejo de Volumen
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  // --- Efectos Visuales y Metadata (Sin cambios lógicos grandes) ---

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(METADATA_URL);
        if (!res.ok) return;
        const data = await res.json();
        let title = 'Desconocido';
        let artist = '';
        const rawTitle = data.title || '';
        if (rawTitle.includes(' - ')) {
          [artist, title] = rawTitle.split(' - ').map((s: string) => s.trim());
        } else {
          title = rawTitle;
        }
        setSong({
          title: title || 'Música en vivo',
          artist: artist,
          cover: data.art || null
        });
      } catch { }
    };
    fetchMetadata();
    const interval = window.setInterval(fetchMetadata, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);


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
          <div className="flex justify-end items-center mb-2">
            <span className="text-cyan-400 text-sm font-mono">{currentTime}</span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2 min-h-[56px]">
            {song.cover ? (
              <img src={song.cover} alt={`Portada de la canción ${song.title} de ${song.artist}`} className="w-14 h-14 rounded shadow border-2 border-custom-orange bg-slate-900 object-cover" loading="lazy" />
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
            {status === 'loading' ? (
              <p className="text-yellow-400 text-sm animate-pulse">{error || 'Cargando señal...'}</p>
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
          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all pulse-glow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
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
