
import { useState } from "react";
import { motion } from "framer-motion";
import AdminProgramEditor from "./AdminProgramEditor";
import AdminBannerEditor from "./AdminBannerEditor";

import type { Dispatch, SetStateAction } from "react";

type Banner = {
  image: string;
  url: string;
  alt: string;
};

type Program = {
  title: string;
  time: string;
  live: boolean;
  description: string;
  host: string;
};

type AdminPanelProps = {
  onLogout: () => void;
  banners: Banner[];
  setBanners: Dispatch<SetStateAction<Banner[]>>;
  programs: Program[];
  setPrograms: Dispatch<SetStateAction<Program[]>>;
};

export default function AdminPanel({ onLogout, banners, setBanners, programs, setPrograms }: AdminPanelProps) {
  const [section, setSection] = useState<"main" | "programs" | "banners">("main");
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-custom-dark px-4 py-12">
      <motion.div
        className="glass bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl shadow-xl border border-cyan-700/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-black text-center text-custom-teal mb-8 orbitron tracking-wider">
          Panel de Administración
        </h2>
        {section === "main" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sección Programación */}
            <div className="bg-slate-900/80 rounded-xl p-6 shadow border border-cyan-800/30 flex flex-col items-center">
              <h3 className="text-xl font-bold text-custom-orange mb-2">Editar Programación</h3>
              <p className="text-slate-300 text-center mb-4">Agrega, edita o elimina bloques de la programación de la radio.</p>
              <button className="bg-custom-teal text-white px-4 py-2 rounded-lg font-semibold hover:bg-custom-orange transition" onClick={() => setSection("programs")}>Ir a Programación</button>
            </div>
            {/* Sección Banners */}
            <div className="bg-slate-900/80 rounded-xl p-6 shadow border border-cyan-800/30 flex flex-col items-center">
              <h3 className="text-xl font-bold text-custom-orange mb-2">Editar Banners</h3>
              <p className="text-slate-300 text-center mb-4">Gestiona los banners de publicidad que aparecen en la landing.</p>
              <button className="bg-custom-teal text-white px-4 py-2 rounded-lg font-semibold hover:bg-custom-orange transition" onClick={() => setSection("banners")}>Ir a Banners</button>
            </div>
          </div>
        )}
        {section === "programs" && (
          <>
            <AdminProgramEditor programs={programs} setPrograms={setPrograms} />
            <button className="mt-6 text-sm text-cyan-400 underline hover:text-orange-400 transition" onClick={() => setSection("main")}>Volver al panel</button>
          </>
        )}
        {section === "banners" && (
          <>
            <AdminBannerEditor banners={banners} setBanners={setBanners} />
            <button className="mt-6 text-sm text-cyan-400 underline hover:text-orange-400 transition" onClick={() => setSection("main")}>Volver al panel</button>
          </>
        )}
        <button
          className="mt-10 text-sm text-cyan-400 underline hover:text-orange-400 transition"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </motion.div>
    </section>
  );
}
