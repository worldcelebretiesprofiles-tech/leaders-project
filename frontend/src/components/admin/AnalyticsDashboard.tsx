import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics } from "../../services/api";
import { Users, FileText, CheckCircle2, Clock } from "lucide-react";

export function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["dashboardAnalytics"],
    queryFn: () => getDashboardAnalytics(),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground p-8">Loading analytics...</div>;
  }

  if (error || !analytics) {
    return <div className="text-sm text-red-500 p-8">Failed to load analytics</div>;
  }

  const statCards = [
    { label: "Total Profiles", value: analytics.total_profiles, icon: Users, color: "text-blue-500" },
    { label: "Published Profiles", value: analytics.published_profiles, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Pending Reviews", value: analytics.pending_profiles, icon: Clock, color: "text-amber-500" },
    { label: "Draft Profiles", value: analytics.draft_profiles, icon: FileText, color: "text-sky-500" },
    { label: "Total Applications", value: analytics.total_applications, icon: FileText, color: "text-purple-500" },
    { label: "Pending Applications", value: analytics.pending_applications, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-gradient">Dashboard Analytics</h2>
        <p className="text-sm text-foreground/60 mt-1">Overview of system metrics and platform usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`size-12 rounded-full bg-white/5 flex items-center justify-center ${stat.color}`}>
                <Icon className="size-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
