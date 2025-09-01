import { useState, useEffect } from "react";
import { FaEdit, FaTrash} from "react-icons/fa";
import { supabase } from '../supabaseClient';

type Program = {
  id?: string;
  title: string;
  start_time: string;
  end_time: string;
  day_of_week: number; // valor único por fila (se generan varias filas si hay múltiples días)
  image_url: string;
  live: boolean;
  description: string;
  host: string;
};

export default function AdminProgramEditor() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Días seleccionados para nuevo programa (multi-selección)
  const [newProgramDays, setNewProgramDays] = useState<number[]>([1]);
  // Días seleccionados al editar (multi-selección)
  const [editProgramDays, setEditProgramDays] = useState<number[]>([1]);
  // Guardar valores originales para borrado seguro al editar (si cambia título/descripcion)
  const [originalGroupKeys, setOriginalGroupKeys] = useState<{title: string; description: string} | null>(null);
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
  const [editProgram, setEditProgram] = useState<Program>({
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
          id: p.id,
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
    const prog = programs[idx];
    setEditingIndex(idx);
    setEditProgram(prog);
    // Agrupar días existentes del mismo programa (título + descripción) para edición múltiple
    const groupDays = programs
      .filter(p => p.title === prog.title && p.description === prog.description)
      .map(p => p.day_of_week)
      .sort((a,b)=>a-b);
    setEditProgramDays(groupDays.length ? groupDays : [prog.day_of_week]);
    setOriginalGroupKeys({ title: prog.title, description: prog.description });
  };

  // Guardar edición
  const handleSave = async () => {
    if (editingIndex !== null && originalGroupKeys) {
      // Borrar todas las filas del grupo original
      const { error: delError } = await supabase
        .from('programs')
        .delete()
        .eq('name', originalGroupKeys.title)
        .eq('description', originalGroupKeys.description);
      if (delError) {
        alert('Error al limpiar programas previos: ' + delError.message);
        return;
      }
      // Insertar una fila por cada día seleccionado
      const rows = editProgramDays.map(day => ({
        name: editProgram.title,
        start_time: editProgram.start_time,
        end_time: editProgram.end_time,
        day_of_week: day,
        image_url: editProgram.image_url,
        description: editProgram.description,
        host: editProgram.host,
        live: editProgram.live,
      }));
      const { error: insError } = await supabase.from('programs').insert(rows);
      if (insError) {
        alert('Error al guardar programas: ' + insError.message);
        return;
      }
      await fetchProgramsFromDB();
      setEditingIndex(null);
      setEditProgram({ title: "", start_time: "", end_time: "", day_of_week: 1, image_url: "", live: false, description: "", host: "" });
      setEditProgramDays([1]);
      setOriginalGroupKeys(null);
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
    // Validaciones básicas
    if (!newProgram.title.trim()) { alert('Título requerido'); return; }
    if (!newProgram.start_time || !newProgram.end_time) { alert('Horario incompleto'); return; }
    if (newProgramDays.length === 0) { alert('Selecciona al menos un día'); return; }
    const rows = newProgramDays.map(day => ({
      name: newProgram.title,
      start_time: newProgram.start_time,
      end_time: newProgram.end_time,
      day_of_week: day,
      image_url: newProgram.image_url,
      description: newProgram.description,
      host: newProgram.host,
      live: newProgram.live,
    }));
    const { error } = await supabase.from('programs').insert(rows);
    if (!error) {
      await fetchProgramsFromDB();
      setNewProgram({ title: "", start_time: "", end_time: "", day_of_week: 1, image_url: "", live: false, description: "", host: "" });
      setNewProgramDays([1]);
    } else {
      alert('Error al agregar programa: ' + error.message);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h3 className="text-2xl font-bold text-custom-orange mb-4 text-center">Panel de Programación</h3>
      <ul className="mb-6">
        {programs.map((p, idx) => (
          <li key={idx} className="mb-2 bg-slate-800 rounded p-3 flex flex-col gap-2 relative border border-slate-700">
            {editingIndex === idx ? (
              <div className="bg-slate-900 rounded p-4 mt-2 border border-slate-700 shadow-inner">
                <form className="flex flex-col gap-2 w-full" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                  <input className="rounded px-2 py-1 border border-slate-600" placeholder="Título del programa" value={editProgram.title} onChange={e => setEditProgram({ ...editProgram, title: e.target.value })} />
                  <div className="flex gap-2">
                    <input className="rounded px-2 py-1 border border-slate-600 w-1/2" type="time" placeholder="Inicio" value={editProgram.start_time} onChange={e => setEditProgram({ ...editProgram, start_time: e.target.value })} />
                    <input className="rounded px-2 py-1 border border-slate-600 w-1/2" type="time" placeholder="Fin" value={editProgram.end_time} onChange={e => setEditProgram({ ...editProgram, end_time: e.target.value })} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6,7].map(d => {
                      const label = ['L','M','X','J','V','S','D'][d-1];
                      const checked = editProgramDays.includes(d);
                      return (
                        <label key={d} className={`cursor-pointer text-xs px-2 py-1 rounded border ${checked ? 'bg-custom-teal text-white border-custom-teal' : 'bg-slate-700 text-slate-200 border-slate-600'}`}> 
                          <input type="checkbox" className="hidden" checked={checked} onChange={() => setEditProgramDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d].sort((a,b)=>a-b))} />{label}
                        </label>
                      );
                    })}
                  </div>
                  <input className="rounded px-2 py-1 border border-slate-600" placeholder="Imagen URL" value={editProgram.image_url} onChange={e => setEditProgram({ ...editProgram, image_url: e.target.value })} />
                  <input className="rounded px-2 py-1 border border-slate-600" placeholder="Conductor" value={editProgram.host} onChange={e => setEditProgram({ ...editProgram, host: e.target.value })} />
                  <input className="rounded px-2 py-1 border border-slate-600" placeholder="Descripción" value={editProgram.description} onChange={e => setEditProgram({ ...editProgram, description: e.target.value })} />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <input type="checkbox" checked={editProgram.live} onChange={e => setEditProgram({ ...editProgram, live: e.target.checked })} /> En vivo
                    </label>
                    <button type="submit" className="bg-custom-teal text-white px-3 py-1 rounded font-semibold hover:bg-custom-orange transition ml-auto">Guardar</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-bold text-white truncate">{p.title}</span>
                <span className="text-cyan-400 font-mono">{p.start_time} - {p.end_time}</span>
                <span className="text-white text-xs">{['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][p.day_of_week-1]}</span>
                <span className="text-white text-xs truncate">{p.host}</span>
                <span className="text-slate-300 text-xs truncate">{p.description}</span>
                {p.image_url && <img src={p.image_url} alt="img" className="h-8 w-8 object-cover rounded shadow border border-custom-teal" />}
                <span className={`text-xs font-bold ${p.live ? 'text-red-400' : 'text-blue-400'}`}>{p.live ? 'EN VIVO' : 'PRÓXIMO'}</span>
                <div className="flex flexrow gap-2 mt-2 md:mt-0 justify-center">
                  <button className="bg-custom-orange text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-500 transition btn-program" onClick={() => handleEdit(idx)}><FaEdit />Editar</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-800 transition btn-program" onClick={() => handleDelete(idx)}><FaTrash />Eliminar</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <form className="bg-slate-900 rounded p-4 flex flex-col gap-3 mb-2 border border-slate-700 shadow-lg" onSubmit={e => { e.preventDefault(); handleAdd(); }}>
        <label className="text-cyan-300 font-semibold text-sm">Agregar Nuevo Programa</label>
        <input className="rounded px-2 py-1 border border-slate-600" placeholder="Título del programa" value={newProgram.title} onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} />
        <div className="flex gap-2">
          <input className="rounded px-2 py-1 border border-slate-600 w-1/2" type="time" placeholder="Inicio" value={newProgram.start_time} onChange={e => setNewProgram({ ...newProgram, start_time: e.target.value })} />
          <input className="rounded px-2 py-1 border border-slate-600 w-1/2" type="time" placeholder="Fin" value={newProgram.end_time} onChange={e => setNewProgram({ ...newProgram, end_time: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1,2,3,4,5,6,7].map(d => {
            const label = ['LUN','MAR','MIE','JUE','VIE','SAB','DOM'][d-1];
            const checked = newProgramDays.includes(d);
            return (
              <label key={d} className={`cursor-pointer text-xs px-2 py-1 rounded border ${checked ? 'bg-custom-teal text-white border-custom-teal' : 'bg-slate-700 text-slate-200 border-slate-600'}`}>
                <input type="checkbox" className="hidden" checked={checked} onChange={() => setNewProgramDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d].sort((a,b)=>a-b))} />{label}
            </label>
            );
          })}
        </div>
        <input className="rounded px-2 py-1 border border-slate-600" placeholder="Imagen URL" value={newProgram.image_url} onChange={e => setNewProgram({ ...newProgram, image_url: e.target.value })} />
        <input className="rounded px-2 py-1 border border-slate-600" placeholder="Conductor" value={newProgram.host} onChange={e => setNewProgram({ ...newProgram, host: e.target.value })} />
        <input className="rounded px-2 py-1 border border-slate-600" placeholder="Descripción" value={newProgram.description} onChange={e => setNewProgram({ ...newProgram, description: e.target.value })} />
        <div className="flex items-center gap-2 mt-2">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={newProgram.live} onChange={e => setNewProgram({ ...newProgram, live: e.target.checked })} /> En vivo
          </label>
          <button type="submit" className="bg-custom-teal text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 justify-center hover:bg-custom-orange transition ml-auto">Agregar Programa</button>
        </div>
      </form>
    </div>
  );
}
