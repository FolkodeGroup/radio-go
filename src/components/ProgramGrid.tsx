import React from "react";
import { motion } from "framer-motion";

const programs = [
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

const ProgramGrid: React.FC = () => (
  <section id="programacion" className="py-20">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold text-white mb-4 orbitron">
          Nuestra <span className="text-cyan-400">Programación</span>
        </h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Descubre los mejores programas las 24 horas del día
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((program, index) => (
          <motion.div
            key={program.title}
            className="glass rounded-2xl p-6 relative overflow-hidden group hover:bg-white/15 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            viewport={{ once: true }}
          >
            {/* Indicador de estado */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
              program.live 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-blue-500 text-white"
            }`}>
              {program.live ? "EN VIVO" : "PRÓXIMO"}
            </div>
            
            {/* Contenido principal */}
            <div className="pt-8">
              <h3 className="text-xl font-bold text-white mb-2 orbitron">
                {program.title}
              </h3>
              <p className="text-cyan-400 font-mono text-lg mb-3">
                {program.time}
              </p>
              <p className="text-slate-300 mb-3">
                {program.description}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9H21ZM19 19H5V9H19V19Z"/>
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">
                  {program.host}
                </span>
              </div>
            </div>
            
            {/* Efecto hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProgramGrid;
