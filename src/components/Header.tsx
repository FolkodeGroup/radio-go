import React, { useState } from "react";
import { motion } from "framer-motion";
import logo from '../assets/logo-radio.jpg';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  return (
    <motion.header
      className="bg-custom-dark/80 backdrop-blur-sm sticky top-0 z-50 shadow-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a className="flex items-center space-x-2" href="#inicio">
          <img src={logo} alt="Radio Go Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-white">RADIO<span className="text-custom-orange">GO</span></span>
        </a>
        <nav className="hidden md:flex space-x-8 items-center">
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#inicio">Inicio</a>
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#sobre-nosotros">Sobre Nosotros</a>
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#programacion">Programación</a>
          <a className="text-gray-300 hover:text-custom-orange transition duration-300 font-semibold" href="#contacto">Contacto</a>
        </nav>
        <button
          className="md:hidden text-gray-300 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="material-icons">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>
      {/* Menú móvil corregido */}
      <div
        className={`absolute md:hidden bg-custom-dark shadow-lg rounded-b-lg py-2 w-full left-0 z-50 ${isMobileMenuOpen ? 'block' : 'hidden'
          }`}
        id="mobile-menu"
      >
        <a
          className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300"
          href="#inicio"
          onClick={toggleMobileMenu}
        >
          Inicio
        </a>
        <a
          className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300"
          href="#sobre-nosotros"
          onClick={toggleMobileMenu}
        >
          Sobre Nosotros
        </a>
        <a
          className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300"
          href="#programacion"
          onClick={toggleMobileMenu}
        >
          Programación
        </a>
        <a
          className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300"
          href="#contacto"
          onClick={toggleMobileMenu}
        >
          Contacto
        </a>
      </div>
    </motion.header>
  );
};

export default Header;