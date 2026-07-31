import { useForm as useRHForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";

const basicInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

type BasicInfoForm = z.infer<typeof basicInfoSchema>;

export function BasicInfoSection({ profile, session }: { profile: any; session: any }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isDirty } } = useRHForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: profile?.name || "",
      title: profile?.title || "",
      subtitle: profile?.subtitle || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BasicInfoForm) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profiles/me`, {
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
      toast.success("Basic Information saved!");
    },
    onError: () => toast.error("Failed to save Basic Information."),
  });

  const onSubmit = (data: BasicInfoForm) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Basic Information</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Your core public identity. This appears at the very top of your digital portfolio.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("name")}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Dr. Jane Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Professional Title</label>
          <input
            {...register("title")}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="E.g., Chief Executive Officer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Subtitle / Tagline</label>
          <textarea
            {...register("subtitle")}
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            placeholder="E.g., Pioneering sustainable technology solutions for the next generation..."
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={16} />
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
