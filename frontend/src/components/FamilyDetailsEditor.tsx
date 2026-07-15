import React, { useState, useEffect } from "react";
import { getFamilyDetails, saveFamilyDetails, uploadImage, resolveImageUrl } from "../services/api";
import { Save, Loader2, Image as ImageIcon, Trash2, X, Plus } from "lucide-react";
import { toast } from "sonner";

export function FamilyDetailsEditor({
  profileId,
  profileName,
  profileSlug,
  onCancel,
  onSave,
  embedded = false,
}: {
  profileId: number;
  profileName: string;
  profileSlug: string;
  onCancel?: () => void;
  onSave?: () => void;
  embedded?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    father_name: "",
    mother_name: "",
    spouse_name: "",
    children: [] as string[],
    background: "",
    images: [] as string[],
  });
  
  const [childInput, setChildInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getFamilyDetails(profileId)
      .then((res) => {
        setData({
          father_name: res.father_name || "",
          mother_name: res.mother_name || "",
          spouse_name: res.spouse_name || "",
          children: typeof res.children === 'string' ? JSON.parse(res.children) : res.children || [],
          background: res.background || "",
          images: typeof res.images === 'string' ? JSON.parse(res.images) : res.images || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to load family details");
        setLoading(false);
      });
  }, [profileId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFamilyDetails(profileId, data);
      toast.success("Family details saved securely");
      if (onSave) onSave();
    } catch (err: any) {
      toast.error(err.message || "Failed to save family details");
    } finally {
      setSaving(false);
    }
  };

  const addChild = () => {
    if (childInput.trim()) {
      setData({ ...data, children: [...data.children, childInput.trim()] });
      setChildInput("");
    }
  };

  const removeChild = (idx: number) => {
    const newChildren = [...data.children];
    newChildren.splice(idx, 1);
    setData({ ...data, children: newChildren });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const res = await uploadImage(file);
      setData({ ...data, images: [...data.images, res.url] });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    const newImages = [...data.images];
    newImages.splice(idx, 1);
    setData({ ...data, images: newImages });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={`space-y-8 animate-fade-in ${embedded ? '' : 'pb-24'}`}>
      {/* Editor Header */}
      {!embedded && (
        <div className="flex items-center justify-between border-b border-white/5 pb-6 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-gradient">
              Manage Family Details
            </h2>
            <p className="text-sm text-foreground/60 mt-1">
              Editing family section of <span className="text-emerald-500 font-bold">{profileName}</span> (/{profileSlug})
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Details
            </button>
          </div>
        </div>
      )}

      {embedded && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Family Details</h2>
          <p className="text-sm text-foreground/60">Manage family background and photos.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Father's Name</label>
            <input
              type="text"
              value={data.father_name}
              onChange={(e) => setData({ ...data, father_name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              placeholder="E.g. John Doe Sr."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Mother's Name</label>
            <input
              type="text"
              value={data.mother_name}
              onChange={(e) => setData({ ...data, mother_name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Spouse / Partner Name</label>
            <input
              type="text"
              value={data.spouse_name}
              onChange={(e) => setData({ ...data, spouse_name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Children</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={childInput}
                onChange={(e) => setChildInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChild())}
                className="flex-1 rounded-xl border border-white/10 bg-midnight px-4 py-2 text-sm focus:border-emerald-500/50 focus:outline-none"
                placeholder="Child's name"
              />
              <button onClick={addChild} type="button" className="bg-emerald-500/20 text-emerald-400 px-3 rounded-xl hover:bg-emerald-500/30 transition-colors">
                <Plus className="size-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.children.map((child, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full pl-3 pr-1 py-1 text-xs">
                  {child}
                  <button onClick={() => removeChild(idx)} className="p-1 hover:text-red-400"><X className="size-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Family Background & History</label>
            <textarea
              value={data.background}
              onChange={(e) => setData({ ...data, background: e.target.value })}
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              placeholder="Write a brief history or background about the family..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Family Photos</label>
            
            <div className="flex items-center gap-4 mb-4">
              <label className="cursor-pointer flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 hover:bg-white/10 transition-colors">
                {uploading ? <Loader2 className="size-4 animate-spin text-emerald-500" /> : <ImageIcon className="size-4 text-emerald-500" />}
                <span className="text-sm font-medium">Upload Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {data.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-midnight flex items-center justify-center">
                  <img src={resolveImageUrl(img)} alt="Family" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeImage(idx)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
              {data.images.length === 0 && (
                <div className="col-span-2 text-center py-8 text-foreground/40 text-sm border border-dashed border-white/10 rounded-xl">
                  No images uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {embedded && (
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Family Details
          </button>
        </div>
      )}
    </div>
  );
}
