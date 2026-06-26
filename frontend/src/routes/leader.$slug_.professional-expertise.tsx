import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getProfileBySlug, getProfiles } from "../services/api";
import { SEO } from "../components/SEO";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Globe2,
  ShieldAlert,
  ChevronLeft,
  Settings,
  X,
  Menu,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Clock,
  Languages,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Calendar,
  Building,
  Award,
  Video,
  ExternalLink,
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { DynamicIcon } from "../components/DynamicIcon";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { ScrollReveal } from "../components/ScrollReveal";

const expertiseSearchSchema = z.object({
  preview: z.string().optional(),
});

export const Route = createFileRoute("/leader/$slug_/professional-expertise")({
  validateSearch: (search) => expertiseSearchSchema.parse(search),
  loaderDeps: ({ search: { preview } }) => ({ preview }),
  loader: async ({ params, deps }) => {
    try {
      const isPreview = deps.preview === "true";
      const leader = await getProfileBySlug(params.slug, isPreview);
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
  head: ({ loaderData }) => {
    const leader = loaderData?.leader;
    if (!leader) return {};
    const title = `${leader.name} | Verified Professional Expertise Profile`;
    const rolesList = Array.isArray(leader.roles) ? leader.roles.map((r: any) => r.label).join(", ") : "";
    const expertiseList = Array.isArray(leader.expertise_areas) 
      ? leader.expertise_areas.map((e: any) => typeof e === "string" ? e : e.name || "").join(", ") 
      : "";
    const keywordsString = Array.isArray(leader.keywords) ? leader.keywords.join(", ") : "";
    
    const description = `Verified Professional Expertise Profile of ${leader.name}. Specializing in: ${expertiseList || rolesList || leader.title}. Keywords: ${keywordsString}`;
    
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywordsString },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:image", content: leader.portrait },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: leader.portrait },
      ],
      links: [
        { rel: "canonical", href: `https://globalleadersphere.com/leader/${leader.slug}/professional-expertise` },
      ],
    };
  },
  component: ProfessionalExpertise,
  notFoundComponent: ExpertiseNotFound,
});

function SectionLabel({ children, className = "mb-5" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        border-[1.5px] border-[#86EFAC]/30 bg-[#F0FDF4]/5 text-[#86EFAC]
        shadow-[0_3px_12px_-3px_rgba(22,163,74,0.12)]
        transition-all duration-300 ease-out
        hover:border-[#86EFAC]/60 hover:bg-[#F0FDF4]/10 hover:text-white
        hover:scale-[1.02] active:scale-[0.98]
        cursor-default select-none group
        ${className}
      `}
    >
      <Sparkles className="size-3.5 text-[#86EFAC] shrink-0" />
      <span className="text-[11px] font-bold tracking-[0.08em] uppercase">
        {children}
      </span>
    </div>
  );
}

function ProfessionalExpertise() {
  const { leader, allProfiles } = Route.useLoaderData();
  const search = Route.useSearch();
  const isPreview = search.preview === "true";
  
  console.log("=== ProfessionalExpertise Debug ===");
  console.log("leader slug:", leader?.slug);
  console.log("leader is_published:", leader?.is_published);
  console.log("leader status:", leader?.status);
  console.log("isPreview:", isPreview);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [origin, setOrigin] = useState("https://globalleadersphere.com");

  const [journeyExpanded, setJourneyExpanded] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [publicationsExpanded, setPublicationsExpanded] = useState(false);
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const [testimonialsExpanded, setTestimonialsExpanded] = useState(false);
  const [orgsExpanded, setOrgsExpanded] = useState(false);
  const [whoIHelpExpanded, setWhoIHelpExpanded] = useState(false);
  const [industriesExpanded, setIndustriesExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("admin_token");
      console.log("useEffect - admin_token exists:", !!adminToken);
      setIsAdmin(!!adminToken);
      setOrigin(window.location.origin);
    }
  }, []);

  const canView = leader.is_published || (isPreview && isAdmin);
  console.log("canView check:", {
    "leader.is_published": leader.is_published,
    "isPreview": isPreview,
    "isAdmin": isAdmin,
    "result canView": canView
  });

  if (!canView) {
    return <ExpertiseNotFound />;
  }

  // Parse details defensively
  const visibility = leader.section_visibility || {};
  
  const roles = Array.isArray(leader.roles) ? leader.roles : [];
  
  const expertiseAreas = Array.isArray(leader.expertise_areas) 
    ? leader.expertise_areas.map((e: any) => typeof e === "string" ? { name: e, description: "", icon: "ShieldCheck" } : e)
    : [];

  const servicesOffered = Array.isArray(leader.services_offered) ? leader.services_offered : [];
  
  const industriesServed = Array.isArray(leader.industries_served)
    ? leader.industries_served.map((i: any) => typeof i === "string" ? { name: i, description: "", image: null } : i)
    : [];
    
  const whoIHelp = Array.isArray(leader.who_i_help)
    ? leader.who_i_help.map((w: any) => typeof w === "string" ? { name: w, description: "", image: null } : w)
    : [];

  const languages = Array.isArray(leader.languages) ? leader.languages : [];
  
  const impactStatistics = Array.isArray(leader.impact_statistics) 
    ? leader.impact_statistics.map((s: any) => s.value ? { number: s.value, label: s.label } : s)
    : [];

  const achievements = Array.isArray(leader.achievements)
    ? leader.achievements.map((ach: any) => typeof ach === "string" ? { title: ach, description: "", image: null } : ach)
    : [];

  const keywords = Array.isArray(leader.keywords) ? leader.keywords : [];

  // New spec lists
  const professionalJourney = Array.isArray(leader.professional_journey) ? leader.professional_journey : [];
  const currentActivities = Array.isArray(leader.current_activities) ? leader.current_activities : [];
  const howIHelp = Array.isArray(leader.how_i_help) ? leader.how_i_help : [];
  
  // Helper to extract YouTube thumbnail from URL
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
  };
  const servicesConsultations = Array.isArray(leader.services_consultations) ? leader.services_consultations : [];
  const professionalGallery = Array.isArray(leader.professional_gallery) ? leader.professional_gallery : [];
  const publications = Array.isArray(leader.publications) ? leader.publications : [];
  const mediaInterviews = Array.isArray(leader.media_interviews) ? leader.media_interviews : [];
  const testimonials = Array.isArray(leader.testimonials) ? leader.testimonials : [];
  const organizationsAssociations = Array.isArray(leader.organizations_associations) ? leader.organizations_associations : [];
  const contactCollaboration = leader.contact_collaboration || {};
  const contactTypes = Array.isArray(leader.contact_types) ? leader.contact_types : [];

  const parsedData = (typeof leader.data === "string" ? JSON.parse(leader.data) : leader.data || {});
  const connect = parsedData.connect || {};

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": leader.name,
      "jobTitle": roles.map((r: any) => r.label).join(", ") || leader.title,
      "description": leader.subtitle,
      "image": leader.portrait,
      "url": `${origin}/leader/${leader.slug}/professional-expertise`,
      "knowsAbout": expertiseAreas.map((e: any) => e.name),
      "knowsLanguage": languages,
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services Offered",
        "itemListElement": servicesConsultations.map((service: any, index: number) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service.title,
            "description": service.description
          },
        })),
      },
    },
  };

  const navItems = [
    { label: "Biography", to: "/leader/$slug" as const, hash: "profile" },
    { label: "Awards", to: "/leader/$slug" as const, hash: "awards" },
    { label: "Certificates", to: "/leader/$slug" as const, hash: "certificates" },
    { label: "News Articles", to: "/leader/$slug" as const, hash: "news-articles" },
    { label: "Recent Activities", to: "/leader/$slug" as const, hash: "recent-activities" },
    { label: "Professional Expertise", to: "/leader/$slug/professional-expertise" as const, isActive: true },
  ];

  // Cloudinary image extractor helper
  const getImgUrl = (imgObj: any) => {
    if (!imgObj) return "";
    return typeof imgObj === "string" ? imgObj : imgObj.secure_url || "";
  };

  const getImgAlt = (imgObj: any, fallback: string = "") => {
    if (!imgObj || typeof imgObj === "string") return fallback;
    return imgObj.alt_text || fallback;
  };

  const getImgCaption = (imgObj: any) => {
    if (!imgObj || typeof imgObj === "string") return "";
    return imgObj.caption || "";
  };

  // Find single featured items
  const featuredPublication = publications.find((p) => p.featured === true);
  const featuredAchievement = achievements.find((a) => a.featured === true);
  const featuredTestimonial = testimonials.find((t) => t.featured === true);
  const featuredService = servicesConsultations.find((s) => s.featured === true);

  return (
    <div className="bg-midnight min-h-screen text-foreground relative overflow-hidden font-sans select-text">
      <SEO 
        title={`Professional Expertise | ${leader.name} | Global Leader Sphere`} 
        description={leader.subtitle || `Professional Expertise of ${leader.name}`}
        image={leader.portrait}
      />
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      {/* Ambient background glows */}
      <div className="blob bg-[#2E5E99] w-[500px] h-[500px] -top-20 -left-20 opacity-20" />
      <div className="blob bg-[#b38f36] w-[600px] h-[600px] top-[20%] -right-20 opacity-10" />
      <div className="blob bg-[#2E5E99] w-[550px] h-[550px] bottom-[10%] -left-30 opacity-15" />

      {/* Preview Mode Top Banner */}
      {isPreview && isAdmin && (
        <div className="bg-amber-500/20 backdrop-blur-md border-b border-amber-500/30 text-amber-300 px-4 py-2 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 relative z-50">
          <Sparkles className="size-4 animate-pulse" /> Preview Mode — Unpublished Draft ({leader.status || "draft"})
        </div>
      )}

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 transition-all duration-300 bg-midnight/80 backdrop-blur-md border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-9 rounded-2xl btn-premium grid place-items-center">
              <Globe2 className="size-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-[17px] text-sky">
                WHRC · Leader Profile
              </div>
              <div className="text-[13px] text-foreground/60">Verified global identity</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 shadow-2xl backdrop-blur-3xl">
            <Link
              to="/leader/$slug"
              params={{ slug: leader.slug }}
              className="px-4.5 py-2 text-xs font-bold text-foreground/75 hover:text-sky hover:bg-sky/5 rounded-full transition"
            >
              Biography Portfolio
            </Link>
            <span className="px-4.5 py-2 text-xs font-bold text-sky bg-sky/10 border border-sky/20 rounded-full shadow-inner">
              Professional Expertise
            </span>
          </div>

          <div className="flex items-center gap-3">
            {allProfiles.length > 1 ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-sky/5 transition text-sky font-semibold tracking-wide text-[13px] border-sky/30">
                  <span className="max-w-[120px] truncate">{leader.name}</span>
                  <ChevronDown className="size-3.5" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl p-2 border-white/10 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-1">
                    Switch Leader Profile
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {allProfiles.map((p: any) => (
                      <Link
                        key={p.slug}
                        to="/leader/$slug/professional-expertise"
                        params={{ slug: p.slug }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sky/5 hover:text-sky transition text-left ${
                          p.slug === leader.slug ? "bg-white/5 border border-sky/30" : ""
                        }`}
                      >
                        <div className="size-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                          <img
                            src={p.portrait}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {p.title}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-white/5 mt-2 pt-2">
                    <Link
                      to="/admin"
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-[#2E5E99]/15 hover:bg-[#2E5E99]/30 transition text-xs font-bold text-sky border border-sky/20"
                    >
                      <Settings className="size-3.5" /> Admin Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/admin"
                className="hidden sm:inline-flex px-4 py-2 rounded-full glass hover:bg-white/10 transition text-foreground/80 hover:text-white font-semibold text-[13px] items-center gap-1.5"
              >
                <Settings className="size-3.5 text-sky" /> Admin Panel
              </Link>
            )}

            <Link
              to={`/leader/${leader.slug}`}
              className="bg-linear-to-br from-[#7BA4D0] to-[#2E5E99] text-white shadow-[0_10px_30px_-10px_rgba(46,94,153,0.5)] rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              View Biography <ArrowUpRight className="size-3.5" />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full glass hover:bg-white/10 transition text-foreground border border-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 px-6 py-4 space-y-4 bg-midnight/95 backdrop-blur-xl shadow-2xl animate-fade-in relative z-50">
            {/* Page Switcher in Mobile */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
              <Link
                to="/leader/$slug"
                params={{ slug: leader.slug }}
                className="text-center py-2 text-xs font-bold text-foreground/75 hover:text-sky rounded-xl transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Biography Portfolio
              </Link>
              <span className="text-center py-2 text-xs font-bold text-sky bg-sky/10 border border-sky/20 rounded-xl shadow-inner">
                Professional Expertise
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-1.5">
                Expertise Sections
              </div>
              {[
                { label: "Overview", hash: "#overview" },
                { label: "Professional Journey", hash: "#journey" },
                { label: "Current Activities", hash: "#activities" },
                { label: "Expertise Areas", hash: "#expertise" },
                { label: "Services & Consultations", hash: "#services" },
                { label: "Publications", hash: "#publications" },
                { label: "Testimonials", hash: "#testimonials" },
                { label: "Contact", hash: "#connect-expertise" }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.hash}
                  className="block px-4 py-2.5 text-sm font-semibold rounded-2xl hover:bg-sky/5 hover:text-sky transition text-foreground/90"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Secondary Sticky Sub-Navbar for Professional Expertise Anchors */}
      <div className="sticky top-[73px] z-40 bg-midnight/90 backdrop-blur-md border-b border-white/5 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-start gap-1 overflow-x-auto no-scrollbar">
          {[
            { label: "Overview", hash: "#overview" },
            { label: "Professional Journey", hash: "#journey" },
            { label: "Current Activities", hash: "#activities" },
            { label: "Expertise Areas", hash: "#expertise" },
            { label: "Services & Consultations", hash: "#services" },
            { label: "Publications & Books", hash: "#publications" },
            { label: "Testimonials", hash: "#testimonials" },
            { label: "Contact & Collab", hash: "#connect-expertise" }
          ].map((item) => (
            <a
              key={item.label}
              href={item.hash}
              className="px-4 py-2 text-xs rounded-full hover:bg-white/5 hover:text-[#86EFAC] text-foreground/80 font-semibold tracking-wide transition shrink-0"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="overview" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-20 pb-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 fade-up">
            <div className="chip mb-6">
              Verified Professional Expertise Profile
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight flex items-center flex-wrap gap-x-3.5 gap-y-2">
              <span className="text-gradient">{leader.name}</span>
              <VerifiedBadge className="size-8 md:size-9 lg:size-10 shrink-0" />
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-foreground/75 max-w-2xl leading-relaxed">
              {leader.subtitle}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-[#7BA4D0]/80 font-medium">
              {leader.years_experience && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-sky" /> {leader.years_experience} Experience
                </div>
              )}
              {languages.length > 0 && visibility.languages !== false && (
                <div className="flex items-center gap-2">
                  <Globe2 className="size-4 text-sky" /> Fluent in {languages.join(", ")}
                </div>
              )}
            </div>

            {roles.length > 0 && visibility.roles !== false && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {roles.map((r: any) => (
                  <span key={r.id || r.label} className="role-chip-gold-shimmer flex items-center gap-1.5 text-xs">
                    <DynamicIcon name={r.icon} className="size-3.5" /> {r.label}
                  </span>
                ))}
              </div>
            )}

            {/* Featured Publication / Achievement Hero Highlight */}
            {(featuredPublication || featuredAchievement) && (
              <div className="mt-8 p-3.5 rounded-xl bg-linear-to-r from-[#b38f36]/10 to-[#b38f36]/5 border border-[#b38f36]/25 max-w-xl animate-pulse">
                <div className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-1">
                  <Award className="size-3" /> Featured Spotlight
                </div>
                <div className="font-display font-bold text-sm mt-1 text-foreground truncate">
                  {featuredPublication ? featuredPublication.title : featuredAchievement?.title}
                </div>
                <div className="text-xs text-foreground/60 line-clamp-2 mt-0.5">
                  {featuredPublication ? featuredPublication.description : featuredAchievement?.description}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-5">
              {leader.is_available_for_consultation && (
                <a
                  href="#connect-expertise"
                  className="btn-premium rounded-full px-8 py-4 text-base font-semibold inline-flex items-center gap-2.5"
                >
                  {leader.cta_text || "Book Consultation"} <ArrowUpRight className="size-5" />
                </a>
              )}
              <Link
                to={`/leader/${leader.slug}`}
                className="glass rounded-full px-8 py-4 text-base font-medium inline-flex items-center gap-2.5 text-foreground hover:bg-white/10 transition"
              >
                View Biography
              </Link>
            </div>
          </div>

          {/* Portrait */}
          <div className="lg:col-span-5 relative fade-up" style={{ animationDelay: ".15s" }}>
            <div className="relative mx-auto w-[320px] sm:w-[380px] lg:w-[420px] aspect-4/5">
              <div className="absolute -inset-10 rounded-full bg-linear-to-tr from-[#2E5E99] to-[#7BA4D0] opacity-20 blur-[100px] animate-pulse" />
              <div className="ring-halo absolute -inset-6 rounded-3xl opacity-40 blur-2xl" />
              <div className="ring-halo absolute -inset-2 rounded-3xl opacity-60" />
              <div className="absolute inset-0 rounded-3xl overflow-hidden glass-strong p-2">
                <img
                  src={leader.portrait}
                  alt={`Portrait of ${leader.name}`}
                  className="w-full h-full object-cover rounded-[22px] object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SUMMARY */}
      {leader.professional_summary && visibility.summary !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl w-full">
              <SectionLabel>Professional Summary</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4 mb-6">Mission & Vision</h2>
              <div 
                className="text-foreground/85 text-base md:text-lg leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: leader.professional_summary }}
              />
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 1: Professional Journey */}
      {professionalJourney.length > 0 && visibility.journey !== false && (
        <section id="journey" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <SectionLabel>Professional Journey</SectionLabel>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4">Career Timeline & Growth</h2>
              </div>
              <div className="relative border-l-2 border-white/5 pl-6 lg:pl-10 space-y-10 max-w-4xl mx-auto">
                {(journeyExpanded ? professionalJourney : professionalJourney.slice(0, 3)).map((entry: any, index: number) => (
                  <div key={index} className="relative group animate-fade-in">
                    {/* Bullet */}
                    <div className="absolute -left-[29px] lg:-left-[43px] top-1.5 size-4 rounded-full bg-midnight border-2 border-gold ring-4 ring-[#b38f36]/15 group-hover:scale-125 transition-transform" />
                    
                    <div className="grid md:grid-cols-12 gap-6">
                      <div className="md:col-span-8 space-y-2">
                        <div className="text-xs font-bold text-gold uppercase tracking-wider">
                          {entry.startDate} — {entry.endDate}
                        </div>
                        <h3 className="text-xl font-bold font-display text-foreground">
                          {entry.title}
                        </h3>
                        <div className="text-sm font-semibold text-sky">
                          {entry.organization}
                        </div>
                        <p className="text-sm text-foreground/75 leading-relaxed pt-2">
                          {entry.description}
                        </p>
                      </div>

                      {getImgUrl(entry.image) && (
                        <div className="md:col-span-4">
                          <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg aspect-video md:aspect-square relative group">
                            <img
                              src={getImgUrl(entry.image)}
                              alt={getImgAlt(entry.image, entry.title)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {getImgCaption(entry.image) && (
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-[10px] text-white text-center">
                                {getImgCaption(entry.image)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {professionalJourney.length > 3 && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setJourneyExpanded(!journeyExpanded)}
                    className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    {journeyExpanded ? "Show Less" : "Load More"}
                    <ChevronDown className={`size-4 transition-transform duration-300 ${journeyExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 2: Current Activities */}
      {currentActivities.length > 0 && visibility.activities !== false && (
        <section id="activities" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>Current Activities</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Active Engagements</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activitiesExpanded ? currentActivities : currentActivities.slice(0, 3)).map((act: any, index: number) => (
                <div
                  key={index}
                  className="glass-strong rounded-2xl border-white/5 shadow-xl hover:border-sky/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in"
                >
                  {getImgUrl(act.image) && (
                    <div className="aspect-video w-full overflow-hidden border-b border-white/5 relative">
                      <img
                        src={getImgUrl(act.image)}
                        alt={getImgAlt(act.image, act.title)}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gold uppercase tracking-wider">
                      <span>Activity</span>
                      {act.date && <span>{act.date}</span>}
                    </div>
                    <h3 className="text-lg font-bold font-display text-foreground">{act.title}</h3>
                    <p className="text-xs text-foreground/75 leading-relaxed">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {currentActivities.length > 3 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setActivitiesExpanded(!activitiesExpanded)}
                  className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {activitiesExpanded ? "Show Less" : "Load More"}
                  <ChevronDown className={`size-4 transition-transform duration-300 ${activitiesExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 3: Areas of Expertise */}
      {expertiseAreas.length > 0 && visibility.expertise !== false && (
        <section id="expertise" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>Areas of Expertise</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Core Competencies</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expertiseAreas.map((exp: any, index: number) => (
                <div
                  key={index}
                  className="glass-strong p-5 rounded-2xl border-white/10 hover:border-gold/30 hover:scale-[1.02] transition-all duration-300 flex items-start gap-4"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center shrink-0">
                    <DynamicIcon name={exp.icon || "ShieldCheck"} className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-foreground mb-1.5">{exp.name}</h3>
                    <p className="text-xs text-foreground/70 leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 4: How I Help */}
      {howIHelp.length > 0 && visibility.howIHelp !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>How I Help</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Actionable Value</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {howIHelp.map((serv: any, index: number) => (
                <div
                  key={index}
                  className="glass-strong p-6 rounded-2xl border-white/10 hover:border-sky/20 transition-all flex flex-col md:flex-row gap-6 items-start"
                >
                  {getImgUrl(serv.image) && (
                    <div className="w-full md:w-32 aspect-video md:aspect-square rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={getImgUrl(serv.image)}
                        alt={getImgAlt(serv.image, serv.name)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold font-display text-sky">{serv.name}</h3>
                    <p className="text-sm text-foreground/75 leading-relaxed">{serv.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 5: Services & Consultations */}
      {servicesConsultations.length > 0 && visibility.services !== false && (
        <section id="services" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>Services & Consultations</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Professional Offerings</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicesConsultations.map((serv: any, index: number) => {
                const isFeatured = serv.featured === true;
                return (
                  <div
                    key={index}
                    className={`glass-strong rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                      isFeatured ? "border-gold/30 shadow-[0_0_20px_-5px_rgba(179,143,54,0.1)] ring-1 ring-gold/20" : "border-white/5 shadow-xl"
                    } flex flex-col justify-between`}
                  >
                    <div>
                      {getImgUrl(serv.image) && (
                        <div className="aspect-[21/9] w-full overflow-hidden relative">
                          {isFeatured && (
                            <div className="absolute top-3 left-3 bg-gold text-midnight text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-lg">
                              <Sparkles className="size-2.5" /> Featured
                            </div>
                          )}
                          <img
                            src={getImgUrl(serv.image)}
                            alt={getImgAlt(serv.image, serv.title)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5 space-y-2">
                        <h3 className="text-xl font-bold font-display text-sky">{serv.title}</h3>
                        <p className="text-xs text-foreground/75 leading-relaxed">{serv.description}</p>
                      </div>
                    </div>
                    {serv.ctaText && (
                      <div className="p-5 pt-0">
                        <a
                          href="#connect-expertise"
                          className="w-full bg-linear-to-br from-[#7BA4D0]/10 to-[#2E5E99]/15 hover:from-[#7BA4D0]/20 hover:to-[#2E5E99]/30 transition text-center py-2.5 rounded-xl border border-sky/20 text-xs font-bold text-sky uppercase tracking-wider block"
                        >
                          {serv.ctaText}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 6: Professional Gallery */}
      {professionalGallery.length > 0 && visibility.gallery !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>Professional Gallery</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Work & Events Photos</h2>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {(galleryExpanded ? professionalGallery : professionalGallery.slice(0, 6)).map((gal: any, index: number) => (
                <div
                  key={index}
                  className="break-inside-avoid glass-strong rounded-2xl border border-white/5 overflow-hidden shadow-lg group relative animate-fade-in"
                >
                  <img
                    src={getImgUrl(gal.image)}
                    alt={getImgAlt(gal.image, gal.title)}
                    className="w-full object-cover max-h-96"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-left space-y-2">
                    {gal.date && <div className="text-[10px] text-gold font-bold uppercase">{gal.date}</div>}
                    <h3 className="text-lg font-bold font-display text-white">{gal.title}</h3>
                    {gal.description && <p className="text-xs text-foreground/75 leading-relaxed">{gal.description}</p>}
                  </div>
                </div>
              ))}
            </div>
            {professionalGallery.length > 6 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setGalleryExpanded(!galleryExpanded)}
                  className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {galleryExpanded ? "Show Less" : "Load More"}
                  <ChevronDown className={`size-4 transition-transform duration-300 ${galleryExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 7: Impact Statistics */}
      {impactStatistics.length > 0 && visibility.stats !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl text-center">
              <div className="max-w-2xl mx-auto mb-10">
                <SectionLabel>Impact Statistics</SectionLabel>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4">Platform Track Record</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {impactStatistics.map((stat: any, index: number) => (
                  <div
                    key={index}
                    className="glass p-5 rounded-xl border-white/5 hover:border-sky/20 transition-all duration-300 hover:-translate-y-1 text-center"
                  >
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-gradient mb-2">
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold tracking-wider text-foreground/60 uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 8: Achievements */}
      {achievements.length > 0 && visibility.achievements !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>Achievements</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Key Accomplishments</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((ach: any, index: number) => {
                const isFeatured = ach.featured === true;
                return (
                  <div
                    key={index}
                    className={`glass-strong p-5 rounded-2xl flex gap-5 items-start transition-all duration-300 ${
                      isFeatured ? "border-gold/30 shadow-[0_0_20px_-5px_rgba(179,143,54,0.1)] ring-1 ring-gold/20" : "border-white/5 shadow-xl"
                    }`}
                  >
                    {getImgUrl(ach.image) && (
                      <div className="size-16 md:size-24 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                        <img
                          src={getImgUrl(ach.image)}
                          alt={getImgAlt(ach.image, ach.title)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <h3 className="text-lg font-bold font-display text-foreground">{ach.title}</h3>
                        {isFeatured && (
                          <span className="bg-gold/20 text-gold text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/75 leading-relaxed">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 9: Publications & Books */}
      {publications.length > 0 && visibility.publications !== false && (
        <section id="publications" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-6">
                <SectionLabel>Publications</SectionLabel>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4">Intellectual Contributions</h2>
                <p className="text-foreground/75 mt-4 text-sm max-w-lg mx-auto">
                  Books, monographs, and research papers authored to advance field knowledge.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(publicationsExpanded ? publications : publications.slice(0, 3)).map((pub: any, idx: number) => {
                  const isFeatured = pub.featured === true;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl glass border transition-all flex flex-col justify-between gap-4 animate-fade-in ${
                        isFeatured ? "border-gold/30 bg-gold/5 shadow-[0_0_20px_-5px_rgba(179,143,54,0.1)] ring-1 ring-gold/20" : "border-white/5"
                      }`}
                    >
                      <div className="space-y-4">
                        {getImgUrl(pub.image) && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
                            <img
                              src={getImgUrl(pub.image)}
                              alt={getImgAlt(pub.image, pub.title)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-[10px] text-gold font-bold uppercase">{pub.date}</span>
                            {isFeatured && (
                              <span className="bg-gold/25 text-gold text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold font-display text-foreground leading-snug">{pub.title}</h3>
                          <p className="text-xs text-foreground/60 leading-relaxed">{pub.description}</p>
                        </div>
                      </div>
                      {pub.link && (
                        <div className="pt-2">
                          <a
                            href={pub.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-sky hover:text-sky-300 transition"
                          >
                            View Publication <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {publications.length > 3 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setPublicationsExpanded(!publicationsExpanded)}
                    className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    {publicationsExpanded ? "Show Less" : "Load More"}
                    <ChevronDown className={`size-4 transition-transform duration-300 ${publicationsExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 10: Media & Interviews */}
      {mediaInterviews.length > 0 && visibility.media !== false && (
        <section id="media" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-6">
                <SectionLabel>Media Presence</SectionLabel>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4">Interviews & Broadcasts</h2>
                <p className="text-foreground/75 mt-4 text-sm max-w-lg mx-auto">
                  Featured news segments, television interviews, panel discussions, and podcasts.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(mediaExpanded ? mediaInterviews : mediaInterviews.slice(0, 3)).map((med: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl glass border border-white/5 hover:border-sky/20 transition-all flex flex-col justify-between gap-4 animate-fade-in"
                  >
                    <div className="space-y-4">
                      {(getYouTubeThumbnail(med.link) || getImgUrl(med.image)) && (
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 relative group">
                          <img
                            src={getYouTubeThumbnail(med.link) || getImgUrl(med.image)}
                            alt={med.title || "Interview Video"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 grid place-items-center group-hover:bg-black/50 transition-colors">
                            <Video className="size-8 text-white/80 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <span className="text-[10px] text-sky font-bold uppercase block">{med.date}</span>
                        <h3 className="text-lg font-bold font-display text-foreground leading-snug">{med.title}</h3>
                        <p className="text-xs text-foreground/60 leading-relaxed">{med.description}</p>
                      </div>
                    </div>
                    {med.link && (
                      <div className="pt-2">
                        <a
                          href={med.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-sky hover:text-white transition"
                        >
                          Watch Interview <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {mediaInterviews.length > 3 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setMediaExpanded(!mediaExpanded)}
                    className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    {mediaExpanded ? "Show Less" : "Load More"}
                    <ChevronDown className={`size-4 transition-transform duration-300 ${mediaExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 11: Testimonials & Recommendations */}
      {testimonials.length > 0 && visibility.testimonials !== false && (
        <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>Testimonials</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Recommendations & Trust</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {(testimonialsExpanded ? testimonials : testimonials.slice(0, 2)).map((test: any, index: number) => {
                const isFeatured = test.featured === true;
                return (
                  <div
                    key={index}
                    className={`glass-strong p-6 rounded-2xl relative flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] animate-fade-in ${
                      isFeatured ? "border-gold/30 bg-gold/5 shadow-[0_0_20px_-5px_rgba(179,143,54,0.1)] ring-1 ring-gold/20" : "border-white/5 shadow-xl"
                    }`}
                  >
                    <MessageSquare className="size-8 text-[#b38f36]/30 absolute top-6 right-8" />
                    
                    <div className="space-y-4">
                      {isFeatured && (
                        <span className="bg-gold/20 text-gold text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                          Featured Recommendation
                        </span>
                      )}
                      <p className="text-foreground/80 italic text-base leading-relaxed">
                        "{test.testimonial}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
                      {getImgUrl(test.image) && (
                        <div className="size-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                          <img
                            src={getImgUrl(test.image)}
                            alt={test.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-foreground text-sm">{test.name}</div>
                        <div className="text-xs text-foreground/50 mt-0.5">{test.designation}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {testimonials.length > 2 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setTestimonialsExpanded(!testimonialsExpanded)}
                  className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {testimonialsExpanded ? "Show Less" : "Load More"}
                  <ChevronDown className={`size-4 transition-transform duration-300 ${testimonialsExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 12: Organizations & Associations */}
      {organizationsAssociations.length > 0 && visibility.orgs !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <SectionLabel>Affiliations</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-sky mt-4">Organizations & Associations</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(orgsExpanded ? organizationsAssociations : organizationsAssociations.slice(0, 3)).map((org: any, index: number) => (
                <div
                  key={index}
                  className="glass-strong p-5 rounded-2xl border border-white/5 hover:border-sky/20 hover:scale-[1.01] transition-all flex gap-4 items-start animate-fade-in"
                >
                  {getImgUrl(org.logo) && (
                    <div className="size-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5 p-1 flex items-center justify-center">
                      <img
                        src={getImgUrl(org.logo)}
                        alt={org.name}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-base leading-snug">{org.name}</h3>
                    <div className="text-xs font-semibold text-sky">{org.position}</div>
                    <p className="text-[11px] text-foreground/60 leading-relaxed pt-1.5">{org.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {organizationsAssociations.length > 3 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setOrgsExpanded(!orgsExpanded)}
                  className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {orgsExpanded ? "Show Less" : "Load More"}
                  <ChevronDown className={`size-4 transition-transform duration-300 ${orgsExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 13: Who I Help */}
      {whoIHelp.length > 0 && visibility.whoIHelp !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <SectionLabel>Who I Help</SectionLabel>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4">Target Audience</h2>
                <p className="text-foreground/75 mt-4 text-sm max-w-lg mx-auto">
                  Providing dedicated focus and customized solutions to empower key communities.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(whoIHelpExpanded ? whoIHelp : whoIHelp.slice(0, 3)).map((audience: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl glass border border-white/5 hover:border-sky/30 transition-all flex flex-col gap-4 items-start animate-fade-in"
                  >
                    {getImgUrl(audience.image) && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={getImgUrl(audience.image)}
                          alt={getImgAlt(audience.image, audience.name)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sky text-base">{audience.name}</div>
                      <div className="text-xs text-foreground/60 mt-2 leading-relaxed">{audience.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              {whoIHelp.length > 3 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setWhoIHelpExpanded(!whoIHelpExpanded)}
                    className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    {whoIHelpExpanded ? "Show Less" : "Load More"}
                    <ChevronDown className={`size-4 transition-transform duration-300 ${whoIHelpExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 14: Languages */}
      {languages.length > 0 && visibility.languages !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <SectionLabel>Languages</SectionLabel>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4">Communication & Languages</h2>
                <p className="text-foreground/75 mt-4 text-sm max-w-lg mx-auto">
                  Languages in which the leader conducts professional counseling, diplomacy, and advocacy.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {languages.map((lang: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4.5 rounded-xl glass border border-white/5 hover:border-[#86EFAC]/30 transition-all flex items-center gap-4 group"
                  >
                    <div className="size-10 rounded-xl bg-[#86EFAC]/10 group-hover:bg-[#86EFAC]/25 grid place-items-center transition-colors">
                      <Languages className="size-5 text-[#86EFAC]" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-base">{lang}</div>
                      <div className="text-[10px] text-foreground/40 font-semibold uppercase tracking-wider mt-0.5">Professional Fluency</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 15: Industries Served */}
      {industriesServed.length > 0 && visibility.industries !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-6 md:p-8 rounded-2xl border-white/10 shadow-2xl">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <SectionLabel>Sectors Served</SectionLabel>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-gradient mt-4">Industries & Domains</h2>
                <p className="text-foreground/75 mt-4 text-sm max-w-lg mx-auto">
                  Sectors where the leader provides active consultancy, policy advisory, and CSR alignment.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(industriesExpanded ? industriesServed : industriesServed.slice(0, 3)).map((ind: any, index: number) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl glass border border-white/5 hover:border-sky/20 transition-all flex flex-col gap-4 items-start animate-fade-in"
                  >
                    {getImgUrl(ind.image) && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={getImgUrl(ind.image)}
                          alt={getImgAlt(ind.image, ind.name)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-foreground text-base">{ind.name}</div>
                      {ind.description && (
                        <div className="text-xs text-foreground/60 mt-2 leading-relaxed">{ind.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {industriesServed.length > 3 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setIndustriesExpanded(!industriesExpanded)}
                    className="px-6 py-2.5 rounded-full border border-sky/30 bg-sky/5 text-sky hover:bg-sky/15 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    {industriesExpanded ? "Show Less" : "Load More"}
                    <ChevronDown className={`size-4 transition-transform duration-300 ${industriesExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 16: Keywords & Tags */}
      {keywords.length > 0 && visibility.keywords !== false && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <ScrollReveal>
            <div className="glass-strong p-4.5 rounded-2xl border-white/10 shadow-xl flex items-center justify-center flex-wrap gap-2 text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold text-sky uppercase tracking-wider mr-2">Search tags:</span>
              {keywords.map((kw: string) => (
                <span
                  key={kw}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky/5 text-sky border border-sky/10"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* SECTION 17: Contact & Collaboration (CTA / Banner / Prefered Types) */}
      {visibility.contact !== false && (
        <footer id="connect-expertise" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <ScrollReveal>
            <div className="glass-strong rounded-2xl p-6 md:p-8 border border-white/10 shadow-3xl text-center relative overflow-hidden">
              <div className="absolute -inset-10 rounded-full bg-linear-to-tr from-[#2E5E99] to-[#7BA4D0] opacity-10 blur-[100px]" />
              
              {/* Optional Contact Banner Image */}
              {getImgUrl(contactCollaboration.image) && (
                <div className="w-full max-h-60 rounded-xl overflow-hidden border border-white/10 mb-6 relative">
                  <img
                    src={getImgUrl(contactCollaboration.image)}
                    alt={getImgAlt(contactCollaboration.image, "Contact Banner")}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="max-w-2xl mx-auto relative z-10 space-y-6">
                <SectionLabel>Consultation Availability</SectionLabel>
                
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient">
                  {contactCollaboration.ctaText || "Book Consultation"}
                </h2>
                
                <p className="text-foreground/75 text-base md:text-lg leading-relaxed">
                  {contactCollaboration.description || `Let's discuss how we can work together to create measurable impact.`}
                </p>

                {/* Preference types tags */}
                {contactTypes.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block w-full mb-1">
                      Open for opportunities in:
                    </span>
                    {contactTypes.map((type) => (
                      <span key={type} className="px-3 py-1.5 rounded-full border border-sky/20 bg-sky/5 text-[10px] font-bold text-sky uppercase tracking-wider">
                        {type}
                      </span>
                    ))}
                  </div>
                )}

                {leader.is_available_for_consultation && (
                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                      href={`mailto:${connect.email || "info@globalleadersphere.com"}?subject=Consultation Request for ${leader.name}`}
                      className="btn-premium rounded-full px-8 py-4 text-base font-semibold inline-flex items-center gap-2.5"
                    >
                      {leader.cta_text || "Book Consultation"} <ArrowUpRight className="size-5" />
                    </a>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-6 text-sm text-foreground/60 text-left md:text-center">
                  {connect.website && (
                    <div>
                      <div className="font-bold text-sky mb-1 text-xs uppercase tracking-wider">Official Web</div>
                      <a href={`https://${connect.website}`} target="_blank" rel="noreferrer" className="hover:text-white transition break-all">
                        {connect.website}
                      </a>
                    </div>
                  )}
                  {connect.instagram && (
                    <div>
                      <div className="font-bold text-sky mb-1 text-xs uppercase tracking-wider">Instagram</div>
                      <a href={`https://instagram.com/${connect.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="hover:text-white transition">
                        {connect.instagram}
                      </a>
                    </div>
                  )}
                  {connect.linkedin && (
                    <div>
                      <div className="font-bold text-sky mb-1 text-xs uppercase tracking-wider">LinkedIn</div>
                      <a href={`https://linkedin.com/in/${connect.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-white transition">
                        {leader.name}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </footer>
      )}
    </div>
  );
}

function ExpertiseNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-midnight text-foreground px-4 text-center">
      <div className="blob bg-[#2E5E99] w-[500px] h-[500px] -top-20 opacity-25" />
      <div className="max-w-md glass-strong p-6 rounded-2xl border-white/10 shadow-2xl relative z-10">
        <ShieldAlert className="size-16 text-gold mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-display font-bold text-sky leading-tight mb-3">
          Expertise Profile Hidden
        </h1>
        <p className="text-foreground/75 mb-8 text-sm">
          The requested professional expertise page is currently not published or is under review.
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
