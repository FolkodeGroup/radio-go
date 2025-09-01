import React from "react";
import { motion } from "framer-motion";
import logo from '../assets/logo-radio.jpg';
import banderaArgentina from '../assets/bandera-argentina.png';

const Header: React.FC = () => {
  return (
    <motion.header
      className="bg-custom-dark/80 backdrop-blur-sm sticky top-0 z-50 shadow-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <a className="flex items-center space-x-2" href="#inicio">
              <img src={logo} alt="Logo de Radio Go" className="h-10 w-auto" loading="lazy" />
            <span className="text-xl font-bold text-white">RADIO<span className="text-custom-orange">GO</span></span>
          </a>
              {/* Bandera de Argentina flameando, ocupa todo el espacio sobrante */}
              <div className="flex-1 flex items-center justify-center">
                  <img
                    src={banderaArgentina}
                    alt="Bandera de Argentina flameando"
                    className="h-10 w-full max-w-xs object-contain select-none m-0"
                    style={{ background: 'transparent', display: 'block' }}
                    draggable="false"
                    loading="lazy"
                  />
              </div>
        </div>
        <nav className="hidden md:flex space-x-8 items-center">
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#inicio">Inicio</a>
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#nosotros">Sobre Nosotros</a>
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#programación">Programación</a>
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#contacto">Contacto</a>
        </nav>
        <button className="md:hidden text-gray-300" id="mobile-menu-button">
          <span className="material-icons">menu</span>
        </button>
      </div>
      <div className="hidden md:hidden bg-custom-dark" id="mobile-menu">
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800" href="#inicio">Inicio</a>
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800" href="#nosotros">Sobre Nosotros</a>
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800" href="#programación">Programación</a>
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800" href="#contacto">Contacto</a>
      </div>
    </motion.header>
  );
};

export default Header;
