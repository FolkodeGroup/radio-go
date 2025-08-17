import { motion } from "framer-motion";
import Header from "./components/Header";
import ModernPlayer from "./components/ModernPlayer";
import Footer from "./components/Footer";
import logo from "./assets/logo-radio.jpg";
import Login from "./components/Login";
import "./styles.css";

function App() {
  return (
    <div className="min-h-screen bg-custom-dark">
      <Login />
      <Header />
      {/* Hero Section */}
      <section id="inicio" className="min-h-screen flex flex-col justify-center items-center px-6 pt-20 bg-custom-dark">
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
            <div className="bg-custom-dark rounded-lg p-6 transform hover:-translate-y-2 transition duration-300 shadow-lg border-l-4 border-custom-orange relative overflow-hidden group">
              <p className="font-bold text-custom-orange mb-2">08:00 - 10:00</p>
              <h3 className="text-xl font-semibold text-white mb-2">
                Despierta con Go
              </h3>
              <p className="text-gray-400">
                La mejor energía y los hits del momento para empezar tu día con
                todo.
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
            <div className="bg-custom-dark rounded-lg p-6 transform hover:-translate-y-2 transition duration-300 shadow-lg border-l-4 border-custom-teal relative overflow-hidden group">
              <p className="font-bold text-custom-teal mb-2">14:00 - 16:00</p>
              <h3 className="text-xl font-semibold text-white mb-2">
                Tarde de Clásicos
              </h3>
              <p className="text-gray-400">
                Un viaje en el tiempo con las canciones que marcaron época.
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
            <div className="bg-custom-dark rounded-lg p-6 transform hover:-translate-y-2 transition duration-300 shadow-lg border-l-4 border-custom-orange relative overflow-hidden group">
              <p className="font-bold text-custom-orange mb-2">20:00 - 22:00</p>
              <h3 className="text-xl font-semibold text-white mb-2">Go Nights</h3>
              <p className="text-gray-400">
                La selección perfecta de música electrónica para acompañar tu
                noche.
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
      <div className="bg-custom-dark">

        <Footer />
      </div>
    </div>
  );
}

export default App;
