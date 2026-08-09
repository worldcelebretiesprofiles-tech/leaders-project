import { useForm as useRHForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { getBaseUrl } from "../../services/api";
import { SectionHeader } from "./SectionHeader";
import { SaveIndicator } from "./SaveIndicator";
import { useState, useEffect } from "react";

const socialLinksSchema = z.object({
  linkedin: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  twitter: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  instagram: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)),
});

type SocialLinksForm = z.infer<typeof socialLinksSchema>;

export function SocialLinksSection({ profile, session }: { profile: any; session: any }) {
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const connect = profile?.data?.connect || {};

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useRHForm<SocialLinksForm>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      linkedin: connect.linkedin || "",
      twitter: connect.twitter || "",
      instagram: connect.instagram || "",
      website: connect.website || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SocialLinksForm) => {
      const res = await fetch(`${getBaseUrl()}/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          data: {
            ...profile?.data,
            connect: {
              linkedin: data.linkedin,
              twitter: data.twitter,
              instagram: data.instagram,
              website: data.website,
            },
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Social Links saved!");
    },
    onError: () => toast.error("Failed to save Social Links."),
  });

  const onSubmit = (data: SocialLinksForm) => {
    mutation.mutate(data);
  };

  const formValues = watch();

  // Calculate completion percentage: 25% for each filled social handle
  let score = 0;
  if (formValues.linkedin && formValues.linkedin.trim().length > 0) score += 25;
  if (formValues.twitter && formValues.twitter.trim().length > 0) score += 25;
  if (formValues.instagram && formValues.instagram.trim().length > 0) score += 25;
  if (formValues.website && formValues.website.trim().length > 0) score += 25;

  const status = profile?.status || "DRAFT";
  const isReadOnly = status === "SUBMITTED" || status === "PUBLISHED" || status === "UNDER_REVIEW";

  // Implement auto-save debounce
  useEffect(() => {
    if (!isDirty || isReadOnly) return;
    const timer = setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 1500);
    return () => clearTimeout(timer);
  }, [formValues.linkedin, formValues.twitter, formValues.instagram, formValues.website, isDirty, isReadOnly]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title="Social Links"
          description="Link your professional and personal social handles for connect options on your portfolio."
          percentage={score}
        />
        <SaveIndicator isSaving={mutation.isPending} lastSaved={lastSaved} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <fieldset disabled={isReadOnly} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">LinkedIn Profile URL</label>
              <input
                {...register("linkedin")}
                type="text"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="https://linkedin.com/in/username"
              />
              {errors.linkedin && <p className="mt-1 text-sm text-red-400">{errors.linkedin.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Twitter / X URL</label>
              <input
                {...register("twitter")}
                type="text"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="https://x.com/username"
              />
              {errors.twitter && <p className="mt-1 text-sm text-red-400">{errors.twitter.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Instagram URL</label>
              <input
                {...register("instagram")}
                type="text"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="https://instagram.com/username"
              />
              {errors.instagram && <p className="mt-1 text-sm text-red-400">{errors.instagram.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Personal Website URL</label>
              <input
                {...register("website")}
                type="text"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="https://username.com"
              />
              {errors.website && <p className="mt-1 text-sm text-red-400">{errors.website.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={!isDirty || mutation.isPending || isReadOnly}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Save size={16} />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
