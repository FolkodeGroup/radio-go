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
  // --- DUAL ENGINE: Motores A y B ---
  const engineARef = useRef<HTMLAudioElement>(null);
  const engineBRef = useRef<HTMLAudioElement>(null);

  const workerRef = useRef<Worker | null>(null);

  // Estado para controlar qué motor es el que "suena" (el activo)
  const [activeEngine, setActiveEngine] = useState<'A' | 'B'>('A');

  // Temporizador para el relevo
  const timeSinceLastSwitch = useRef(0);
  const isSwitchingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<{ title: string; artist: string; cover: string | null }>({ title: 'Cargando...', artist: '', cover: null });
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');

  // Helpers
  const getActiveAudio = () => (activeEngine === 'A' ? engineARef.current : engineBRef.current);
  const getNextAudio = () => (activeEngine === 'A' ? engineBRef.current : engineARef.current);

  // --- FINALIZAR PROCESO DE CAMBIO (DEFINIDO ANTES PARA USAR EN CALLBACK) ---
  const finalizeSwitch = () => {
    const currentAudio = getActiveAudio(); // El "viejo" (A)

    console.log("✂️ [Relay] Cortando motor viejo ahora.");

    // CAMBIO DE ESTADO (SWAP)
    setActiveEngine(prev => prev === 'A' ? 'B' : 'A');
    timeSinceLastSwitch.current = 0;
    isSwitchingRef.current = false;

    // Matar el viejo
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = ""; // Liberar conexión
      currentAudio.volume = 0;
    }

    console.log("✨ [Relay] Relevo Completado. Conexión 100% Renovada.");
  };

  // --- HANDOFF LOGIC (Relevo con Overlap) ---
  const performHandoff = useCallback(() => {
    if (isSwitchingRef.current) return;
    isSwitchingRef.current = true;

    const nextAudio = getNextAudio();
    // Quitamos 'activeAudio' que no se usaba aquí, para evitar warning

    if (!nextAudio) return;

    console.log(`🔄 [Relay] Calentando Motor ${activeEngine === 'A' ? 'B' : 'A'}...`);

    // 1. Preparar siguiente motor (Muted)
    nextAudio.volume = 0;
    nextAudio.src = STREAM_URL + '?t=' + Date.now();
    nextAudio.load();

    // Listener para cuando haya audio real
    const onPlayStart = () => {
      console.log("🔊 [Relay] Motor secundario emitiendo sonido. Iniciando Cross-Fade...");

      // 3. Unmute inmediato del nuevo
      nextAudio.volume = volume;

      // 4. MANTENER AMBOS SONANDO (OVERLAP) POR 2 SEGUNDOS
      setTimeout(() => {
        finalizeSwitch();
      }, 2000);

      nextAudio.removeEventListener('playing', onPlayStart);
    };

    nextAudio.addEventListener('playing', onPlayStart, { once: true });

    // 2. Play
    nextAudio.play()
      .catch(err => {
        console.error("❌ [Relay] Falló arranque motor secundario:", err);
        isSwitchingRef.current = false;
        nextAudio.removeEventListener('playing', onPlayStart);
      });
  }, [activeEngine, volume]); // finalizeSwitch es estable o recreada, pero dentro del scope funciona

  // --- WORKER ---
  useEffect(() => {
    workerRef.current = new RadioWorker();

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'tick') {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));

        if (playing && status === 'playing') {
          timeSinceLastSwitch.current += 10;
        }

        // Trigger a los 290s
        if (playing && !isSwitchingRef.current && timeSinceLastSwitch.current >= 290) {
          console.log("⚠️ [Relay] 4m 50s alcanzados. Iniciando relevo preventivo...");
          performHandoff();
        }
      }
    };

    return () => workerRef.current?.terminate();
  }, [playing, status, performHandoff]);


  // --- CONTROLES PÚBLICOS ---

  const initialPlay = async () => {
    const audio = getActiveAudio();
    if (!audio) return;

    setStatus('loading');
    setError("Conectando...");

    try {
      audio.src = STREAM_URL + '?t=' + Date.now();
      audio.volume = volume;
      await audio.play();
      setPlaying(true);
      setStatus('playing');
      setError(null);
      timeSinceLastSwitch.current = 0;
    } catch (err) {
      console.error("Error start:", err);
      setStatus('error');
      setError("Error de conexión");
    }
  };

  const manualStop = () => {
    const current = getActiveAudio();
    const next = getNextAudio();

    if (current) { current.pause(); current.src = ""; }
    if (next) { next.pause(); next.src = ""; }

    setPlaying(false);
    setStatus('idle');
    timeSinceLastSwitch.current = 0;
    isSwitchingRef.current = false;
  };

  const togglePlay = () => {
    if (playing) manualStop();
    else initialPlay();
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    // Aplicar a ambos si hay transición
    const current = getActiveAudio();
    const next = getNextAudio();
    if (current) current.volume = newVolume;
    if (next && isSwitchingRef.current) next.volume = newVolume;
  };

  // --- Metadata ---
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

  const isReconnecting = status === 'loading';

  return (
    <motion.div
      className="radio-3d p-8 max-w-xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      {/* MOTORES OCULTOS */}
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
              <p className="text-yellow-400 text-sm animate-pulse">{error || 'Conectando...'}</p>
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
