import { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';

type Program = {
  title: string;
  time: string;
  live: boolean;
  description: string;
  host: string;
};

export default function AdminProgramEditor() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newProgram, setNewProgram] = useState<Program>({
    title: "",
    time: "",
    live: false,
    description: "",
    host: ""
  });

  // Refrescar programas desde Supabase
  const fetchProgramsFromDB = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('name, start_time, end_time, description, host, day_of_week, id')
      .order('start_time', { ascending: true });
    if (!error && data) {
      setPrograms(
        data.map((p: {
          name: string;
          start_time: string;
          end_time: string;
          description: string;
          host: string;
          day_of_week: number;
          id: string;
        }) => ({
          title: p.name,
          time: `${p.start_time || ''} - ${p.end_time || ''}`,
          live: false,
          description: p.description || '',
          host: p.host || '',
        }))
      );
    }
  };

  useEffect(() => {
    fetchProgramsFromDB();
  }, []);

  // Editar
  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setNewProgram(programs[idx]);
  };

  // Guardar edición
  const handleSave = async () => {
    if (editingIndex !== null) {
      const oldProgram = programs[editingIndex];
      const { error } = await supabase.from('programs').update({
        name: newProgram.title,
        description: newProgram.description,
        host: newProgram.host,
      }).eq('name', oldProgram.title).eq('description', oldProgram.description);
      if (!error) {
        await fetchProgramsFromDB();
        setEditingIndex(null);
        setNewProgram({ title: "", time: "", live: false, description: "", host: "" });
      } else {
        alert('Error al editar programa: ' + error.message);
      }
    }
  };

  // Eliminar
  const handleDelete = async (idx: number) => {
    const program = programs[idx];
    const { error } = await supabase.from('programs').delete().eq('name', program.title).eq('description', program.description);
    if (!error) {
      await fetchProgramsFromDB();
    } else {
      alert('Error al eliminar programa: ' + error.message);
    }
  };

  // Agregar
  const handleAdd = async () => {
    const { error } = await supabase.from('programs').insert({
      name: newProgram.title,
      description: newProgram.description,
      host: newProgram.host,
    });
    if (!error) {
      await fetchProgramsFromDB();
      setNewProgram({ title: "", time: "", live: false, description: "", host: "" });
    } else {
      alert('Error al agregar programa: ' + error.message);
    }
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
