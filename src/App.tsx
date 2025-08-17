import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import ModernPlayer from "./components/ModernPlayer";
import Footer from "./components/Footer";
import logo from "./assets/logo-radio.jpg";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";
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
  image: string;
  url: string;
  alt: string;
};

const initialPrograms: Program[] = [
  {
    title: "TRASnOCHE BLUE",
    time: "01:00 - 06:00",
    live: true,
    description: "Música nocturna y conversación relajante",
    host: "DJ Midnight"
  },
  {
    title: "HABLEMOS TODO HOY",
    time: "06:00 - 09:00",
    live: false,
    description: "Noticias del día y actualidad",
    host: "María González"
  },
  {
    title: "LA MAÑANA DE BLUE",
    time: "09:00 - 13:00",
    live: false,
    description: "Música popular y entretenimiento",
    host: "Carlos Méndez"
  },
];

const initialBanners: Banner[] = [
  { image: "https://cdn.discordapp.com/attachments/1271478849305051260/1406698409037140071/Copilot_20250817_145649.png?ex=68a3697b&is=68a217fb&hm=34c9f1da7638f8f63241343032697a8fc805bde75ebd058858a2d5b35c782f32&", url: "https://ejemplo.com/1", alt: "Banner 1" },
  { image: "https://via.placeholder.com/728x90?text=Banner+2", url: "https://ejemplo.com/2", alt: "Banner 2" },
];

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
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

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  if (isAdmin) {
    return <AdminPanel
      onLogout={() => setIsAdmin(false)}
      banners={banners}
      setBanners={setBanners}
      programs={programs}
      setPrograms={setPrograms}
    />;
  }

  return (
    <div className="min-h-screen bg-custom-dark">
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
      <section className="w-full flex justify-center items-center py-6 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 select-none">
        <div className="w-full relative flex items-center justify-center px-0">
          {/* Flecha izquierda */}
          <button
            className="absolute left-4 z-10 bg-slate-900/70 hover:bg-cyan-700/80 text-white rounded-full p-2 shadow-lg transition-all top-1/2 -translate-y-1/2"
            onClick={() => goToBanner((currentBanner - 1 + banners.length) % banners.length)}
            aria-label="Anterior"
            style={{ display: banners.length > 1 ? 'block' : 'none' }}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          {/* Banner actual */}
          {banners.length > 0 ? (
            <a
              href={banners[currentBanner]?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mx-auto rounded-xl shadow-lg bg-slate-900/80 border border-cyan-700/30 overflow-hidden transition-all duration-500"
              style={{ minHeight: 110, maxWidth: '100%' }}
            >
              <img
                src={banners[currentBanner].image}
                alt={banners[currentBanner].alt}
                className="w-[100%] h-[110px] object-cover rounded-xl transition-all duration-500"
                style={{ maxWidth: '100%' }}
              />
            </a>
          ) : (
            <div className="w-full h-[90px] flex items-center justify-center text-slate-400 bg-slate-900/60 rounded-xl border border-cyan-700/20">
              Sin banners
            </div>
          )}
          {/* Flecha derecha */}
          <button
            className="absolute right-4 z-10 bg-slate-900/70 hover:bg-cyan-700/80 text-white rounded-full p-2 shadow-lg transition-all top-1/2 -translate-y-1/2"
            onClick={() => goToBanner((currentBanner + 1) % banners.length)}
            aria-label="Siguiente"
            style={{ display: banners.length > 1 ? 'block' : 'none' }}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
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
      <section id="inicio" className="min-h-screen flex flex-col justify-center items-center px-6 pt-10 bg-custom-dark">
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
          >
            RADIO<span className="text-custom-orange">GO</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            La mejor música y entretenimiento las 24 horas del día
          </motion.p>
          <motion.div
            className="mb-16"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <ModernPlayer />
          </motion.div>
          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {[
              { number: "24/7", label: "En el aire" },
              { number: "91.6", label: "FM MHz" },
              { number: "∞", label: "Buena música" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="glass rounded-lg p-6 border-l-4 border-custom-orange"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-custom-teal orbitron mb-2">
                  {stat.number}
                </div>
                <div className="text-white font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Sobre Nosotros Section */}
      <section className="py-20 bg-custom-dark" id="sobre-nosotros">
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
      <section className="py-20 bg-gray-900" id="programacion">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Nuestra <span className="text-custom-teal">Programación</span>
          </h2>
          <div className="w-24 h-1 bg-custom-orange mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.length > 0 ? programs.map((p, idx) => (
              <div
                key={idx}
                className={`bg-custom-dark rounded-lg p-6 transform hover:-translate-y-2 transition duration-300 shadow-lg border-l-4 ${p.live ? 'border-custom-orange' : 'border-custom-teal'} relative overflow-hidden group`}
              >
                <p className={`font-bold ${p.live ? 'text-custom-orange' : 'text-custom-teal'} mb-2`}>{p.time}</p>
                <h3 className="text-xl font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-gray-400 mb-1">{p.description}</p>
                <p className="text-xs text-slate-400">{p.host}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </div>
            )) : (
              <div className="col-span-3 text-center text-slate-400 py-8">No hay programas cargados.</div>
            )}
          </div>
        </div>
      </section>
      <div className="bg-custom-dark">
        <Footer onAdminLoginClick={() => setShowLogin(true)} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

export default App;
