import { Loader2, Check } from "lucide-react";

export function SaveIndicator({ isSaving, lastSaved }: { isSaving: boolean; lastSaved: string | null }) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium select-none">
      {isSaving ? (
        <>
          <Loader2 className="size-3.5 animate-spin text-blue-500" />
          <span>Saving changes...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="size-3.5 text-emerald-500" />
          <span>Draft autosaved at {lastSaved}</span>
        </>
      ) : null}
    </div>
  );
}
