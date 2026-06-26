import { useState, useMemo } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { getProfiles, getCategories } from "../services/api";
import {
  Globe2,
  ChevronDown,
  Search,
  Sparkles,
  Settings,
  ArrowRight,
  Filter,
  X,
  Compass,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import { HeadingFrame } from "../components/HeadingFrame";
import { VerifiedBadge } from "../components/VerifiedBadge";

export const Route = createFileRoute(
  "/category/$categorySlug/$subcategorySlug"
)({
  loader: async ({ params }) => {
    try {
      const categories = await getCategories();
      const currentCategory = categories.find((c: any) => c.slug === params.categorySlug);
      const currentSubcategory = currentCategory
        ? currentCategory.subcategories.find((s: any) => s.slug === params.subcategorySlug)
        : null;
      const profiles = currentSubcategory
        ? await getProfiles({ subcategory_id: currentSubcategory.id })
        : [];
      return { profiles, categories };
    } catch (err) {
      console.error("Failed to load subcategory page data in loader:", err);
      return { profiles: [], categories: [] };
    }
  },
  head: ({ loaderData, params }) => {
    const categories = loaderData?.categories || [];
    const currentCategory = categories.find((c: any) => c.slug === params.categorySlug);
    const currentSubcategory = currentCategory
      ? currentCategory.subcategories.find((s: any) => s.slug === params.subcategorySlug)
      : null;
    const title = currentSubcategory
      ? `${currentSubcategory.name} — Verified ${currentCategory?.name || ""} Directory | Global Leader Sphere`
      : "Subcategory Role Directory — Global Leader Sphere";
    const description = currentSubcategory
      ? `Explore verified changemakers, delegates, and community leaders listed under the specific role of ${currentSubcategory.name}.`
      : "Explore verified directories of global leaders and changemakers.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SubcategoryDirectory,
});

function SubcategoryDirectory() {
  const { profiles, categories } = Route.useLoaderData();
  const { categorySlug, subcategorySlug } = useParams({
    from: "/category/$categorySlug/$subcategorySlug",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Find parent category details
  const currentCategory = useMemo(() => {
    return categories.find((c: any) => c.slug === categorySlug);
  }, [categories, categorySlug]);

  // Find specific subcategory details
  const currentSubcategory = useMemo(() => {
    if (!currentCategory) return null;
    return currentCategory.subcategories.find((s: any) => s.slug === subcategorySlug);
  }, [currentCategory, subcategorySlug]);

  const filteredProfiles = useMemo(() => {
    if (!currentCategory || !currentSubcategory) return [];
    
    const subcatProfiles = profiles.filter((p: any) => p.subcategory_id === currentSubcategory.id);
    
    const query = searchTerm.toLowerCase().trim();
    if (!query) return subcatProfiles;

    return subcatProfiles
      .map((p: any) => {
        let score = 0;

        // Base matching (name, title, subtitle)
        if (p.name.toLowerCase().includes(query)) score += 10;
        if (p.title && p.title.toLowerCase().includes(query)) score += 5;
        if (p.subtitle && p.subtitle.toLowerCase().includes(query)) score += 3;

        // Priority 1: Professional Roles, Keywords
        const roles = Array.isArray(p.roles) ? p.roles : [];
        if (roles.some((r: any) => r && (typeof r === "string" ? r : r.label || "").toLowerCase().includes(query))) {
          score += 100;
        }
        const keywords = Array.isArray(p.keywords) ? p.keywords : [];
        if (keywords.some((k: any) => k && (typeof k === "string" ? k : k.name || "").toLowerCase().includes(query))) {
          score += 100;
        }

        // Priority 2: Expertise Areas, Services Offered, Who I Help
        const expertise = Array.isArray(p.expertise_areas) ? p.expertise_areas : [];
        if (expertise.some((e: any) => e && (typeof e === "string" ? e : e.name || "").toLowerCase().includes(query))) {
          score += 50;
        }
        const services = Array.isArray(p.services_offered) ? p.services_offered : [];
        if (services.some((s: any) => s && (typeof s === "string" ? s : s.title || s.name || "").toLowerCase().includes(query))) {
          score += 50;
        }
        const servicesConsultations = Array.isArray(p.services_consultations) ? p.services_consultations : [];
        if (servicesConsultations.some((s: any) => s && s.title && s.title.toLowerCase().includes(query))) {
          score += 50;
        }
        const howIHelp = Array.isArray(p.how_i_help) ? p.how_i_help : [];
        if (howIHelp.some((h: any) => h && h.name && h.name.toLowerCase().includes(query))) {
          score += 50;
        }
        const whoIHelp = Array.isArray(p.who_i_help) ? p.who_i_help : [];
        if (whoIHelp.some((w: any) => w && (typeof w === "string" ? w : w.name || "").toLowerCase().includes(query))) {
          score += 50;
        }

        // Priority 3: Summary, Industries
        if (p.professional_summary && p.professional_summary.toLowerCase().includes(query)) {
          score += 20;
        }
        const industries = Array.isArray(p.industries_served) ? p.industries_served : [];
        if (industries.some((ind: any) => ind && (typeof ind === "string" ? ind : ind.name || "").toLowerCase().includes(query))) {
          score += 20;
        }

        return { profile: p, score };
      })
      .filter((item: { profile: any; score: number }) => item.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .map((item: { profile: any; score: number }) => item.profile);
  }, [profiles, currentCategory, currentSubcategory, searchTerm]);

  if (!currentCategory || !currentSubcategory) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight text-foreground px-4 text-center">
        <div className="blob bg-[#0070c0] w-[500px] h-[500px] -top-20 opacity-[0.08]" />
        <div className="max-w-md glass-strong p-8 rounded-3xl border-white/10 shadow-2xl relative z-10">
          <Compass className="size-16 text-gold mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-display font-bold text-sky mb-3">Subcategory Not Found</h1>
          <p className="text-foreground/75 mb-8">
            The requested subcategory role directory does not exist or has been modified.
          </p>
          <Link
            to="/"
            className="btn-premium rounded-full px-6 py-3 font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft className="size-4" /> Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-foreground bg-midnight font-sans">
      {/* Background decoration blobs */}
      <div className="blob bg-[#0070c0] w-[600px] h-[600px] -top-40 -right-40 opacity-10" />
      <div className="blob bg-[#b38f36] w-[700px] h-[700px] top-[40%] -left-60 opacity-[0.06]" />
      <div className="blob bg-[#0070c0] w-[500px] h-[500px] bottom-[-200px] right-20 opacity-[0.08]" />

      {/* ========================================================================= */}
      {/* STICKY GLASSMORPHIC HEADER NAVBAR WITH MULTI-LEVEL DROPDOWNS             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/5 backdrop-blur-2xl py-4 px-6 md:px-12 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-10 rounded-2xl btn-premium grid place-items-center group-hover:scale-105 transition-transform duration-300">
              <Globe2 className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-sky leading-tight tracking-tight group-hover:text-white transition-colors">
                Global Leader Sphere
              </h1>
              <p className="text-[10px] text-foreground/40 font-semibold tracking-wider uppercase">
                Verified Global Leaders Network
              </p>
            </div>
          </Link>

          {/* Dynamic Categories Navbar Menu */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-sky hover:bg-sky/5 relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-sky after:transition-all after:duration-300 hover:after:w-[60%] transition"
            >
              Main Portal
            </Link>

            <div className="relative group/dropdown">
              <button
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition bg-[#2E5E99]/30 text-sky border border-sky/30 cursor-pointer outline-none font-bold"
              >
                <span>Sectors & Directories</span>
                <ChevronDown
                  className="size-3 transition-transform duration-300 group-hover/dropdown:rotate-180 group-hover/dropdown:text-sky text-foreground/40"
                />
              </button>

              {/* Mega Dropdown Panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[480px] sm:w-[540px] glass-strong border border-white/10 rounded-[28px] p-5 shadow-2xl transition-all duration-200 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible z-50 grid grid-cols-1 sm:grid-cols-2 gap-4 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
                <div className="col-span-full border-b border-white/5 pb-2 mb-1 text-left">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                      Explore Portfolios by Sector
                    </span>
                  </div>
                  {categories.map((cat: any) => {
                    const isCatSelected = currentCategory.id === cat.id;
                    return (
                      <div key={cat.id} className="space-y-2 text-left">
                        <Link
                          to="/category/$categorySlug"
                          params={{ categorySlug: cat.slug }}
                          className={`font-display font-semibold text-xs hover:text-white transition flex items-center gap-1.5 ${
                            isCatSelected ? "text-sky shadow-glow" : "text-[#7BA4D0]/80"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${isCatSelected ? "bg-sky animate-pulse" : "bg-sky/50"}`} />
                          {cat.name}
                        </Link>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="pl-3 border-l border-white/5 space-y-1">
                            {cat.subcategories.map((sub: any) => {
                              const isSubSelected = currentSubcategory.id === sub.id;
                              return (
                                <Link
                                  key={sub.id}
                                  to="/category/$categorySlug/$subcategorySlug"
                                  params={{
                                    categorySlug: cat.slug,
                                    subcategorySlug: sub.slug,
                                  }}
                                  className={`block text-[11px] hover:text-sky transition ${
                                    isSubSelected ? "text-sky font-semibold" : "text-foreground/60"
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </nav>

          {/* Secure Admin Console Route Link */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="glass rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 hover:bg-white/10 hover:border-white/20 transition text-sky border border-sky/20 shadow-lg"
            >
              <Settings className="size-3.5" /> Admin Console
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BREADCRUMBS & BANNERS                                                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto pt-12 pb-6 px-6 md:px-12 z-10 relative">
        <div className="space-y-6">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/40 flex-wrap">
            <Link to="/" className="hover:text-sky transition">
              Home
            </Link>
            <ChevronRight className="size-3 text-foreground/20" />
            <Link
              to="/category/$categorySlug"
              params={{ categorySlug: currentCategory.slug }}
              className="hover:text-sky transition"
            >
              {currentCategory.name}
            </Link>
            <ChevronRight className="size-3 text-foreground/20" />
            <span className="text-gold font-bold">{currentSubcategory.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <ScrollReveal animation="fade-up" delay={0}>
                <div className="inline-flex items-center gap-2 chip py-1.5 px-4 bg-gold/10 border-gold/25 text-gold font-bold text-[11px] uppercase tracking-widest mb-3">
                  <VerifiedBadge className="size-4 mr-0.5" /> Verified Role Directory
                </div>
              </ScrollReveal>
              <ScrollReveal animation="heading-reveal" delay={150}>
                <div className="mt-2 mb-4">
                  <HeadingFrame theme="gradient">
                    <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-gradient leading-tight tracking-tight reveal-heading-underline mb-0 pb-0">
                      {currentSubcategory.name}
                    </h2>
                  </HeadingFrame>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="fade-up" delay={300}>
                <p className="text-sm text-foreground/60 leading-relaxed font-sans max-w-2xl mt-3">
                  Listing verified public profiles classified under the subcategory of{" "}
                  <span className="text-sky font-semibold">{currentSubcategory.name}</span> in the{" "}
                  <span className="text-sky font-semibold">{currentCategory.name}</span> sector.
                </p>
              </ScrollReveal>
            </div>

            <div className="text-xs text-foreground/40 font-semibold shrink-0">
              Verified Leaders Registered:{" "}
              <span className="text-gold font-bold font-mono text-base">
                {filteredProfiles.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FILTER & RELATED SUBCATEGORIES ROW                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto py-4 px-6 md:px-12 z-10 relative">
        <div className="glass-strong rounded-3xl p-6 border-white/10 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Dynamic Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-3.5 size-4 text-foreground/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-midnight/50 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-sky/50 outline-none text-foreground"
              placeholder="Search subcategory leaders..."
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-3.5 text-foreground/40 hover:text-white transition"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Toggle tabs for other subcategories under the same parent */}
          {currentCategory.subcategories && currentCategory.subcategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest px-2">
                Other Roles:
              </span>
              {currentCategory.subcategories.map((sub: any) => {
                const isCurrent = sub.id === currentSubcategory.id;
                return isCurrent ? (
                  <span
                    key={sub.id}
                    className="chip py-2 px-4.5 text-xs bg-gold/10 border-gold/30 text-gold font-semibold"
                  >
                    {sub.name}
                  </span>
                ) : (
                  <Link
                    key={sub.id}
                    to="/category/$categorySlug/$subcategorySlug"
                    params={{
                      categorySlug: currentCategory.slug,
                      subcategorySlug: sub.slug,
                    }}
                    className="glass px-4.5 py-2 rounded-2xl text-xs font-semibold text-foreground/80 hover:text-sky hover:bg-sky/5 hover:border-sky/20 transition border border-white/5"
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* VERIFIED LEADERS GRID SHOWCASE                                           */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto pb-16 px-6 md:px-12 z-10 relative">
        {filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 glass rounded-3xl p-12 border-white/5 text-center max-w-md mx-auto">
            <Compass className="size-12 text-gold animate-pulse" />
            <h3 className="font-display text-lg font-bold text-sky">No Verified Leaders</h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              We couldn't find any verified leader listed in this specific subcategory directory matching your selection.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn-premium rounded-full px-5 py-2.5 text-xs font-bold mt-2"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProfiles.map((p: any) => {
              return (
                <Link
                  key={p.id}
                  to="/leader/$slug"
                  params={{ slug: p.slug }}
                  className="glass rounded-[32px] overflow-hidden hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300 border-white/10 flex flex-col justify-between group h-full cursor-pointer"
                >
                  <div className="p-6">
                    {/* Portrait Frame */}
                    <div className="aspect-4/5 w-full rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-inner mb-6 relative">
                      <img
                        src={p.portrait}
                        alt={p.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Floating Category Tag */}
                      {p.category_name && (
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className="chip py-1 px-2.5 text-[9px] bg-midnight/90 border border-white/15 text-sky font-bold uppercase backdrop-blur-md">
                            {p.category_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-gold font-bold uppercase tracking-wider">
                        <VerifiedBadge className="size-4 mr-0.5" />
                        <span>Verified Identity</span>
                      </div>
                      
                      <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-sky transition-colors leading-tight">
                        {p.name}
                      </h3>
                      
                      <p className="text-[12px] text-sky-light/80 font-semibold truncate">
                        {p.title}
                      </p>
                      
                      <p className="text-xs text-foreground/50 line-clamp-2 leading-relaxed pt-1">
                        {p.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Visual hover footer */}
                  <div className="px-6 py-4.5 border-t border-white/5 bg-white/3 flex items-center justify-between text-xs font-bold text-sky group-hover:bg-sky/5 transition-colors">
                    <span className="inline-flex items-center gap-1.5">
                      {p.subcategory_name || "UN Representative"} <ArrowRight className="size-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                    <span className="text-[10px] text-foreground/30 font-semibold font-mono">
                      #{p.id}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
