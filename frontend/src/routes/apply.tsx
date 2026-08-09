import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { submitApplication } from "../services/api";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
});

const applySchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  job_title: z.string().min(2, "Job title is required"),
  linkedin_url: z.string().min(5, "LinkedIn URL is required"),
  motivation: z.string().min(20, "Please provide a brief reason for applying"),
});

type ApplyForm = z.infer<typeof applySchema>;

function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
  });

  const onSubmit = async (data: ApplyForm) => {
    setIsSubmitting(true);
    setError("");
    try {
      await submitApplication(data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight pt-32 pb-16 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-sky/10 border border-sky/20 text-sky mb-6 shadow-glow">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-display font-bold text-4xl text-gradient mb-4">Apply for Verification</h1>
          <p className="text-foreground/70">
            Join the Global Leader Sphere directory. Please provide your details below and our team will review your application.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border-white/10 shadow-2xl relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
              <p className="text-foreground/60 mb-8 max-w-sm mx-auto">
                Thank you for applying. Our administrative team will review your profile and reach out via email once approved.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-premium px-6 py-2.5 rounded-full text-sm font-bold"
              >
                Return to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    {...register("first_name")}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-white transition-colors placeholder:text-white/30"
                    placeholder="Jane"
                  />
                  {errors.first_name && <p className="mt-1 text-xs text-red-400">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    {...register("last_name")}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-white transition-colors placeholder:text-white/30"
                    placeholder="Doe"
                  />
                  {errors.last_name && <p className="mt-1 text-xs text-red-400">{errors.last_name.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-white transition-colors placeholder:text-white/30"
                  placeholder="jane.doe@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Company</label>
                  <input
                    {...register("company")}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-white transition-colors placeholder:text-white/30"
                    placeholder="Acme Corp"
                  />
                  {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Job Title</label>
                  <input
                    {...register("job_title")}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-white transition-colors placeholder:text-white/30"
                    placeholder="CEO"
                  />
                  {errors.job_title && <p className="mt-1 text-xs text-red-400">{errors.job_title.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">LinkedIn URL</label>
                <input
                  {...register("linkedin_url")}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-white transition-colors placeholder:text-white/30"
                  placeholder="https://linkedin.com/in/janedoe"
                />
                {errors.linkedin_url && <p className="mt-1 text-xs text-red-400">{errors.linkedin_url.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Reason for Applying</label>
                <textarea
                  {...register("motivation")}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-sky/50 outline-none text-white transition-colors placeholder:text-white/30"
                  placeholder="Briefly describe your role and why you want to join the directory..."
                />
                {errors.motivation && <p className="mt-1 text-xs text-red-400">{errors.motivation.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-premium py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : (
                    <>Submit Application <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
