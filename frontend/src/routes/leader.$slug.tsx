import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getProfileBySlug, getProfiles } from "../services/api";
import { LeaderProfileView } from "../components/LeaderProfileView";
import { SEO } from "../components/SEO";
import { ShieldAlert, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/leader/$slug")({
  loader: async ({ params }) => {
    try {
      const leader = await getProfileBySlug(params.slug);
      if (!leader) {
        throw notFound();
      }
      const allProfiles = await getProfiles();
      return { leader, allProfiles };
    } catch (err) {
      console.error(`Loader error for slug '${params.slug}':`, err);
      throw notFound();
    }
  },
  component: LeaderProfile,
  notFoundComponent: LeaderNotFound,
});

function LeaderProfile() {
  const { leader, allProfiles } = Route.useLoaderData();
  const title = `${leader.name} | Global Leader Profile | Global Leader Sphere`;
  const description = leader.subtitle || `Verified global leader profile of ${leader.name} — ${leader.title}.`;
  
  return (
    <>
      <SEO title={title} description={description} image={leader.portrait} />
      <LeaderProfileView leader={leader} allProfiles={allProfiles} />
    </>
  );
}

function LeaderNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-midnight text-foreground px-4 text-center">
      {/* Ambient backgrounds */}
      <div className="blob bg-[#2E5E99] w-[500px] h-[500px] -top-20 opacity-25" />

      <div className="max-w-md glass-strong p-8 rounded-3xl border-white/10 shadow-2xl relative z-10">
        <ShieldAlert className="size-16 text-gold mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-display font-bold text-sky leading-tight mb-3">
          Profile Not Found
        </h1>
        <p className="text-foreground/75 mb-8">
          The requested verified leader identity does not exist or has been modified.
        </p>
        <Link
          to="/"
          className="btn-premium rounded-full px-6 py-3 font-bold inline-flex items-center gap-2"
        >
          <ChevronLeft className="size-4" /> Go back home
        </Link>
      </div>
    </div>
  );
}
