import { useState, useEffect } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SEO } from "../components/SEO";
import {
  getProfiles,
  saveProfile,
  deleteProfile,
  uploadImage,
  getCategories,
  saveCategory,
  deleteCategory,
  saveSubcategory,
  deleteSubcategory,
  loginAdmin,
  getProfessionalExpertise,
  saveProfessionalExpertise,
  resolveImageUrl,
} from "../services/api";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Globe2,
  ChevronLeft,
  ArrowUpRight,
  Upload,
  Save,
  Loader2,
  ChevronUp,
  ChevronDown,
  Info,
  Award,
  Users,
  BookOpen,
  CalendarDays,
  FileText,
  Megaphone,
  Share2,
  User,
  Activity,
  UserCheck,
  Quote,
  Layers,
  Sparkles,
  Images,
  QrCode,
  X,
  Lock,
  LogOut,
  Settings,
  CheckCircle2,
  Languages,
  Clock,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { DynamicIcon, POPULAR_LEADER_ICONS } from "../components/DynamicIcon";
import { FamilyDetailsEditor } from "../components/FamilyDetailsEditor";

const adminSearchSchema = z.object({
  mode: z.enum(["list", "edit", "expertise-edit", "family-edit"]).catch("list"),
  profileId: z.number().optional(),
  section: z.string().catch("general"),
});

export const Route = createFileRoute("/admin")({
  validateSearch: (search) => adminSearchSchema.parse(search),
  loader: async () => {
    try {
      const results = await Promise.allSettled([
        getProfiles(),
        getCategories(),
      ]);
      const profiles = results[0].status === 'fulfilled' ? results[0].value : [];
      const categories = results[1].status === 'fulfilled' ? results[1].value : [];
      return { profiles, categories };
    } catch (err) {
      console.error("Failed to load admin data:", err);
      return { profiles: [], categories: [] };
    }
  },
  component: AdminDashboard,
});

const defaultProfileTemplate = {
  name: "Dr. New Leader",
  slug: "dr-new-leader",
  title: "Country Director · Organisation Name",
  subtitle: "Strategic Leader · Social Reformer · Hyderabad, Telangana.",
  portrait: "/assets/leader-portrait.jpg",
  data: {
    roles: [
      { icon: "ShieldCheck", label: "Human Rights Advocate" },
      { icon: "Briefcase", label: "Entrepreneur" },
    ],
    stats: [
      { value: "2026", label: "Organisation Founded" },
      { value: "1,000+", label: "Youth Mobilised" },
      { value: "5+", label: "Years of Advocacy" },
    ],
    bio: [
      { k: "Name", v: "Dr. New Leader" },
      { k: "Education", v: "MA Sociology" },
      { k: "Present location", v: "Hyderabad, India" },
    ],
    biography: {
      earlyLife: "Early life details...",
      career: "Career & professional journey details...",
    },
    timeline: [
      {
        period: "2026 – Present",
        title: "Founder & Chairman — Org Name",
        body: "Built the grassroots organisation from the ground up, directing human rights campaigns...",
        highlight: "Founded Grassroots Movement",
        icon: "ShieldCheck",
        span: "lg:col-span-2",
      },
    ],
    orgFocus: ["Grievance Redressal", "Legal Aid", "Women & Child Rights"],
    initiatives: [
      {
        icon: "Megaphone",
        title: "Awareness Campaigns",
        body: "Conducting large-scale rights awareness drives targeting youth in rural communities.",
      },
    ],
    awards: [
      {
        year: "2026",
        title: "Global Leadership Award",
        org: "International Summit",
        body: "Honoured for outstanding commitment to grassroots social reform.",
        img: "",
      },
    ],
    recent: [
      {
        title: "National Leadership Summit Participation",
        body: "Addressed delegates on the integration of ethical entrepreneurship with community development.",
      },
    ],
    inspirations: [
      {
        name: "Dr. B.R. Ambedkar",
        quote: "Educate. Agitate. Organise.",
        body: "Guided by servant-leadership models built on equality and education.",
      },
    ],
    connect: {
      instagram: "@username",
      website: "example.org",
      council: "example.com",
    },
    certificates: [],
    myInitiatives: [],
    newsArticles: [],
    recentActivities: [],
  },
};

type ActiveSubSection =
  | "general"
  | "roles"
  | "stats"
  | "bio"
  | "biography"
  | "timeline"
  | "focus"
  | "initiatives"
  | "awards"
  | "certificates"
  | "myInitiatives"
  | "newsArticles"
  | "recentActivities"
  | "recent"
  | "inspirations"
  | "connect"
  | "csvImport";

// Standalone SectionArrayEditor Component for Certificates, Initiatives, News, and Recent Activities
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

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter the administrator password");
      return;
    }
    setLoading(true);
    try {
      const data = await loginAdmin(password);
      if (data.token) {
        onLogin(data.token);
        toast.success("Welcome back, Administrator!");
      } else {
        toast.error("Invalid response from authentication server");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative p-6 bg-midnight overflow-hidden">
      {/* Background decoration blobs */}
      <div className="blob bg-[#0070c0] w-[500px] h-[500px] -top-32 -right-32 opacity-15" />
      <div className="blob bg-[#b38f36] w-[600px] h-[600px] -bottom-32 -left-32 opacity-10" />

      <div className="w-full max-w-md glass-strong rounded-3xl p-8 md:p-10 border-white/10 shadow-2xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-16 rounded-3xl btn-premium grid place-items-center mb-4 shadow-lg shadow-sky/20">
            <Globe2 className="size-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gradient">Global Leader Sphere</h2>
          <p className="text-sm text-foreground/60 mt-1">Authorized Administration Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gold uppercase tracking-wider block">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-white/90 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:border-sky focus:ring-4 focus:ring-sky/10 outline-none text-veil transition-all shadow-inner placeholder:text-foreground/30"
                disabled={loading}
                autoFocus
              />
              <Lock className="size-5 text-foreground/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-sky-dark active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Unlock Admin Panel
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs text-sky font-semibold hover:text-[#005c9e] inline-flex items-center gap-1 transition"
          >
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExpertiseArrayEditor({
  sectionKey,
  sectionTitle,
  sectionSubtitle,
  items,
  setItems,
  itemTemplate,
  customFields,
  maxItems = 25,
  showFeaturedSelector = false,
  sectionVisibility,
  setSectionVisibility,
  themeColor = "sky",
}: {
  sectionKey: string;
  sectionTitle: string;
  sectionSubtitle: string;
  items: any[];
  setItems: (val: any[]) => void;
  itemTemplate: any;
  customFields: { key: string; label: string; placeholder?: string; type?: "text" | "textarea" | "image" }[];
  maxItems?: number;
  showFeaturedSelector?: boolean;
  sectionVisibility: Record<string, boolean>;
  setSectionVisibility: (val: Record<string, boolean>) => void;
  themeColor?: "sky" | "emerald";
}) {
  const isVisible = sectionVisibility[sectionKey] !== false;

  const handleAddItem = () => {
    if (items.length >= maxItems) {
      toast.error(`Maximum limit of ${maxItems} items reached for ${sectionTitle}!`);
      return;
    }
    const newItems = [...items, { ...itemTemplate, order: items.length + 1 }];
    setItems(newItems);
  };

  const handleDeleteItem = (idx: number) => {
    const copy = [...items];
    copy.splice(idx, 1);
    const updated = copy.map((item, i) => ({ ...item, order: i + 1 }));
    setItems(updated);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...items];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;
    const updated = copy.map((item, i) => ({ ...item, order: i + 1 }));
    setItems(updated);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const copy = [...items];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;
    const updated = copy.map((item, i) => ({ ...item, order: i + 1 }));
    setItems(updated);
  };

  const handleFieldChange = (idx: number, field: string, value: any) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: value };
    setItems(copy);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number, fieldKey: string) => {
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

    toast.loading("Uploading image...", { id: "img-upload" });

    try {
      const res = await uploadImage(file);
      
      let publicId = "";
      const urlParts = res.url.split("/portraits/");
      if (urlParts.length > 1) {
        publicId = "portraits/" + urlParts[1].split(".")[0];
      } else {
        publicId = "portraits/" + res.url.split("/").pop().split(".")[0];
      }

      const imgMetadata = {
        public_id: publicId,
        secure_url: res.url,
        alt_text: "",
        caption: "",
        uploaded_at: new Date().toISOString()
      };

      handleFieldChange(idx, fieldKey, imgMetadata);
      toast.success("Image uploaded successfully!", { id: "img-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.", { id: "img-upload" });
    }
  };

  return (
    <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 flex-wrap gap-2">
        <div>
          <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${themeColor === "emerald" ? "text-emerald-600" : "text-sky"}`}>
            {sectionTitle}
          </h4>
          <p className="text-[10px] text-foreground/50">
            {sectionSubtitle} (Max {maxItems})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setSectionVisibility({ ...sectionVisibility, [sectionKey]: e.target.checked })}
              className={`rounded border-white/10 bg-midnight focus:ring-2 ${
                themeColor === "emerald" 
                  ? "text-emerald-600 focus:ring-emerald-500" 
                  : "text-sky focus:ring-sky"
              }`}
            />
            <span>Show Section</span>
          </label>
          {isVisible && (
            <button
              onClick={handleAddItem}
              className={`glass rounded-full px-3 py-1.5 text-[10px] font-bold inline-flex items-center gap-1 border transition ${
                themeColor === "emerald"
                  ? "text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/5"
                  : "text-sky border-sky/20 hover:bg-sky/5"
              }`}
            >
              <Plus className="size-3" /> Add Item
            </button>
          )}
        </div>
      </div>

      {!isVisible && (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs text-foreground/40">
          This section is currently hidden from public display.
        </div>
      )}

      {isVisible && items.length === 0 && (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs text-foreground/50">
          No items added yet. Click "Add Item" to add new content.
        </div>
      )}

      {isVisible && items.length > 0 && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {items.map((item: any, idx: number) => {
            return (
              <div
                key={idx}
                className="glass p-5 rounded-2xl border-white/10 space-y-4 relative group"
              >
                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {showFeaturedSelector && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-amber-400 hover:text-gold transition select-none mr-2">
                      <input
                        type="checkbox"
                        checked={item.featured === true}
                        onChange={() => {
                          const updated = items.map((itm, i) => ({
                            ...itm,
                            featured: i === idx
                          }));
                          setItems(updated);
                        }}
                        className="rounded border-white/10 bg-midnight text-gold focus:ring-gold size-3"
                      />
                      <span>Featured</span>
                    </label>
                  )}
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="glass p-1.5 rounded-lg text-foreground hover:bg-white/10 disabled:opacity-20 transition border border-white/10"
                    title="Move Up"
                  >
                    <ChevronUp className="size-3" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === items.length - 1}
                    className="glass p-1.5 rounded-lg text-foreground hover:bg-white/10 disabled:opacity-20 transition border border-white/10"
                    title="Move Down"
                  >
                    <ChevronDown className="size-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(idx)}
                    className="glass p-1.5 rounded-lg text-red-400 hover:bg-red-950/20 hover:text-red-300 transition border border-white/10"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 pr-20">
                  {customFields.map((field) => {
                    const val = item[field.key];
                    if (field.type === "image") {
                      // Normalise legacy image string url to metadata object
                      const imgObj = typeof val === "string" 
                        ? { secure_url: val, public_id: "", alt_text: "", caption: "", uploaded_at: "" }
                        : val || { secure_url: "", public_id: "", alt_text: "", caption: "", uploaded_at: "" };
                      
                      return (
                        <div key={field.key} className="space-y-2">
                          <label className="text-[11px] font-bold text-foreground/70">{field.label}</label>
                          {imgObj.secure_url ? (
                            <div className="space-y-2">
                              <div className="relative size-16 rounded-xl overflow-hidden border border-white/10">
                                <img
                                  src={imgObj.secure_url}
                                  alt={imgObj.alt_text || ""}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange(idx, field.key, null)}
                                  className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity grid place-items-center text-red-400 font-bold text-[9px]"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Image Alt Text (SEO)..."
                                  value={imgObj.alt_text || ""}
                                  onChange={(e) => handleFieldChange(idx, field.key, { ...imgObj, alt_text: e.target.value })}
                                  className="w-full bg-midnight border border-white/10 rounded-lg px-2 py-1 text-[11px] text-foreground outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Caption..."
                                  value={imgObj.caption || ""}
                                  onChange={(e) => handleFieldChange(idx, field.key, { ...imgObj, caption: e.target.value })}
                                  className="w-full bg-midnight border border-white/10 rounded-lg px-2 py-1 text-[11px] text-foreground outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <input
                                type="file"
                                accept="image/*"
                                id={`file-${sectionKey}-${idx}-${field.key}`}
                                onChange={(e) => handleFileUpload(e, idx, field.key)}
                                className="hidden"
                              />
                              <label
                                htmlFor={`file-${sectionKey}-${idx}-${field.key}`}
                                className="glass hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-foreground/80 hover:text-white cursor-pointer transition inline-flex items-center gap-1"
                              >
                                <Upload className={`size-3 ${themeColor === "emerald" ? "text-emerald-600" : "text-sky"}`} /> Upload Image
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (field.type === "textarea") {
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground/70">{field.label}</label>
                          <textarea
                            placeholder={field.placeholder}
                            value={val || ""}
                            onChange={(e) => handleFieldChange(idx, field.key, e.target.value)}
                            rows={3}
                            className="w-full bg-midnight border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-foreground/90 font-sans"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[11px] font-bold text-foreground/70">{field.label}</label>
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={val || ""}
                          onChange={(e) => handleFieldChange(idx, field.key, e.target.value)}
                          className="w-full bg-midnight border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-foreground"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfessionalExpertiseEditor({
  profileId,
  profileName,
  profileSlug,
  onCancel,
  onSave,
  isSaving,
}: {
  profileId: number;
  profileName: string;
  profileSlug: string;
  onCancel: () => void;
  onSave: (data: any, isPublish: boolean) => Promise<void>;
  isSaving: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [activeExpertiseSection, setActiveExpertiseSection] = useState("overview");

  // Form states
  const [roles, setRoles] = useState<any[]>([]);
  const [expertiseAreas, setExpertiseAreas] = useState<any[]>([]);
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [industriesServed, setIndustriesServed] = useState<any[]>([]);
  const [whoIHelp, setWhoIHelp] = useState<any[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState("");
  const [professionalSummary, setProfessionalSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isAvailableForConsultation, setIsAvailableForConsultation] = useState(false);
  const [ctaText, setCtaText] = useState("Book Consultation");
  const [impactStatistics, setImpactStatistics] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // New spec states
  const [status, setStatus] = useState("draft");
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [contactTypes, setContactTypes] = useState<string[]>([]);
  const [professionalJourney, setProfessionalJourney] = useState<any[]>([]);
  const [currentActivities, setCurrentActivities] = useState<any[]>([]);
  const [howIHelp, setHowIHelp] = useState<any[]>([]);
  const [servicesConsultations, setServicesConsultations] = useState<any[]>([]);
  const [professionalGallery, setProfessionalGallery] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [mediaInterviews, setMediaInterviews] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [organizationsAssociations, setOrganizationsAssociations] = useState<any[]>([]);
  const [contactCollaboration, setContactCollaboration] = useState<any>({ ctaText: "", description: "", image: null });

  // Input states for legacy add
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [newRoleIcon, setNewRoleIcon] = useState("ShieldCheck");
  const [newKeyword, setNewKeyword] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getProfessionalExpertise(profileId);
        setRoles(data.roles || []);
        
        // Convert legacy expertise_areas string[] to object[]
        const rawExpertise = data.expertise_areas || [];
        setExpertiseAreas(
          rawExpertise.map((e: any) =>
            typeof e === "string" ? { name: e, description: "", icon: "ShieldCheck" } : e
          )
        );

        setServicesOffered(data.services_offered || []);

        // Convert legacy industries_served string[] to object[]
        const rawIndustries = data.industries_served || [];
        setIndustriesServed(
          rawIndustries.map((ind: any) =>
            typeof ind === "string" ? { name: ind, description: "", image: null } : ind
          )
        );

        // Convert legacy who_i_help string[] to object[]
        const rawWhoIHelp = data.who_i_help || [];
        setWhoIHelp(
          rawWhoIHelp.map((w: any) =>
            typeof w === "string" ? { name: w, description: "", image: null } : w
          )
        );

        setLanguages(data.languages || []);
        setYearsExperience(data.years_experience || "");
        setProfessionalSummary(data.professional_summary || "");
        setKeywords(data.keywords || []);
        setIsAvailableForConsultation(data.is_available_for_consultation || false);
        setCtaText(data.cta_text || "Book Consultation");
        
        // Convert legacy impact stats
        const rawStats = data.impact_statistics || [];
        setImpactStatistics(
          rawStats.map((s: any) =>
            s.value ? { number: s.value, label: s.label } : s
          )
        );

        // Convert legacy achievements string[] to object[]
        const rawAchievements = data.achievements || [];
        setAchievements(
          rawAchievements.map((ach: any) =>
            typeof ach === "string" ? { title: ach, description: "", image: null } : ach
          )
        );

        setFeaturedServices(data.featured_services || []);
        setIsPublished(data.is_published || false);

        // Map spec states
        setStatus(data.status || "draft");
        setSectionVisibility(data.section_visibility || {});
        setContactTypes(data.contact_types || []);
        setProfessionalJourney(data.professional_journey || []);
        setCurrentActivities(data.current_activities || []);
        setHowIHelp(data.how_i_help || []);
        setServicesConsultations(data.services_consultations || []);
        setProfessionalGallery(data.professional_gallery || []);
        setPublications(data.publications || []);
        setMediaInterviews(data.media_interviews || []);
        setTestimonials(data.testimonials || []);
        setOrganizationsAssociations(data.organizations_associations || []);
        setContactCollaboration(data.contact_collaboration || { ctaText: "", description: "", image: null });

      } catch (err) {
        toast.error("Failed to load professional expertise data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 glass-strong rounded-3xl p-12 border-white/10">
        <Loader2 className="size-8 animate-spin text-sky" />
        <p className="text-sm font-medium text-foreground/50">Loading professional expertise data...</p>
      </div>
    );
  }

  // Textarea helper
  const insertTextHelper = (before: string, after: string = "") => {
    const textarea = document.getElementById("professionalSummaryTextarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    setProfessionalSummary(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 10);
  };

  const moveItem = (list: any[], setList: (val: any[]) => void, index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const copy = [...list];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setList(copy);
  };

  const addRole = () => {
    if (!newRoleLabel.trim()) return;
    setRoles([...roles, { id: `role-${Date.now()}`, label: newRoleLabel.trim(), icon: newRoleIcon }]);
    setNewRoleLabel("");
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    if (!keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
    }
    setNewKeyword("");
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const addCustomLanguage = () => {
    if (!newLanguage.trim()) return;
    if (!languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
    }
    setNewLanguage("");
  };

  const getProfileStrength = () => {
    let completed = 0;
    if (roles.length > 0) completed++;
    if (professionalJourney.length > 0) completed++;
    if (currentActivities.length > 0) completed++;
    if (expertiseAreas.length > 0) completed++;
    if (howIHelp.length > 0) completed++;
    if (servicesConsultations.length > 0) completed++;
    if (professionalGallery.length > 0) completed++;
    if (impactStatistics.length > 0) completed++;
    if (achievements.length > 0) completed++;
    if (publications.length > 0) completed++;
    if (mediaInterviews.length > 0) completed++;
    if (testimonials.length > 0) completed++;
    if (organizationsAssociations.length > 0) completed++;
    if (whoIHelp.length > 0) completed++;
    if (languages.length > 0) completed++;
    if (industriesServed.length > 0) completed++;
    if (keywords.length > 0) completed++;
    if (contactCollaboration?.ctaText || contactCollaboration?.description) completed++;

    return Math.round((completed / 18) * 100);
  };

  const toggleContactType = (type: string) => {
    if (contactTypes.includes(type)) {
      setContactTypes(contactTypes.filter((t) => t !== type));
    } else {
      setContactTypes([...contactTypes, type]);
    }
  };

  const handleContactBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size exceeds 2MB limit!");
      return;
    }
    toast.loading("Uploading banner...", { id: "banner-upload" });
    try {
      const res = await uploadImage(file);
      let publicId = "portraits/" + res.url.split("/").pop().split(".")[0];
      setContactCollaboration({
        ...contactCollaboration,
        image: {
          public_id: publicId,
          secure_url: res.url,
          alt_text: "Contact Banner",
          caption: "",
          uploaded_at: new Date().toISOString()
        }
      });
      toast.success("Banner uploaded successfully!", { id: "banner-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Banner upload failed.", { id: "banner-upload" });
    }
  };

  const buildPayload = (publish: boolean) => {
    return {
      roles,
      expertise_areas: expertiseAreas,
      services_offered: servicesOffered,
      industries_served: industriesServed,
      who_i_help: whoIHelp,
      languages,
      years_experience: yearsExperience,
      professional_summary: professionalSummary,
      keywords,
      is_available_for_consultation: isAvailableForConsultation,
      cta_text: ctaText,
      impact_statistics: impactStatistics,
      achievements,
      featured_services: featuredServices,
      is_published: publish,
      status: publish ? "published" : status,
      section_visibility: sectionVisibility,
      contact_types: contactTypes,
      professional_journey: professionalJourney,
      current_activities: currentActivities,
      how_i_help: howIHelp,
      services_consultations: servicesConsultations,
      professional_gallery: professionalGallery,
      publications,
      media_interviews: mediaInterviews,
      testimonials,
      organizations_associations: organizationsAssociations,
      contact_collaboration: contactCollaboration,
    };
  };

  const handleSaveClick = (publish: boolean) => {
    onSave(buildPayload(publish), publish);
  };

  const handlePreviewClick = async () => {
    try {
      await saveProfessionalExpertise(profileId, buildPayload(isPublished));
      toast.success("Draft saved! Opening preview...");
      if (typeof window !== "undefined") {
        window.open(`/leader/${profileSlug}/professional-expertise?preview=true`, "_blank");
      }
    } catch (err) {
      toast.error("Failed to save draft for preview.");
      console.error(err);
    }
  };

  const strength = getProfileStrength();

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gradient">
            Manage Professional Expertise
          </h2>
          <p className="text-sm text-foreground/60 mt-1">
            Editing credentials of <span className="text-emerald-500 font-bold">{profileName}</span> (/{profileSlug})
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2 bg-midnight border border-white/10 rounded-xl px-3 py-2 text-xs">
            <span className="text-foreground/50 uppercase font-bold">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-foreground outline-none font-bold cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <button
            onClick={onCancel}
            className="glass rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-white/10 transition"
          >
            Cancel
          </button>
          
          <button
            onClick={() => handleSaveClick(false)}
            disabled={isSaving}
            className="glass rounded-xl px-5 py-2.5 text-xs font-bold text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/5 transition inline-flex items-center gap-1.5"
          >
            <Save className="size-3.5" /> Save Draft
          </button>

          <button
            onClick={handlePreviewClick}
            disabled={isSaving}
            className="glass rounded-xl px-5 py-2.5 text-xs font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/5 transition inline-flex items-center gap-1.5"
          >
            <ArrowUpRight className="size-3.5" /> Save & Preview
          </button>

          <button
            onClick={() => handleSaveClick(true)}
            disabled={isSaving}
            className="btn-premium rounded-xl px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/15 border-none"
          >
            <Sparkles className="size-3.5" /> Publish Live
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Category Switcher */}
        <div className="lg:col-span-3 glass-strong rounded-3xl p-5 border-white/10 space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">
            Expertise Sections
          </div>

          {[
            { id: "overview", label: "Overview & Status", icon: Settings },
            { id: "roles", label: "Professional Roles", icon: UserCheck },
            { id: "languages", label: "14. Languages", icon: Languages },
            { id: "summary", label: "Professional Summary", icon: FileText },
            { id: "whoIHelp", label: "13. Who I Help", icon: User },
            { id: "journey", label: "1. Journey Timeline", icon: Clock },
            { id: "activities", label: "2. Current Activities", icon: CalendarDays },
            { id: "expertise", label: "3. Areas of Expertise", icon: Sparkles },
            { id: "howIHelp", label: "4. How I Help", icon: CheckCircle2 },
            { id: "services", label: "5. Services Offered", icon: Layers },
            { id: "gallery", label: "6. Professional Gallery", icon: Images },
            { id: "stats", label: "7. Impact Statistics", icon: Activity },
            { id: "achievements", label: "8. Achievements", icon: Award },
            { id: "publications", label: "9. Publications & Books", icon: BookOpen },
            { id: "media", label: "10. Media & Interviews", icon: Megaphone },
            { id: "testimonials", label: "11. Testimonials", icon: Quote },
            { id: "orgs", label: "12. Organizations", icon: Globe2 },
            { id: "industries", label: "15. Industries Served", icon: ShieldCheck },
            { id: "keywords", label: "16. Keywords & Tags", icon: QrCode },
            { id: "contact", label: "17. Contact & Collaboration", icon: Share2 },
          ].map((sect) => {
            const Icon = sect.icon;
            return (
              <button
                key={sect.id}
                type="button"
                onClick={() => setActiveExpertiseSection(sect.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition text-[13px] font-semibold flex items-center gap-3 cursor-pointer ${
                  activeExpertiseSection === sect.id
                    ? "bg-linear-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/15"
                    : "hover:bg-emerald-500/5 text-foreground/70"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    activeExpertiseSection === sect.id ? "text-white" : "text-emerald-600/60 dark:text-emerald-400/60"
                  }`}
                />
                <span>{sect.label}</span>
              </button>
            );
          })}

          <div className="pt-6 border-t border-white/5 mt-6">
            <button
              onClick={() => handleSaveClick(true)}
              disabled={isSaving}
              className="btn-premium w-full rounded-2xl py-3.5 font-bold text-sm inline-flex items-center justify-center gap-2 text-white bg-linear-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/15 cursor-pointer border-none"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Publish Expertise
            </button>
          </div>
        </div>

        {/* Right Editor Panels */}
        <div className="lg:col-span-9 glass-strong rounded-3xl p-8 border-white/10 min-h-[600px] flex flex-col justify-between">
          <div>
            {/* Section Header */}
            <div className="border-b border-white/5 pb-6 mb-8 flex items-center justify-between">
              <div>
                <span className="chip py-1! px-2.5! text-[10px] font-bold text-emerald-600 bg-emerald-500/5 border-emerald-500/20 uppercase tracking-wider mb-2">
                  Expertise Section Editor
                </span>
                <h2 className="font-display text-2xl font-bold text-gradient capitalize">
                  {activeExpertiseSection === "orgs"
                    ? "Organizations & Associations"
                    : activeExpertiseSection === "keywords"
                      ? "Keywords & Tags"
                      : activeExpertiseSection === "summary"
                        ? "Professional Summary"
                        : activeExpertiseSection === "contact"
                          ? "Contact & Collaboration"
                          : activeExpertiseSection === "journey"
                            ? "Professional Journey Timeline"
                            : `${activeExpertiseSection} Details`}
                </h2>
              </div>
              <div className="text-xs text-foreground/50">
                Leader Profile ID:{" "}
                <span className="font-mono text-emerald-500 font-bold">
                  {profileId}
                </span>
              </div>
            </div>

            {/* CONDITIONAL RENDER PANELS */}
            {activeExpertiseSection === "overview" && (
              <div className="space-y-6 animate-fade-in">
                {/* Strength Meter */}
                <div className="glass p-6 rounded-3xl border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-600 uppercase">
                    <span>Profile Strength Meter</span>
                    <span>{strength}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-emerald-600 to-teal-500 transition-all duration-500" 
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-foreground/50">
                    Fill out all 18 sections to achieve 100% complete strength and maximize SEO discoverability.
                  </p>
                </div>

                {/* Global Visibility Map */}
                <div className="glass p-6 rounded-3xl border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase border-b border-white/5 pb-2">Global Visibility Map</h4>
                  <p className="text-[11px] text-foreground/50 mb-3">
                    Check or uncheck sections to show or hide them from the public website profile.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] font-semibold text-foreground/80">
                    {[
                      { k: "roles", l: "Roles" },
                      { k: "languages", l: "Languages" },
                      { k: "summary", l: "Summary" },
                      { k: "whoIHelp", l: "Who I Help" },
                      { k: "journey", l: "Journey" },
                      { k: "activities", l: "Activities" },
                      { k: "expertise", l: "Expertise" },
                      { k: "howIHelp", l: "How I Help" },
                      { k: "services", l: "Services" },
                      { k: "gallery", l: "Gallery" },
                      { k: "stats", l: "Statistics" },
                      { k: "achievements", l: "Achievements" },
                      { k: "publications", l: "Publications" },
                      { k: "media", l: "Media" },
                      { k: "testimonials", l: "Testimonials" },
                      { k: "orgs", l: "Organizations" },
                      { k: "industries", l: "Industries" },
                      { k: "keywords", l: "Keywords" },
                      { k: "contact", l: "Contact" },
                    ].map((item) => (
                      <label key={item.k} className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-400 transition">
                        <input
                          type="checkbox"
                          checked={sectionVisibility[item.k] !== false}
                          onChange={(e) => setSectionVisibility({ ...sectionVisibility, [item.k]: e.target.checked })}
                          className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3.5"
                        />
                        <span>{item.l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeExpertiseSection === "roles" && (
              <div className="glass p-6 rounded-3xl border-white/5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">Professional Roles</h3>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sectionVisibility.roles !== false}
                      onChange={(e) => setSectionVisibility({ ...sectionVisibility, roles: e.target.checked })}
                      className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3"
                    />
                    <span>Show Section</span>
                  </label>
                </div>
                {sectionVisibility.roles !== false ? (
                  <>
                    <p className="text-[11px] text-foreground/50">
                      Provide dynamic roles to be displayed under the leader's name (e.g., CEO, Author, Consultant).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. AI Consultant"
                        value={newRoleLabel}
                        onChange={(e) => setNewRoleLabel(e.target.value)}
                        className="flex-1 bg-midnight border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none text-foreground focus:border-emerald-500/50"
                      />
                      <select
                        value={newRoleIcon}
                        onChange={(e) => setNewRoleIcon(e.target.value)}
                        className="bg-midnight border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground/80 outline-none cursor-pointer focus:border-emerald-500/50"
                      >
                        {POPULAR_LEADER_ICONS.map((i) => (
                          <option key={i.name} value={i.name}>
                            {i.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addRole}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {roles.map((r, index) => (
                        <div
                          key={r.id || index}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <DynamicIcon name={r.icon} className="size-4 text-emerald-600" />
                            <span>{r.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveItem(roles, setRoles, index, "up")}
                              disabled={index === 0}
                              className="p-1.5 hover:bg-white/5 text-foreground/50 hover:text-white rounded disabled:opacity-20"
                            >
                              <ChevronUp className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(roles, setRoles, index, "down")}
                              disabled={index === roles.length - 1}
                              className="p-1.5 hover:bg-white/5 text-foreground/50 hover:text-white rounded disabled:opacity-20"
                            >
                              <ChevronDown className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRoles(roles.filter((role) => role.id !== r.id))}
                              className="p-1.5 hover:bg-red-950/20 text-red-400 rounded"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs text-foreground/40">
                    This section is hidden.
                  </div>
                )}
              </div>
            )}

            {activeExpertiseSection === "journey" && (
              <ExpertiseArrayEditor
                sectionKey="journey"
                sectionTitle="1. Professional Journey"
                sectionSubtitle="Show professional growth over time."
                items={professionalJourney}
                setItems={setProfessionalJourney}
                themeColor="emerald"
                itemTemplate={{ title: "", organization: "", startDate: "", endDate: "", description: "", image: null }}
                customFields={[
                  { key: "title", label: "Role Title", placeholder: "e.g. Senior Consultant" },
                  { key: "organization", label: "Organization/Company", placeholder: "e.g. Apollo Hospital" },
                  { key: "startDate", label: "Start Year", placeholder: "e.g. 2010" },
                  { key: "endDate", label: "End Year (or 'Present')", placeholder: "e.g. 2018" },
                  { key: "description", label: "Description", type: "textarea", placeholder: "Explain your key contributions..." },
                  { key: "image", label: "Featured Image", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "activities" && (
              <ExpertiseArrayEditor
                sectionKey="activities"
                sectionTitle="2. Current Activities"
                sectionSubtitle="Show what you are currently doing (Max 25 items)."
                items={currentActivities}
                setItems={setCurrentActivities}
                themeColor="emerald"
                maxItems={25}
                itemTemplate={{ title: "", description: "", image: null, date: "" }}
                customFields={[
                  { key: "title", label: "Activity Title", placeholder: "e.g. Meditation Training Program" },
                  { key: "date", label: "Date / Frequency", placeholder: "e.g. Weekly or Oct 2025" },
                  { key: "description", label: "Description", type: "textarea", placeholder: "Describe the activity..." },
                  { key: "image", label: "Featured Image", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "expertise" && (
              <ExpertiseArrayEditor
                sectionKey="expertise"
                sectionTitle="3. Areas of Expertise"
                sectionSubtitle="Show core specializations."
                items={expertiseAreas}
                setItems={setExpertiseAreas}
                themeColor="emerald"
                itemTemplate={{ name: "", description: "", icon: "ShieldCheck" }}
                customFields={[
                  { key: "name", label: "Expertise Domain Name", placeholder: "e.g. Meditation or Civic Advocacy" },
                  { key: "description", label: "Short Description", type: "textarea", placeholder: "Explain this capability..." },
                  { key: "icon", label: "Icon Class", placeholder: "e.g. ShieldCheck, Briefcase, Users, Heart" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "howIHelp" && (
              <ExpertiseArrayEditor
                sectionKey="howIHelp"
                sectionTitle="4. How I Help"
                sectionSubtitle="Explain practical value to visitors."
                items={howIHelp}
                setItems={setHowIHelp}
                themeColor="emerald"
                itemTemplate={{ name: "", description: "", image: null }}
                customFields={[
                  { key: "name", label: "Service Name", placeholder: "e.g. Spiritual Guidance" },
                  { key: "description", label: "Description", type: "textarea", placeholder: "Explain how you deliver value..." },
                  { key: "image", label: "Icon/Image (Optional)", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "services" && (
              <ExpertiseArrayEditor
                sectionKey="services"
                sectionTitle="5. Services & Consultations"
                sectionSubtitle="Display professional offerings."
                items={servicesConsultations}
                setItems={setServicesConsultations}
                themeColor="emerald"
                showFeaturedSelector={true}
                itemTemplate={{ title: "", description: "", image: null, ctaText: "Book Consultation", featured: false }}
                customFields={[
                  { key: "title", label: "Service Title", placeholder: "e.g. AI Business Automation" },
                  { key: "ctaText", label: "CTA Button Text", placeholder: "e.g. Apply for Mentorship or Connect" },
                  { key: "description", label: "Description", type: "textarea", placeholder: "Describe the scope and deliverables..." },
                  { key: "image", label: "Service Banner Image", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "gallery" && (
              <ExpertiseArrayEditor
                sectionKey="gallery"
                sectionTitle="6. Professional Gallery"
                sectionSubtitle="Show real professional work (Max 25 items)."
                items={professionalGallery}
                setItems={setProfessionalGallery}
                themeColor="emerald"
                maxItems={25}
                itemTemplate={{ image: null, title: "", description: "", date: "" }}
                customFields={[
                  { key: "title", label: "Photo Label", placeholder: "e.g. Meditation Workshop Guntur" },
                  { key: "date", label: "Event Date", placeholder: "e.g. June 2026" },
                  { key: "description", label: "Caption / Description", type: "textarea", placeholder: "Additional details about the photo..." },
                  { key: "image", label: "Gallery Photo", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "stats" && (
              <ExpertiseArrayEditor
                sectionKey="stats"
                sectionTitle="7. Impact Statistics"
                sectionSubtitle="Show measurable records."
                items={impactStatistics}
                setItems={setImpactStatistics}
                themeColor="emerald"
                itemTemplate={{ number: "", label: "" }}
                customFields={[
                  { key: "number", label: "Value / Number", placeholder: "e.g. 10,000+ or 25 Years" },
                  { key: "label", label: "Indicator / Label", placeholder: "e.g. Lives Impacted or Workshops Held" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "achievements" && (
              <ExpertiseArrayEditor
                sectionKey="achievements"
                sectionTitle="8. Achievements"
                sectionSubtitle="Show achievements beyond awards."
                items={achievements}
                setItems={setAchievements}
                themeColor="emerald"
                showFeaturedSelector={true}
                itemTemplate={{ title: "", description: "", image: null, featured: false }}
                customFields={[
                  { key: "title", label: "Achievement Title", placeholder: "e.g. Trained 5,000 Students" },
                  { key: "description", label: "Details", type: "textarea", placeholder: "Describe the achievement context..." },
                  { key: "image", label: "Achievement Photo", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "publications" && (
              <ExpertiseArrayEditor
                sectionKey="publications"
                sectionTitle="9. Publications & Books"
                sectionSubtitle="Show intellectual contributions."
                items={publications}
                setItems={setPublications}
                themeColor="emerald"
                showFeaturedSelector={true}
                itemTemplate={{ title: "", description: "", image: null, date: "", link: "", featured: false }}
                customFields={[
                  { key: "title", label: "Book/Publication Title", placeholder: "e.g. Meditation for Modern Life" },
                  { key: "date", label: "Publication Date", placeholder: "e.g. May 2026" },
                  { key: "link", label: "Purchase or Reading Link", placeholder: "e.g. https://amazon.com/..." },
                  { key: "description", label: "Description", type: "textarea", placeholder: "Short summary..." },
                  { key: "image", label: "Cover Image", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "media" && (
              <ExpertiseArrayEditor
                sectionKey="media"
                sectionTitle="10. Media & Interviews"
                sectionSubtitle="Show media presence."
                items={mediaInterviews}
                setItems={setMediaInterviews}
                themeColor="emerald"
                itemTemplate={{ title: "", description: "", link: "", date: "" }}
                customFields={[
                  { key: "title", label: "Interview Title", placeholder: "e.g. Interview on Spiritual Living" },
                  { key: "date", label: "Broadcast Date", placeholder: "e.g. April 2026" },
                  { key: "link", label: "Broadcast Video Link", placeholder: "e.g. https://youtube.com/watch?..." },
                  { key: "description", label: "Description", type: "textarea", placeholder: "Featured broadcast info..." }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "testimonials" && (
              <ExpertiseArrayEditor
                sectionKey="testimonials"
                sectionTitle="11. Testimonials"
                sectionSubtitle="Build trust with recommendations."
                items={testimonials}
                setItems={setTestimonials}
                themeColor="emerald"
                showFeaturedSelector={true}
                itemTemplate={{ name: "", designation: "", testimonial: "", image: null, featured: false }}
                customFields={[
                  { key: "name", label: "Reviewer Name", placeholder: "e.g. Dr. Rajesh Kumar" },
                  { key: "designation", label: "Reviewer Position", placeholder: "e.g. Director, ABC Hospital" },
                  { key: "testimonial", label: "Recommendation content", type: "textarea", placeholder: "Quote text..." },
                  { key: "image", label: "Profile Photo", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "orgs" && (
              <ExpertiseArrayEditor
                sectionKey="orgs"
                sectionTitle="12. Organizations & Associations"
                sectionSubtitle="Show board memberships and leadership roles."
                items={organizationsAssociations}
                setItems={setOrganizationsAssociations}
                themeColor="emerald"
                itemTemplate={{ name: "", position: "", description: "", logo: null }}
                customFields={[
                  { key: "name", label: "Organization Name", placeholder: "e.g. International Meditation Society" },
                  { key: "position", label: "Position / Role", placeholder: "e.g. Board Member or Director" },
                  { key: "description", label: "Brief description of role", type: "textarea", placeholder: "Details..." },
                  { key: "logo", label: "Organization Logo/Banner", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "whoIHelp" && (
              <ExpertiseArrayEditor
                sectionKey="whoIHelp"
                sectionTitle="13. Who I Help"
                sectionSubtitle="Define target audience."
                items={whoIHelp}
                setItems={setWhoIHelp}
                themeColor="emerald"
                itemTemplate={{ name: "", description: "", image: null }}
                customFields={[
                  { key: "name", label: "Target Audience Name", placeholder: "e.g. Entrepreneurs or Students" },
                  { key: "description", label: "Description", type: "textarea", placeholder: "How you assist this audience..." },
                  { key: "image", label: "Audience Card Photo", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "languages" && (
              <div className="glass p-6 rounded-3xl border-white/5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">14. Languages</h3>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sectionVisibility.languages !== false}
                      onChange={(e) => setSectionVisibility({ ...sectionVisibility, languages: e.target.checked })}
                      className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3"
                    />
                    <span>Show Section</span>
                  </label>
                </div>
                {sectionVisibility.languages !== false ? (
                  <>
                    <p className="text-[11px] text-foreground/50">
                      Select or add languages the leader can communicate in.
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {["English", "Telugu", "Hindi", "Tamil", "Kannada"].map((lang) => (
                        <label key={lang} className="flex items-center gap-2 cursor-pointer hover:text-white transition">
                          <input
                            type="checkbox"
                            checked={languages.includes(lang)}
                            onChange={() => toggleLanguage(lang)}
                            className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3.5"
                          />
                          <span>{lang}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Custom Language..."
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        className="flex-1 bg-midnight border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none text-foreground focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={addCustomLanguage}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold"
                      >
                        Add Custom
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs text-foreground/40">
                    This section is hidden.
                  </div>
                )}
              </div>
            )}

            {activeExpertiseSection === "industries" && (
              <ExpertiseArrayEditor
                sectionKey="industries"
                sectionTitle="15. Industries Served"
                sectionSubtitle="Display sectors and domains."
                items={industriesServed}
                setItems={setIndustriesServed}
                themeColor="emerald"
                itemTemplate={{ name: "", description: "", image: null }}
                customFields={[
                  { key: "name", label: "Industry Name", placeholder: "e.g. Healthcare or Education" },
                  { key: "description", label: "Description", type: "textarea", placeholder: "Describe services provided to this domain..." },
                  { key: "image", label: "Industry Representative Photo", type: "image" }
                ]}
                sectionVisibility={sectionVisibility}
                setSectionVisibility={setSectionVisibility}
              />
            )}

            {activeExpertiseSection === "keywords" && (
              <div className="glass p-6 rounded-3xl border-white/5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">16. Keywords & Tags</h3>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sectionVisibility.keywords !== false}
                      onChange={(e) => setSectionVisibility({ ...sectionVisibility, keywords: e.target.checked })}
                      className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3"
                    />
                    <span>Show Section</span>
                  </label>
                </div>
                {sectionVisibility.keywords !== false ? (
                  <>
                    <p className="text-[11px] text-foreground/50">
                      Index keywords optimized for platform search and crawl rankings.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. meditation coach"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        className="flex-1 bg-midnight border border-white/10 rounded-xl px-4 py-2 text-sm outline-none text-foreground focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-2">
                      {keywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                        >
                          <span>#{kw}</span>
                          <button
                            type="button"
                            onClick={() => setKeywords(keywords.filter((k) => k !== kw))}
                            className="hover:text-red-400 transition"
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs text-foreground/40">
                    This section is hidden.
                  </div>
                )}
              </div>
            )}

            {activeExpertiseSection === "summary" && (
              <div className="glass p-6 rounded-3xl border-white/5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">Professional Summary</h3>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sectionVisibility.summary !== false}
                      onChange={(e) => setSectionVisibility({ ...sectionVisibility, summary: e.target.checked })}
                      className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3"
                    />
                    <span>Show Section</span>
                  </label>
                </div>
                {sectionVisibility.summary !== false ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/75 block">Years of Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 25 Years"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full bg-midnight border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-foreground focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-foreground/60">
                        <span>Summary Content (HTML Allowed)</span>
                        <span>{professionalSummary.length} / 3000</span>
                      </div>
                      <div className="flex gap-1 bg-midnight p-1 rounded-lg border border-white/10 flex-wrap text-[10px]">
                        <button type="button" onClick={() => insertTextHelper("<p>", "</p>")} className="px-2 py-0.5 hover:bg-white/10 rounded font-bold">P</button>
                        <button type="button" onClick={() => insertTextHelper("<strong>", "</strong>")} className="px-2 py-0.5 hover:bg-white/10 rounded font-bold">B</button>
                        <button type="button" onClick={() => insertTextHelper("<em>", "</em>")} className="px-2 py-0.5 hover:bg-white/10 rounded italic">I</button>
                        <button type="button" onClick={() => insertTextHelper("<ul>\n  <li>", "</li>\n</ul>")} className="px-2 py-0.5 hover:bg-white/10 rounded">List</button>
                      </div>
                      <textarea
                        id="professionalSummaryTextarea"
                        placeholder="Provide professional statement..."
                        value={professionalSummary}
                        onChange={(e) => setProfessionalSummary(e.target.value)}
                        maxLength={3000}
                        rows={6}
                        className="w-full bg-midnight border border-white/10 rounded-xl p-3 text-xs outline-none text-foreground font-mono leading-relaxed focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs text-foreground/40">
                    This section is hidden.
                  </div>
                )}
              </div>
            )}

            {activeExpertiseSection === "contact" && (
              <div className="glass p-6 rounded-3xl border-white/5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">17. Contact & Collaboration</h3>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sectionVisibility.contact !== false}
                      onChange={(e) => setSectionVisibility({ ...sectionVisibility, contact: e.target.checked })}
                      className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3"
                    />
                    <span>Show Section</span>
                  </label>
                </div>
                {sectionVisibility.contact !== false ? (
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground/75">Call-to-Action Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Book Consultation"
                        value={contactCollaboration?.ctaText || ""}
                        onChange={(e) => setContactCollaboration({ ...contactCollaboration, ctaText: e.target.value })}
                        className="w-full bg-midnight border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-foreground focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-foreground/75">Description</label>
                      <textarea
                        placeholder="Explain how visitors can collaborate with you..."
                        value={contactCollaboration?.description || ""}
                        onChange={(e) => setContactCollaboration({ ...contactCollaboration, description: e.target.value })}
                        rows={3}
                        className="w-full bg-midnight border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-foreground focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-foreground/75 block">Banner Image</label>
                      {contactCollaboration?.image?.secure_url ? (
                        <div className="space-y-2">
                          <div className="relative size-16 rounded-xl overflow-hidden border border-white/10">
                            <img
                              src={contactCollaboration.image.secure_url}
                              alt="Banner"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setContactCollaboration({ ...contactCollaboration, image: null })}
                              className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity grid place-items-center text-red-400 font-bold text-[9px]"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Alt Text..."
                              value={contactCollaboration.image.alt_text || ""}
                              onChange={(e) => setContactCollaboration({
                                ...contactCollaboration,
                                image: { ...contactCollaboration.image, alt_text: e.target.value }
                              })}
                              className="bg-midnight border border-white/10 rounded-lg px-2 py-1 text-[11px] text-foreground outline-none focus:border-emerald-500/50"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            id="contact-banner-file"
                            onChange={handleContactBannerUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="contact-banner-file"
                            className="glass hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-foreground/80 hover:text-white cursor-pointer transition inline-flex items-center gap-1"
                          >
                            <Upload className="size-3 text-emerald-600" /> Upload Banner
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="font-bold text-foreground/75 block">Future Contact Types Preference</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Consultation",
                          "Speaking Engagement",
                          "Training Program",
                          "Partnership",
                          "Media Interview",
                          "Mentoring"
                        ].map((type) => (
                          <label key={type} className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                            <input
                              type="checkbox"
                              checked={contactTypes.includes(type)}
                              onChange={() => toggleContactType(type)}
                              className="rounded border-white/10 bg-midnight text-emerald-600 focus:ring-emerald-500 size-3.5"
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Consultation Availability Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div>
                        <span className="font-bold text-foreground/75 block">Consultation Availability Status</span>
                        <span className="text-[10px] text-foreground/40 block">Enable general consultation buttons</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAvailableForConsultation(!isAvailableForConsultation)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          isAvailableForConsultation ? "bg-emerald-600" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            isAvailableForConsultation ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-xs text-foreground/40">
                    This section is hidden.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons at bottom right */}
          <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-6 mt-12 flex-wrap">
            <button
              onClick={onCancel}
              className="glass rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveClick(false)}
              disabled={isSaving}
              className="glass rounded-xl px-5 py-2.5 text-xs font-bold text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/5 transition inline-flex items-center gap-1.5"
            >
              <Save className="size-3.5" /> Save Draft
            </button>
            <button
              onClick={handlePreviewClick}
              disabled={isSaving}
              className="glass rounded-xl px-5 py-2.5 text-xs font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/5 transition inline-flex items-center gap-1.5"
            >
              <ArrowUpRight className="size-3.5" /> Save & Preview
            </button>
            <button
              onClick={() => handleSaveClick(true)}
              disabled={isSaving}
              className="btn-premium rounded-xl px-6 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/15 border-none"
            >
              <Sparkles className="size-3.5" /> Publish Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Defensive utility to parse and guarantee the complete schema structure of the profile data
const normalizeProfile = (profile: any) => {
  if (!profile) return null;
  const copy = JSON.parse(JSON.stringify(profile));

  // Parse data if it is returned as a JSON string from PostgreSQL JSONB
  if (typeof copy.data === "string") {
    try {
      copy.data = JSON.parse(copy.data);
    } catch (e) {
      console.error("Failed to parse profile data JSON string:", e);
    }
  }
  if (!copy.data) copy.data = {};

  // Normalize category relationships
  copy.category_id = copy.category_id !== undefined ? copy.category_id : null;
  copy.subcategory_id = copy.subcategory_id !== undefined ? copy.subcategory_id : null;

  // Guarantee that every array/object field exists to prevent rendering exceptions in the sub-editors
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

function AdminDashboard() {
  const loaderData = Route.useLoaderData();
  const router = useRouter();

  const search = Route.useSearch();
  const mode = search.mode;
  const profileId = search.profileId;
  const activeSection = (search.section || "general") as ActiveSubSection;

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_token");
    }
    return null;
  });

  const [profiles, setProfiles] = useState<any[]>(loaderData.profiles || []);
  const [categoriesList, setCategoriesList] = useState<any[]>(loaderData.categories || []);

  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedImportSection, setSelectedImportSection] = useState<"stats" | "bio" | "timeline" | "awards">("stats");

  // Synchronize state when loaderData updates (e.g. on router.invalidate())
  useEffect(() => {
    if (loaderData.profiles) {
      setProfiles(loaderData.profiles);
    }
  }, [loaderData.profiles]);

  useEffect(() => {
    if (loaderData.categories) {
      setCategoriesList(loaderData.categories);
    }
  }, [loaderData.categories]);

  const [isInitializing, setIsInitializing] = useState(false);

  const loadData = async () => {
    try {
      setIsInitializing(true);
      const results = await Promise.allSettled([
        getProfiles(),
        getCategories(),
      ]);
      
      const p = results[0].status === 'fulfilled' ? results[0].value : [];
      const c = results[1].status === 'fulfilled' ? results[1].value : [];
      
      setProfiles(p);
      setCategoriesList(c);
      
      const rejected = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      const hasAuthError = rejected.some(r => 
        r.reason?.message?.includes("Authentication failed") || 
        r.reason?.message?.includes("Unauthorized") || 
        r.reason?.message?.includes("401")
      );

      if (hasAuthError) {
        handleLogout();
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem("admin_token");
    setProfiles([]);
    setCategoriesList([]);
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Helper setters that write to URL query parameters
  const setMode = (newMode: "list" | "edit" | "expertise-edit" | "family-edit") => {
    router.navigate({
      to: "/admin",
      search: (prev: any) => ({
        ...prev,
        mode: newMode,
        profileId: (newMode === "list" || newMode === "create") ? undefined : prev.profileId,
      }),
    });
  };

  const setActiveSection = (newSection: ActiveSubSection) => {
    router.navigate({
      to: "/admin",
      search: (prev: any) => ({
        ...prev,
        section: newSection,
      }),
    });
  };

  const [adminView, setAdminView] = useState<"profiles" | "categories" | "expertise">("profiles");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  // Category Inputs State
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Subcategory Inputs State
  const [newSubcatName, setNewSubcatName] = useState("");
  const [editingSubcatId, setEditingSubcatId] = useState<number | null>(null);
  const [editingSubcatName, setEditingSubcatName] = useState("");

  console.log("AdminDashboard render state:", {
    mode,
    hasSelectedProfile: !!selectedProfile,
    activeSection,
    adminView,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [activeQrModal, setActiveQrModal] = useState<{ name: string; url: string } | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Synchronize URL search parameters with the draft profile state
  useEffect(() => {
    if (mode === "edit" || mode === "expertise-edit" || mode === "family-edit") {
      if (profileId) {
        const found = profiles.find((p: any) => p.id === profileId);
        if (found) {
          if (!selectedProfile || selectedProfile.id !== found.id) {
            setSelectedProfile(normalizeProfile(found));
          }
        }
      } else if (mode === "edit") {
        if (!selectedProfile || selectedProfile.id) {
          const freshProfile = normalizeProfile(defaultProfileTemplate);
          if (freshProfile) {
            let suffix = 1;
            let baseSlug = freshProfile.slug;
            const profilesList = Array.isArray(profiles) ? profiles : [];
            while (profilesList.some((p: any) => p.slug === freshProfile.slug)) {
              freshProfile.slug = `${baseSlug}-${suffix}`;
              suffix++;
            }
            setSelectedProfile(freshProfile);
          }
        }
      }
    } else {
      if (selectedProfile !== null) {
        setSelectedProfile(null);
      }
    }
  }, [mode, profileId, profiles]);

  if (!token) {
    return <AdminLogin onLogin={(newToken) => {
      setToken(newToken);
      sessionStorage.setItem("admin_token", newToken);
    }} />;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col items-center justify-center">
        <Loader2 className="size-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-white/60 font-medium text-sm animate-pulse">Initializing Dashboard Workspace...</p>
      </div>
    );
  }

  // Switch to edit mode with a fully normalized copy of the profile data
  const handleEdit = (profile: any) => {
    setSelectedProfile(normalizeProfile(profile));
    router.navigate({
      to: "/admin",
      search: {
        mode: "edit",
        profileId: profile.id,
        section: "general",
      },
    });
  };

  const handleCreateNew = () => {
    setSelectedProfile(null);
    router.navigate({
      to: "/admin",
      search: {
        mode: "edit",
        profileId: undefined,
        section: "general",
      },
    });
  };

  const handleDuplicate = async (profile: any) => {
    const clone = JSON.parse(JSON.stringify(profile));
    delete clone.id; // Remove database PK to trigger insert
    clone.name = `${clone.name} (Copy)`;

    let suffix = 1;
    let baseSlug = `${clone.slug}-copy`;
    clone.slug = baseSlug;
    while (profiles.some((p: any) => p.slug === clone.slug)) {
      clone.slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    try {
      toast.loading("Duplicating profile...", { id: "dup" });
      await saveProfile(clone);
      toast.success("Profile duplicated successfully!", { id: "dup" });
      router.invalidate();
    } catch (err) {
      toast.error("Failed to duplicate profile.", { id: "dup" });
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this leader profile? This cannot be undone.",
      )
    )
      return;

    try {
      toast.loading("Deleting profile...", { id: "del" });
      await deleteProfile(id);
      toast.success("Profile deleted successfully!", { id: "del" });
      router.invalidate();
    } catch (err) {
      toast.error("Failed to delete profile.", { id: "del" });
    }
  };

  // Safe nested state update helper
  const updateField = (field: string, value: any) => {
    setSelectedProfile((prev: any) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug when name changes and we are creating a new profile (no ID yet)
      if (field === "name" && !prev.id) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const updateDataSection = (section: string, value: any) => {
    setSelectedProfile((prev: any) => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: value,
      },
    }));
  };

  // Image upload handler
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.loading("Uploading image locally...", { id: "img-upload" });

    try {
      const res = await uploadImage(file);
      onComplete(res.url);
      toast.success("Image uploaded successfully!", { id: "img-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Ensure it's a valid image file.", {
        id: "img-upload",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Publish profile (saves to Postgres)
  const handlePublish = async () => {
    if (!selectedProfile.name.trim()) {
      toast.error("Profile Name is required!");
      return;
    }
    if (!selectedProfile.slug.trim()) {
      toast.error("URL Slug is required!");
      return;
    }

    // Validation for new sections: Title and Description are required
    const sectionsToCheck = [
      { key: "certificates", name: "Certificates" },
      { key: "myInitiatives", name: "My Initiatives" },
      { key: "newsArticles", name: "News Articles" },
      { key: "recentActivities", name: "Recent Activities" }
    ];

    for (const section of sectionsToCheck) {
      const items = selectedProfile.data[section.key] || [];
      if (section.key === "myInitiatives") {
        // Validation for nested initiatives:
        // 1. Initiative Title is required
        // 2. Each image in the initiative must have a Title and Description
        const hasInvalidInit = items.some(
          (init: any) => !init.title?.trim()
        );
        if (hasInvalidInit) {
          toast.error('All initiatives in "My Initiatives" must have a Title!');
          return;
        }

        const hasInvalidImage = items.some((init: any) => 
          (init.images || []).some(
            (img: any) => !img.title?.trim() || !img.description?.trim()
          )
        );
        if (hasInvalidImage) {
          toast.error('All images in "My Initiatives" slideshows must have a Title and Description!');
          return;
        }
      } else {
        const hasInvalidItem = items.some(
          (item: any) => !item.title?.trim() || !item.description?.trim()
        );
        if (hasInvalidItem) {
          toast.error(`All items in "${section.name}" section must have a Title and Description!`);
          return;
        }
      }
    }

    // Clean up slug formatting
    const cleanSlug = selectedProfile.slug
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Slug unique check (excluding self when editing)
    const isSlugDuplicate = profiles.some(
      (p: any) => p.slug === cleanSlug && p.id !== selectedProfile.id,
    );
    if (isSlugDuplicate) {
      toast.error("URL Slug is already in use by another profile!");
      return;
    }

    const finalProfile = {
      ...selectedProfile,
      slug: cleanSlug,
    };

    setIsSaving(true);
    toast.loading("Saving changes to PostgreSQL...", { id: "save" });

    try {
      const response = await saveProfile(finalProfile);
      toast.success("Leader profile published successfully!", { id: "save" });
      
      const savedId = selectedProfile.id || (response && response.id);
      
      if (!selectedProfile.id && response && response.id) {
        setSelectedProfile((prev: any) => ({
          ...prev,
          id: response.id,
          slug: cleanSlug,
        }));
      } else {
        setSelectedProfile((prev: any) => ({
          ...prev,
          slug: cleanSlug,
        }));
      }

      await router.navigate({
        to: "/admin",
        search: (prev: any) => ({
          ...prev,
          mode: "edit",
          profileId: savedId,
        }),
      });

      router.invalidate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save leader profile.", { id: "save" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveExpertise = async (payload: any, publish: boolean) => {
    if (!selectedProfile) return;
    try {
      setIsSaving(true);
      await saveProfessionalExpertise(selectedProfile.id, payload);
      
      // Reload profiles
      const p = await getProfiles();
      setProfiles(p);
      
      toast.success(publish ? "Professional expertise published successfully!" : "Professional expertise draft saved successfully!");
      
      await router.invalidate();
    } catch (err) {
      toast.error("Failed to save professional expertise.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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
  const refreshCategories = async () => {
    try {
      const freshCats = await getCategories();
      setCategoriesList(freshCats);
    } catch (e) {
      console.error("Failed to refresh categories:", e);
    }
  };

  // Category CRUD Handlers
  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      toast.error("Category name cannot be empty!");
      return;
    }
    const slug = newCatName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      toast.loading("Adding category...", { id: "cat-action" });
      await saveCategory({ name: newCatName.trim(), slug });
      toast.success("Category added successfully!", { id: "cat-action" });
      setNewCatName("");
      await refreshCategories();
      router.invalidate();
    } catch (e) {
      toast.error("Failed to add category.", { id: "cat-action" });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCatId || !editingCatName.trim()) {
      toast.error("Category name cannot be empty!");
      return;
    }
    const slug = editingCatName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      toast.loading("Updating category...", { id: "cat-action" });
      await saveCategory({ id: editingCatId, name: editingCatName.trim(), slug });
      toast.success("Category updated successfully!", { id: "cat-action" });
      setEditingCatId(null);
      setEditingCatName("");
      await refreshCategories();
      router.invalidate();
    } catch (e) {
      toast.error("Failed to update category.", { id: "cat-action" });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this category? All nested subcategories will also be deleted, and profiles linked to this category will be unassigned.")) return;

    try {
      toast.loading("Deleting category...", { id: "cat-action" });
      await deleteCategory(id);
      toast.success("Category deleted successfully!", { id: "cat-action" });
      if (selectedCatId === id) setSelectedCatId(null);
      await refreshCategories();
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete category.", { id: "cat-action" });
    }
  };

  // Subcategory CRUD Handlers
  const handleAddSubcategory = async () => {
    if (!selectedCatId) {
      toast.error("Please select a category first!");
      return;
    }
    if (!newSubcatName.trim()) {
      toast.error("Subcategory name cannot be empty!");
      return;
    }
    const slug = `${categoriesList.find(c => c.id === selectedCatId)?.slug || "sub"}-${newSubcatName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}`;

    try {
      toast.loading("Adding subcategory...", { id: "subcat-action" });
      await saveSubcategory({
        category_id: selectedCatId,
        name: newSubcatName.trim(),
        slug,
      });
      toast.success("Subcategory added successfully!", { id: "subcat-action" });
      setNewSubcatName("");
      await refreshCategories();
      router.invalidate();
    } catch (e) {
      toast.error("Failed to add subcategory.", { id: "subcat-action" });
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!selectedCatId || !editingSubcatId || !editingSubcatName.trim()) {
      toast.error("Subcategory name cannot be empty!");
      return;
    }
    const slug = `${categoriesList.find(c => c.id === selectedCatId)?.slug || "sub"}-${editingSubcatName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}`;

    try {
      toast.loading("Updating subcategory...", { id: "subcat-action" });
      await saveSubcategory({
        id: editingSubcatId,
        category_id: selectedCatId,
        name: editingSubcatName.trim(),
        slug,
      });
      toast.success("Subcategory updated successfully!", { id: "subcat-action" });
      setEditingSubcatId(null);
      setEditingSubcatName("");
      await refreshCategories();
      router.invalidate();
    } catch (e) {
      toast.error("Failed to update subcategory.", { id: "subcat-action" });
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subcategory? Profiles linked to it will be unassigned.")) return;

    try {
      toast.loading("Deleting subcategory...", { id: "subcat-action" });
      await deleteSubcategory(id);
      toast.success("Subcategory deleted successfully!", { id: "subcat-action" });
      await refreshCategories();
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete subcategory.", { id: "subcat-action" });
    }
  };

  return (
    <div className="admin-console relative min-h-screen text-foreground bg-midnight overflow-hidden py-10 px-6 lg:px-12">
      <SEO title="Admin Dashboard | Global Leader Sphere" description="Secure admin dashboard for Global Leader Sphere" />

      {/* Background decoration blobs */}
      <div className={`blob w-[500px] h-[500px] -top-32 -right-32 opacity-10 transition-colors duration-500 ${
        mode === "expertise-edit" ? "bg-[#10b981]" : "bg-[#0070c0]"
      }`} />
      <div className="blob bg-[#b38f36] w-[600px] h-[600px] bottom-[-200px] -left-32 opacity-[0.06]" />

      {/* HEADER NAVBAR */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between mb-10 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl btn-premium grid place-items-center">
            <Globe2 className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-sky">Global Leader Sphere</h1>
            <p className="text-[12px] text-foreground/50">Verified Profiles Admin Console</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode === "edit" || mode === "expertise-edit" || mode === "family-edit" ? (
            <button
              onClick={() => {
                if (confirm("Discard unsaved changes?")) {
                  setMode("list");
                  setSelectedProfile(null);
                }
              }}
              className="glass rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5 hover:bg-white/10 transition"
            >
              <ChevronLeft className="size-4" /> Cancel
            </button>
          ) : (
            <Link
              to="/"
              className="glass rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5 hover:bg-white/10 transition"
            >
              View Live Website <ArrowUpRight className="size-4 text-sky" />
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="glass rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5 text-red-500 hover:bg-red-50/10 transition border border-red-500/20"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </nav>
<main className="max-w-7xl mx-auto z-10 relative">
        {mode === "list" ? (
          /* ========================================================================= */
          /* 1. DIRECTORY / PROFILE LIST VIEW & CATEGORIES MANAGER                     */
          /* ========================================================================= */
          <div className="glass-strong rounded-3xl p-8 border-white/10 shadow-3xl">
            
            {/* Tab Swticher */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-8 flex-wrap">
              <button
                onClick={() => setAdminView("profiles")}
                className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 ${
                  adminView === "profiles" || adminView === "categories"
                    ? "bg-linear-to-r from-sapphire to-sky text-white shadow-md shadow-sky/15"
                    : "hover:bg-[#0d2c6c]/5 text-foreground/75 border border-transparent"
                }`}
              >
                <UserCheck className="size-4" /> Profile Management
              </button>
              <button
                onClick={() => setAdminView("expertise")}
                className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 ${
                  adminView === "expertise"
                    ? "bg-linear-to-r from-sapphire to-sky text-white shadow-md shadow-sky/15"
                    : "hover:bg-[#0d2c6c]/5 text-foreground/75 border border-transparent"
                }`}
              >
                <Award className="size-4" /> Professional Expertise
              </button>
            </div>

            {adminView === "profiles" && (
              /* Profiles View List */
              <>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gradient">Leader Directory</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                      Manage the verified identities running on the sphere platform.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setAdminView("categories");
                        if (categoriesList.length > 0 && selectedCatId === null) {
                          setSelectedCatId(categoriesList[0].id);
                        }
                      }}
                      className="glass rounded-full px-5 py-3 font-semibold text-sm inline-flex items-center gap-2 hover:bg-white/5 transition"
                    >
                      <Layers className="size-4 text-sky" /> Manage Categories
                    </button>
                    <button
                      onClick={handleCreateNew}
                      className="btn-premium rounded-full px-6 py-3 font-semibold text-sm inline-flex items-center gap-2"
                    >
                      <Plus className="size-4" /> Create New Profile
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((p: any, index: number) => {
                    const isFirst = index === 0;
                    return (
                      <div
                        key={p.id}
                        className="glass rounded-[28px] overflow-hidden p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 border-white/10 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Avatar header */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="size-16 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-inner">
                              <img
                                src={p.portrait}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 opacity-80">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
                                Verified
                              </span>
                            </div>
                          </div>

                          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-sky transition duration-200 truncate">
                            {p.name}
                          </h3>
                          <p className="text-[13px] text-gold/80 font-medium truncate mt-1">
                            {p.title}
                          </p>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                            <div className="text-[11px] text-muted-foreground space-y-1">
                              <div>
                                Slug: <span className="text-sky font-mono font-bold">/{p.slug}</span>
                              </div>
                            </div>
                            {origin && (
                              <button
                                type="button"
                                onClick={() => setActiveQrModal({ name: p.name, url: `${origin}/leader/${p.slug}` })}
                                className="bg-white p-1 rounded-lg shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200 border border-white/10 shadow-sm"
                                title="Enlarge verification QR"
                              >
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`${origin}/leader/${p.slug}`)}`}
                                  alt="QR Code"
                                  className="size-7 object-contain"
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions panel */}
                        <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-4 gap-2">
                          <Link
                            to="/leader/$slug"
                            params={{ slug: p.slug }}
                            target="_blank"
                            className="glass rounded-xl py-2.5 text-center text-xs font-semibold text-foreground/80 hover:text-white hover:bg-white/10 transition inline-flex items-center justify-center gap-1"
                            title="View Live Profile"
                          >
                            <ArrowUpRight className="size-3.5" /> Live
                          </Link>
                          <button
                            onClick={() => handleEdit(p)}
                            className="glass rounded-xl py-2.5 text-center text-xs font-semibold text-sky bg-sky/5 hover:bg-sky/15 hover:text-sky-light transition inline-flex items-center justify-center gap-1 border border-sky/20"
                            title="Edit Profile"
                          >
                            <Edit3 className="size-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="glass rounded-xl py-2.5 text-center text-xs font-semibold text-foreground/80 hover:text-white hover:bg-white/10 transition inline-flex items-center justify-center gap-1"
                            title="Duplicate Profile"
                          >
                            <Copy className="size-3.5" /> Copy
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={isFirst && profiles.length === 1}
                            className="glass rounded-xl py-2.5 text-center text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 disabled:opacity-30 disabled:pointer-events-none transition inline-flex items-center justify-center gap-1 border border-red-500/10"
                            title="Delete Profile"
                          >
                            <Trash2 className="size-3.5" /> Del
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {adminView === "categories" && (
              /* Categories Manager View */
              <>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gradient">Category Directory</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                      Manage directory sectors, subcategories and classifications.
                    </p>
                  </div>
                  <button
                    onClick={() => setAdminView("profiles")}
                    className="glass rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-white/10 transition"
                  >
                    <ChevronLeft className="size-4" /> Back to Profiles
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-8 items-start animate-fade-in">
                  {/* Left Column: Categories List & Add */}
                  <div className="md:col-span-5 space-y-6">
                    <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-sky border-b border-white/5 pb-2">
                        Add New Category
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Category Name"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="flex-1 bg-midnight border border-white/10 rounded-xl px-4 py-2 text-xs outline-none text-foreground"
                        />
                        <button
                          onClick={handleAddCategory}
                          className="bg-sky hover:bg-sky/85 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                        >
                          Create
                        </button>
                      </div>
                    </div>

                    <div className="glass p-6 rounded-3xl border-white/5 space-y-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-sky border-b border-white/5 pb-2 mb-2">
                        Categories Registry
                      </h3>
                      <div className="space-y-1">
                        {categoriesList.map((cat: any) => {
                          const isSelected = selectedCatId === cat.id;
                          const isEditing = editingCatId === cat.id;
                          return (
                            <div
                              key={cat.id}
                              onClick={() => setSelectedCatId(cat.id)}
                              className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition group ${
                                isSelected
                                  ? "bg-sky/15 border border-sky/35 text-sky"
                                  : "glass hover:bg-[#0d2c6c]/5 text-foreground/75"
                              }`}
                            >
                              {isEditing ? (
                                <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={editingCatName}
                                    onChange={(e) => setEditingCatName(e.target.value)}
                                    className="flex-1 bg-midnight border border-white/10 rounded-lg px-2 py-1 text-xs outline-none text-foreground"
                                  />
                                  <button
                                    onClick={handleUpdateCategory}
                                    className="bg-sky/20 hover:bg-sky/35 text-sky px-2.5 py-1 rounded-lg text-[10px] font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCatId(null)}
                                    className="bg-white/5 hover:bg-white/10 text-foreground/50 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-xs font-semibold">{cat.name}</span>
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => {
                                        setEditingCatId(cat.id);
                                        setEditingCatName(cat.name);
                                      }}
                                      className="p-1 rounded hover:bg-white/10 text-sky transition"
                                      title="Rename Category"
                                    >
                                      <Edit3 className="size-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(cat.id)}
                                      className="p-1 rounded hover:bg-red-950/20 text-red-400 transition"
                                      title="Delete Category"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Subcategories List & Add */}
                  <div className="md:col-span-7">
                    {selectedCatId ? (
                      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-sky">
                              Subcategories Classification
                            </h3>
                            <p className="text-[10px] text-foreground/50 mt-0.5">
                              Roles and divisions within selected sector.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Subcategory Name"
                              value={newSubcatName}
                              onChange={(e) => setNewSubcatName(e.target.value)}
                              className="bg-midnight border border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none text-foreground"
                            />
                            <button
                              onClick={handleAddSubcategory}
                              className="bg-sky/20 hover:bg-sky/35 text-sky px-4 py-1.5 rounded-xl text-xs font-bold transition"
                            >
                              Add Subcategory
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                          {(categoriesList.find((c: any) => c.id === selectedCatId)?.subcategories || []).length === 0 ? (
                            <div className="text-center py-12 text-foreground/45 text-xs">
                              No subcategories added to this sector yet.
                            </div>
                          ) : (
                            categoriesList.find((c: any) => c.id === selectedCatId)?.subcategories.map((sub: any) => {
                              const isEditingSub = editingSubcatId === sub.id;
                              return (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-medium group"
                                >
                                  {isEditingSub ? (
                                    <div className="flex gap-2 w-full">
                                      <input
                                        type="text"
                                        value={editingSubcatName}
                                        onChange={(e) => setEditingSubcatName(e.target.value)}
                                        className="flex-1 bg-midnight border border-white/10 rounded-lg px-2 py-1 text-xs outline-none text-foreground"
                                      />
                                      <button
                                        onClick={handleUpdateSubcategory}
                                        className="bg-sky/20 hover:bg-sky/35 text-sky px-2.5 py-1 rounded-lg text-[10px] font-bold"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingSubcatId(null)}
                                        className="bg-white/5 hover:bg-white/10 text-foreground/50 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span>{sub.name}</span>
                                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            setEditingSubcatId(sub.id);
                                            setEditingSubcatName(sub.name);
                                          }}
                                          className="p-1 rounded hover:bg-white/10 text-sky transition"
                                          title="Rename Subcategory"
                                        >
                                          <Edit3 className="size-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSubcategory(sub.id)}
                                          className="p-1 rounded hover:bg-red-950/20 text-red-400 transition"
                                          title="Delete Subcategory"
                                        >
                                          <Trash2 className="size-3.5" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[250px] gap-2 glass rounded-3xl border-white/5 text-center text-foreground/50 text-xs">
                        Select a category from the list to manage its subcategories.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {adminView === "expertise" && (
              /* Professional Expertise View List */
              <>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gradient">Professional Expertise Registry</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                      Manage professional roles, achievements, services and consulting parameters for verified leaders.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((p: any) => {
                    return (
                      <div
                        key={p.id}
                        className="glass rounded-[28px] overflow-hidden p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 border-white/10 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Avatar header */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="size-16 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-inner">
                              <img
                                src={p.portrait}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {p.is_published ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
                                  Published
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md">
                                  Draft (Unpublished)
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-sky transition duration-200 truncate">
                            {p.name}
                          </h3>
                          <p className="text-[13px] text-gold/80 font-medium truncate mt-1">
                            {p.title}
                          </p>
                          
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                            <div className="text-[11px] text-muted-foreground space-y-1">
                              <div>
                                Experience: <span className="text-sky font-bold">{p.years_experience || "Not Set"}</span>
                              </div>
                              {p.languages && Array.isArray(p.languages) && p.languages.length > 0 && (
                                <div className="text-[10px] text-gold font-medium truncate max-w-[200px]">
                                  Languages: {p.languages.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions panel */}
                        <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                          {p.is_published ? (
                            <Link
                              to="/leader/$slug/professional-expertise"
                              params={{ slug: p.slug }}
                              target="_blank"
                              className="glass rounded-xl py-2.5 text-center text-xs font-semibold text-foreground/80 hover:text-white hover:bg-white/10 transition inline-flex items-center justify-center gap-1"
                              title="View Expertise Page"
                            >
                              <ArrowUpRight className="size-3.5" /> View Page
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProfile(p);
                                if (typeof window !== "undefined") {
                                  window.open(`/leader/${p.slug}/professional-expertise?preview=true`, "_blank");
                                }
                              }}
                              className="glass rounded-xl py-2.5 text-center text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-950/20 transition inline-flex items-center justify-center gap-1 border border-amber-500/10"
                              title="Preview Draft"
                            >
                              <ArrowUpRight className="size-3.5" /> Preview Draft
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedProfile(p);
                              router.navigate({
                                to: "/admin",
                                search: (prev: any) => ({
                                  ...prev,
                                  mode: "expertise-edit",
                                  profileId: p.id,
                                }),
                              });
                            }}
                            className="glass rounded-xl py-2.5 text-center text-xs font-semibold text-sky bg-sky/5 hover:bg-sky/15 hover:text-sky-light transition inline-flex items-center justify-center gap-1 border border-sky/20"
                            title="Edit Expertise"
                          >
                            <Award className="size-3.5" /> Edit Expertise
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : !selectedProfile ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 glass-strong rounded-3xl p-12 border-white/10">
            <Loader2 className="size-8 animate-spin text-sky" />
            <p className="text-sm font-medium text-foreground/50">Loading editor...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Editing Header with Switcher Tabs */}
            <div className="glass-strong rounded-3xl p-6 border-white/10 flex flex-wrap justify-between items-center gap-6 shadow-2xl backdrop-blur-2xl">
              <div>
                <span className="text-[10px] font-bold text-sky uppercase tracking-widest bg-sky/15 border border-sky/30 px-3 py-1.5 rounded-full inline-block mb-2 font-semibold">
                  Console Mode: Editor
                </span>
                <h2 className="text-2xl font-bold font-display text-gradient">
                  Editing Profile: {selectedProfile.name}
                </h2>
                <p className="text-xs text-foreground/50 mt-1">
                  Active Slug: <span className="font-mono text-amber-400">/leader/{selectedProfile.slug}</span>
                </p>
              </div>

              {/* Tab Toggle Switcher */}
              <div className="flex items-center gap-2 bg-black/35 p-1.5 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    router.navigate({
                      to: "/admin",
                      search: (prev: any) => ({
                        ...prev,
                        mode: "edit",
                      }),
                    });
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 cursor-pointer ${
                    mode === "edit"
                      ? "bg-linear-to-r from-sapphire to-sky text-white shadow-md shadow-sky/15"
                      : "hover:bg-white/5 text-foreground/60"
                  }`}
                >
                  <UserCheck className="size-4" /> Profile Info & Bio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    router.navigate({
                      to: "/admin",
                      search: (prev: any) => ({
                        ...prev,
                        mode: "expertise-edit",
                      }),
                    });
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 cursor-pointer ${
                    mode === "expertise-edit"
                      ? "bg-linear-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/15"
                      : "hover:bg-white/5 text-foreground/60"
                  }`}
                >
                  <Award className="size-4" /> Professional Expertise
                </button>
              </div>
            </div>

            {/* Toggle Content */}
            {mode === "expertise-edit" ? (
              <ProfessionalExpertiseEditor
                profileId={selectedProfile.id}
                profileName={selectedProfile.name}
                profileSlug={selectedProfile.slug}
                onCancel={() => {
                  setMode("list");
                  setSelectedProfile(null);
                }}
                onSave={handleSaveExpertise}
                isSaving={isSaving}
              />
            ) : (
              /* Basic Profile Form */
              <div className="grid lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left Sidebar Category Switcher */}
            <div className="lg:col-span-3 glass-strong rounded-3xl p-5 border-white/10 space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">
                Editing Sections
              </div>

              {[
                { id: "general", label: "General & Hero", icon: User },
                { id: "csvImport", label: "CSV Bulk Import", icon: FileText },
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
                {activeSection === "csvImport" && (
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
                        setMode("list");
                        setSelectedProfile(null);
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
        )}
      </div>
    )}
      </main>

      {activeQrModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setActiveQrModal(null)}
        >
          <div 
            className="glass-strong border border-white/15 max-w-sm w-full rounded-3xl p-6 shadow-2xl relative text-center space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              onClick={() => setActiveQrModal(null)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="mx-auto size-14 rounded-2xl btn-premium grid place-items-center mb-2">
              <QrCode className="size-7 text-white" />
            </div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight">
              {activeQrModal.name}
            </h3>
            <p className="text-xs text-sky font-semibold uppercase tracking-wider">
              Verification Registry QR
            </p>
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-white/10 mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeQrModal.url)}`}
                alt="Verification QR Code"
                className="size-48 object-contain mx-auto"
              />
            </div>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-normal">
              Scan this secure seal to verify credentials or share this link:
              <br />
              <a 
                href={activeQrModal.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-sky hover:underline break-all font-mono mt-1.5 inline-block"
              >
                {activeQrModal.url}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
