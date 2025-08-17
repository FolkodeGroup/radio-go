"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import logo from '../assets/logo-radio.jpg';


type LoginProps = {
  onLoginSuccess: () => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    // Simulación: usuario y contraseña fijos
    if (email === "demo@radio.com" && password === "1234") {
      setError("");
      onLoginSuccess();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] px-2">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.img
          src={logo}
          alt="Radio Go Logo"
          className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-custom-teal shadow-2xl floating"
          style={{ filter: "drop-shadow(0 0 20px rgba(20, 184, 166, 0.5))" }}
          width={96}
          height={96}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        />
      </motion.div>
      <form
        onSubmit={handleSubmit}
        className="glass bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-lg rounded-2xl p-8 w-full max-w-xs shadow-xl border border-cyan-700/30"
      >
        <h2 className="text-2xl font-black text-center text-custom-teal mb-6 orbitron tracking-wider">Acceso Admin</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-semibold mb-1 text-white">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@email.com"
            className="w-full border border-cyan-700 bg-slate-900/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-custom-teal placeholder:text-slate-400"
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-semibold mb-1 text-white">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-cyan-700 bg-slate-900/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-custom-teal placeholder:text-slate-400"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-orange-400 text-sm mb-2 text-center font-semibold">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-custom-teal to-custom-orange text-white font-bold py-2 px-4 rounded-lg shadow hover:from-custom-orange hover:to-custom-teal transition-colors duration-200 mt-2"
        >
          Ingresar
        </button>
      </form>
    </section>
  );
}