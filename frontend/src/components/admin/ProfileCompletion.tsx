import { useState, useEffect } from "react";
import { getMeCompletion } from "../../services/api";
import { CheckCircle2, Circle } from "lucide-react";

export function ProfileCompletion() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompletion();
  }, []);

  const fetchCompletion = async () => {
    try {
      const res = await getMeCompletion();
      setData(res.completion);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-white/5 h-32 rounded-3xl" />;
  }

  if (!data) return null;

  const { percentage, missing, completedFields, totalFields } = data;

  return (
    <div className="glass-strong rounded-3xl p-6 border-white/10">
      <h3 className="font-display font-bold text-lg mb-4 text-gradient">Profile Completion</h3>
      
      <div className="flex items-center gap-6 mb-6">
        <div className="relative size-20 shrink-0">
          <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
            <path
              className="text-white/10"
              strokeDasharray="100, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className={percentage === 100 ? "text-emerald-500" : "text-sky"}
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
            {percentage}%
          </div>
        </div>
        
        <div>
          <p className="text-sm text-foreground/80 font-medium">
            {completedFields} of {totalFields} fields completed
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            {percentage === 100 
              ? "Your profile is fully detailed!"
              : "Complete these missing fields to improve your profile's visibility and quality."}
          </p>
        </div>
      </div>

      {missing && missing.length > 0 && (
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Missing Information
          </h4>
          <ul className="space-y-2">
            {missing.map((field: string, idx: number) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-foreground/70">
                <Circle className="size-3.5 text-sky" /> {field}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {percentage === 100 && (
        <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="size-4" /> Ready for Review
        </div>
      )}
    </div>
  );
}
