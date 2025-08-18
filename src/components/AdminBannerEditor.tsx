import { useState, useEffect } from "react";
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
    if (!newBanner.image || !newBanner.url) return;
    const { error } = await supabase.from('banners').insert({
      image_url: newBanner.image,
      link_url: newBanner.url,
      title: newBanner.alt,
      active: true
    });
    if (!error) {
      await fetchBannersFromDB();
      setNewBanner({ image: "", url: "", alt: "" });
    } else {
      alert('Error al agregar banner: ' + error.message);
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setNewBanner(banners[idx]);
  };

  const handleSave = async () => {
    if (editingIndex === null) return;
    const oldBanner = banners[editingIndex];
    const { error } = await supabase.from('banners').update({
      image_url: newBanner.image,
      link_url: newBanner.url,
      title: newBanner.alt
    }).eq('image_url', oldBanner.image).eq('link_url', oldBanner.url);
    if (!error) {
      await fetchBannersFromDB();
      setEditingIndex(null);
      setNewBanner({ image: "", url: "", alt: "" });
    } else {
      alert('Error al editar banner: ' + error.message);
    }
  };

  const handleDelete = async (idx: number) => {
    const banner = banners[idx];
    const { error } = await supabase.from('banners').delete().eq('image_url', banner.image).eq('link_url', banner.url);
    if (!error) {
      await fetchBannersFromDB();
    } else {
      alert('Error al eliminar banner: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-custom-orange mb-4">Editar Banners</h3>
      <ul className="mb-6">
        {banners.map((b, idx) => (
          <li key={idx} className="mb-2 bg-slate-800 rounded p-3 flex flex-col md:flex-row md:items-center gap-2">
            <img src={b.image} alt={b.alt} className="w-32 h-10 object-cover rounded border border-cyan-700" />
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline text-xs">{b.url}</a>
            <span className="text-white text-xs">{b.alt}</span>
            {editingIndex === idx ? (
              <>
                <input className="rounded px-2 py-1 mr-2" value={newBanner.image} onChange={e => setNewBanner({ ...newBanner, image: e.target.value })} placeholder="URL imagen" />
                <input className="rounded px-2 py-1 mr-2" value={newBanner.url} onChange={e => setNewBanner({ ...newBanner, url: e.target.value })} placeholder="Enlace" />
                <input className="rounded px-2 py-1 mr-2" value={newBanner.alt} onChange={e => setNewBanner({ ...newBanner, alt: e.target.value })} placeholder="Alt" />
                <button className="bg-custom-teal text-white px-2 py-1 rounded ml-2" onClick={handleSave}>Guardar</button>
              </>
            ) : (
              <>
                <button className="bg-custom-orange text-white px-2 py-1 rounded ml-2" onClick={() => handleEdit(idx)}>Editar</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded ml-2" onClick={() => handleDelete(idx)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="bg-slate-900 rounded p-4 flex flex-col gap-2 mb-2">
        <input className="rounded px-2 py-1" placeholder="URL imagen" value={newBanner.image} onChange={e => setNewBanner({ ...newBanner, image: e.target.value })} />
        <input className="rounded px-2 py-1" placeholder="Enlace" value={newBanner.url} onChange={e => setNewBanner({ ...newBanner, url: e.target.value })} />
        <input className="rounded px-2 py-1" placeholder="Alt" value={newBanner.alt} onChange={e => setNewBanner({ ...newBanner, alt: e.target.value })} />
        <button className="bg-custom-teal text-white px-4 py-2 rounded-lg font-semibold hover:bg-custom-orange transition mt-2" onClick={handleAdd}>Agregar Banner</button>
      </div>
    </div>
  );
}
