import { useState, useEffect } from "react";
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SEO } from "../components/SEO";
import {
  getProfiles,
  saveProfile,
  publishProfile,
  deleteProfile,
  uploadImage,
  getCategories,
  saveCategory,
  deleteCategory,
  saveSubcategory,
  deleteSubcategory,
  getProfessionalExpertise,
  saveProfessionalExpertise,
  resolveImageUrl,
  getBaseUrl,
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
  Bell,
  TrendingUp,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { DynamicIcon, POPULAR_LEADER_ICONS } from "../components/DynamicIcon";
import { AnalyticsDashboard } from "../components/admin/AnalyticsDashboard";
import { NotificationCenter } from "../components/admin/NotificationCenter";
import { LeaderDashboard } from "../components/admin/LeaderDashboard";
import { AdminDirectory } from "../components/admin/AdminDirectory";
import { ApplicationReview } from "../components/admin/ApplicationReview";
import { PortfolioReview } from "../components/admin/PortfolioReview";
import { FamilyDetailsEditor } from "../components/FamilyDetailsEditor";
import { supabase } from "../lib/supabase";

const adminSearchSchema = z.object({
  mode: z.enum(["list", "edit", "expertise-edit", "family-edit", "dashboard"]).catch("list"),
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
  | "dashboard"
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
  | "family"
  | "csvImport";

// Standalone SectionArrayEditor Component for Certificates, Initiatives, News, and Recent Activities

import { ProfileEditConsole, normalizeProfile } from '../components/admin/ProfileEditConsole';
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const sessionToken = data.session?.access_token;
      if (!sessionToken) {
        throw new Error("No session created");
      }

      // Fetch profile to verify if they are admin
      const res = await fetch(`${getBaseUrl()}/auth/me`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!res.ok) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Insufficient permissions.");
      }

      const me = await res.json();
      const role = me.data?.role || me.role;
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Insufficient permissions.");
      }

      sessionStorage.setItem("admin_token", sessionToken);
      onLogin(sessionToken);
      toast.success("Welcome back, Administrator!");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative p-6 bg-slate-50 overflow-hidden font-sans select-text">
      {/* Background decoration blobs */}
      <div className="blob bg-blue-500/10 w-[500px] h-[500px] -top-32 -right-32 rounded-full absolute filter blur-3xl" />
      <div className="blob bg-indigo-500/10 w-[600px] h-[600px] -bottom-32 -left-32 rounded-full absolute filter blur-3xl" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-14 rounded-2xl bg-blue-600 grid place-items-center mb-4 shadow-md shadow-blue-500/20">
            <Globe2 className="size-7 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-800">Global Leader Sphere</h2>
          <p className="text-xs text-slate-400 mt-1">Authorized Administration Console</p>
        </div>

        <form onSubmit={handleSupabaseSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-880"
                disabled={loading}
                autoFocus
              />
              <Mail className="size-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                disabled={loading}
              />
              <Lock className="size-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Sign In (Supabase)
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link
            to="/"
            className="text-xs text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-1 transition"
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

export function ProfessionalExpertiseEditor({
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
      if (!profileId) {
        setLoading(false);
        return;
      }
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


function AdminDashboard() {
  const loaderData = Route.useLoaderData();
  const router = useRouter();

  const search = Route.useSearch();
  const mode = search.mode;
  const profileId = search.profileId;
  const activeSection = (search.section || "dashboard") as ActiveSubSection;

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

  const handleLogout = async () => {
    setToken(null);
    sessionStorage.removeItem("admin_token");
    setProfiles([]);
    setCategoriesList([]);
    await supabase.auth.signOut();
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Keep admin token fresh when Supabase automatically refreshes the session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token && sessionStorage.getItem("admin_token")) {
        setToken(session.access_token);
        sessionStorage.setItem("admin_token", session.access_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Helper setters that write to URL query parameters
  const setMode = (newMode: "list" | "edit" | "expertise-edit" | "family-edit") => {
    router.navigate({
      to: "/admin",
      search: (prev: any) => ({
        ...prev,
        mode: newMode,
        profileId: newMode === "list" ? undefined : prev.profileId,
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

  const [adminView, setAdminView] = useState<"profiles" | "categories" | "expertise" | "applications" | "portfolio-review" | "users" | "analytics" | "settings">("profiles");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
      
      const savedId = selectedProfile.id || (response && response.id);
      
      if (savedId) {
        await publishProfile(savedId);
      }

      toast.success("Leader profile published successfully!", { id: "save" });
      
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
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save leader profile.", { id: "save" });
      
      if (err.message && (err.message.includes("Unauthorized") || err.message.includes("Invalid or expired token"))) {
        toast.error("Session expired. Please log in again.");
        handleLogout();
      }
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
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans select-text">
      <SEO title="Admin Dashboard | Global Leader Sphere" description="Secure admin dashboard for Global Leader Sphere" />

      {/* LEFT SIDEBAR */}
      <aside className={`bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 transition-all duration-300 border-r border-slate-800 z-30 fixed inset-y-0 left-0 md:relative ${
        sidebarCollapsed ? "w-20" : "w-64"
      } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                <Globe2 className="size-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="font-display font-bold text-sm tracking-tight text-white truncate">Global Leader Sphere</h1>
                  <p className="text-[10px] text-slate-500 font-medium">System Console</p>
                </div>
              )}
            </div>
            
            {/* Sidebar toggle button (desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex size-7 items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className={`size-4 transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
            
            {/* Mobile close toggle */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="flex md:hidden size-7 items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-6">
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Core Registry</p>}
              <ul className="space-y-1">
                {[
                  { id: "profiles", label: "Profile Management", icon: UserCheck },
                  { id: "expertise", label: "Professional Expertise", icon: Award },
                  { id: "applications", label: "Applications", icon: FileText },
                  { id: "portfolio-review", label: "Portfolio Reviews", icon: ShieldCheck }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminView === item.id && mode === "list";
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setAdminView(item.id as any);
                          setMode("list");
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        }`}
                        title={item.label}
                      >
                        <Icon className="size-4.5 shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Configuration</p>}
              <ul className="space-y-1">
                {[
                  { id: "categories", label: "Categories", icon: Layers },
                  { id: "users", label: "User Accounts", icon: Users },
                  { id: "analytics", label: "System Analytics", icon: Activity },
                  { id: "settings", label: "Settings", icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminView === item.id && mode === "list";
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setAdminView(item.id as any);
                          setMode("list");
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        }`}
                        title={item.label}
                      >
                        <Icon className="size-4.5 shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-3 border-t border-slate-800 flex flex-col gap-2">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800/50">
              <div className="size-8 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">Administrator</p>
                <p className="text-[10px] text-slate-500 truncate">admin@system.com</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
            title="Logout"
          >
            <LogOut className="size-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* MODERN HEADER */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex md:hidden size-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Welcome back, Admin</h2>
              <p className="text-[10px] text-slate-400 font-medium">Role: System SuperAdmin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Action buttons */}
            {mode === "edit" || mode === "expertise-edit" || mode === "family-edit" ? (
              <button
                onClick={() => {
                  if (confirm("Discard unsaved changes?")) {
                    setMode("list");
                    setSelectedProfile(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition h-9"
              >
                <ChevronLeft className="size-4" /> Cancel Edit
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition h-9"
              >
                View Live Website <ArrowUpRight className="size-3.5 text-blue-500" />
              </Link>
            )}

            {/* Notifications mock icon */}
            <button className="size-9 rounded-xl border border-gray-200/80 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition relative">
              <Bell className="size-4" />
              <span className="absolute top-2.5 right-2.5 size-2 bg-blue-500 rounded-full" />
            </button>

            {/* Profile Avatar */}
            <div className="size-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              A
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT BODY */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {mode === "list" ? (
            <div className="bg-transparent space-y-8">
              {adminView === "profiles" && (
                <AdminDirectory
                  profiles={profiles}
                  categoriesList={categoriesList}
                  origin={origin}
                  handleCreateNew={handleCreateNew}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  setAdminView={(v) => setAdminView(v as any)}
                  setSelectedCatId={setSelectedCatId}
                  setActiveQrModal={setActiveQrModal}
                />
              )}
              {adminView === "applications" && (
                <ApplicationReview token={token || ""} />
              )}
              {adminView === "portfolio-review" && (
                <PortfolioReview currentUser={{ role: "SUPER_ADMIN" }} />
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

            {/* USERS VIEW */}
            {adminView === "users" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">User Accounts</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage registration credentials and user access status.</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {profiles.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full overflow-hidden border border-gray-200 bg-slate-100 shrink-0 grid place-items-center text-slate-400">
                                {p.portrait && p.portrait.trim() !== "" ? (
                                  <img src={p.portrait} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="size-4" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                                <span className="text-xs text-slate-400">client-id: {p.owner_id || "Unlinked"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600">CLIENT</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 border border-emerald-200 text-emerald-700">
                              ACTIVE
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEdit(p)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                            >
                              Manage User
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ANALYTICS VIEW */}
            {adminView === "analytics" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs">
                <AnalyticsDashboard />
              </div>
            )}

            {/* SETTINGS VIEW */}
            {adminView === "settings" && (
              <div className="space-y-8">
                <div className="border-b border-gray-100 pb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">System Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure global parameters and third-party integrations.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 text-sm">General Settings</h3>
                    <p className="text-xs text-slate-400">Core parameters of the verified directory system.</p>
                  </div>
                  <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Platform Name</label>
                      <input type="text" defaultValue="Global Leader Sphere" className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-800 focus:bg-white focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Admin Email Contact</label>
                      <input type="email" defaultValue="admin@globalleadersphere.com" className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-800 focus:bg-white focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200/80" />

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 text-sm">Integrations</h3>
                    <p className="text-xs text-slate-400">Manage credentials for Cloudinary, Supabase, and mailing APIs.</p>
                  </div>
                  <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Supabase Project URL</label>
                      <input type="text" value="https://global-leader-sphere.supabase.co" disabled className="w-full bg-slate-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cloudinary Assets Bucket</label>
                      <input type="text" value="global-leader-sphere" disabled className="w-full bg-slate-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button onClick={() => toast.success("Settings saved successfully!")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-500/10">
                    Save Changes
                  </button>
                </div>
              </div>
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
                    if (!selectedProfile?.id) return;
                    router.navigate({
                      to: "/admin",
                      search: (prev: any) => ({
                        ...prev,
                        mode: "expertise-edit",
                      }),
                    });
                  }}
                  disabled={!selectedProfile?.id}
                  title={!selectedProfile?.id ? "Please save the profile first" : "Edit Professional Expertise"}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-2 ${
                    mode === "expertise-edit"
                      ? "bg-linear-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/15"
                      : "hover:bg-white/5 text-foreground/60"
                  } ${!selectedProfile?.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
              
              <ProfileEditConsole
                mode="admin"
                selectedProfile={selectedProfile}
                categoriesList={categoriesList}
                isSaving={isSaving}
                onUpdateField={updateField}
                onUpdateDataSection={updateDataSection}
                onPublish={handlePublish}
                onDiscard={() => {
                  setMode("list");
                  setSelectedProfile(null);
                }}
                onImageUpload={handleImageUpload}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                uploadImage={uploadImage}
              />

        )}
      </div>
    )}
      </main>
    </div>

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
