import { useState } from "react";


type Banner = {
  image: string;
  url: string;
  alt: string;
};

type AdminBannerEditorProps = {
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
};

export default function AdminBannerEditor({ banners, setBanners }: AdminBannerEditorProps) {
  const [newBanner, setNewBanner] = useState<Banner>({ image: "", url: "", alt: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newBanner.image || !newBanner.url) return;
    setBanners([...banners, newBanner]);
    setNewBanner({ image: "", url: "", alt: "" });
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setNewBanner(banners[idx]);
  };

  const handleSave = () => {
    if (editingIndex === null) return;
    const updated = [...banners];
    updated[editingIndex] = newBanner;
    setBanners(updated);
    setEditingIndex(null);
    setNewBanner({ image: "", url: "", alt: "" });
  };

  const handleDelete = (idx: number) => {
    setBanners(banners.filter((_, i) => i !== idx));
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
