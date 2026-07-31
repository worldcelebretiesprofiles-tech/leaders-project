import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { BasicInfoSection } from "../components/portfolio-builder/BasicInfoSection";
import { BiographySection } from "../components/portfolio-builder/BiographySection";

export const Route = createFileRoute("/dashboard/portfolio")({
  component: PortfolioBuilderPage,
});

function PortfolioBuilderPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["portfolio-me"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profiles/me`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.data;
    },
    enabled: !!session,
  });

  const submitMutation = useMutation({
    mutationFn: async (summary: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ status: "SUBMITTED", change_summary: summary }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      setShowSubmitModal(false);
      setChangeSummary("");
      toast.success("Portfolio submitted for review!");
    },
    onError: () => toast.error("Failed to submit portfolio."),
  });

  if (isLoading) return <div className="p-8 text-zinc-400">Loading Portfolio...</div>;

  const status = profile?.status || 'DRAFT';
  const isPublished = profile?.is_published;
  const latestVersion = profile?.latest_version_number || 0;

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Status Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
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
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={status === 'SUBMITTED' || submitMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
            {submitMutation.isPending ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>

      {showSubmitModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Submit Profile Updates</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Please provide a brief summary of what you've updated so the administrator knows what to review.
            </p>
            <textarea
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="e.g., Added new achievements, updated biography..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-blue-500 outline-none min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => submitMutation.mutate(changeSummary)}
                disabled={submitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} /> Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 shrink-0">
            <nav className="flex flex-col gap-1 sticky top-8">
              {[
                { id: "basic-info", label: "Basic Information" },
                { id: "biography", label: "Biography" },
                { id: "expertise", label: "Professional Expertise" },
                { id: "family", label: "Family Details" },
                { id: "gallery", label: "Media & Gallery" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50" 
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm p-6 min-h-[500px]">
            {activeTab === "basic-info" && (
              <BasicInfoSection profile={profile} session={session} />
            )}
            {activeTab === "biography" && (
              <BiographySection profile={profile} session={session} />
            )}
            {activeTab === "expertise" && (
              <div className="text-zinc-400">Professional Expertise module loading...</div>
            )}
            {activeTab === "family" && (
              <div className="text-zinc-400">Family Details module loading...</div>
            )}
            {activeTab === "gallery" && (
              <div className="text-zinc-400">Gallery module loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
