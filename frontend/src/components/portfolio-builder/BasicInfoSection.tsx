import { useForm as useRHForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { getCategories, getBaseUrl } from "../../services/api";
import { ImageUploader } from "./ImageUploader";
import { SectionHeader } from "./SectionHeader";
import { SaveIndicator } from "./SaveIndicator";
import { useState, useEffect } from "react";

const basicInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  portrait: z.string().optional(),
  category_id: z.coerce.number().nullable().optional(),
  subcategory_id: z.coerce.number().nullable().optional(),
});

type BasicInfoForm = z.infer<typeof basicInfoSchema>;

export function BasicInfoSection({ profile, session }: { profile: any; session: any }) {
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isDirty } } = useRHForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: profile?.name || "",
      title: profile?.title || "",
      subtitle: profile?.subtitle || "",
      portrait: profile?.portrait || "",
      category_id: profile?.category_id || null,
      subcategory_id: profile?.subcategory_id || null,
    },
  });

  const selectedCategoryId = watch("category_id");
  const subcategories = categories.find((c: any) => c.id === selectedCategoryId)?.subcategories || [];

  // Reset subcategory if selected category changes and current subcategory is not in the new subcategories
  useEffect(() => {
    const currentSubId = watch("subcategory_id");
    if (currentSubId && !subcategories.some((s: any) => s.id === currentSubId)) {
      setValue("subcategory_id", null);
    }
  }, [selectedCategoryId, subcategories, setValue, watch]);

  const mutation = useMutation({
    mutationFn: async (data: BasicInfoForm) => {
      const res = await fetch(`${getBaseUrl()}/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      setLastSaved(new Date().toLocaleTimeString());
      toast.success("Basic Information saved!");
    },
    onError: () => toast.error("Failed to save Basic Information."),
  });

  // Calculate completion percentage: name (40%), title (20%), subtitle (20%), portrait (20%)
  const nameVal = watch("name");
  const titleVal = watch("title");
  const subVal = watch("subtitle");
  const portVal = watch("portrait");
  let score = 0;
  if (nameVal && nameVal.trim().length >= 2) score += 40;
  if (titleVal && titleVal.trim().length > 0) score += 20;
  if (subVal && subVal.trim().length > 0) score += 20;
  if (portVal && portVal.trim().length > 0) score += 20;

  const status = profile?.status || "DRAFT";
  const isReadOnly = status === "SUBMITTED" || status === "PUBLISHED" || status === "UNDER_REVIEW";

  const onSubmit = (data: BasicInfoForm) => {
    mutation.mutate(data);
  };

  // Implement auto-save debounce on changes
  useEffect(() => {
    if (!isDirty || isReadOnly) return;
    const timer = setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 1500);
    return () => clearTimeout(timer);
  }, [nameVal, titleVal, subVal, portVal, selectedCategoryId, watch("subcategory_id"), isDirty, isReadOnly]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title="Personal Information"
          description="Your core public identity. This appears at the top of your digital portfolio."
          percentage={score}
        />
        <SaveIndicator isSaving={mutation.isPending} lastSaved={lastSaved} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <fieldset disabled={isReadOnly} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register("name")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Dr. Jane Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Professional Title</label>
              <input
                {...register("title")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="E.g., Chief Executive Officer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Subtitle / Tagline</label>
            <textarea
              {...register("subtitle")}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              placeholder="E.g., Pioneering sustainable technology solutions for the next generation..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Sector / Category</label>
              <select
                {...register("category_id")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Select Sector...</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Subcategory</label>
              <select
                {...register("subcategory_id")}
                disabled={!selectedCategoryId}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <option value="">Select Subcategory...</option>
                {subcategories.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Controller
            name="portrait"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value || ""}
                onChange={field.onChange}
                label="Portrait Avatar"
                disabled={isReadOnly}
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
