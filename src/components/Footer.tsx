import React from "react";
import { motion } from "framer-motion";
import { FaFacebook, FaTiktok, FaInstagram, FaTwitch } from "react-icons/fa";
import { SiTunein } from "react-icons/si";



type FooterProps = {
  onAdminLoginClick?: () => void;
  isAdmin?: boolean;
};

const Footer: React.FC<FooterProps> = ({ onAdminLoginClick, isAdmin }) => (
  <footer className="bg-slate-900/90 backdrop-blur-lg py-12 mt-20">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Logo y descripción */}
        <div className="md:col-span-2">
          <motion.div 
            className="text-3xl font-bold text-white mb-4 orbitron"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            RADIO<span className="text-cyan-400">GO</span>
          </motion.div>
          <motion.p 
            className="text-slate-300 mb-6 max-w-md"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Tu estación de radio favorita. Música, entretenimiento y la mejor programación las 24 horas del día.
          </motion.p>
          
          {/* Redes sociales */}
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              { icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=61579298256538", color: "text-blue-500", label: "Facebook" },
              { icon: FaTiktok, url: "https://www.tiktok.com/@radiogodigital", color: "text-white", label: "Tiktok" },
              { icon: FaInstagram, url: "https://www.instagram.com/radiogodigital", color: "text-pink-500", label: "Instagram" },
              { icon: FaTwitch, url: "https://www.twitch.tv/radiogodigital", color: "text-purple-500", label: "Twitch" },
              { icon: SiTunein, url: "https://tunein.com/radio/Radio-Go-s346452", color: "text-white", label: "TuneIn" },
            ].map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-slate-800 hover:bg-cyan-600 rounded-full flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <Icon className={`w-5 h-5 ${social.color}`} />
                </motion.a>
              );
            })}
          </motion.div>
        </div>
        
        {/* Enlaces rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h4 className="text-white font-bold mb-4">Enlaces</h4>
          <ul className="space-y-2">
            {["Inicio", "Programación", "Nosotros", "Contacto"].map((link) => (
              <li key={link}>
                <a href={`#${link.toLowerCase()}`} className="text-slate-300 hover:text-cyan-400 transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
        
        {/* Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h4 className="text-white font-bold mb-4">Contacto</h4>
          <div className="space-y-2 text-slate-300">
            <p>📧 info@radiogo.com</p>
            <p>📞 +1 (555) 123-4567</p>
          </div>
        </motion.div>
      </div>
      
      {/* Línea divisoria y copyright */}
      <motion.div 
        className="border-t border-slate-800 pt-6 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-2">
          <p className="text-slate-400 text-sm">
            © 2025 Radio Go. Todos los derechos reservados. | Diseñado por <a href="https://folkode.vercel.app" target="_blank" rel="noopener noreferrer">Folkode</a>
          </p>
          
          <button
            className="ml-4 mt-2 md:mt-0 text-xs text-cyan-400 underline hover:text-orange-400 transition"
            onClick={onAdminLoginClick}
          >
            {isAdmin ? 'Panel administrador' : 'Login administrador'}
          </button>
        </div>
      </motion.div>
    </div>
  </footer>
);

export default Footer;
