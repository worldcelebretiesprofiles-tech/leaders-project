import { useForm as useRHForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { getFamilyDetails, saveFamilyDetails } from "../../services/api";
import { SectionHeader } from "./SectionHeader";
import { SaveIndicator } from "./SaveIndicator";
import { DynamicArray } from "./DynamicArray";
import { useState, useEffect } from "react";

const familySchema = z.object({
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  spouse_name: z.string().optional(),
  background: z.string().optional(),
  children: z.array(z.string()),
});

type FamilyForm = z.infer<typeof familySchema>;

export function FamilySection({ profile, session }: { profile: any; session: any }) {
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const { data: familyRes, isLoading } = useQuery({
    queryKey: ["family-details", profile?.id],
    queryFn: () => getFamilyDetails(profile.id),
    enabled: !!profile?.id,
  });

  const family = familyRes?.data || familyRes || {};

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } = useRHForm<FamilyForm>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      father_name: "",
      mother_name: "",
      spouse_name: "",
      background: "",
      children: [],
    },
  });

  // Reset values when family data loads
  useEffect(() => {
    if (family) {
      reset({
        father_name: family.father_name || "",
        mother_name: family.mother_name || "",
        spouse_name: family.spouse_name || "",
        background: family.background || "",
        children: Array.isArray(family.children) ? family.children : [],
      });
    }
  }, [familyRes, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FamilyForm) => {
      return saveFamilyDetails(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-details", profile?.id] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Family Details saved!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save Family Details."),
  });

  const onSubmit = (data: FamilyForm) => {
    mutation.mutate(data);
  };

  const formValues = watch();

  // Calculate completion percentage: background (40%), father_name (20%), mother_name (20%), spouse_name (20%)
  let score = 0;
  if (formValues.background && formValues.background.trim().length > 0) score += 40;
  if (formValues.father_name && formValues.father_name.trim().length > 0) score += 20;
  if (formValues.mother_name && formValues.mother_name.trim().length > 0) score += 20;
  if (formValues.spouse_name && formValues.spouse_name.trim().length > 0) score += 20;

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
    formValues.father_name,
    formValues.mother_name,
    formValues.spouse_name,
    formValues.background,
    JSON.stringify(formValues.children),
    isDirty,
    isReadOnly
  ]);

  if (isLoading) return <div className="text-zinc-500 text-xs p-4">Loading Family details...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title="Family Details"
          description="Provide details regarding your family lineage and background (kept secure for biography archiving)."
          percentage={score}
        />
        <SaveIndicator isSaving={mutation.isPending} lastSaved={lastSaved} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <fieldset disabled={isReadOnly} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Father's Name</label>
              <input
                {...register("father_name")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Mother's Name</label>
              <input
                {...register("mother_name")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Spouse's Name</label>
              <input
                {...register("spouse_name")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Linage / Family Background</label>
            <textarea
              {...register("background")}
              rows={4}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="E.g. Hailing from a line of dedicated educators and civil servants..."
            />
          </div>

          <Controller
            name="children"
            control={control}
            render={({ field }) => (
              <DynamicArray
                value={field.value}
                onChange={field.onChange}
                label="Children names"
                placeholder="E.g., Charles Doe"
              />
            )}
          />

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
