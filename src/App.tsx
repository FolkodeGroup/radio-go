// Utilidad para limpiar y validar el src base64
function getValidBase64Src(image_type: string, image_data: string): string | null {
  if (!image_type || !image_data) return null;
  // Limpiar espacios y caracteres extraños
  const cleanType = image_type.trim().replace(/[^a-zA-Z0-9/-]+/g, '');
  const cleanData = image_data.trim().replace(/[^a-zA-Z0-9+/=]+/g, '');
  if (!cleanType.startsWith('image/')) return null;
  if (cleanData.length < 20) return null;
  return `data:${cleanType};base64,${cleanData}`;
}
import { useState, useEffect, useRef, type Dispatch, type SetStateAction, type ComponentType } from "react";
// Loader global con logo
function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={logo}
              alt="Radio Go Logo"
              className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-xl animate-pulse"
              style={{ filter: "drop-shadow(0 0 20px rgba(20, 184, 166, 0.5))" }}
            />
          </div>
          <div className="absolute inset-0 w-24 h-24 border-[6px] border-custom-orange border-t-transparent border-b-transparent rounded-full animate-spin mx-auto my-auto shadow-[0_0_32px_4px_rgba(249,115,22,0.25)]"></div>
        </div>
        <span className="text-cyan-300 font-bold text-lg tracking-widest animate-pulse mt-2">Cargando...</span>
      </div>
    </div>
  );
}
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { motion } from "framer-motion";
import Header from "./components/Header";
import { Suspense, lazy } from "react";
const ModernPlayer = lazy(() => import("./components/ModernPlayer"));
import Footer from "./components/Footer";
import logo from "./assets/logo-radio.jpg";
import logoRadiosComBr from "./assets/navbar-logo-radios.com.br.webp";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";
import { FaFacebook, FaTwitch } from "react-icons/fa";
import { SiTunein } from 'react-icons/si';
import "./styles.css";




// Banner type
type Program = {
  title: string;
  time: string;
  live: boolean;
  description: string;
  host: string;
};

type Banner = {
  id: string;
  title: string;
  description: string | null;
  link_url: string | null;
  image_data: string;
  image_type: string;
};


function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [currentLive, setCurrentLive] = useState<Program | null>(null);
  // Estado de carga global
  const [loading, setLoading] = useState(true);
  // Consultar datos reales de Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      // Banners
      const { data: bannersData, error: bannersError } = await supabase
        .from('banners')
        .select('id, title, description, link_url, image_data, image_type, active')
        .eq('active', true)
        .order('priority', { ascending: false });

      if (isMounted && !bannersError && bannersData) {
        setBanners(bannersData as Banner[]);
      }
      // Programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('name, start_time, end_time, description, host, day_of_week, id')
        .order('start_time', { ascending: true });
      if (isMounted && !programsError && programsData) {
        // Detectar programa en vivo
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const nowStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const day = now.getDay();
        let liveFound = null;
        const mapped = programsData.map((p: {
          name: string;
          start_time: string;
          end_time: string;
          description: string;
          host: string;
          day_of_week: number;
          id: string;
        }) => {
          // Asume formato HH:mm o HH:mm:ss
          const start = (p.start_time || '').slice(0, 5);
          const end = (p.end_time || '').slice(0, 5);
          const isToday = p.day_of_week === day;
          const isLive = isToday && nowStr >= start && nowStr < end;
          if (isLive) liveFound = {
            title: p.name,
            time: `${p.start_time || ''} - ${p.end_time || ''}`,
            live: true,
            description: p.description || '',
            host: p.host || '',
          };
          return {
            title: p.name,
            time: `${p.start_time || ''} - ${p.end_time || ''}`,
            live: isLive,
            description: p.description || '',
            host: p.host || '',
          };
        });
        setPrograms(mapped);
        setCurrentLive(liveFound);
      }
      // Oculta loader tras ambos fetch
      setTimeout(() => { if (isMounted) setLoading(false); }, 200); // delay mínimo para evitar parpadeo
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerInterval = useRef<number | null>(null);


  // Slider automático
  useEffect(() => {
    if (banners.length <= 1) return;
    if (bannerInterval.current) clearInterval(bannerInterval.current);
    bannerInterval.current = window.setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 segundos
    return () => {
      if (bannerInterval.current) clearInterval(bannerInterval.current);
    };
  }, [banners.length]);

  // Cambio manual
  const goToBanner = (idx: number) => {
    setCurrentBanner(idx);
    if (bannerInterval.current) {
      clearInterval(bannerInterval.current);
      bannerInterval.current = window.setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
  };

  const handleLoginSuccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setIsAdmin(true);
    setShowLogin(false);
  };

  // Mantener sesión sincronizada con Supabase
  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAdmin(!!user);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(!!session?.user);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isAdmin) {
    type AdminPanelProps = {
      banners: Banner[];
      setBanners: Dispatch<SetStateAction<Banner[]>>;
      programs: Program[];
      setPrograms: Dispatch<SetStateAction<Program[]>>;
    };
    const AdminPanelComponent = AdminPanel as unknown as ComponentType<AdminPanelProps>;
    return (
      <div>
        <div className="flex justify-end items-center p-4 bg-gray-900 text-white text-sm logout-button">
          {user && (
            <span className="mr-4">Logueado como: <span className="font-bold text-custom-teal">{user.email}</span></span>
          )}
          <button
            className="bg-custom-orange text-white px-3 py-1 rounded hover:bg-custom-teal transition mt-4"
            onClick={async () => {
              await supabase.auth.signOut();
              setIsAdmin(false);
              setUser(null);
            }}
          >
            Cerrar sesión
          </button>
        </div>
        <AdminPanelComponent
          banners={banners}
          setBanners={setBanners}
          programs={programs}
          setPrograms={setPrograms}
        />
      </div>
    );
  }

  if (loading) return <GlobalLoader />;

  return (
    <main className="min-h-screen bg-custom-dark" id="main-content" tabIndex={-1}>
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-md flex flex-col items-center bg-login">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl z-10"
              onClick={() => setShowLogin(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
      <Header />
      {/* Banner Slider Section */}
      <section className="w-full flex justify-center items-center py-6 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 select-none" aria-label="Banners principales">
        <div className="w-full relative flex items-center justify-center px-0">
          {/* Flecha izquierda */}
          <button
            className="absolute left-4 z-10 bg-slate-900/70 hover:bg-cyan-700/80 text-white rounded-full p-2 shadow-lg transition-all top-1/2 -translate-y-1/2"
            onClick={() => goToBanner((currentBanner - 1 + banners.length) % banners.length)}
            aria-label="Banner anterior"
            style={{ display: banners.length > 1 ? 'block' : 'none' }}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          {/* Banner actual */}
          {banners.length > 0 && banners[currentBanner] ? (
            <a
              href={banners[currentBanner].link_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-[320px] relative rounded-xl shadow-lg bg-slate-900/80 border border-cyan-700/30 overflow-hidden transition-all duration-500"
              style={{ height: 320 }}
            >
              {/* Imagen de fondo */}
              {(() => {
                const src = getValidBase64Src(banners[currentBanner].image_type, banners[currentBanner].image_data);
                if (src) {
                  return (
                    <img
                      src={src}
                      alt={banners[currentBanner].title}
                      className="absolute inset-0 w-full h-full object-contain object-center z-0"
                      style={{ width: '100%', height: '100%' }}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = '/vite.svg';
                      }}
                    />
                  );
                } else {
                  return (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-700 text-slate-400 z-0">
                      Sin imagen
                    </div>
                  );
                }
              })()}
              {/* Overlay de texto */}
              <div className="relative z-10 flex flex-col justify-end h-full w-full px-8 py-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <h3 className="text-white font-bold text-2xl md:text-3xl mb-2 drop-shadow-lg truncate" title={banners[currentBanner].title}>{banners[currentBanner].title}</h3>
                {banners[currentBanner].description && (
                  <p className="text-white text-base md:text-lg line-clamp-2 drop-shadow-lg">{banners[currentBanner].description}</p>
                )}
              </div>
            </a>
          ) : (
            <div className="w-full h-[320px] flex items-center justify-center text-slate-400 bg-slate-900/60 rounded-xl border border-cyan-700/20">
              Sin banners
            </div>
          )}
          {/* Flecha derecha */}
          <button
            className="absolute right-4 z-10 bg-slate-900/70 hover:bg-cyan-700/80 text-white rounded-full p-2 shadow-lg transition-all top-1/2 -translate-y-1/2"
            onClick={() => goToBanner((currentBanner + 1) % banners.length)}
            aria-label="Banner siguiente"
            style={{ display: banners.length > 1 ? 'block' : 'none' }}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
          {/* Indicadores */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full border-2 ${idx === currentBanner ? 'bg-custom-orange border-custom-orange' : 'bg-slate-700 border-slate-400'} transition-all`}
                onClick={() => goToBanner(idx)}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      {/* Hero Section */}
      <section id="inicio" className="min-h-screen flex flex-col justify-center items-center px-6 pt-10 bg-custom-dark md:scroll-mt-[-60px] sm:scroll-mt-[30px]" aria-label="Inicio">
        <div className="container mx-auto text-center">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.img
              src={logo}
              alt="Radio Go Logo"
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-custom-teal shadow-2xl floating"
              style={{ filter: "drop-shadow(0 0 20px rgba(20, 184, 166, 0.5))" }}
              width={128}
              height={128}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            />
          </motion.div>
          <motion.h1
            className="text-6xl md:text-8xl font-black text-white mb-6 orbitron text-glow"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            tabIndex={0}
          >
            RADIO<span className="text-custom-orange">GO</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            La mejor música y entretenimiento las 24 horas
          </motion.p>
          <motion.div
            className="mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Suspense fallback={<div className="w-full flex justify-center items-center min-h-[120px]"><span className="text-custom-teal animate-pulse">Cargando reproductor...</span></div>}>
              <ModernPlayer currentLive={currentLive} />
            </Suspense>
          </motion.div>
          {/* Redes sociales */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span> Escuchanos en </span>{" "}
            <span className="text-custom-orange">Nuestras </span>{" "}
            <span className="text-custom-teal">Redes</span>
          </h2>
          <div className="w-24 h-1 bg-custom-teal mx-auto mb-8"></div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-3xl mx-auto card-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {/* Facebook */}
            <motion.a
              href="https://www.facebook.com/profile.php?id=61579298256538"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="glass rounded-lg px-5 py-3 border border-custom-orange flex items-center hover:bg-[#1e1e1e] transition text-center justify-center"
            >
              <FaFacebook size={35} className="text-2xl text-blue-500" />
            </motion.a>
            {/* Twitch */}
            <motion.a
              href="https://www.twitch.tv/radiogodigital"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="glass rounded-lg px-5 py-3 border border-custom-orange flex items-center hover:bg-[#1e1e1e] transition text-center justify-center"
            >
              <FaTwitch size={35} className="text-2xl text-purple-500" />
            </motion.a>
            {/* TuneIn */}
            <motion.a
              href="https://tunein.com/radio/Radio-Go-s346452"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="glass rounded-lg px-5 py-3 border border-custom-orange flex items-center hover:bg-[#1e1e1e] transition text-center justify-center"
            >
              <SiTunein size={35} className="text-2xl text-white" />
            </motion.a>
            {/* radios.com.br */}
            <motion.a
              href="https://www.radios.com.br/aovivo/radio-go/272262"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="glass rounded-lg px-5 py-3 border border-custom-orange flex items-center hover:bg-[#1e1e1e] transition text-center justify-center"
            >
              <img src={logoRadiosComBr} alt="radios.com.br" className="w-8 h-8 object-contain" />
            </motion.a>
          </motion.div>
        </div>
      </section>
      {/* Sobre Nosotros Section */}
      <section className="py-20 bg-custom-dark md:scroll-mt-[300px]" id="nosotros" aria-label="Sobre Nosotros">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sobre <span className="text-custom-orange">Radio</span>{" "}
            <span className="text-custom-teal">Go</span>
          </h2>
          <div className="w-24 h-1 bg-custom-teal mx-auto mb-8"></div>
          <p className="max-w-3xl mx-auto text-gray-400 text-lg">
            Somos más que una radio, somos una comunidad apasionada por la música.
            Desde nuestros inicios, nos hemos dedicado a ofrecer una programación
            fresca, dinámica y de alta calidad, conectando a nuestra audiencia con
            los ritmos que marcan tendencia y los clásicos que nunca mueren. En
            Radio Go, cada día es una nueva aventura sonora.
          </p>
        </div>
      </section>
      {/* Nuestra Programación Section */}
      <section className="py-20 bg-gray-900 md:scroll-mt-[40px] sm:scroll-mt-[150px]" id="programación" aria-label="Nuestra Programación">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Nuestra <span className="text-custom-teal">Programación</span>
          </h2>
          <div className="w-24 h-1 bg-custom-orange mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.length > 0 ? programs.map((p, idx) => {
              const isTurquoise = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`bg-custom-dark rounded-lg p-6 transform hover:-translate-y-2 transition duration-300 shadow-lg border-l-4 ${p.live ? 'border-custom-orange' : isTurquoise ? 'border-custom-teal' : 'border-custom-orange'} relative overflow-hidden group`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <p className={`font-bold ${p.live ? 'text-custom-orange animate-pulse' : isTurquoise ? 'text-custom-teal' : 'text-custom-orange'}`}>{p.time}</p>
                    {p.live && <span className="bg-custom-orange text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">EN VIVO</span>}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-gray-400 mb-1">{p.description}</p>
                  <p className="text-xs text-slate-400">{p.host}</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              );
            }) : (
              <div className="col-span-3 text-center text-slate-400 py-8">No hay programas cargados.</div>
            )}
          </div>
        </div>
      </section>
      <footer className="bg-custom-dark" id="contacto" aria-label="Contacto">
        <Footer onAdminLoginClick={() => setShowLogin(true)} isAdmin={isAdmin} />
      </footer>
    </main>
  );
}

export default App;
