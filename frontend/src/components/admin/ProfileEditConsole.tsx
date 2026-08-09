import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck, Plus, Trash2, Copy, Edit3, Globe2, ChevronLeft, ArrowUpRight, Upload, Save,
  Loader2, ChevronUp, ChevronDown, Info, Award, Users, BookOpen, CalendarDays, FileText,
  Megaphone, Share2, User, Activity, UserCheck, Quote, Layers, Sparkles, Images, QrCode, X,
  Lock, LogOut, Settings, CheckCircle2, Languages, Clock, Menu, Bell, TrendingUp, Mail
} from "lucide-react";
import { toast } from "sonner";
import { DynamicIcon, POPULAR_LEADER_ICONS } from "../DynamicIcon";
import { resolveImageUrl, uploadImage, saveProfile } from "../../services/api";
import { LeaderDashboard } from "./LeaderDashboard";
import { FamilyDetailsEditor } from "../FamilyDetailsEditor";

export type ActiveSubSection = "dashboard" | "general" | "roles" | "stats" | "bio" | "biography" | "timeline" | "focus" | "initiatives" | "awards" | "certificates" | "myInitiatives" | "newsArticles" | "recentActivities" | "recent" | "inspirations" | "connect" | "family" | "csvImport";

export interface ProfileEditConsoleProps {
  mode: "admin" | "client";
  selectedProfile: any;
  categoriesList?: any[];
  isSaving: boolean;
  onUpdateField: (field: string, value: any) => void;
  onUpdateDataSection: (section: string, data: any) => void;
  onPublish: () => void;
  onDiscard?: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  activeSection: ActiveSubSection;
  setActiveSection: (section: ActiveSubSection) => void;
  uploadImage?: (file: File) => Promise<any>;
}

export const normalizeProfile = (profile: any) => {
  if (!profile) return null;
  const copy = JSON.parse(JSON.stringify(profile));

  if (typeof copy.data === "string") {
    try {
      copy.data = JSON.parse(copy.data);
    } catch (e) {
      console.error("Failed to parse profile data JSON string:", e);
    }
  }
  if (!copy.data) copy.data = {};

  copy.category_id = copy.category_id !== undefined ? copy.category_id : null;
  copy.subcategory_id = copy.subcategory_id !== undefined ? copy.subcategory_id : null;

  copy.data.roles = copy.data.roles || [];
  copy.data.stats = copy.data.stats || [];
  copy.data.bio = copy.data.bio || [];
  copy.data.biography = copy.data.biography || { earlyLife: "", career: "" };
  copy.data.timeline = copy.data.timeline || [];
  copy.data.orgFocus = copy.data.orgFocus || [];
  copy.data.initiatives = copy.data.initiatives || [];
  copy.data.awards = copy.data.awards || [];
  copy.data.recent = copy.data.recent || [];
  copy.data.inspirations = copy.data.inspirations || [];
  copy.data.connect = copy.data.connect || { instagram: "", website: "", council: "" };
  copy.data.certificates = copy.data.certificates || [];
  copy.data.myInitiatives = copy.data.myInitiatives || [];
  copy.data.newsArticles = copy.data.newsArticles || [];
  copy.data.recentActivities = copy.data.recentActivities || [];

  return copy;
};

function SectionArrayEditor({
  sectionKey,
  sectionTitle,
  sectionSubtitle,
  itemTemplate,
  customFields,
  selectedProfile,
  updateDataSection,
  isUploading,
  setIsUploading,
}: {
  sectionKey: string;
  sectionTitle: string;
  sectionSubtitle: string;
  itemTemplate: any;
  customFields: { key: string; label: string; placeholder?: string; type?: "text" | "textarea" }[];
  selectedProfile: any;
  updateDataSection: (section: string, value: any) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}) {
  const items = selectedProfile.data[sectionKey] || [];

  const handleAddItem = () => {
    // Validation: Max 25 images/items per section
    if (items.length >= 25) {
      toast.error(`Maximum limit of 25 items reached for ${sectionTitle}!`);
      return;
    }
    const newItems = [...items, { ...itemTemplate, order: items.length + 1 }];
    updateDataSection(sectionKey, newItems);
  };

  const handleDeleteItem = (idx: number) => {
    const copy = [...items];
    copy.splice(idx, 1);
    // Re-assign display orders
    const updated = copy.map((item, i) => ({ ...item, order: i + 1 }));
    updateDataSection(sectionKey, updated);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...items];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;
    // Update orders
    const updated = copy.map((item, i) => ({ ...item, order: i + 1 }));
    updateDataSection(sectionKey, updated);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const copy = [...items];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;
    // Update orders
    const updated = copy.map((item, i) => ({ ...item, order: i + 1 }));
    updateDataSection(sectionKey, updated);
  };

  const handleFieldChange = (idx: number, field: string, value: any) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: value };
    updateDataSection(sectionKey, copy);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Max image size 2 MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size exceeds the 2 MB limit!");
      return;
    }

    // Validation: Acceptable formats
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allowedExts = ["jpg", "jpeg", "png", "webp"];
    
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(fileExt || "")) {
      toast.error("Invalid file format! Only JPG, JPEG, PNG, and WEBP are accepted.");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading image...", { id: "img-upload" });

    try {
      const res = await uploadImage(file);
      handleFieldChange(idx, "image", res.url);
      toast.success("Image uploaded successfully!", { id: "img-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.", { id: "img-upload" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-sky uppercase tracking-wider">
            {sectionTitle}
          </h4>
          <p className="text-xs text-muted-foreground">
            {sectionSubtitle} (Max 25 items)
          </p>
        </div>
        <button
          onClick={handleAddItem}
          className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
        >
          <Plus className="size-3.5" /> Add New Item
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="glass p-6 rounded-3xl border-white/10 grid md:grid-cols-12 gap-6 relative group"
          >
            {/* Delete and Reorder actions */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="glass p-1.5 rounded-xl text-foreground hover:bg-white/10 disabled:opacity-30 transition border border-white/10"
                title="Move Up"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                onClick={() => handleMoveDown(idx)}
                disabled={idx === items.length - 1}
                className="glass p-1.5 rounded-xl text-foreground hover:bg-white/10 disabled:opacity-30 transition border border-white/10"
                title="Move Down"
              >
                <ChevronDown className="size-3.5" />
              </button>
              <button
                onClick={() => handleDeleteItem(idx)}
                className="glass p-1.5 rounded-xl text-red-400 hover:bg-red-950/20 hover:text-red-300 transition border border-red-500/20"
                title="Delete"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            {/* Left Col: Image Upload */}
            <div className="md:col-span-4 space-y-3">
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-midnight border border-white/10 flex items-center justify-center relative">
                {item.image ? (
                  <img
                    src={resolveImageUrl(item.image)}
                    alt="Section preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-muted-foreground text-xs">
                    <Upload className="size-8 mx-auto mb-2 text-[#7BA4D0]/30" />
                    No Image Uploaded
                  </div>
                )}
              </div>
              <label className="glass w-full rounded-xl py-2 text-center text-[10px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/5 transition border-white/10">
                <Upload className="size-3.5 text-sky" /> Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, idx)}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                value={item.image || ""}
                onChange={(e) => handleFieldChange(idx, "image", e.target.value)}
                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-mono outline-none text-foreground"
                placeholder="Or paste direct image URL"
              />
              <input
                type="text"
                value={item.alt || ""}
                onChange={(e) => handleFieldChange(idx, "alt", e.target.value)}
                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] outline-none text-foreground mt-1.5"
                placeholder="SEO Alt Text (optional)"
              />
            </div>

            {/* Right Col: Fields */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                    Title / Headline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => handleFieldChange(idx, "title", e.target.value)}
                    className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground font-bold text-sky"
                    placeholder="Enter title (required)"
                  />
                </div>

                {customFields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={item[field.key] || ""}
                        onChange={(e) => handleFieldChange(idx, field.key, e.target.value)}
                        className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground min-h-[80px]"
                        placeholder={field.placeholder || ""}
                      />
                    ) : (
                      <input
                        type="text"
                        value={item[field.key] || ""}
                        onChange={(e) => handleFieldChange(idx, field.key, e.target.value)}
                        className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground"
                        placeholder={field.placeholder || ""}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                  Short Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) => handleFieldChange(idx, "description", e.target.value)}
                  className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground min-h-[80px]"
                  placeholder="Enter short description (required)"
                />
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="glass p-12 rounded-3xl text-center text-muted-foreground text-sm border-white/5">
            No items created yet. Click "Add New Item" to start.
          </div>
        )}

        {items.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAddItem}
              className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
            >
              <Plus className="size-3.5" /> Add New Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Nested InitiativesEditor Component for My Initiatives

function InitiativesEditor({
  selectedProfile,
  updateDataSection,
  isUploading,
  setIsUploading,
}: {
  selectedProfile: any;
  updateDataSection: (section: string, value: any) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}) {
  const initiatives = selectedProfile.data.myInitiatives || [];
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const handleAddInitiative = () => {
    if (initiatives.length >= 25) {
      toast.error("Maximum limit of 25 initiatives reached!");
      return;
    }
    const newInit = {
      id: "init_" + Date.now(),
      title: "New Initiative",
      images: []
    };
    const updated = [...initiatives, newInit];
    updateDataSection("myInitiatives", updated);
    setActiveIdx(updated.length - 1);
  };

  const handleDeleteInitiative = (idx: number) => {
    if (!confirm("Are you sure you want to delete this initiative and all its images?")) return;
    const updated = [...initiatives];
    updated.splice(idx, 1);
    updateDataSection("myInitiatives", updated);
    setActiveIdx(Math.max(0, idx - 1));
  };

  const handleMoveInitUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...initiatives];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    updateDataSection("myInitiatives", updated);
    setActiveIdx(idx - 1);
  };

  const handleMoveInitDown = (idx: number) => {
    if (idx === initiatives.length - 1) return;
    const updated = [...initiatives];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    updateDataSection("myInitiatives", updated);
    setActiveIdx(idx + 1);
  };

  const handleInitiativeTitleChange = (val: string) => {
    const updated = [...initiatives];
    updated[activeIdx] = { ...updated[activeIdx], title: val };
    updateDataSection("myInitiatives", updated);
  };

  const activeInit = initiatives[activeIdx];
  const images = activeInit?.images || [];

  const handleAddImage = () => {
    if (images.length >= 25) {
      toast.error("Maximum limit of 25 images reached for this initiative!");
      return;
    }
    const newImg = {
      image: "",
      title: "",
      description: "",
      order: images.length + 1
    };
    const updatedInit = { ...activeInit, images: [...images, newImg] };
    const updated = [...initiatives];
    updated[activeIdx] = updatedInit;
    updateDataSection("myInitiatives", updated);
  };

  const handleDeleteImage = (imgIdx: number) => {
    const copy = [...images];
    copy.splice(imgIdx, 1);
    const updatedImages = copy.map((img, i) => ({ ...img, order: i + 1 }));
    const updatedInit = { ...activeInit, images: updatedImages };
    const updated = [...initiatives];
    updated[activeIdx] = updatedInit;
    updateDataSection("myInitiatives", updated);
  };

  const handleMoveImageUp = (imgIdx: number) => {
    if (imgIdx === 0) return;
    const copy = [...images];
    const temp = copy[imgIdx - 1];
    copy[imgIdx - 1] = copy[imgIdx];
    copy[imgIdx] = temp;
    const updatedImages = copy.map((img, i) => ({ ...img, order: i + 1 }));
    const updatedInit = { ...activeInit, images: updatedImages };
    const updated = [...initiatives];
    updated[activeIdx] = updatedInit;
    updateDataSection("myInitiatives", updated);
  };

  const handleMoveImageDown = (imgIdx: number) => {
    if (imgIdx === images.length - 1) return;
    const copy = [...images];
    const temp = copy[imgIdx + 1];
    copy[imgIdx + 1] = copy[imgIdx];
    copy[imgIdx] = temp;
    const updatedImages = copy.map((img, i) => ({ ...img, order: i + 1 }));
    const updatedInit = { ...activeInit, images: updatedImages };
    const updated = [...initiatives];
    updated[activeIdx] = updatedInit;
    updateDataSection("myInitiatives", updated);
  };

  const handleImageFieldChange = (imgIdx: number, field: string, value: any) => {
    const copy = [...images];
    copy[imgIdx] = { ...copy[imgIdx], [field]: value };
    const updatedInit = { ...activeInit, images: copy };
    const updated = [...initiatives];
    updated[activeIdx] = updatedInit;
    updateDataSection("myInitiatives", updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, imgIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size exceeds the 2 MB limit!");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allowedExts = ["jpg", "jpeg", "png", "webp"];

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(fileExt || "")) {
      toast.error("Invalid file format! Only JPG, JPEG, PNG, and WEBP are accepted.");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading image...", { id: "img-upload" });

    try {
      const res = await uploadImage(file);
      handleImageFieldChange(imgIdx, "image", res.url);
      toast.success("Image uploaded successfully!", { id: "img-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.", { id: "img-upload" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-sky uppercase tracking-wider">
            My Initiatives
          </h4>
          <p className="text-xs text-muted-foreground">
            Manage storytelling slideshow initiatives (Max 25 initiatives).
          </p>
        </div>
        <button
          onClick={handleAddInitiative}
          className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
        >
          <Plus className="size-3.5" /> Add New Initiative
        </button>
      </div>

      {/* Initiatives Tabs Selector */}
      {initiatives.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 glass rounded-2xl border-white/5">
          {initiatives.map((init: any, idx: number) => (
            <div
              key={init.id || idx}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeIdx === idx
                  ? "bg-sky text-white shadow-lg shadow-sky/25"
                  : "bg-white/5 text-foreground/75 hover:bg-white/10 hover:text-foreground"
              }`}
              onClick={() => setActiveIdx(idx)}
            >
              <span>{init.title || `Initiative ${idx + 1}`}</span>
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveInitUp(idx);
                  }}
                  disabled={idx === 0}
                  className="p-0.5 rounded-sm hover:bg-white/20 disabled:opacity-20 transition"
                  title="Move Left"
                >
                  <ChevronLeft className="size-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveInitDown(idx);
                  }}
                  disabled={idx === initiatives.length - 1}
                  className="p-0.5 rounded-sm hover:bg-white/20 disabled:opacity-20 transition"
                  title="Move Right"
                >
                  <ChevronDown className="size-3" style={{ transform: "rotate(-90deg)" }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteInitiative(idx);
                  }}
                  className="p-0.5 rounded-sm hover:bg-red-500/20 text-red-400 transition ml-0.5"
                  title="Delete Initiative"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {initiatives.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center text-muted-foreground text-sm border-white/5">
          No initiatives created yet. Click "Add New Initiative" to start.
        </div>
      ) : (
        activeInit && (
          <div className="space-y-6 glass-strong p-6 rounded-3xl border-white/10">
            {/* Active Initiative Settings */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                Initiative Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={activeInit.title || ""}
                onChange={(e) => handleInitiativeTitleChange(e.target.value)}
                className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground"
                placeholder="Enter initiative title (e.g. Anti-Drug Campaigns)"
              />
            </div>

            {/* Images Header */}
            <div className="border-t border-white/5 pt-6 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-sky uppercase tracking-wider">
                  Slideshow Images ({images.length} / 25)
                </h5>
                <p className="text-[10px] text-muted-foreground">
                  Upload up to 25 story slides for this initiative.
                </p>
              </div>
              <button
                onClick={handleAddImage}
                className="glass text-sky rounded-full px-3 py-1.5 text-[11px] font-bold inline-flex items-center gap-1 border border-sky/20 hover:bg-sky/5 transition"
              >
                <Plus className="size-3" /> Add Image Slide
              </button>
            </div>

            {/* Images Grid */}
            <div className="space-y-4">
              {images.map((item: any, imgIdx: number) => (
                <div
                  key={imgIdx}
                  className="glass p-4 rounded-2xl border-white/5 flex flex-col md:flex-row gap-4 relative"
                >
                  {/* Left: Image Upload Preview */}
                  <div className="w-full md:w-44 shrink-0 flex flex-col items-center justify-center gap-2 border border-white/10 rounded-xl bg-midnight/30 p-3 relative overflow-hidden aspect-[4/3] md:aspect-auto md:h-32">
                    {item.image ? (
                      <img
                        src={resolveImageUrl(item.image)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg absolute inset-0"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center">
                        No Image Uploaded
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg">
                      <label className="cursor-pointer bg-sky text-white px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 hover:bg-sky-light transition">
                        <Upload className="size-3" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, imgIdx)}
                          disabled={isUploading}
                        />
                      </label>
                      <input
                        type="text"
                        value={item.image || ""}
                        onChange={(e) => handleImageFieldChange(imgIdx, "image", e.target.value)}
                        className="w-full bg-white/15 border border-white/10 rounded-md px-2 py-0.5 text-[9px] text-white focus:border-sky/50 outline-none placeholder:text-white/40 text-center"
                        placeholder="Or paste URL"
                      />
                    </div>
                  </div>

                  {/* Right: Title & Description inputs */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-gold uppercase tracking-wider block mb-1">
                          Slide Image Title <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.title || ""}
                          onChange={(e) => handleImageFieldChange(imgIdx, "title", e.target.value)}
                          className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:border-sky/50 outline-none text-foreground"
                          placeholder="e.g. Campaign Launch Guntur"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0 self-end">
                        <button
                          onClick={() => handleMoveImageUp(imgIdx)}
                          disabled={imgIdx === 0}
                          className="p-1 rounded-lg bg-midnight/40 text-sky hover:bg-sky/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Move Up"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveImageDown(imgIdx)}
                          disabled={imgIdx === images.length - 1}
                          className="p-1 rounded-lg bg-midnight/40 text-sky hover:bg-sky/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Move Down"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(imgIdx)}
                          className="p-1 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-500/10 border border-red-500/10 transition"
                          title="Delete Slide"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gold uppercase tracking-wider block">
                        Slide Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={item.description || ""}
                        onChange={(e) => handleImageFieldChange(imgIdx, "description", e.target.value)}
                        className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:border-sky/50 outline-none text-foreground min-h-[50px] leading-normal"
                        placeholder="Enter description for this campaign event..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gold uppercase tracking-wider block">
                        Image Alt Text (for SEO)
                      </label>
                      <input
                        type="text"
                        value={item.alt || ""}
                        onChange={(e) => handleImageFieldChange(imgIdx, "alt", e.target.value)}
                        className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:border-sky/50 outline-none text-foreground"
                        placeholder="e.g. Anti-drug rally banner"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {images.length === 0 && (
                <div className="glass p-8 rounded-2xl text-center text-muted-foreground text-xs border-white/5">
                  No image slides added to this initiative yet. Click "Add Image Slide" to start.
                </div>
              )}

              {images.length > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddImage}
                    className="glass text-sky rounded-full px-3 py-1.5 text-[11px] font-bold inline-flex items-center gap-1 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
                  >
                    <Plus className="size-3" /> Add Image Slide
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {initiatives.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleAddInitiative}
            className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
          >
            <Plus className="size-3.5" /> Add New Initiative
          </button>
        </div>
      )}
    </div>
  );
}

export function ProfileEditConsole(props: ProfileEditConsoleProps) {
  const { mode, selectedProfile, categoriesList = [], isSaving, onUpdateField: updateField, onUpdateDataSection: updateDataSection, onPublish: handlePublish, onDiscard, onImageUpload: handleImageUpload, activeSection, setActiveSection } = props;
  const [selectedImportSection, setSelectedImportSection] = useState("stats");
  const [isUploading, setIsUploading] = useState(false);

  const parseCSVLine = (line: string): string[] => {
    const cells: string[] = [];
    let currentCell = "";
    let insideQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        cells.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    return cells.map(c => c.replace(/^"|"$/g, "").trim());
  };

  const isHeaderRow = (section: string, cells: string[]): boolean => {
    if (cells.length === 0) return false;
    const c0 = cells[0].toLowerCase();
    const c1 = cells[1]?.toLowerCase();
    if (section === "stats") {
      return c0 === "value" && c1 === "label";
    }
    if (section === "bio") {
      return (c0 === "key" || c0 === "k") && (c1 === "value" || c1 === "v");
    }
    if (section === "timeline") {
      return c0 === "period" && c1 === "title";
    }
    if (section === "awards") {
      return c0 === "year" && c1 === "title";
    }
    return false;
  };

  const handleCSVImport = (section: string, csvText: string) => {
    if (!csvText.trim()) {
      toast.error("CSV content is empty.");
      return;
    }

    try {
      let lines = csvText.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        toast.error("No content found.");
        return;
      }

      // Check and skip header row if present
      const firstLineCells = parseCSVLine(lines[0]);
      if (isHeaderRow(section, firstLineCells)) {
        lines = lines.slice(1);
      }

      const importedItems: any[] = [];

      for (const line of lines) {
        const cleanCells = parseCSVLine(line);

        if (section === "stats") {
          if (cleanCells.length >= 2) {
            importedItems.push({
              value: cleanCells[0],
              label: cleanCells[1],
            });
          }
        } else if (section === "bio") {
          if (cleanCells.length >= 2) {
            importedItems.push({
              k: cleanCells[0],
              v: cleanCells[1],
            });
          }
        } else if (section === "timeline") {
          if (cleanCells.length >= 3) {
            importedItems.push({
              period: cleanCells[0] || "2026",
              title: cleanCells[1] || "Milestone Title",
              body: cleanCells[2] || "Milestone description...",
              highlight: cleanCells[3] || "",
              icon: cleanCells[4] || "ShieldCheck",
              span: "lg:col-span-1",
            });
          }
        } else if (section === "awards") {
          if (cleanCells.length >= 3) {
            importedItems.push({
              year: cleanCells[0] || "2026",
              title: cleanCells[1] || "Award Title",
              org: cleanCells[2] || "Awarding Body",
              body: cleanCells[3] || "Citation details...",
              img: "",
            });
          }
        }
      }

      if (importedItems.length === 0) {
        toast.error("Could not parse any valid items. Please check if columns match the template.");
        return;
      }

      const existingList = selectedProfile.data[section] || [];
      updateDataSection(section, [...existingList, ...importedItems]);
      toast.success(`Successfully imported ${importedItems.length} items to ${section}!`);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while parsing the CSV data.");
    }
  };

  const CSVImportBox = ({ section, defaultOpen }: { section: string; defaultOpen?: boolean }) => {
    const [csvText, setCsvText] = useState("");
    const [isOpen, setIsOpen] = useState(defaultOpen || false);
    const [dragActive, setDragActive] = useState(false);

    const placeholders: Record<string, { header: string; desc: string; sample: string }> = {
      stats: {
        header: "Bulk Import Stats",
        desc: "Upload a CSV file or paste comma-separated rows. Expected columns: value, label",
        sample: "4,000+,Youth Mobilised\n100%,Verified Registry\n16+,Global Citations"
      },
      bio: {
        header: "Bulk Import Biodata Rows",
        desc: "Upload a CSV file or paste comma-separated rows. Expected columns: key, value",
        sample: "Place of Birth,UN Geneva\nNationality,Indian\nDesignation,Founder & Chairman"
      },
      timeline: {
        header: "Bulk Import Milestones",
        desc: "Upload a CSV file or paste comma-separated rows. Expected columns: period, title, body, highlight, icon",
        sample: "2015,UN Geneva Envoy,Appointed delegate for global peace advocacy.,UN Representative,Globe2\n2018,Founded Council,Started World Human Rights Council to empower marginalized youth.,Social Founder,Users"
      },
      awards: {
        header: "Bulk Import Awards",
        desc: "Upload a CSV file or paste comma-separated rows. Expected columns: year, title, org, body",
        sample: "2019,Mandela Peace Award,UN Geneva,For outstanding contribution to youth welfare and structural peace building.\n2021,Honorary Doctorate,Oxford Academy,Recognized for pioneering socio-welfare research."
      }
    };

    const downloadCSVTemplate = () => {
      let content = "";
      let filename = `template_${section}.csv`;

      if (section === "stats") {
        content = "value,label\n4,000+,Youth Mobilised\n100%,Verified Personas\n16+,Global Citations";
      } else if (section === "bio") {
        content = "key,value\nPlace of Birth,UN Geneva\nNationality,Indian\nOffice,WHRC Geneva";
      } else if (section === "timeline") {
        content = "period,title,body,highlight,icon\n2015,UN Geneva Envoy,Appointed delegate for global peace advocacy.,UN Representative,Globe2\n2018,Founded Council,Started World Human Rights Council to empower youth.,Social Founder,Users";
      } else if (section === "awards") {
        content = "year,title,org,body\n2019,Mandela Peace Award,UN Geneva,For outstanding contribution to youth welfare.\n2021,Honorary Doctorate,Oxford Academy,Recognized for pioneering socio-welfare research.";
      }

      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleFile = (file: File) => {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please upload a valid .csv file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          handleCSVImport(section, text);
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read file.");
      };
      reader.readAsText(file);
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    };

    const target = placeholders[section];
    if (!target) return null;

    return (
      <div className="mt-6 border border-white/10 rounded-3xl p-5 bg-midnight/20">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-sky uppercase tracking-wider cursor-pointer outline-none"
        >
          <span className="flex items-center gap-2">
            <FileText className="size-4" /> {target.header} (CSV Bulk Importer)
          </span>
          <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {target.desc}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative min-h-[140px] ${
                  dragActive
                    ? "border-sky bg-sky/5 scale-[1.02]"
                    : "border-white/10 hover:border-sky/50 hover:bg-white/5 bg-midnight/30"
                }`}
                onClick={() => document.getElementById(`file-upload-${section}`)?.click()}
              >
                <input
                  type="file"
                  id={`file-upload-${section}`}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="size-7 text-sky mb-2" />
                <span className="text-xs font-semibold text-foreground">
                  Drag & Drop CSV file here
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  or click to select file from device
                </span>
                <span className="chip py-0.5! px-2! text-[9px] font-bold text-gold bg-gold/5 mt-3 border-gold/20 uppercase">
                  Must match template headers
                </span>
              </div>

              {/* Paste Text Area */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-1">
                  Or Paste CSV Text Directly
                </span>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full flex-1 min-h-[120px] bg-midnight/50 border border-white/10 rounded-2xl p-3 text-xs font-mono outline-none focus:border-sky/50 text-foreground"
                  placeholder={target.sample}
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 pt-2">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCsvText(target.sample)}
                  className="text-[10px] text-sky hover:underline cursor-pointer"
                >
                  Load Sample Data
                </button>
                <button
                  type="button"
                  onClick={downloadCSVTemplate}
                  className="text-[10px] text-gold hover:underline cursor-pointer font-semibold"
                >
                  Download CSV Template (.csv)
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleCSVImport(section, csvText);
                  setCsvText("");
                }}
                className="btn-premium rounded-full px-5 py-2 text-xs font-bold shadow-lg cursor-pointer"
              >
                Import Rows
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to refresh categories from database

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left Sidebar Category Switcher */}
            <div className="lg:col-span-3 glass-strong rounded-3xl p-5 border-white/10 space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">
                Editing Sections
              </div>

              {[
                { id: "dashboard", label: "Dashboard Overview", icon: Activity },
                { id: "general", label: "General & Hero", icon: User },
                ...(props.mode === "admin" ? [{ id: "csvImport", label: "CSV Bulk Import", icon: FileText }] : []),
                { id: "roles", label: "Key Badges / Roles", icon: UserCheck },
                { id: "stats", label: "Impact Stats Grid", icon: Activity },
                { id: "bio", label: "Biodata Table", icon: FileText },
                { id: "biography", label: "Biography Chapters", icon: BookOpen },
                { id: "family", label: "Family Details", icon: Users },
                { id: "timeline", label: "Timeline Milestones", icon: CalendarDays },
                { id: "focus", label: "Core Organisation Focus", icon: ShieldCheck },
                { id: "initiatives", label: "Key Initiatives", icon: Megaphone },
                { id: "awards", label: "Awards & Recognition", icon: Award },
                { id: "certificates", label: "Certificates", icon: FileText },
                { id: "myInitiatives", label: "My Initiatives", icon: Megaphone },
                { id: "newsArticles", label: "News Articles", icon: FileText },
                { id: "recentActivities", label: "Recent Activities", icon: CalendarDays },
                { id: "recent", label: "Recent Stage", icon: Award },
                { id: "inspirations", label: "Inspirations Quote", icon: Quote },
                { id: "connect", label: "Footer Social Connect", icon: Share2 },
              ].map((sect) => {
                const Icon = sect.icon;
                return (
                  <button
                    key={sect.id}
                    onClick={() => setActiveSection(sect.id as ActiveSubSection)}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition text-[13px] font-semibold flex items-center gap-3 ${
                      activeSection === sect.id
                        ? "bg-linear-to-r from-sapphire to-sky text-white shadow-md shadow-sky/15"
                        : "hover:bg-[#0d2c6c]/5 text-foreground/70"
                    }`}
                  >
                    <Icon
                      className={`size-4 ${
                        activeSection === sect.id ? "text-white" : "text-[#7BA4D0]/60"
                      }`}
                    />
                    <span>{sect.label}</span>
                  </button>
                );
              })}

              <div className="pt-6 border-t border-white/5 mt-6">
                <button
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="btn-premium w-full rounded-2xl py-3.5 font-bold text-sm inline-flex items-center justify-center gap-2 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Publish Profile
                </button>
              </div>
            </div>

            {/* Right Editor Panels */}
            <div className="lg:col-span-9 glass-strong rounded-3xl p-8 border-white/10 min-h-[600px] flex flex-col justify-between">
              <div>
                {/* Section Header */}
                <div className="border-b border-white/5 pb-6 mb-8 flex items-center justify-between">
                  <div>
                    <span className="chip py-1! px-2.5! text-[10px] font-bold text-sky bg-sky/5 uppercase tracking-wider mb-2">
                      Section Editor
                    </span>
                    <h2 className="font-display text-2xl font-bold text-gradient capitalize">
                      {activeSection === "connect"
                        ? "Footer Social Links"
                        : activeSection === "bio"
                          ? "Biodata Table Manager"
                          : activeSection === "stats"
                            ? "Impact Stats Grid"
                            : activeSection === "family"
                              ? "Family Details & Background"
                            : activeSection === "timeline"
                              ? "Timeline Achievements"
                              : activeSection === "csvImport"
                                ? "CSV Bulk Data Importer"
                                : `${activeSection} Details`}
                    </h2>
                  </div>
                  <div className="text-xs text-foreground/50">
                    Draft Profile ID:{" "}
                    <span className="font-mono text-sky font-bold">
                      {selectedProfile.id || "Unpublished New"}
                    </span>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* CSV BULK IMPORT GLOBAL SECTION                                           */}
                {/* ========================================================================= */}
                {props.mode === "admin" && activeSection === "csvImport" && (
                  <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Select Target Portfolio Section
                        </label>
                        <select
                          value={selectedImportSection}
                          onChange={(e) => setSelectedImportSection(e.target.value as any)}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-foreground cursor-pointer font-semibold"
                        >
                          <option value="stats">Impact Stats Grid</option>
                          <option value="bio">Biodata Table Rows</option>
                          <option value="timeline">Timeline Milestones</option>
                          <option value="awards">Awards & Recognition</option>
                        </select>
                      </div>
                    </div>

                    <div className="glass p-6 rounded-3xl border-white/5">
                      <CSVImportBox key={selectedImportSection} section={selectedImportSection} defaultOpen={true} />
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 1: GENERAL HERO                                               */}
                {/* ========================================================================= */}
                {activeSection === "dashboard" && (
                  <LeaderDashboard profile={selectedProfile} />
                )}
                {activeSection === "general" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider">
                          Full Leader Name
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground"
                          placeholder="e.g. Dr. John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider">
                          URL Route Slug
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.slug}
                          onChange={(e) => updateField("slug", e.target.value)}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground font-mono"
                          placeholder="e.g. dr-john-doe"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Route: /leader/
                          <span className="text-sky">{selectedProfile.slug || "slug"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider">
                          Title / Organisation Link
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.title}
                          onChange={(e) => updateField("title", e.target.value)}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground"
                          placeholder="e.g. Founder & Chairman, World Human Rights Council"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider">
                          Subtitle Introduction
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.subtitle}
                          onChange={(e) => updateField("subtitle", e.target.value)}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground"
                          placeholder="e.g. Social Reformer & Entrepreneur · Hyderabad, India."
                        />
                      </div>
                    </div>

                    {/* Category & Subcategory Selection */}
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Leader Category Classification
                        </label>
                        <select
                          value={selectedProfile.category_id || ""}
                          onChange={(e) => {
                            const catId = e.target.value ? parseInt(e.target.value, 10) : null;
                            updateField("category_id", catId);
                            updateField("subcategory_id", null); // Reset subcategory when category changes
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground"
                        >
                          <option value="">-- Unassigned Category --</option>
                          {categoriesList.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Leader Subcategory Role
                        </label>
                        <select
                          value={selectedProfile.subcategory_id || ""}
                          onChange={(e) => {
                            const subId = e.target.value ? parseInt(e.target.value, 10) : null;
                            updateField("subcategory_id", subId);
                          }}
                          disabled={!selectedProfile.category_id}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="">-- Unassigned Subcategory --</option>
                          {categoriesList
                            .find((c) => c.id === selectedProfile.category_id)
                            ?.subcategories.map((sub: any) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Portrait Local File Uploader */}
                    <div className="space-y-2 pt-4">
                      <label className="text-xs font-bold text-gold uppercase tracking-wider block mb-2">
                        Leader Portrait Image
                      </label>
                      <div className="flex flex-col md:flex-row items-center gap-6 p-6 glass rounded-[24px] border-white/10">
                        <div className="size-32 rounded-2xl overflow-hidden border border-white/15 bg-midnight shrink-0 shadow-lg relative group">
                          <img
                            src={selectedProfile.portrait}
                            alt="Portrait Preview"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="flex-1 w-full space-y-3">
                          <div className="text-xs text-foreground/60 leading-relaxed">
                            Upload a high-resolution leader profile picture (supports JPG, PNG). The
                            image will be stored directly inside your local{" "}
                            <span className="font-mono text-sky">/public/uploads/</span> directory.
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="btn-premium rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition">
                              <Upload className="size-3.5" /> Upload File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(e, (url) => updateField("portrait", url))
                                }
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={selectedProfile.portrait}
                              onChange={(e) => updateField("portrait", e.target.value)}
                              className="flex-1 bg-midnight/30 border border-white/10 rounded-full px-4 py-2.5 text-xs font-mono focus:border-sky/50 outline-none text-foreground"
                              placeholder="Direct asset path e.g. /assets/leader-portrait.jpg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 2: ROLES BADGES                                                */}
                {/* ========================================================================= */}
                {activeSection === "roles" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        Add up to 5 strategic credentials or tags showing in the hero block.
                      </span>
                      <button
                        onClick={() => {
                          const newRoles = [
                            ...(selectedProfile.data.roles || []),
                            { icon: "ShieldCheck", label: "New Strategic Role" },
                          ];
                          updateDataSection("roles", newRoles);
                        }}
                        className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                      >
                        <Plus className="size-3.5" /> Add Role
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(selectedProfile.data.roles || []).map((role: any, i: number) => (
                        <div
                          key={i}
                          className="glass p-4 rounded-2xl border-white/5 flex flex-wrap md:flex-nowrap items-center gap-4 hover:border-white/10 transition"
                        >
                          <div className="size-10 rounded-xl bg-[#7BA4D0]/5 border border-white/10 grid place-items-center shrink-0">
                            <DynamicIcon name={role.icon} className="size-5 text-sky" />
                          </div>

                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              value={role.label}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.roles];
                                copy[i].label = e.target.value;
                                updateDataSection("roles", copy);
                              }}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-sky/50 outline-none"
                              placeholder="Role Label"
                            />
                          </div>

                          <div className="w-[180px] shrink-0">
                            <select
                              value={role.icon}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.roles];
                                copy[i].icon = e.target.value;
                                updateDataSection("roles", copy);
                              }}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50 text-foreground"
                            >
                              {POPULAR_LEADER_ICONS.map((ico) => (
                                <option key={ico.name} value={ico.name}>
                                  {ico.name} ({ico.label})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.roles];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i - 1, 0, item);
                                updateDataSection("roles", copy);
                              }}
                              disabled={i === 0}
                              className="glass p-2 rounded-lg text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronUp className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.roles];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i + 1, 0, item);
                                updateDataSection("roles", copy);
                              }}
                              disabled={i === selectedProfile.data.roles.length - 1}
                              className="glass p-2 rounded-lg text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronDown className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.roles];
                                copy.splice(i, 1);
                                updateDataSection("roles", copy);
                              }}
                              className="glass p-2 rounded-lg text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(selectedProfile.data.roles || []).length > 0 && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            const newRoles = [
                              ...(selectedProfile.data.roles || []),
                              { icon: "ShieldCheck", label: "New Strategic Role" },
                            ];
                            updateDataSection("roles", newRoles);
                          }}
                          className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
                        >
                          <Plus className="size-3.5" /> Add Role
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 3: STATS GRID                                                 */}
                {/* ========================================================================= */}
                {activeSection === "stats" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        Build up to 6 key stat values displaying in the "Impact at a glance" grid.
                      </span>
                      <button
                        onClick={() => {
                          const newStats = [
                            ...(selectedProfile.data.stats || []),
                            { value: "10+", label: "New Metric" },
                          ];
                          updateDataSection("stats", newStats);
                        }}
                        className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                      >
                        <Plus className="size-3.5" /> Add Stat
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {(selectedProfile.data.stats || []).map((stat: any, i: number) => (
                        <div
                          key={i}
                          className="glass p-4 rounded-2xl border-white/5 space-y-3 relative group"
                        >
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.stats];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i - 1, 0, item);
                                updateDataSection("stats", copy);
                              }}
                              disabled={i === 0}
                              className="glass p-1 rounded text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronUp className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.stats];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i + 1, 0, item);
                                updateDataSection("stats", copy);
                              }}
                              disabled={i === selectedProfile.data.stats.length - 1}
                              className="glass p-1 rounded text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronDown className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.stats];
                                copy.splice(i, 1);
                                updateDataSection("stats", copy);
                              }}
                              className="glass p-1 rounded text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                              Stat Value (e.g. "4,000+", "2017")
                            </label>
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.stats];
                                copy[i].value = e.target.value;
                                updateDataSection("stats", copy);
                              }}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-sky outline-none focus:border-sky/50"
                              placeholder="Value"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                              Stat Label Description
                            </label>
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.stats];
                                copy[i].label = e.target.value;
                                updateDataSection("stats", copy);
                              }}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50"
                              placeholder="Label Description"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {(selectedProfile.data.stats || []).length > 0 && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            const newStats = [
                              ...(selectedProfile.data.stats || []),
                              { value: "10+", label: "New Metric" },
                            ];
                            updateDataSection("stats", newStats);
                          }}
                          className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
                        >
                          <Plus className="size-3.5" /> Add Stat
                        </button>
                      </div>
                    )}

                    <CSVImportBox section="stats" />
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 4: BIODATA                                                    */}
                {/* ========================================================================= */}
                {activeSection === "bio" && (
                  <div className="space-y-6">
                    {/* Secondary Biodata Profile Image Upload */}
                    <div className="glass p-5 rounded-3xl border border-white/10 space-y-4">
                      <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                        Biodata Section Profile Image (Left Side)
                      </label>
                      <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
                        <div className="size-28 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-inner shrink-0 relative group">
                          {selectedProfile.data.biodataImage ? (
                            <img
                              src={selectedProfile.data.biodataImage}
                              alt="Biodata section portrait"
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 text-foreground/45 text-[10px] leading-relaxed">
                              <span>No image uploaded</span>
                              <span className="text-sky mt-1">(Portrait fallback)</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 flex-1 min-w-[200px]">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Upload a secondary or formal photo to be displayed in the boxed area under the quote card on the left side of your Biodata. If omitted, the main profile portrait will be shown as a fallback.
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition cursor-pointer">
                              <Upload className="size-3.5" /> Select Image File
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleImageUpload(e, (url) => {
                                    updateDataSection("biodataImage", url);
                                  });
                                }}
                              />
                            </label>
                            {selectedProfile.data.biodataImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateDataSection("biodataImage", undefined);
                                }}
                                className="glass text-red-400 rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-red-500/20 hover:bg-red-950/20 transition cursor-pointer"
                              >
                                <Trash2 className="size-3.5" /> Remove Image
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        Define key fields displaying inside the premium table (e.g. Place of birth,
                        Education).
                      </span>
                      <button
                        onClick={() => {
                          const newBio = [
                            ...(selectedProfile.data.bio || []),
                            { k: "New Key", v: "Enter Value" },
                          ];
                          updateDataSection("bio", newBio);
                        }}
                        className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                      >
                        <Plus className="size-3.5" /> Add Row
                      </button>
                    </div>

                    <div className="space-y-3 rounded-2xl bg-white/5 p-4 border border-white/10">
                      {(selectedProfile.data.bio || []).map((row: any, i: number) => (
                        <div key={i} className="flex gap-4 items-center flex-wrap md:flex-nowrap">
                          <input
                            type="text"
                            value={row.k}
                            onChange={(e) => {
                              const copy = [...selectedProfile.data.bio];
                              copy[i].k = e.target.value;
                              updateDataSection("bio", copy);
                            }}
                            className="w-[180px] bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gold uppercase tracking-wider outline-none focus:border-sky/50"
                            placeholder="Key"
                          />
                          <input
                            type="text"
                            value={row.v}
                            onChange={(e) => {
                              const copy = [...selectedProfile.data.bio];
                              copy[i].v = e.target.value;
                              updateDataSection("bio", copy);
                            }}
                            className="flex-1 bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky/50"
                            placeholder="Value"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.bio];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i - 1, 0, item);
                                updateDataSection("bio", copy);
                              }}
                              disabled={i === 0}
                              className="glass p-1.5 rounded text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronUp className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.bio];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i + 1, 0, item);
                                updateDataSection("bio", copy);
                              }}
                              disabled={i === selectedProfile.data.bio.length - 1}
                              className="glass p-1.5 rounded text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronDown className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.bio];
                                copy.splice(i, 1);
                                updateDataSection("bio", copy);
                              }}
                              className="glass p-1.5 text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(selectedProfile.data.bio || []).length > 0 && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            const newBio = [
                              ...(selectedProfile.data.bio || []),
                              { k: "New Key", v: "Enter Value" },
                            ];
                            updateDataSection("bio", newBio);
                          }}
                          className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
                        >
                          <Plus className="size-3.5" /> Add Row
                        </button>
                      </div>
                    )}

                    <CSVImportBox section="bio" />
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 5: BIOGRAPHY                                                   */}
                {/* ========================================================================= */}
                {activeSection === "biography" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                        Early Life & Education Chapter
                      </label>
                      <textarea
                        value={selectedProfile.data.biography?.earlyLife || ""}
                        onChange={(e) => {
                          const bioSect = selectedProfile.data.biography || {};
                          updateDataSection("biography", {
                            ...bioSect,
                            earlyLife: e.target.value,
                          });
                        }}
                        rows={6}
                        className="w-full bg-midnight/50 border border-white/10 rounded-2xl p-4 text-sm focus:border-sky/50 outline-none text-foreground leading-relaxed"
                        placeholder="Detail the leader's background, schooling, family life, and early education..."
                      />
                    </div>

                    <div className="space-y-2 pt-4">
                      <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                        Career & Professional Journey Chapter
                      </label>
                      <textarea
                        value={selectedProfile.data.biography?.career || ""}
                        onChange={(e) => {
                          const bioSect = selectedProfile.data.biography || {};
                          updateDataSection("biography", {
                            ...bioSect,
                            career: e.target.value,
                          });
                        }}
                        rows={6}
                        className="w-full bg-midnight/50 border border-white/10 rounded-2xl p-4 text-sm focus:border-sky/50 outline-none text-foreground leading-relaxed"
                        placeholder="Detail the key professional milestones, founding of institutions, entrepreneurship, and advocacy work..."
                      />
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION: FAMILY DETAILS                                                */}
                {/* ========================================================================= */}
                {activeSection === "family" && (
                  <FamilyDetailsEditor
                    profileId={selectedProfile.id}
                    profileName={selectedProfile.name}
                    profileSlug={selectedProfile.slug}
                    embedded
                  />
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 6: TIMELINE                                                    */}
                {/* ========================================================================= */}
                {activeSection === "timeline" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        Manage milestone roles displaying inside the interactive selector module.
                      </span>
                      <button
                        onClick={() => {
                          const newTimeline = [
                            ...(selectedProfile.data.timeline || []),
                            {
                              period: "2026",
                              title: "New Role Title",
                              body: "Milestone achievements and impact details...",
                              highlight: "Key Highlight",
                              icon: "ShieldCheck",
                              span: "lg:col-span-1",
                            },
                          ];
                          updateDataSection("timeline", newTimeline);
                        }}
                        className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                      >
                        <Plus className="size-3.5" /> Add Milestone
                      </button>
                    </div>

                    <div className="space-y-6">
                      {(selectedProfile.data.timeline || []).map((t: any, i: number) => (
                        <div
                          key={i}
                          className="glass p-6 rounded-3xl border-white/10 space-y-4 relative group hover:border-[#7BA4D0]/30 transition-all duration-300"
                        >
                          {/* Floating card tools */}
                          <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.timeline];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i - 1, 0, item);
                                updateDataSection("timeline", copy);
                              }}
                              disabled={i === 0}
                              className="glass p-2 rounded-lg text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronUp className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.timeline];
                                const [item] = copy.splice(i, 1);
                                copy.splice(i + 1, 0, item);
                                updateDataSection("timeline", copy);
                              }}
                              disabled={i === selectedProfile.data.timeline.length - 1}
                              className="glass p-2 rounded-lg text-foreground hover:bg-white/10 disabled:opacity-20 transition"
                            >
                              <ChevronDown className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.timeline];
                                copy.splice(i, 1);
                                updateDataSection("timeline", copy);
                              }}
                              className="glass p-2 rounded-lg text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                                Duration / Period
                              </label>
                              <input
                                type="text"
                                value={t.period}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.timeline];
                                  copy[i].period = e.target.value;
                                  updateDataSection("timeline", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50"
                                placeholder="e.g. May 2017 – Present"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                                Milestone Full Title
                              </label>
                              <input
                                type="text"
                                value={t.title}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.timeline];
                                  copy[i].title = e.target.value;
                                  updateDataSection("timeline", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50"
                                placeholder="e.g. Founder & Chairman — WHRC"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                              Achievement Body Details
                            </label>
                            <textarea
                              value={t.body}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.timeline];
                                copy[i].body = e.target.value;
                                updateDataSection("timeline", copy);
                              }}
                              rows={3}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-sky/50 leading-relaxed"
                              placeholder="Describe structural achievements, youth mobilization, corporate operations..."
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                                Primary Impact Highlight
                              </label>
                              <input
                                type="text"
                                value={t.highlight}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.timeline];
                                  copy[i].highlight = e.target.value;
                                  updateDataSection("timeline", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50 text-sky font-medium"
                                placeholder="e.g. Grassroots Leadership"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                                Timeline Icon
                              </label>
                              <select
                                value={t.icon}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.timeline];
                                  copy[i].icon = e.target.value;
                                  updateDataSection("timeline", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50 text-foreground"
                              >
                                {POPULAR_LEADER_ICONS.map((ico) => (
                                  <option key={ico.name} value={ico.name}>
                                    {ico.name} ({ico.label})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gold uppercase tracking-widest">
                                Card Width Span
                              </label>
                              <select
                                value={t.span}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.timeline];
                                  copy[i].span = e.target.value;
                                  updateDataSection("timeline", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50 text-foreground"
                              >
                                <option value="lg:col-span-1">Standard (1 column)</option>
                                <option value="lg:col-span-2">Double Width (2 columns)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(selectedProfile.data.timeline || []).length > 0 && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            const newTimeline = [
                              ...(selectedProfile.data.timeline || []),
                              {
                                period: "2026",
                                title: "New Role Title",
                                body: "Milestone achievements and impact details...",
                                highlight: "Key Highlight",
                                icon: "ShieldCheck",
                                span: "lg:col-span-1",
                              },
                            ];
                            updateDataSection("timeline", newTimeline);
                          }}
                          className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
                        >
                          <Plus className="size-3.5" /> Add Milestone
                        </button>
                      </div>
                    )}

                    <CSVImportBox section="timeline" />
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 7: FOCUS                                                       */}
                {/* ========================================================================= */}
                {activeSection === "focus" && (
                  <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border-white/10 space-y-4">
                      <h5 className="text-xs font-bold text-sky uppercase tracking-wider mb-2">
                        Organisation General Information
                      </h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                            Section Label
                          </label>
                          <input
                            type="text"
                            value={selectedProfile.data.orgLabel || ""}
                            onChange={(e) => updateDataSection("orgLabel", e.target.value)}
                            className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground"
                            placeholder="Organisation"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                            Section Website
                          </label>
                          <input
                            type="text"
                            value={selectedProfile.data.orgWebsite || ""}
                            onChange={(e) => updateDataSection("orgWebsite", e.target.value)}
                            className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground font-mono"
                            placeholder="whrcheadquarters.org"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                            Section Heading
                          </label>
                          <input
                            type="text"
                            value={selectedProfile.data.orgTitle || ""}
                            onChange={(e) => updateDataSection("orgTitle", e.target.value)}
                            className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground font-bold text-sky"
                            placeholder="About World Human Rights Council"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                            Section Subtitle
                          </label>
                          <input
                            type="text"
                            value={selectedProfile.data.orgSubtitle || ""}
                            onChange={(e) => updateDataSection("orgSubtitle", e.target.value)}
                            className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground"
                            placeholder="Founded May 2017 · Active across multiple States"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                          Section Description
                        </label>
                        <textarea
                          value={selectedProfile.data.orgDescription || ""}
                          onChange={(e) => updateDataSection("orgDescription", e.target.value)}
                          className="w-full bg-midnight/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:border-sky/50 outline-none text-foreground min-h-[80px]"
                          placeholder="A grassroots-based human rights council..."
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-xs font-bold text-sky uppercase tracking-wider">
                            Focus Areas / Floating Cards
                          </h5>
                          <p className="text-[10px] text-muted-foreground">
                            Manage focus points displayed as card badges (e.g. Grievance Redressal, Legal Aid).
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newFocus = [
                              ...(selectedProfile.data.orgFocus || []),
                              "New Core Value",
                            ];
                            updateDataSection("orgFocus", newFocus);
                          }}
                          className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                        >
                          <Plus className="size-3.5" /> Add Focus Area
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {(selectedProfile.data.orgFocus || []).map((focus: string, i: number) => (
                          <div
                            key={i}
                            className="glass px-4 py-3 rounded-2xl border-white/5 flex items-center justify-between gap-3"
                          >
                            <input
                              type="text"
                              value={focus}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.orgFocus];
                                copy[i] = e.target.value;
                                updateDataSection("orgFocus", copy);
                              }}
                              className="bg-transparent border-none text-sm font-semibold focus:outline-none flex-1 text-sky"
                            />
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.orgFocus];
                                copy.splice(i, 1);
                                updateDataSection("orgFocus", copy);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/5 transition shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {(selectedProfile.data.orgFocus || []).length > 0 && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => {
                              const newFocus = [
                                ...(selectedProfile.data.orgFocus || []),
                                "New Core Value",
                              ];
                              updateDataSection("orgFocus", newFocus);
                            }}
                            className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition shadow-lg"
                          >
                            <Plus className="size-3.5" /> Add Focus Area
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 8: INITIATIVES                                                 */}
                {/* ========================================================================= */}
                {activeSection === "initiatives" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        Manage key community programs and initiatives.
                      </span>
                      <button
                        onClick={() => {
                          const newInits = [
                            ...(selectedProfile.data.initiatives || []),
                            {
                              icon: "Megaphone",
                              title: "New Program Title",
                              body: "Provide a detailed summary of the campaigns, drives, or legal aids...",
                            },
                          ];
                          updateDataSection("initiatives", newInits);
                        }}
                        className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                      >
                        <Plus className="size-3.5" /> Add Initiative
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {(selectedProfile.data.initiatives || []).map((init: any, i: number) => (
                        <div
                          key={i}
                          className="glass p-5 rounded-3xl border-white/5 space-y-3 relative group"
                        >
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.initiatives];
                                copy.splice(i, 1);
                                updateDataSection("initiatives", copy);
                              }}
                              className="glass p-1.5 rounded text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-[#7BA4D0]/5 border border-white/10 grid place-items-center">
                              <DynamicIcon name={init.icon} className="size-5 text-sky" />
                            </div>
                            <select
                              value={init.icon}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.initiatives];
                                copy[i].icon = e.target.value;
                                updateDataSection("initiatives", copy);
                              }}
                              className="bg-midnight/30 border border-white/10 rounded-xl px-2 py-1 text-xs outline-none text-foreground flex-1"
                            >
                              {POPULAR_LEADER_ICONS.map((ico) => (
                                <option key={ico.name} value={ico.name}>
                                  {ico.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                              Program Title
                            </label>
                            <input
                              type="text"
                              value={init.title}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.initiatives];
                                copy[i].title = e.target.value;
                                updateDataSection("initiatives", copy);
                              }}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-sky/50 text-gold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                              Program Summary Details
                            </label>
                            <textarea
                              value={init.body}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.initiatives];
                                copy[i].body = e.target.value;
                                updateDataSection("initiatives", copy);
                              }}
                              rows={4}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-sky/50 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 9: AWARDS                                                      */}
                {/* ========================================================================= */}
                {activeSection === "awards" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        Manage awards, titles, guest of honours, and upload recognition photos.
                      </span>
                      <button
                        onClick={() => {
                          const newAwards = [
                            ...(selectedProfile.data.awards || []),
                            {
                              year: "2026",
                              title: "Award Certificate",
                              org: "Awarding Body",
                              body: "Describe the citation details...",
                              img: "",
                            },
                          ];
                          updateDataSection("awards", newAwards);
                        }}
                        className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                      >
                        <Plus className="size-3.5" /> Add Award
                      </button>
                    </div>

                    <div className="space-y-6">
                      {(selectedProfile.data.awards || []).map((aw: any, i: number) => (
                        <div
                          key={i}
                          className="glass p-6 rounded-3xl border-white/10 grid md:grid-cols-12 gap-6 relative group"
                        >
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.awards];
                                copy.splice(i, 1);
                                updateDataSection("awards", copy);
                              }}
                              className="glass p-1.5 rounded text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          {/* Image field */}
                          <div className="md:col-span-4 space-y-3">
                            <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-midnight border border-white/10 flex items-center justify-center relative">
                              {aw.img ? (
                                <img
                                  src={aw.img}
                                  alt="Award preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-3 text-muted-foreground text-xs">
                                  <Award className="size-8 mx-auto mb-2 text-[#7BA4D0]/30 animate-pulse" />
                                  No Recognition Photo
                                </div>
                              )}
                            </div>
                            <label className="glass w-full rounded-xl py-2 text-center text-[10px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/5 transition border-white/10">
                              <Upload className="size-3.5 text-sky" /> Upload Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(e, (url) => {
                                    const copy = [...selectedProfile.data.awards];
                                    copy[i].img = url;
                                    updateDataSection("awards", copy);
                                  })
                                }
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={aw.img || ""}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.awards];
                                copy[i].img = e.target.value;
                                updateDataSection("awards", copy);
                              }}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-mono outline-none text-foreground"
                              placeholder="Direct photo URL"
                            />
                          </div>

                          {/* Details fields */}
                          <div className="md:col-span-8 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                                  Award Year
                                </label>
                                <input
                                  type="text"
                                  value={aw.year}
                                  onChange={(e) => {
                                    const copy = [...selectedProfile.data.awards];
                                    copy[i].year = e.target.value;
                                    updateDataSection("awards", copy);
                                  }}
                                  className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50"
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                                  Awarding Body / Org
                                </label>
                                <input
                                  type="text"
                                  value={aw.org}
                                  onChange={(e) => {
                                    const copy = [...selectedProfile.data.awards];
                                    copy[i].org = e.target.value;
                                    updateDataSection("awards", copy);
                                  }}
                                  className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky/50"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                                Award Name / Certificate Title
                              </label>
                              <input
                                type="text"
                                value={aw.title}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.awards];
                                  copy[i].title = e.target.value;
                                  updateDataSection("awards", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-sky/50 text-gold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                                Citation Details
                              </label>
                              <textarea
                                value={aw.body}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.awards];
                                  copy[i].body = e.target.value;
                                  updateDataSection("awards", copy);
                                }}
                                rows={3}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-sky/50 leading-relaxed"
                              />
                            </div>

                            <div className="space-y-2 border-t border-white/5 pt-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-gold uppercase tracking-widest block">
                                  Ceremony & Video Links
                                </label>
                                <button
                                  onClick={() => {
                                    const copy = [...selectedProfile.data.awards];
                                    const links = copy[i].links || [];
                                    copy[i] = {
                                      ...copy[i],
                                      links: [...links, { label: "Ceremony Link", url: "" }],
                                    };
                                    updateDataSection("awards", copy);
                                  }}
                                  className="glass text-sky rounded-full px-2.5 py-1 text-[10px] font-bold inline-flex items-center gap-1 border border-sky/20 hover:bg-sky/5 transition"
                                >
                                  <Plus className="size-3" /> Add Link
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(aw.links || []).map((lnk: any, lIdx: number) => (
                                  <div key={lIdx} className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={lnk.label || ""}
                                      onChange={(e) => {
                                        const copy = [...selectedProfile.data.awards];
                                        const updatedLinks = [...(copy[i].links || [])];
                                        updatedLinks[lIdx] = { ...updatedLinks[lIdx], label: e.target.value };
                                        copy[i] = { ...copy[i], links: updatedLinks };
                                        updateDataSection("awards", copy);
                                      }}
                                      className="bg-midnight/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-foreground w-36 outline-none focus:border-sky/50"
                                      placeholder="Label (e.g. YouTube)"
                                    />
                                    <input
                                      type="text"
                                      value={lnk.url || ""}
                                      onChange={(e) => {
                                        const copy = [...selectedProfile.data.awards];
                                        const updatedLinks = [...(copy[i].links || [])];
                                        updatedLinks[lIdx] = { ...updatedLinks[lIdx], url: e.target.value };
                                        copy[i] = { ...copy[i], links: updatedLinks };
                                        updateDataSection("awards", copy);
                                      }}
                                      className="flex-1 bg-midnight/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-foreground outline-none focus:border-sky/50"
                                      placeholder="URL (e.g. https://...)"
                                    />
                                    <button
                                      onClick={() => {
                                        const copy = [...selectedProfile.data.awards];
                                        const updatedLinks = [...(copy[i].links || [])];
                                        updatedLinks.splice(lIdx, 1);
                                        copy[i] = { ...copy[i], links: updatedLinks };
                                        updateDataSection("awards", copy);
                                      }}
                                      className="glass p-1.5 rounded-lg text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <CSVImportBox section="awards" />
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION: CERTIFICATES, INITIATIVES, NEWS, ACTIVITIES                 */}
                {/* ========================================================================= */}
                {activeSection === "certificates" && (
                  <SectionArrayEditor
                    sectionKey="certificates"
                    sectionTitle="Certificates"
                    sectionSubtitle="Manage professional certificates and qualifications."
                    itemTemplate={{ image: "", title: "", org: "", description: "", date: "", socialLink: "" }}
                    customFields={[
                      { key: "org", label: "Issuing Organization", placeholder: "e.g. WHRC Headquarters" },
                      { key: "date", label: "Date", placeholder: "e.g. 2026-06-08" },
                      { key: "socialLink", label: "Social Media Link (Optional)", placeholder: "https://instagram.com/..." },
                    ]}
                    selectedProfile={selectedProfile}
                    updateDataSection={updateDataSection}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                )}

                {activeSection === "myInitiatives" && (
                  <InitiativesEditor
                    selectedProfile={selectedProfile}
                    updateDataSection={updateDataSection}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                )}

                {activeSection === "newsArticles" && (
                  <SectionArrayEditor
                    sectionKey="newsArticles"
                    sectionTitle="News Articles"
                    sectionSubtitle="Manage newspaper clippings, headline news, and publication records."
                    itemTemplate={{ image: "", title: "", description: "", source: "", date: "", link: "", socialLink: "" }}
                    customFields={[
                      { key: "source", label: "Publication Source", placeholder: "e.g. Times of India" },
                      { key: "date", label: "Publication Date", placeholder: "e.g. 2026-05-15" },
                      { key: "link", label: "Article Link (Optional)", placeholder: "https://example.com/article" },
                      { key: "socialLink", label: "Social Media Link (Optional)", placeholder: "https://instagram.com/..." },
                    ]}
                    selectedProfile={selectedProfile}
                    updateDataSection={updateDataSection}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                )}

                {activeSection === "recentActivities" && (
                  <SectionArrayEditor
                    sectionKey="recentActivities"
                    sectionTitle="Recent Activities"
                    sectionSubtitle="Manage active stages, recent events, and locations."
                    itemTemplate={{ image: "", title: "", description: "", date: "", location: "", socialLink: "" }}
                    customFields={[
                      { key: "date", label: "Activity Date", placeholder: "e.g. 2026-06-01" },
                      { key: "location", label: "Location", placeholder: "e.g. Guntur, Andhra Pradesh" },
                      { key: "socialLink", label: "Social Media Link (Optional)", placeholder: "https://instagram.com/..." },
                    ]}
                    selectedProfile={selectedProfile}
                    updateDataSection={updateDataSection}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 10: RECENT                                                     */}
                {/* ========================================================================= */}
                {activeSection === "recent" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        Showcase recent activities on the global stage.
                      </span>
                      <button
                        onClick={() => {
                          const newRecent = [
                            ...(selectedProfile.data.recent || []),
                            {
                              title: "New Activity",
                              body: "Details of this event, drive or representation...",
                            },
                          ];
                          updateDataSection("recent", newRecent);
                        }}
                        className="glass text-sky rounded-full px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                      >
                        <Plus className="size-3.5" /> Add Activity
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(selectedProfile.data.recent || []).map((r: any, i: number) => (
                        <div
                          key={i}
                          className="glass p-5 rounded-2xl border-white/5 relative group space-y-3"
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.recent];
                                copy.splice(i, 1);
                                updateDataSection("recent", copy);
                              }}
                              className="glass p-1.5 rounded text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                              Activity Title
                            </label>
                            <input
                              type="text"
                              value={r.title}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.recent];
                                copy[i].title = e.target.value;
                                updateDataSection("recent", copy);
                              }}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-sky/50"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                              Activity Description
                            </label>
                            <textarea
                              value={r.body}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.recent];
                                copy[i].body = e.target.value;
                                updateDataSection("recent", copy);
                              }}
                              rows={3}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-sky/50 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 11: INSPIRATIONS                                               */}
                {/* ========================================================================= */}
                {activeSection === "inspirations" && (
                  <div className="space-y-6">
                    <span className="text-xs text-muted-foreground block mb-4">
                      Add up to 3 core inspirational figures or ancient philosophies (e.g. Ambedkar,
                      Jyotiba Phule).
                    </span>

                    <div className="space-y-6">
                      {(selectedProfile.data.inspirations || []).map((insp: any, i: number) => (
                        <div
                          key={i}
                          className="glass p-6 rounded-3xl border-white/10 space-y-4 relative group"
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const copy = [...selectedProfile.data.inspirations];
                                copy.splice(i, 1);
                                updateDataSection("inspirations", copy);
                              }}
                              className="glass p-1.5 rounded text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                                Inspiration Figure Name
                              </label>
                              <input
                                type="text"
                                value={insp.name}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.inspirations];
                                  copy[i].name = e.target.value;
                                  updateDataSection("inspirations", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-sky/50 text-sky"
                                placeholder="e.g. Dr. B.R. Ambedkar"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                                Famous Philosophical Quote
                              </label>
                              <input
                                type="text"
                                value={insp.quote}
                                onChange={(e) => {
                                  const copy = [...selectedProfile.data.inspirations];
                                  copy[i].quote = e.target.value;
                                  updateDataSection("inspirations", copy);
                                }}
                                className="w-full bg-midnight/30 border border-white/10 rounded-xl px-3 py-2 text-xs italic outline-none focus:border-sky/50"
                                placeholder="Quote..."
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gold uppercase tracking-widest">
                              Relevance & Core Teachings
                            </label>
                            <textarea
                              value={insp.body}
                              onChange={(e) => {
                                const copy = [...selectedProfile.data.inspirations];
                                copy[i].body = e.target.value;
                                updateDataSection("inspirations", copy);
                              }}
                              rows={3}
                              className="w-full bg-midnight/30 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-sky/50 leading-relaxed"
                              placeholder="Describe how this philosophy translates to their leadership story..."
                            />
                          </div>
                        </div>
                      ))}

                      {selectedProfile.data.inspirations?.length < 3 && (
                        <button
                          onClick={() => {
                            const newIns = [
                              ...(selectedProfile.data.inspirations || []),
                              {
                                name: "New Figure",
                                quote: "Famous teaching quote...",
                                body: "Teachings details...",
                              },
                            ];
                            updateDataSection("inspirations", newIns);
                          }}
                          className="glass text-sky w-full rounded-2xl py-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                        >
                          <Plus className="size-3.5" /> Add Figure
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SUBSECTION 12: CONNECT                                                    */}
                {/* ========================================================================= */}
                {activeSection === "connect" && (
                  <div className="space-y-6">
                    <span className="text-xs text-muted-foreground block mb-4">
                      Connect verified handles displaying in the contact blocks and buttons.
                    </span>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Instagram Username
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.data.connect?.instagram || ""}
                          onChange={(e) => {
                            const conn = selectedProfile.data.connect || {};
                            updateDataSection("connect", {
                              ...conn,
                              instagram: e.target.value,
                            });
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground"
                          placeholder="e.g. @dr.ravuribalaraju"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Organisation Website
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.data.connect?.website || ""}
                          onChange={(e) => {
                            const conn = selectedProfile.data.connect || {};
                            updateDataSection("connect", {
                              ...conn,
                              website: e.target.value,
                            });
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground font-mono"
                          placeholder="e.g. whrcheadquarters.org"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Council Website Link
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.data.connect?.council || ""}
                          onChange={(e) => {
                            const conn = selectedProfile.data.connect || {};
                            updateDataSection("connect", {
                              ...conn,
                              council: e.target.value,
                            });
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground font-mono"
                          placeholder="e.g. whrc.co.in"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Facebook Link
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.data.connect?.facebook || ""}
                          onChange={(e) => {
                            const conn = selectedProfile.data.connect || {};
                            updateDataSection("connect", {
                              ...conn,
                              facebook: e.target.value,
                            });
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground font-mono"
                          placeholder="e.g. https://facebook.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          LinkedIn Link
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.data.connect?.linkedin || ""}
                          onChange={(e) => {
                            const conn = selectedProfile.data.connect || {};
                            updateDataSection("connect", {
                              ...conn,
                              linkedin: e.target.value,
                            });
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground font-mono"
                          placeholder="e.g. https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          Twitter / X Link
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.data.connect?.twitter || ""}
                          onChange={(e) => {
                            const conn = selectedProfile.data.connect || {};
                            updateDataSection("connect", {
                              ...conn,
                              twitter: e.target.value,
                            });
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground font-mono"
                          placeholder="e.g. https://x.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gold uppercase tracking-wider block">
                          YouTube Channel Link
                        </label>
                        <input
                          type="text"
                          value={selectedProfile.data.connect?.youtube || ""}
                          onChange={(e) => {
                            const conn = selectedProfile.data.connect || {};
                            updateDataSection("connect", {
                              ...conn,
                              youtube: e.target.value,
                            });
                          }}
                          className="w-full bg-midnight/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-sky/50 outline-none text-foreground font-mono"
                          placeholder="e.g. https://youtube.com/@channel"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-sky uppercase tracking-wider">
                            Custom Social Links
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            Add any other social networks, online articles, or personal profiles.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const conn = selectedProfile.data.connect || {};
                            const customLinks = conn.customLinks || [];
                            updateDataSection("connect", {
                              ...conn,
                              customLinks: [...customLinks, { label: "Custom Handle", url: "" }],
                            });
                          }}
                          className="glass text-sky rounded-full px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 border border-sky/20 hover:bg-sky/5 transition"
                        >
                          <Plus className="size-3" /> Add Custom Link
                        </button>
                      </div>
                      <div className="space-y-4">
                        {(selectedProfile.data.connect?.customLinks || []).map((link: any, idx: number) => (
                          <div key={idx} className="flex gap-4 items-center bg-midnight/30 p-3 rounded-2xl border border-white/5">
                            <input
                              type="text"
                              value={link.label || ""}
                              onChange={(e) => {
                                const conn = selectedProfile.data.connect || {};
                                const customLinks = [...(conn.customLinks || [])];
                                customLinks[idx] = { ...customLinks[idx], label: e.target.value };
                                updateDataSection("connect", {
                                  ...conn,
                                  customLinks,
                                });
                              }}
                              className="bg-midnight/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-sky/50 outline-none text-foreground font-bold w-48"
                              placeholder="Link Label (e.g. Medium)"
                            />
                            <input
                              type="text"
                              value={link.url || ""}
                              onChange={(e) => {
                                const conn = selectedProfile.data.connect || {};
                                const customLinks = [...(conn.customLinks || [])];
                                customLinks[idx] = { ...customLinks[idx], url: e.target.value };
                                updateDataSection("connect", {
                                  ...conn,
                                  customLinks,
                                });
                              }}
                              className="flex-1 bg-midnight/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-sky/50 outline-none text-foreground font-mono"
                              placeholder="URL (e.g. https://...)"
                            />
                            <button
                              onClick={() => {
                                const conn = selectedProfile.data.connect || {};
                                const customLinks = [...(conn.customLinks || [])];
                                customLinks.splice(idx, 1);
                                updateDataSection("connect", {
                                  ...conn,
                                  customLinks,
                                });
                              }}
                              className="glass p-2.5 rounded-xl text-red-400 hover:bg-red-950/20 hover:text-red-300 transition border border-red-500/20"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Save Action buttons */}
              <div className="border-t border-white/5 mt-10 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="size-3.5 text-sky shrink-0" />
                  Your changes are staged. Click Publish to write directly to PostgreSQL.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (confirm("Discard unsaved changes?")) {
                        if (props.onDiscard) props.onDiscard();
                      }
                    }}
                    className="glass rounded-full px-6 py-3 text-xs font-bold text-foreground hover:bg-white/10 transition"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="btn-premium rounded-full px-6 py-3 text-xs font-bold inline-flex items-center gap-2 text-white"
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Publish Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
  );
}
