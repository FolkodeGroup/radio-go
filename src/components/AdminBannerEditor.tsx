// Utilidad para limpiar y validar el src base64
function getValidBase64Src(image_type: string, image_data: string): string | null {
  if (!image_type || !image_data) return null;
  // Limpiar espacios y caracteres extraños
  const cleanType = image_type.trim().replace(/[^a-zA-Z0-9/-]+/g, '');
  const cleanData = image_data.trim().replace(/[^a-zA-Z0-9+/=]+/g, '');
  if (!cleanType.startsWith('image/')) return null;
  if (cleanData.length < 20) return null;
  return `data:${cleanType};base64,${cleanData}`;
}
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";
import { supabase } from '../supabaseClient';

type Banner = {
  id: string;
  title: string;
  description: string | null;
  link_url: string | null;
  image_data: string;
  image_type: string;
  active: boolean;
  priority: number;
};

export default function AdminBannerEditor() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editBanner, setEditBanner] = useState<Partial<Banner>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Banner uploader state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);


  // Refrescar banners desde Supabase
  const fetchBannersFromDB = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banners')
      .select('id, title, description, link_url, image_data, image_type, active, priority')
      .order('priority', { ascending: false });

    setLoading(false);
    if (!error && data) {
      setBanners(data as Banner[]);
    } else if (error) {
      setErrorMsg('Error al cargar banners: ' + error.message);
    }
  };

  useEffect(() => {
    fetchBannersFromDB();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const base64 = await convertToBase64(file);
      const base64Data = base64.split(',')[1];

      const { error } = await supabase
        .from('banners')
        .insert({
          title: title,
          description: description,
          link_url: linkUrl,
          image_data: base64Data,
          image_type: file.type,
          image_size_bytes: file.size,
          active: true
        });

      if (error) throw error;

      alert('Banner creado exitosamente');
      await fetchBannersFromDB();
      // Resetear formulario
      setFile(null);
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setPreview(null);
    } catch (error: unknown) {
      console.error('Error al subir banner:', error);
      const message = error instanceof Error ? error.message : String(error);
      setErrorMsg('Ocurrió un error al subir el banner: ' + message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditBanner({ ...banners[idx] });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (editingIndex === null || !editBanner.id) return;

    setLoading(true);
    const { error } = await supabase.from('banners').update({
      title: editBanner.title,
      description: editBanner.description,
      link_url: editBanner.link_url,
      active: editBanner.active,
      priority: editBanner.priority,
    }).eq('id', editBanner.id);
    setLoading(false);

    if (!error) {
      await fetchBannersFromDB();
      setEditingIndex(null);
      setEditBanner({});
      setSuccessMsg("Banner editado correctamente.");
    } else {
      setErrorMsg('Error al editar banner: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!window.confirm("¿Estás seguro de que quieres eliminar este banner?")) return;

    setLoading(true);
    const { error } = await supabase.from('banners').delete().eq('id', id);
    setLoading(false);

    if (!error) {
      await fetchBannersFromDB();
      setSuccessMsg("Banner eliminado correctamente.");
    } else {
      setErrorMsg('Error al eliminar banner: ' + error.message);
    }
  };

  return (
    <div className="admin-banner-editor p-4 max-w-2xl mx-auto ">
      <h3 className="text-2xl font-bold text-custom-orange mb-4 text-center">Editar Banners</h3>
      {successMsg && <div className="bg-green-700 text-white rounded px-3 py-2 mb-2 text-center animate-pulse">{successMsg}</div>}
      {errorMsg && <div className="bg-red-700 text-white rounded px-3 py-2 mb-2 text-center animate-pulse">{errorMsg}</div>}

      {/* Formulario para agregar nuevo banner */}
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded p-4 flex flex-col gap-3 mb-6 border border-slate-700 shadow-lg">
        <h4 className="text-cyan-300 font-semibold text-lg">Agregar Nuevo Banner</h4>
        <div>
          <label className="block text-sm font-medium">Título*</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-slate-800 text-white px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-slate-800 text-white px-2 py-1"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">URL de enlace</label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-slate-800 text-white px-2 py-1"
            placeholder="https://ejemplo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Imagen* (máximo 5MB)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-custom-teal file:text-white hover:file:bg-custom-orange"
            required
          />
        </div>
        {preview && (
          <div className="mt-2">
            <p className="text-sm font-medium">Vista previa:</p>
            <img
              src={preview}
              alt="Vista previa"
              className="mt-1 h-48 object-cover rounded-md border border-slate-600"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={isUploading || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FaPlus /> {isUploading ? 'Subiendo...' : 'Crear Banner'}
        </button>
      </form>

      {/* Lista de banners existentes */}
      <h4 className="text-cyan-300 font-semibold text-lg mb-4">Banners Existentes</h4>
      <ul className="mb-6">
        {banners.map((b, idx) => (
          <li key={b.id} className="mb-4 bg-slate-800 rounded p-4 flex flex-col gap-3 border border-slate-700">
            <div className="flex items-start gap-4">
              {(() => {
                const src = getValidBase64Src(b.image_type, b.image_data);
                if (src) {
                  return (
                    <img
                      src={src}
                      alt={b.title}
                      className="w-40 h-auto object-cover rounded border border-cyan-700"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = '/vite.svg';
                      }}
                    />
                  );
                } else {
                  return (
                    <div className="w-40 h-24 flex items-center justify-center bg-slate-700 text-slate-400 rounded border border-cyan-700">
                      Sin imagen
                    </div>
                  );
                }
              })()}
              <div className="flex-1">
                <h5 className="font-bold text-white">{b.title}</h5>
                <p className="text-sm text-slate-300">{b.description}</p>
                <a href={b.link_url || '#'} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline text-xs break-all">{b.link_url}</a>
                <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs font-semibold ${b.active ? 'text-green-400' : 'text-red-400'}`}>{b.active ? 'Activo' : 'Inactivo'}</span>
                    <span className="text-xs text-slate-400">Prioridad: {b.priority}</span>
                </div>
              </div>
            </div>

            {editingIndex === idx ? (
              <div className="bg-slate-900 rounded p-4 mt-2 border border-slate-700 shadow-inner">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                  <input className="rounded px-2 py-1 border border-slate-600 bg-slate-800 text-white" value={editBanner.title || ''} onChange={e => setEditBanner({ ...editBanner, title: e.target.value })} placeholder="Título" />
                  <input className="rounded px-2 py-1 border border-slate-600 bg-slate-800 text-white" value={editBanner.link_url || ''} onChange={e => setEditBanner({ ...editBanner, link_url: e.target.value })} placeholder="Enlace" />
                  <textarea className="rounded px-2 py-1 border border-slate-600 bg-slate-800 text-white md:col-span-2" value={editBanner.description || ''} onChange={e => setEditBanner({ ...editBanner, description: e.target.value })} placeholder="Descripción" />
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Prioridad:</label>
                    <input type="number" className="rounded px-2 py-1 border border-slate-600 bg-slate-800 text-white w-20" value={editBanner.priority || 1} onChange={e => {
                      const priority = parseInt(e.target.value, 10);
                      setEditBanner({ ...editBanner, priority: isNaN(priority) ? 1 : priority });
                    }} />
                  </div>
                  <div className="flex items-center gap-2">
                     <input type="checkbox" className="rounded" checked={!!editBanner.active} onChange={e => setEditBanner({ ...editBanner, active: e.target.checked })} />
                     <label className="text-sm font-medium">Activo</label>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button type="submit" className="bg-custom-teal text-white px-3 py-1 rounded flex items-center gap-1 font-semibold hover:bg-custom-orange transition disabled:opacity-60" disabled={loading}><FaSave /> Guardar</button>
                    <button type="button" onClick={() => setEditingIndex(null)} className="bg-slate-600 text-white px-3 py-1 rounded">Cancelar</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex gap-2 mt-2 self-end">
                <button className="bg-custom-orange text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-500 transition btn-banner" onClick={() => handleEdit(idx)} title="Editar"><FaEdit />Editar</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-800 transition btn-banner" onClick={() => handleDelete(b.id)} title="Eliminar"><FaTrash />Eliminar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
