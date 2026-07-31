import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfiles, getBaseUrl, getHeaders } from "../../services/api";
import { LeaderProfileView } from "../LeaderProfileView";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  History,
  AlertCircle,
  ChevronLeft,
  Archive,
  Search,
  Filter,
  User,
} from "lucide-react";

export function PortfolioReview({ currentUser }: { currentUser: any }) {
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [previewMode, setPreviewMode] = useState<"DRAFT" | "LIVE">("DRAFT");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["adminProfiles"],
    queryFn: () => getProfiles(),
  });

  const selectedProfile = profiles.find((p: any) => p.id === selectedProfileId);

  const { data: versions = [], isLoading: isLoadingVersions } = useQuery({
    queryKey: ["profileVersions", selectedProfileId],
    queryFn: async () => {
      if (!selectedProfileId) return [];
      const res = await fetch(`${getBaseUrl()}/api/v1/profiles/${selectedProfileId}/versions`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch versions");
      const data = await res.json();
      return data.data;
    },
    enabled: !!selectedProfileId,
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await fetch(`${getBaseUrl()}/api/v1/profiles/${id}/publish`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ reviewNotes: notes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to publish");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Portfolio published successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminProfiles"] });
      setSelectedProfileId(null);
      setReviewNotes("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish portfolio");
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await fetch(`${getBaseUrl()}/api/v1/profiles/${id}/request-changes`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ reviewNotes: notes }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to request changes");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Changes requested successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminProfiles"] });
      setSelectedProfileId(null);
      setReviewNotes("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to request changes");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await fetch(`${getBaseUrl()}/api/v1/profiles/${id}/archive`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to archive");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Portfolio archived successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminProfiles"] });
      setSelectedProfileId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to archive portfolio");
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async ({ id, versionId }: { id: number; versionId: number }) => {
      const { rollbackVersion } = await import("../../services/api");
      return await rollbackVersion(id, versionId);
    },
    onSuccess: (data) => {
      toast.success(`Successfully restored to Version ${data.data?.restored_version_number || data.restored_version_number}!`);
      queryClient.invalidateQueries({ queryKey: ["adminProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["profileVersions", selectedProfileId] });
      setPreviewMode("DRAFT");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to rollback version");
    },
  });

  const handlePublish = () => {
    if (!selectedProfileId) return;
    if (confirm("Are you sure you want to approve and publish this version?")) {
      publishMutation.mutate({ id: selectedProfileId, notes: reviewNotes });
    }
  };

  const handleRequestChanges = () => {
    if (!selectedProfileId) return;
    if (!reviewNotes.trim()) {
      toast.error("Review notes are required to request changes.");
      return;
    }
    requestChangesMutation.mutate({ id: selectedProfileId, notes: reviewNotes });
  };

  const handleArchive = () => {
    if (!selectedProfileId) return;
    if (confirm("Are you sure you want to archive this portfolio? This action is for Super Admins only.")) {
      archiveMutation.mutate({ id: selectedProfileId, reason: "Archived by Super Admin" });
    }
  };

  const filteredProfiles = profiles.filter((p: any) => {
    const pName = p.name || "";
    const pTitle = p.title || "";
    const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase()) || pTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    // Hide purely published ones from the active review queue unless specifically asked
    const isReviewable = p.status === "SUBMITTED" || p.status === "CHANGES_REQUESTED" || p.status === "DRAFT" || p.status === "ARCHIVED";
    return matchesSearch && matchesStatus && isReviewable;
  });

  // Render the Review Workspace if a profile is selected
  if (selectedProfileId && selectedProfile) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Details */}
        <div className="w-full md:w-80 border-r border-white/5 bg-midnight/50 flex flex-col h-full shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-white/5 sticky top-0 bg-midnight/90 backdrop-blur-md z-10">
            <button 
              onClick={() => setSelectedProfileId(null)}
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition"
            >
              <ChevronLeft className="size-3.5" /> Back to Dashboard
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            <div>
              <div className="size-16 rounded-xl overflow-hidden bg-white/5 mb-4 border border-white/10">
                {selectedProfile.portrait ? (
                  <img src={selectedProfile.portrait} alt={selectedProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-white/20">No Img</div>
                )}
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{selectedProfile.name}</h2>
              <p className="text-sm text-sky mt-1">{selectedProfile.title}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/70">
                  {selectedProfile.status}
                </span>
                {selectedProfile.is_published && (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
                    Live v{selectedProfile.latest_version_number || 0}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Submission Details</h3>
              <div className="glass p-3 rounded-xl border-white/5 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-white text-right">{selectedProfile.category_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="text-white text-right">{selectedProfile.submitted_at ? new Date(selectedProfile.submitted_at).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>

            {selectedProfile.change_summary && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Change Summary</h3>
                <div className="glass p-3 rounded-xl border-sky/20 bg-sky/5 text-sm text-sky">
                  {selectedProfile.change_summary}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                <History className="size-3.5" /> Version History
              </h3>
              {isLoadingVersions ? (
                <div className="text-xs text-muted-foreground">Loading versions...</div>
              ) : versions.length > 0 ? (
                <div className="space-y-2">
                  {versions.map((v: any) => (
                    <div key={v.id} className="glass p-3 rounded-xl border-white/5 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Version {v.version_number}</span>
                        <span className="text-foreground/40">{new Date(v.published_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-1">{v.change_summary || "No summary provided"}</p>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to rollback the working draft to Version ${v.version_number}? This will overwrite current draft changes.`)) {
                              rollbackMutation.mutate({ id: selectedProfileId!, versionId: v.id });
                            }
                          }}
                          disabled={rollbackMutation.isPending}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition text-[10px] font-bold uppercase"
                        >
                          Restore Draft
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No published versions yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel: Preview */}
        <div className="flex-1 bg-black relative flex flex-col min-w-0">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-full p-1 border-white/10 flex items-center gap-1">
            <button
              onClick={() => setPreviewMode("DRAFT")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                previewMode === "DRAFT" ? "bg-sky text-white" : "text-foreground hover:text-white"
              }`}
            >
              Preview Draft
            </button>
            <button
              onClick={() => setPreviewMode("LIVE")}
              disabled={!selectedProfile.is_published}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                !selectedProfile.is_published ? "opacity-30 cursor-not-allowed" :
                previewMode === "LIVE" ? "bg-emerald-500 text-white" : "text-foreground hover:text-white"
              }`}
            >
              Preview Live
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto w-full">
             {/* Note: In a real app, 'LIVE' preview would fetch the published snapshot. 
                 For now, we just show the selectedProfile for draft, or a placeholder for live. */}
             {previewMode === "DRAFT" ? (
               <div className="pointer-events-none origin-top scale-[0.85] md:scale-100">
                 <LeaderProfileView leader={selectedProfile} allProfiles={profiles} />
               </div>
             ) : (
               <div className="grid place-items-center h-full text-muted-foreground">
                 Live version preview would fetch from the public API.
               </div>
             )}
          </div>
        </div>

        {/* Right Panel: Actions */}
        <div className="w-full md:w-80 border-l border-white/5 bg-midnight/50 flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-white/5 bg-midnight/90">
            <h3 className="font-bold text-white text-sm">Review Actions</h3>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Review Notes (Sent to Leader)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Explain any required changes or leave a note..."
                className="w-full h-32 bg-midnight/30 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:border-sky/50 outline-none resize-none transition"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePublish}
                disabled={publishMutation.isPending || selectedProfile.status !== "SUBMITTED"}
                className="w-full btn-premium rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" /> Approve & Publish
              </button>
              
              <button
                onClick={handleRequestChanges}
                disabled={requestChangesMutation.isPending || selectedProfile.status !== "SUBMITTED"}
                className="w-full glass rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 transition disabled:opacity-50"
              >
                <AlertCircle className="size-4" /> Request Changes
              </button>

              {currentUser?.role === "SUPER_ADMIN" && (
                <button
                  onClick={handleArchive}
                  disabled={archiveMutation.isPending}
                  className="w-full mt-8 glass rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 text-foreground/40 hover:text-white transition disabled:opacity-50"
                >
                  <Archive className="size-4" /> Archive Portfolio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard Table
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Portfolio Reviews</h2>
          <p className="text-muted-foreground text-sm mt-1">Review, approve, and manage leader submissions.</p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 items-center bg-white/[0.02]">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-midnight/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-sky/50 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-midnight/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-sky/50"
            >
              <option value="ALL">All Active</option>
              <option value="SUBMITTED">Needs Review (Submitted)</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading submissions...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No portfolios found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 font-bold text-foreground/40 uppercase tracking-wider text-xs">Leader</th>
                  <th className="px-6 py-4 font-bold text-foreground/40 uppercase tracking-wider text-xs">Category</th>
                  <th className="px-6 py-4 font-bold text-foreground/40 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-bold text-foreground/40 uppercase tracking-wider text-xs">Submitted</th>
                  <th className="px-6 py-4 font-bold text-foreground/40 uppercase tracking-wider text-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProfiles.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                          {p.portrait ? (
                            <img src={p.portrait} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-white/20"><User className="size-4" /></div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{p.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {p.category_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400' :
                        p.status === 'CHANGES_REQUESTED' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-white/5 text-foreground/60'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedProfileId(p.id)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-sky hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-sky/10"
                      >
                        <Eye className="size-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
