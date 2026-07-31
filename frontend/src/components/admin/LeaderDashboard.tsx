import React from "react";
import { ProfileCompletion } from "./ProfileCompletion";
import { Activity, Clock, FileText, CheckCircle2 } from "lucide-react";

interface LeaderDashboardProps {
  profile: any;
}

export function LeaderDashboard({ profile }: LeaderDashboardProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gradient">Leader Workspace</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Manage your public identity and track your review status.
          </p>
        </div>
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
          <div className={`size-3 rounded-full animate-pulse ${
            profile.status === 'PUBLISHED' ? 'bg-emerald-500' :
            profile.status === 'IN_REVIEW' ? 'bg-amber-500' :
            'bg-sky'
          }`} />
          <span className="text-sm font-semibold tracking-wide text-foreground/80">
            {profile.status === 'PUBLISHED' ? 'Live & Published' :
             profile.status === 'IN_REVIEW' ? 'Under Review' :
             profile.status === 'CHANGES_REQUESTED' ? 'Action Required' :
             'Draft Status'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ProfileCompletion />
        
        {/* Quick Stats / Review Timeline Widget */}
        <div className="glass-strong rounded-3xl p-6 border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-gradient flex items-center gap-2">
              <Clock className="size-5 text-sky" /> Version History
            </h3>
            <p className="text-sm text-foreground/60 mb-6">
              Track your profile iterations and previous published snapshots. (Version history viewer coming soon)
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-foreground/40" />
                <div>
                  <p className="text-sm font-bold text-foreground">Current Draft</p>
                  <p className="text-xs text-foreground/50">Last updated today</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-sky/10 text-sky">Active</span>
            </div>
            
            {profile.current_version_id && (
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10 opacity-70">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Version {profile.latest_version_number}</p>
                    <p className="text-xs text-foreground/50">
                      Published {new Date(profile.last_published_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-xs text-sky font-bold hover:underline">View</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity Widget */}
      <div className="glass-strong rounded-3xl p-6 border-white/10">
        <h3 className="font-display font-bold text-lg mb-4 text-gradient flex items-center gap-2">
          <Activity className="size-5 text-sky" /> Recent Activity
        </h3>
        <div className="text-sm text-foreground/50 text-center py-8">
          No recent activity to show. Submit your profile to begin the review process!
        </div>
      </div>
    </div>
  );
}
