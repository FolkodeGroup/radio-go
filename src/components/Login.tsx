"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import logo from '../assets/logo-radio.jpg';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setError("");
    console.log("Login data:", formData);
  };

  return (
    <section className="mt-20">
        <div className="container mx-auto text-center">
          <motion.div
            className=""
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
        </div>
    <div className="flex items-center justify-center bg-dark mb-20 pt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 w-80 space-y-4 form-login"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Ingresar
        </button>
      </form>
    </div>
    </section>
  );
}