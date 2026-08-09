import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, AlertCircle, Eye } from "lucide-react";
import { getBaseUrl, getHeaders } from "../../services/api";
import { supabase } from "../../lib/supabase";

interface Application {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  job_title: string;
  linkedin_url: string;
  motivation: string;
  status: string;
  created_at: string;
}

interface ApplicationReviewProps {
  token: string;
}

export function ApplicationReview({ token }: ApplicationReviewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"SUBMITTED" | "APPROVED" | "REJECTED">("SUBMITTED");

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const headers = getHeaders();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${getBaseUrl()}/applications?status=${activeTab}`, {
        headers,
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : (data.data || []));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: number, status: string, notes?: string) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) return;
    
    setActionLoading(true);
    try {
      const headers = getHeaders({ "Content-Type": "application/json" });
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${getBaseUrl()}/applications/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${status.toLowerCase()} application`);
      }
      setSelectedApp(null);
      await fetchApplications();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to completely delete this application? This cannot be undone.")) return;
    
    setActionLoading(true);
    try {
      const headers = getHeaders();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${getBaseUrl()}/applications/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete application");
      }
      setSelectedApp(null);
      await fetchApplications();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && applications.length === 0) return <div className="p-8 text-center text-foreground/50">Loading applications...</div>;
  if (error) return <div className="p-8 text-center text-red-400"><AlertCircle className="inline mr-2" /> {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="text-sky" /> Applications
        </h2>
        <div className="flex bg-midnight rounded-xl p-1 border border-white/5">
          <button 
            onClick={() => setActiveTab('SUBMITTED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'SUBMITTED' ? 'bg-sky text-white' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'APPROVED' ? 'bg-emerald-500 text-white' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'REJECTED' ? 'bg-red-500 text-white' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-foreground/50">
          No {activeTab.toLowerCase()} applications at this time.
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden border border-foreground/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-foreground/5 text-xs uppercase text-foreground/50 font-bold">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-foreground/5 transition">
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {app.first_name} {app.last_name}
                  </td>
                  <td className="px-6 py-4 text-foreground/70">
                    {app.email}
                  </td>
                  <td className="px-6 py-4 text-foreground/50">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-sky hover:text-sky-light inline-flex items-center gap-1 font-semibold bg-sky/10 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye className="size-4" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-foreground/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-foreground/5">
              <h3 className="text-lg font-bold text-foreground">Review Application</h3>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-foreground/50 hover:text-foreground transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-sky uppercase tracking-wider block mb-1">Applicant Name</label>
                  <p className="text-foreground font-semibold bg-foreground/5 p-3 rounded-xl">
                    {selectedApp.first_name} {selectedApp.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-sky uppercase tracking-wider block mb-1">Email Address</label>
                  <p className="text-foreground font-semibold bg-foreground/5 p-3 rounded-xl">
                    {selectedApp.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-sky uppercase tracking-wider block mb-1">Company / Organization</label>
                <p className="text-foreground font-semibold bg-foreground/5 p-3 rounded-xl">
                  {selectedApp.company}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-sky uppercase tracking-wider block mb-1">Motivation / Background</label>
                <div className="text-foreground/80 bg-foreground/5 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedApp.motivation}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-sky uppercase tracking-wider block mb-1">Admin Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes about this decision..."
                  className="w-full bg-background border border-foreground/20 rounded-xl p-3 text-sm text-foreground focus:border-sky/50 outline-none min-h-[80px]"
                />
              </div>
            </div>

            {activeTab === 'SUBMITTED' ? (
              <div className="p-6 border-t border-foreground/10 bg-foreground/5 flex gap-3 justify-end items-center">
                <button
                  onClick={() => handleDelete(selectedApp.id)}
                  disabled={actionLoading}
                  className="mr-auto px-4 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition disabled:opacity-50 flex items-center gap-2"
                >
                  Delete Application
                </button>
                <button
                  onClick={() => handleReview(selectedApp.id, "REJECTED", notes)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="size-4" /> Reject
                </button>
                <button
                  onClick={() => handleReview(selectedApp.id, "APPROVED", notes)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="size-4" /> Approve & Invite
                </button>
              </div>
            ) : (
              <div className="p-6 border-t border-foreground/10 bg-foreground/5 flex gap-3 justify-end items-center">
                {activeTab !== 'APPROVED' && (
                  <button
                    onClick={() => handleDelete(selectedApp.id)}
                    disabled={actionLoading}
                    className="mr-auto px-4 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    Delete Application
                  </button>
                )}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-foreground bg-foreground/10 hover:bg-foreground/20 transition flex items-center gap-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
