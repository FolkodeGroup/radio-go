import { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';

type Program = {
  title: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  image_url: string;
  live: boolean;
  description: string;
  host: string;
};

export default function AdminProgramEditor() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newProgram, setNewProgram] = useState<Program>({
    title: "",
    start_time: "",
    end_time: "",
    day_of_week: 1,
    image_url: "",
    live: false,
    description: "",
    host: ""
  });

  // Refrescar programas desde Supabase
  const fetchProgramsFromDB = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('name, start_time, end_time, description, host, day_of_week, id, image_url')
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
          image_url: string;
          id: string;
        }) => ({
          title: p.name || '',
          start_time: p.start_time || '',
          end_time: p.end_time || '',
          day_of_week: p.day_of_week || 1,
          image_url: p.image_url || '',
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
        start_time: newProgram.start_time,
        end_time: newProgram.end_time,
        day_of_week: newProgram.day_of_week,
        image_url: newProgram.image_url,
        description: newProgram.description,
        host: newProgram.host,
      }).eq('name', oldProgram.title).eq('description', oldProgram.description);
      if (!error) {
        await fetchProgramsFromDB();
        setEditingIndex(null);
        setNewProgram({ title: "", start_time: "", end_time: "", day_of_week: 1, image_url: "", live: false, description: "", host: "" });
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
      start_time: newProgram.start_time,
      end_time: newProgram.end_time,
      day_of_week: newProgram.day_of_week,
      image_url: newProgram.image_url,
      description: newProgram.description,
      host: newProgram.host,
    });
    if (!error) {
      await fetchProgramsFromDB();
      setNewProgram({ title: "", start_time: "", end_time: "", day_of_week: 1, image_url: "", live: false, description: "", host: "" });
    } else {
      alert('Error al agregar programa: ' + error.message);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-custom-orange mb-6 text-center tracking-wide">Panel de Programación</h3>
      <ul className="mb-8 space-y-4">
        {programs.map((p, idx) => (
          <li key={idx} className="bg-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-lg border-l-4 border-custom-teal">
            {editingIndex === idx ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input-admin" placeholder="Título del programa" value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} />
                <div className="flex gap-2">
                  <input className="input-admin w-1/2" type="time" placeholder="Inicio" value={newProgram.start_time} onChange={e => setNewProgram({ ...newProgram, start_time: e.target.value })} />
                  <input className="input-admin w-1/2" type="time" placeholder="Fin" value={newProgram.end_time} onChange={e => setNewProgram({ ...newProgram, end_time: e.target.value })} />
                </div>
                <select className="input-admin" value={newProgram.day_of_week} onChange={e => setNewProgram({ ...newProgram, day_of_week: Number(e.target.value) })}>
                  {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][d-1]}</option>)}
                </select>
                <input className="input-admin" placeholder="Imagen URL" value={newProgram.image_url} onChange={e => setNewProgram({ ...newProgram, image_url: e.target.value })} />
                <input className="input-admin" placeholder="Conductor" value={newProgram.host} onChange={e => setNewProgram({ ...newProgram, host: e.target.value })} />
                <input className="input-admin col-span-2" placeholder="Descripción" value={newProgram.description} onChange={e => setNewProgram({ ...newProgram, description: e.target.value })} />
                <div className="flex items-center gap-2 col-span-2">
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input type="checkbox" checked={newProgram.live} onChange={e => setNewProgram({ ...newProgram, live: e.target.checked })} /> En vivo
                  </label>
                  <button className="btn-admin-save ml-auto" onClick={handleSave}>Guardar</button>
                </div>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                <span className="font-bold text-white col-span-2 truncate">{p.title}</span>
                <span className="text-cyan-400 font-mono col-span-1">{p.start_time} - {p.end_time}</span>
                <span className="text-white text-xs col-span-1">{['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][p.day_of_week-1]}</span>
                <span className="text-white text-xs col-span-1 truncate">{p.host}</span>
                <span className="text-slate-300 text-xs col-span-1 truncate">{p.description}</span>
                {p.image_url && <img src={p.image_url} alt="img" className="h-8 w-8 object-cover rounded shadow border border-custom-teal" />}
                <span className={`text-xs font-bold ${p.live ? 'text-red-400' : 'text-blue-400'}`}>{p.live ? 'EN VIVO' : 'PRÓXIMO'}</span>
                <button className="btn-admin-edit" onClick={() => handleEdit(idx)}>Editar</button>
                <button className="btn-admin-delete" onClick={() => handleDelete(idx)}>Eliminar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-slate-900 rounded-xl p-6 flex flex-col gap-4 shadow-lg border-l-4 border-custom-orange">
        <h4 className="text-lg font-bold text-custom-teal mb-2">Agregar Nuevo Programa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input-admin" placeholder="Título del programa" value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} />
          <div className="flex gap-2">
            <input className="input-admin w-1/2" type="time" placeholder="Inicio" value={newProgram.start_time} onChange={e => setNewProgram({ ...newProgram, start_time: e.target.value })} />
            <input className="input-admin w-1/2" type="time" placeholder="Fin" value={newProgram.end_time} onChange={e => setNewProgram({ ...newProgram, end_time: e.target.value })} />
          </div>
          <select className="input-admin" value={newProgram.day_of_week} onChange={e => setNewProgram({ ...newProgram, day_of_week: Number(e.target.value) })}>
            {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][d-1]}</option>)}
          </select>
          <input className="input-admin" placeholder="Imagen URL" value={newProgram.image_url} onChange={e => setNewProgram({ ...newProgram, image_url: e.target.value })} />
          <input className="input-admin" placeholder="Conductor" value={newProgram.host} onChange={e => setNewProgram({ ...newProgram, host: e.target.value })} />
          <input className="input-admin col-span-2" placeholder="Descripción" value={newProgram.description} onChange={e => setNewProgram({ ...newProgram, description: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={newProgram.live} onChange={e => setNewProgram({ ...newProgram, live: e.target.checked })} /> En vivo
          </label>
          <button className="btn-admin-add ml-auto" onClick={handleAdd}>Agregar Programa</button>
        </div>
      </div>
      {/* Estilos para inputs y botones admin */}
      <style>{`
        .input-admin {
          @apply rounded-lg px-4 py-2 bg-slate-800 text-white border border-slate-700 focus:border-custom-teal focus:ring-2 focus:ring-custom-teal outline-none transition w-full;
        }
        .btn-admin-save {
          @apply bg-custom-teal text-white px-4 py-2 rounded-lg font-semibold hover:bg-custom-orange transition shadow;
        }
        .btn-admin-edit {
          @apply bg-custom-orange text-white px-3 py-1 rounded-lg font-semibold hover:bg-custom-teal transition shadow ml-2;
        }
        .btn-admin-delete {
          @apply bg-red-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-800 transition shadow ml-2;
        }
        .btn-admin-add {
          @apply bg-custom-teal text-white px-6 py-2 rounded-lg font-bold hover:bg-custom-orange transition shadow;
        }
      `}</style>
    </div>
  );
}
