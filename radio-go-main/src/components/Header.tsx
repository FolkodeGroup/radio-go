// src/components/Header.tsx
import React, { useState } from "react"; // 1. Importa useState
import { motion } from "framer-motion";
import logo from '../assets/logo-radio.jpg';
import banderaArgentina from '../assets/bandera-argentina.png';

const Header: React.FC = () => {
  // 2. Crea un estado para controlar la visibilidad del menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Función para alternar el estado del menú
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 5. Función para cerrar el menú (opcional, útil al hacer clic en un enlace)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
        {/* 4. Botón hamburguesa con onClick */}
        <button
          className="md:hidden text-gray-300 focus:outline-none"
          id="mobile-menu-button"
          onClick={toggleMobileMenu} // Asocia la función al evento onClick
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"} // Accesibilidad
          aria-expanded={isMobileMenuOpen} // Accesibilidad
        >
          {/* Icono del menú hamburguesa (puedes usar uno de Material Icons o un SVG) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMobileMenuOpen ? ( // Cambia el icono según el estado
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> // Icono de cerrar (X)
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> // Icono de menú (tres líneas)
            )}
          </svg>
        </button>
      </div>
      {/* 6. Menú móvil, usa el estado para la clase CSS */}
      <div
        className={`md:hidden bg-custom-dark transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}
        id="mobile-menu"
      >
        {/* 7. Enlaces con onClick para cerrar el menú */}
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300" href="#inicio" onClick={closeMobileMenu}>Inicio</a>
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300" href="#nosotros" onClick={closeMobileMenu}>Sobre Nosotros</a>
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300" href="#programación" onClick={closeMobileMenu}>Programación</a>
        <a className="block py-2 px-6 text-gray-300 hover:bg-gray-800 hover:text-custom-orange transition duration-300" href="#contacto" onClick={closeMobileMenu}>Contacto</a>
      </div>
    </motion.header>
  );
};

export default Header;