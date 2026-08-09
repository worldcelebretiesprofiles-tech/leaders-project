import { useForm as useRHForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { getProfessionalExpertise, saveProfessionalExpertise } from "../../services/api";
import { SectionHeader } from "./SectionHeader";
import { SaveIndicator } from "./SaveIndicator";
import { DynamicArray } from "./DynamicArray";
import { useState, useEffect } from "react";

const professionalSchema = z.object({
  professional_summary: z.string().min(10, "Summary must be at least 10 characters"),
  years_experience: z.string().optional(),
  is_available_for_consultation: z.boolean(),
  cta_text: z.string().optional(),
  roles: z.array(z.string()),
  expertise_areas: z.array(z.string()),
  achievements: z.array(z.string()),
  languages: z.array(z.string()),
});

type ProfessionalForm = z.infer<typeof professionalSchema>;

export function ProfessionalSection({ profile, session }: { profile: any; session: any }) {
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const { data: expertiseRes, isLoading } = useQuery({
    queryKey: ["professional-expertise", profile?.id],
    queryFn: () => getProfessionalExpertise(profile.id),
    enabled: !!profile?.id,
  });

  const expertise = expertiseRes?.data || expertiseRes || {};

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } = useRHForm<ProfessionalForm>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      professional_summary: "",
      years_experience: "",
      is_available_for_consultation: false,
      cta_text: "",
      roles: [],
      expertise_areas: [],
      achievements: [],
      languages: [],
    },
  });

  // Reset values when expertise loads
  useEffect(() => {
    if (expertise) {
      reset({
        professional_summary: expertise.professional_summary || "",
        years_experience: expertise.years_experience || "",
        is_available_for_consultation: !!expertise.is_available_for_consultation,
        cta_text: expertise.cta_text || "",
        roles: Array.isArray(expertise.roles) ? expertise.roles : [],
        expertise_areas: Array.isArray(expertise.expertise_areas) ? expertise.expertise_areas : [],
        achievements: Array.isArray(expertise.achievements) ? expertise.achievements : [],
        languages: Array.isArray(expertise.languages) ? expertise.languages : [],
      });
    }
  }, [expertiseRes, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ProfessionalForm) => {
      return saveProfessionalExpertise(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professional-expertise", profile?.id] });
      // Invalidate completion queries to update header percentage
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Professional Expertise saved!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save Professional Expertise."),
  });

  const onSubmit = (data: ProfessionalForm) => {
    mutation.mutate(data);
  };

  const formValues = watch();

  // Calculate completion percentage: summary (40%), years (20%), roles (20%), expertise areas (20%)
  let score = 0;
  if (formValues.professional_summary && formValues.professional_summary.trim().length >= 10) score += 40;
  if (formValues.years_experience && formValues.years_experience.trim().length > 0) score += 20;
  if (formValues.roles && formValues.roles.length > 0 && formValues.roles[0] !== "") score += 20;
  if (formValues.expertise_areas && formValues.expertise_areas.length > 0 && formValues.expertise_areas[0] !== "") score += 20;

  const status = profile?.status || "DRAFT";
  const isReadOnly = status === "SUBMITTED" || status === "PUBLISHED" || status === "UNDER_REVIEW";

  // Implement auto-save debounce
  useEffect(() => {
    if (!isDirty || isReadOnly) return;
    const timer = setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    formValues.professional_summary,
    formValues.years_experience,
    formValues.is_available_for_consultation,
    formValues.cta_text,
    JSON.stringify(formValues.roles),
    JSON.stringify(formValues.expertise_areas),
    JSON.stringify(formValues.achievements),
    JSON.stringify(formValues.languages),
    isDirty,
    isReadOnly
  ]);

  if (isLoading) return <div className="text-zinc-500 text-xs p-4">Loading Professional details...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title="Professional Expertise"
          description="Highlight your years of consulting experience, specialties, key achievements, and consultation options."
          percentage={score}
        />
        <SaveIndicator isSaving={mutation.isPending} lastSaved={lastSaved} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <fieldset disabled={isReadOnly} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Professional Summary <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("professional_summary")}
              rows={5}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="A compelling overview of your consulting history, methodology, and credentials..."
            />
            {errors.professional_summary && (
              <p className="mt-1 text-sm text-red-400">{errors.professional_summary.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Years of Experience</label>
              <input
                {...register("years_experience")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="E.g., 15+ Years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Call-To-Action (CTA) Label</label>
              <input
                {...register("cta_text")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="E.g., Book Executive Briefing"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
            <input
              type="checkbox"
              id="is_available_for_consultation"
              {...register("is_available_for_consultation")}
              className="size-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="is_available_for_consultation" className="text-sm font-medium text-zinc-300 cursor-pointer">
              Available for consulting and media appearances
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="roles"
              control={control}
              render={({ field }) => (
                <DynamicArray
                  value={field.value}
                  onChange={field.onChange}
                  label="Consulting Roles"
                  placeholder="E.g., Keynote Speaker"
                />
              )}
            />

            <Controller
              name="expertise_areas"
              control={control}
              render={({ field }) => (
                <DynamicArray
                  value={field.value}
                  onChange={field.onChange}
                  label="Specialties / Focus Areas"
                  placeholder="E.g., Quantum Computing"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="achievements"
              control={control}
              render={({ field }) => (
                <DynamicArray
                  value={field.value}
                  onChange={field.onChange}
                  label="Key Achievements"
                  placeholder="E.g., Forbes 30 Under 30"
                />
              )}
            />

            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <DynamicArray
                  value={field.value}
                  onChange={field.onChange}
                  label="Spoken Languages"
                  placeholder="E.g., English (Native)"
                />
              )}
            />
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
