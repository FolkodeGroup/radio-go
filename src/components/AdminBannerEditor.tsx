import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave, FaPlus } from "react-icons/fa";
import { supabase } from '../supabaseClient';

type Banner = {
  image: string;
  url: string;
  alt: string;
};

export default function AdminBannerEditor() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBanner, setNewBanner] = useState<Banner>({ image: "", url: "", alt: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editBanner, setEditBanner] = useState<Banner>({ image: "", url: "", alt: "" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Refrescar banners desde Supabase
  const fetchBannersFromDB = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('image_url, link_url, title, active');
    if (!error && data) {
      setBanners(
        data
          .filter((b: { image_url: string; link_url: string; title: string; active: boolean }) => !!b && b.active)
          .map((b: { image_url: string; link_url: string; title: string; active: boolean }) => ({
            image: b.image_url,
            url: b.link_url,
            alt: b.title || '',
          }))
      );
    }
  };

  useEffect(() => {
    fetchBannersFromDB();
  }, []);

  const handleAdd = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!newBanner.image || !newBanner.url) {
      setErrorMsg("La imagen y el enlace son obligatorios.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('banners').insert({
      image_url: newBanner.image,
      link_url: newBanner.url,
      title: newBanner.alt,
      active: true
    });
    setLoading(false);
    if (!error) {
      await fetchBannersFromDB();
      setNewBanner({ image: "", url: "", alt: "" });
      setSuccessMsg("Banner agregado correctamente.");
    } else {
      setErrorMsg('Error al agregar banner: ' + error.message);
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditBanner(banners[idx]);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (editingIndex === null) return;
    if (!editBanner.image || !editBanner.url) {
      setErrorMsg("La imagen y el enlace son obligatorios.");
      return;
    }
    setLoading(true);
    const oldBanner = banners[editingIndex];
    const { error } = await supabase.from('banners').update({
      image_url: editBanner.image,
      link_url: editBanner.url,
      title: editBanner.alt
    }).eq('image_url', oldBanner.image).eq('link_url', oldBanner.url);
    setLoading(false);
    if (!error) {
      await fetchBannersFromDB();
      setEditingIndex(null);
      setEditBanner({ image: "", url: "", alt: "" });
      setSuccessMsg("Banner editado correctamente.");
    } else {
      setErrorMsg('Error al editar banner: ' + error.message);
    }
  };

  const handleDelete = async (idx: number) => {
    setErrorMsg("");
    setSuccessMsg("");
    const banner = banners[idx];
    setLoading(true);
    const { error } = await supabase.from('banners').delete().eq('image_url', banner.image).eq('link_url', banner.url);
    setLoading(false);
    if (!error) {
      await fetchBannersFromDB();
      setSuccessMsg("Banner eliminado correctamente.");
    } else {
      setErrorMsg('Error al eliminar banner: ' + error.message);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h3 className="text-2xl font-bold text-custom-orange mb-4 text-center">Editar Banners</h3>
      {successMsg && <div className="bg-green-700 text-white rounded px-3 py-2 mb-2 text-center animate-pulse">{successMsg}</div>}
      {errorMsg && <div className="bg-red-700 text-white rounded px-3 py-2 mb-2 text-center animate-pulse">{errorMsg}</div>}
      <ul className="mb-6">
        {banners.map((b, idx) => (
          <li key={idx} className="mb-2 bg-slate-800 rounded p-3 flex flex-col gap-2 relative border border-slate-700">
            <div className="flex items-center gap-3 flex-1">
              <img src={b.image} alt={b.alt} className="w-32 h-10 object-cover rounded border border-cyan-700" />
              <div className="flex flex-col flex-1 min-w-0">
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline text-xs truncate max-w-full block"
                  style={{ wordBreak: 'break-all', maxWidth: '100%' }}
                  title={b.url}
                >
                  {b.url}
                </a>
                <span className="text-white text-xs italic">{b.alt}</span>
              </div>
            </div>
            {editingIndex === idx ? (
              <div className="bg-slate-900 rounded p-4 mt-2 border border-slate-700 shadow-inner">
                <form className="flex flex-col gap-2 w-full" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                  <input className={`rounded px-2 py-1 border ${!editBanner.image ? 'border-red-500' : 'border-slate-600'}`} value={editBanner.image} onChange={e => setEditBanner({ ...editBanner, image: e.target.value })} placeholder="URL de la imagen *" />
                  <input className={`rounded px-2 py-1 border ${!editBanner.url ? 'border-red-500' : 'border-slate-600'}`} value={editBanner.url} onChange={e => setEditBanner({ ...editBanner, url: e.target.value })} placeholder="Enlace destino *" />
                  <input className="rounded px-2 py-1 border border-slate-600" value={editBanner.alt} onChange={e => setEditBanner({ ...editBanner, alt: e.target.value })} placeholder="Texto alternativo" />
                  <button type="submit" className="bg-custom-teal text-white px-3 py-1 rounded flex items-center gap-1 font-semibold hover:bg-custom-orange transition disabled:opacity-60" disabled={loading}><FaSave /> Guardar</button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2 mt-2 md:mt-0">
                <button className="bg-custom-orange text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-500 transition" onClick={() => handleEdit(idx)} title="Editar"><FaEdit />Editar</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-800 transition" onClick={() => handleDelete(idx)} title="Eliminar"><FaTrash />Eliminar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <form className="bg-slate-900 rounded p-4 flex flex-col gap-3 mb-2 border border-slate-700 shadow-lg" onSubmit={e => { e.preventDefault(); handleAdd(); }}>
        <label className="text-cyan-300 font-semibold text-sm">Agregar nuevo banner</label>
        <input className={`rounded px-2 py-1 border ${!newBanner.image && errorMsg ? 'border-red-500' : 'border-slate-600'}`} placeholder="URL de la imagen *" value={newBanner.image} onChange={e => setNewBanner({ ...newBanner, image: e.target.value })} />
        <input className={`rounded px-2 py-1 border ${!newBanner.url && errorMsg ? 'border-red-500' : 'border-slate-600'}`} placeholder="Enlace destino *" value={newBanner.url} onChange={e => setNewBanner({ ...newBanner, url: e.target.value })} />
        <input className="rounded px-2 py-1 border border-slate-600" placeholder="Texto alternativo (opcional)" value={newBanner.alt} onChange={e => setNewBanner({ ...newBanner, alt: e.target.value })} />
        <button type="submit" className="bg-custom-teal text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 justify-center hover:bg-custom-orange transition mt-2 disabled:opacity-60" disabled={loading}><FaPlus /> {loading ? 'Procesando...' : 'Agregar Banner'}</button>
        <span className="text-xs text-slate-400">* Campos obligatorios</span>
      </form>
    </div>
  );
}
