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

const biographySchema = z.object({
  biography: z.string().min(10, "Biography must be at least 10 characters"),
  earlyLife: z.string().optional(),
  career: z.string().optional(),
});

type BiographyForm = z.infer<typeof biographySchema>;

export function BiographySection({ profile, session }: { profile: any; session: any }) {
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useRHForm<BiographyForm>({
    resolver: zodResolver(biographySchema),
    defaultValues: {
      biography: profile?.data?.biography || "",
      earlyLife: profile?.data?.earlyLife || "",
      career: profile?.data?.career || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: BiographyForm) => {
      const res = await fetch(`${getBaseUrl()}/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          data: {
            ...profile?.data,
            biography: formData.biography,
            earlyLife: formData.earlyLife,
            career: formData.career,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Biography saved!");
    },
    onError: () => toast.error("Failed to save Biography."),
  });

  const onSubmit = (data: BiographyForm) => {
    mutation.mutate(data);
  };

  const formValues = watch();

  // Calculate completion percentage: biography (50%), earlyLife (25%), career (25%)
  let score = 0;
  if (formValues.biography && formValues.biography.trim().length >= 10) score += 50;
  if (formValues.earlyLife && formValues.earlyLife.trim().length > 0) score += 25;
  if (formValues.career && formValues.career.trim().length > 0) score += 25;

  const status = profile?.status || "DRAFT";
  const isReadOnly = status === "SUBMITTED" || status === "PUBLISHED" || status === "UNDER_REVIEW";

  // Implement auto-save debounce
  useEffect(() => {
    if (!isDirty || isReadOnly) return;
    const timer = setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 1500);
    return () => clearTimeout(timer);
  }, [formValues.biography, formValues.earlyLife, formValues.career, isDirty, isReadOnly]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title="Biography"
          description="A comprehensive overview of your journey, impact, early life, and career."
          percentage={score}
        />
        <SaveIndicator isSaving={mutation.isPending} lastSaved={lastSaved} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <fieldset disabled={isReadOnly} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Main Story / Executive Biography <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("biography")}
              rows={8}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Write your story here..."
            />
            {errors.biography && <p className="mt-1 text-sm text-red-400">{errors.biography.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Early Life & Education</label>
              <textarea
                {...register("earlyLife")}
                rows={6}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                placeholder="E.g., Born in Seattle, studied engineering at Stanford University..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Career & Professional Milestone</label>
              <textarea
                {...register("career")}
                rows={6}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                placeholder="E.g., Formed First Ventures in 2012, later acquired by TechCorp..."
              />
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
