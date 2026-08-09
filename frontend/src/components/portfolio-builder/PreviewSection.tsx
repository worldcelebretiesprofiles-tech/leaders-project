import { LeaderProfileView } from "../LeaderProfileView";

export function PreviewSection({ profile }: { profile: any }) {
  // Merge profile information for preview view
  const mockProfile = {
    ...profile,
    // Add default values for layout if needed
    data: profile?.data || {},
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl mb-4">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Live Profile Preview</h3>
        <p className="text-[11px] text-zinc-400">
          This is exactly how your profile looks to visitors of your verified web page.
        </p>
      </div>

      <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#0A0D14]">
        <LeaderProfileView leader={mockProfile} allProfiles={[]} />
      </div>
    </div>
  );
}
