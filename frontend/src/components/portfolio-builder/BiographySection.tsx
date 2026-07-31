import { useForm as useRHForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";

const biographySchema = z.object({
  biography: z.string().optional(),
});

type BiographyForm = z.infer<typeof biographySchema>;

export function BiographySection({ profile, session }: { profile: any; session: any }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isDirty } } = useRHForm<BiographyForm>({
    resolver: zodResolver(biographySchema),
    defaultValues: {
      biography: profile?.data?.biography || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: BiographyForm) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        // We nest biography inside the `data` property to update the JSONB blob partially
        body: JSON.stringify({ data: { biography: formData.biography } }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-me"] });
      toast.success("Biography saved!");
    },
    onError: () => toast.error("Failed to save Biography."),
  });

  const onSubmit = (data: BiographyForm) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Biography</h2>
        <p className="text-sm text-zinc-400 mt-1">
          A comprehensive overview of your journey, impact, and personal story.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <div>
          <textarea
            {...register("biography")}
            rows={12}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Write your story here..."
          />
          {errors.biography && <p className="mt-1 text-sm text-red-400">{errors.biography.message}</p>}
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
