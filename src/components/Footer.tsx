import React from "react";
import { motion } from "framer-motion";


const Footer: React.FC = () => (
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
              { icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z", href: "#", label: "Twitter" },
              { icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z", href: "#", label: "Facebook" },
              { icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 2h11A4.5 4.5 0 0122 6.5v11a4.5 4.5 0 01-4.5 4.5h-11A4.5 4.5 0 012 17.5v-11A4.5 4.5 0 016.5 2z", href: "#", label: "Instagram" }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className="w-10 h-10 bg-slate-800 hover:bg-cyan-600 rounded-full flex items-center justify-center text-white transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                aria-label={social.label}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                </svg>
              </motion.a>
            ))}
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
            <p>📍 Tu Ciudad, País</p>
            <p className="font-mono text-cyan-400">FM 91.6 MHz</p>
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
        <div className="flex items-center justify-center gap-2">
                    <p className="text-slate-400 text-sm">
            © 2025 Radio Go. Todos los derechos reservados. | Diseñado por Folkoder
          </p>
          <img
            src="/src/assets/favicon-16x16.png"
            alt="Folkoder Logo"
            className="h-6 w-6"
          />
        </div>
      </motion.div>
    </div>
  </footer>
);

export default Footer;
