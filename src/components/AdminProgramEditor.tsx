import { useState } from "react";

type Program = {
  title: string;
  time: string;
  live: boolean;
  description: string;
  host: string;
};

type AdminProgramEditorProps = {
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
};

export default function AdminProgramEditor({ programs, setPrograms }: AdminProgramEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newProgram, setNewProgram] = useState<Program>({
    title: "",
    time: "",
    live: false,
    description: "",
    host: ""
  });

  // Editar
  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setNewProgram(programs[idx]);
  };

  // Guardar edición
  const handleSave = () => {
    if (editingIndex !== null) {
      const updated = [...programs];
      updated[editingIndex] = newProgram;
      setPrograms(updated);
      setEditingIndex(null);
      setNewProgram({ title: "", time: "", live: false, description: "", host: "" });
    }
  };

  // Eliminar
  const handleDelete = (idx: number) => {
    setPrograms(programs.filter((_, i) => i !== idx));
  };

  // Agregar
  const handleAdd = () => {
    setPrograms([...programs, newProgram]);
    setNewProgram({ title: "", time: "", live: false, description: "", host: "" });
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-custom-orange mb-4">Editar Programación</h3>
      <ul className="mb-6">
        {programs.map((p, idx) => (
          <li key={idx} className="mb-2 bg-slate-800 rounded p-3 flex flex-col md:flex-row md:items-center gap-2">
            {editingIndex === idx ? (
              <>
                <input className="rounded px-2 py-1 mr-2" value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} />
                <input className="rounded px-2 py-1 mr-2" value={newProgram.time} onChange={e => setNewProgram({ ...newProgram, time: e.target.value })} />
                <input className="rounded px-2 py-1 mr-2" value={newProgram.host} onChange={e => setNewProgram({ ...newProgram, host: e.target.value })} />
                <input className="rounded px-2 py-1 mr-2" value={newProgram.description} onChange={e => setNewProgram({ ...newProgram, description: e.target.value })} />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={newProgram.live} onChange={e => setNewProgram({ ...newProgram, live: e.target.checked })} /> En vivo
                </label>
                <button className="bg-custom-teal text-white px-2 py-1 rounded ml-2" onClick={handleSave}>Guardar</button>
              </>
            ) : (
              <>
                <span className="font-bold text-white">{p.title}</span>
                <span className="text-cyan-400 font-mono">{p.time}</span>
                <span className="text-white text-xs">{p.host}</span>
                <span className="text-slate-300 text-xs">{p.description}</span>
                <span className={`text-xs font-bold ${p.live ? 'text-red-400' : 'text-blue-400'}`}>{p.live ? 'EN VIVO' : 'PRÓXIMO'}</span>
                <button className="bg-custom-orange text-white px-2 py-1 rounded ml-2" onClick={() => handleEdit(idx)}>Editar</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded ml-2" onClick={() => handleDelete(idx)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-slate-900 rounded p-4 flex flex-col gap-2 mb-2">
        <input className="rounded px-2 py-1" placeholder="Título" value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} />
        <input className="rounded px-2 py-1" placeholder="Horario" value={newProgram.time} onChange={e => setNewProgram({ ...newProgram, time: e.target.value })} />
        <input className="rounded px-2 py-1" placeholder="Conductor" value={newProgram.host} onChange={e => setNewProgram({ ...newProgram, host: e.target.value })} />
        <input className="rounded px-2 py-1" placeholder="Descripción" value={newProgram.description} onChange={e => setNewProgram({ ...newProgram, description: e.target.value })} />
        <label className="flex items-center gap-1 text-xs">
          <input type="checkbox" checked={newProgram.live} onChange={e => setNewProgram({ ...newProgram, live: e.target.checked })} /> En vivo
        </label>
        <button className="bg-custom-teal text-white px-4 py-2 rounded-lg font-semibold hover:bg-custom-orange transition mt-2" onClick={handleAdd}>Agregar Programa</button>
      </div>
    </div>
  );
}
