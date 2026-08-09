import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, Save, Send, UserCheck, Award } from "lucide-react";
import { toast } from "sonner";
import { getBaseUrl, saveProfile, uploadImage, getCategories, getHeaders } from "../services/api";
import { ProfileEditConsole, ActiveSubSection, normalizeProfile } from "../components/admin/ProfileEditConsole";
import { ProfessionalExpertiseEditor } from "./admin";
import { NotificationCenter } from "../components/admin/NotificationCenter";

export const Route = createFileRoute("/dashboard/portfolio")({
  component: PortfolioBuilderPage,
});

function PortfolioBuilderPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const [mainMode, setMainMode] = useState<"profile" | "professional">("profile");
  const [activeSection, setActiveSection] = useState<ActiveSubSection>("general");
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");

  const submitMutation = useMutation({
    mutationFn: async (summary: string) => {
      const payload = {
        ...localProfile,
        status: "SUBMITTED",
        change_summary: summary,
      };
      
      const res = await fetch(`${getBaseUrl()}/profiles/me`, {
        method: "PATCH",
        headers: getHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit portfolio.");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      setShowSubmitModal(false);
      setChangeSummary("");
      toast.success("Portfolio successfully submitted for review!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit portfolio.");
    },
  });

  // 1. Fetch Categories List
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories();
        setCategoriesList(cats);
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    }
    loadCategories();
  }, []);

  // 2. Fetch Profile Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["portfolio-me"],
    queryFn: async () => {
      const res = await fetch(`${getBaseUrl()}/profiles/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.data;
    },
    enabled: !!session,
  });

  // Fetch latest notifications to show changes requested message
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications-me"],
    queryFn: async () => {
      const res = await fetch(`${getBaseUrl()}/notifications/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      return json.notifications || [];
    },
    enabled: !!session,
  });

  const status = profile?.status || 'DRAFT';
  const latestChangeRequest = notifications.find((n: any) => n.type === 'CHANGES_REQUESTED' && status === 'CHANGES_REQUESTED');

  // Keep localProfile in sync when fetched profile updates
  useEffect(() => {
    if (profile) {
      setLocalProfile(normalizeProfile(profile));
    }
  }, [profile]);

  if (isLoading || !localProfile) return <div className="p-8 text-zinc-400">Loading Portfolio...</div>;

  const isPublished = profile?.is_published;
  const latestVersion = profile?.latest_version_number || 0;

  // Safe nested state update helpers
  const updateField = (field: string, value: any) => {
    setLocalProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateDataSection = (section: string, value: any) => {
    setLocalProfile((prev: any) => ({
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

    setIsSaving(true);
    toast.loading("Uploading image...", { id: "img-upload" });

    try {
      const res = await uploadImage(file);
      onComplete(res.url);
      toast.success("Image uploaded successfully!", { id: "img-upload" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.", { id: "img-upload" });
    } finally {
      setIsSaving(false);
    }
  };

  // Save changes to database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      toast.loading("Saving changes to database...", { id: "save" });
      
      const res = await fetch(`${getBaseUrl()}/profiles/me`, {
        method: "PATCH",
        headers: getHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(localProfile),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save profile changes.");
      }

      toast.success("Portfolio draft saved successfully!", { id: "save" });
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save portfolio changes.", { id: "save" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveExpertise = async (payload: any, publish: boolean) => {
    try {
      setIsSaving(true);
      toast.loading("Saving professional expertise...", { id: "save-exp" });
      
      // Clean structure for saving expertise
      const updatedProfile = {
        ...localProfile,
        data: {
          ...localProfile.data,
          ...payload,
        }
      };

      const res = await fetch(`${getBaseUrl()}/profiles/me`, {
        method: "PATCH",
        headers: getHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(updatedProfile),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save professional expertise.");
      }

      toast.success(publish ? "Professional expertise published successfully!" : "Professional expertise draft saved successfully!", { id: "save-exp" });
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save professional expertise.", { id: "save-exp" });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Workspace Header Panel */}
      <div className="bg-zinc-950 border-b border-zinc-900 p-4 px-8 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-3">
            Portfolio Builder
            {isPublished && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={12} /> Live Version: v{latestVersion}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Working Draft Status:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-bold tracking-wide text-zinc-300 ring-1 ring-inset ring-zinc-700 uppercase">
              {status === 'DRAFT' && <Save className="text-zinc-400" size={12} />}
              {status === 'SUBMITTED' && <Clock className="text-blue-500" size={12} />}
              {status === 'CHANGES_REQUESTED' && <AlertCircle className="text-amber-500" size={12} />}
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
          <button
            onClick={handleSave}
            disabled={isSaving || status === 'SUBMITTED'}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 px-4 py-2 text-xs font-bold text-zinc-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} /> Save Draft
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSaving || status === 'SUBMITTED' || submitMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            {submitMutation.isPending ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>

      {/* Changes Requested Banner */}
      {status === 'CHANGES_REQUESTED' && latestChangeRequest && (
        <div className="bg-amber-950/40 border-b border-amber-900/50 p-4 px-8 flex items-start gap-3 shrink-0">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="text-sm font-bold text-amber-500">Administrator Requested Changes</h3>
            <p className="text-xs text-amber-200/70 mt-1 whitespace-pre-wrap">{latestChangeRequest.message}</p>
            {latestChangeRequest.metadata?.review_notes && (
              <div className="mt-3 p-3 bg-black/40 rounded-lg border border-amber-900/30">
                <p className="text-xs text-amber-100 font-medium whitespace-pre-wrap">{latestChangeRequest.metadata.review_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode Switcher Banner */}
      <div className="bg-zinc-955 border-b border-zinc-900 p-3 px-8 flex flex-col sm:flex-row justify-between items-center gap-3 sticky z-10 shrink-0 shadow-sm">
        <div className="text-zinc-400 text-xs font-medium">
          Editing Portfolio: <strong className="text-zinc-200">{profile?.name}</strong>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setMainMode("profile");
              if (activeSection === "dashboard") {
                setActiveSection("general");
              }
            }}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
              mainMode === "profile"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                : "hover:bg-zinc-800 text-zinc-400"
            }`}
          >
            <UserCheck size={14} /> Profile Info & Bio
          </button>
          <button
            type="button"
            onClick={() => {
              setMainMode("professional");
            }}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
              mainMode === "professional"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/15"
                : "hover:bg-zinc-800 text-zinc-400"
            }`}
          >
            <Award size={14} /> Professional Expertise
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950">
        {mainMode === "profile" ? (
          <ProfileEditConsole
            mode="client"
            selectedProfile={localProfile}
            categoriesList={categoriesList}
            isSaving={isSaving}
            onUpdateField={updateField}
            onUpdateDataSection={updateDataSection}
            onPublish={() => setShowSubmitModal(true)}
            onDiscard={() => {
              setLocalProfile(profile);
            }}
            onImageUpload={handleImageUpload}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        ) : (
          <div className="max-w-7xl mx-auto">
            <ProfessionalExpertiseEditor
              profileId={localProfile.id}
              profileName={localProfile.name}
              profileSlug={localProfile.slug}
              onCancel={() => {
                setMainMode("profile");
              }}
              onSave={handleSaveExpertise}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-in">
            <div>
              <h3 className="text-lg font-bold text-white">Submit Portfolio Updates</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Please provide a brief summary of what you've updated so the administrator knows what to review.
              </p>
            </div>
            <textarea
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="e.g., Added new achievements, updated biography..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 focus:border-blue-500 outline-none min-h-[100px]"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => submitMutation.mutate(changeSummary)}
                disabled={submitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Send size={14} /> Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
