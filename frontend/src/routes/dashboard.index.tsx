import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { profile } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-zinc-100">Welcome to your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
            Portfolio Status
          </h2>
          
          <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800/50">
            {profile?.status === 'ACTIVE' && (
              <CheckCircle2 className="text-emerald-500" size={24} />
            )}
            {profile?.status === 'PENDING' && (
              <Clock className="text-amber-500" size={24} />
            )}
            {(profile?.status === 'SUSPENDED' || profile?.status === 'REJECTED') && (
              <AlertCircle className="text-red-500" size={24} />
            )}
            
            <div>
              <p className="text-sm text-zinc-400">Current Status</p>
              <p className="font-semibold text-zinc-100 capitalize">{profile?.status?.toLowerCase() || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-zinc-400 leading-relaxed">
            {profile?.status === 'ACTIVE' 
              ? "Your portfolio is live and visible to the public. You can manage your contents using the tools below."
              : profile?.status === 'PENDING'
              ? "Your application has been approved and your account is created. Your public portfolio is currently being set up by our team."
              : "Your account is currently inactive. Please contact support for more information."}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
           <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mb-4 border border-blue-900/50">
             <span className="text-blue-400 font-bold text-xl">PB</span>
           </div>
           <h3 className="text-lg font-medium text-zinc-200 mb-2">Portfolio Builder</h3>
           <p className="text-sm text-zinc-400 mb-4">
             The self-service portfolio editor is currently in development.
           </p>
           <span className="inline-flex items-center rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-800/50">
             Coming Soon
           </span>
        </div>
      </div>
    </div>
  );
}
