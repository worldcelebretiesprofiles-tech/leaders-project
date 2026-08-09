import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export function CompletionBadge({ percentage }: { percentage: number }) {
  const rounded = Math.round(percentage);
  let color = "bg-red-500/10 text-red-400 border-red-500/20";
  let Icon = AlertCircle;
  
  if (rounded === 100) {
    color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    Icon = CheckCircle2;
  } else if (rounded > 0) {
    color = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    Icon = Sparkles;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${color}`}>
      <Icon size={12} /> {rounded}% Complete
    </span>
  );
}
