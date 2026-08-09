import { CompletionBadge } from "./CompletionBadge";

export function SectionHeader({ title, description, percentage }: { title: string; description: string; percentage: number }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-400 mt-1">{description}</p>
      </div>
      <CompletionBadge percentage={percentage} />
    </div>
  );
}
