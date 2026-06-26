import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getCategories, getProfiles } from "../services/api";
import {
  Globe2,
  ChevronDown,
  Sparkles,
  Settings,
  ArrowRight,
  ShieldCheck,
  Scale,
  Users,
  Compass,
  ArrowUpRight,
  BookOpen,
  Award,
  FileText,
  Lock,
  PlusCircle,
  HelpCircle,
  Star,
  Layers,
  ChevronUp,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import { VerifiedBadge } from "../components/VerifiedBadge";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const [categories, profiles] = await Promise.all([
        getCategories(),
        getProfiles(),
      ]);
      return { categories, profiles };
    } catch (err) {
      console.error("Failed to load home page data:", err);
      return { categories: [], profiles: [] };
    }
  },
  head: () => {
    return {
      meta: [
        { title: "Global Leader Sphere — Verified Professional Legacies" },
        {
          name: "description",
          content: "Discover authentic, verified digital portfolios of global leaders, pioneers, academic experts, and public officials.",
        },
        { property: "og:title", content: "Global Leader Sphere — Verified Professional Legacies" },
        {
          property: "og:description",
          content: "Authentic, verified digital portfolios of global leaders, pioneers, and public officials.",
        },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { categories, profiles } = Route.useLoaderData();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeLeaderIdx, setActiveLeaderIdx] = useState(0);
  const [origin, setOrigin] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Descriptions for each pre-seeded category
  const categoryDescriptions: Record<string, string> = {
    "human-rights-peace-advocacy":
      "Highlighting international delegates, UN representatives, and grassroots advocates dedicated to global peace, human dignity, and structural civil rights protection.",
    "social-welfare-reform":
      "Showcasing grassroots changemakers, youth mobilizers, and academic reformers working to establish educational access, community welfare, and social empowerment.",
    "corporate-entrepreneurship":
      "Spotlighting ethical founders, corporate leaders, and CSR executives driving responsible business practices and integrating commercial success with societal impact.",
  };

  const categoryIcons: Record<string, any> = {
    "human-rights-peace-advocacy": ShieldCheck,
    "social-welfare-reform": Users,
    "corporate-entrepreneurship": Scale,
  };

  const faqItems = [
    {
      q: "Who can apply for a portfolio?",
      a: "Our platform serves distinguished professionals across all disciplines—including public servants, business executives, scientists, social innovators, sports leaders, and artists. Applications are open to anyone who has demonstrated meaningful leadership or community impact.",
    },
    {
      q: "How does the verification process work?",
      a: "Upon submission, our verification desk cross-references your timeline entries, certifications, and awards with official registers and press coverage. The circular checkmark badge is only awarded once credentials have been validated.",
    },
    {
      q: "Is this service only for high-profile celebrities?",
      a: "No. We believe that researchers, community organizers, doctors, and educators who make a difference deserve a verified legacy just as much as film and political leaders.",
    },
    {
      q: "Can organizations and foundations apply?",
      a: "Yes. We offer institutional legacy pages for NGOs, research centers, and businesses seeking to showcase their official leaders and milestones.",
    },
    {
      q: "How easily can I update my portfolio?",
      a: "Through our nested Admin console, you or your authorized representatives can add timeline items, upload certificate scans, publish news articles, and manage initiatives in real-time.",
    },
    {
      q: "How is my privacy and security maintained?",
      a: "We utilize secure Postgres databases and robust security configurations. We never host ads or trackers on your profile, ensuring a clean, distraction-free environment.",
    },
  ];

  return (
    <div className="relative min-h-screen text-foreground bg-midnight font-sans">
      {/* Background decoration blobs (wrapped to prevent overflow issues) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob bg-[#0070c0] w-[600px] h-[600px] -top-40 -right-40 opacity-10" />
        <div className="blob bg-[#b38f36] w-[700px] h-[700px] top-[25%] -left-60 opacity-[0.05]" />
        <div className="blob bg-[#0070c0] w-[600px] h-[600px] top-[50%] -right-40 opacity-[0.06]" />
        <div className="blob bg-[#b38f36] w-[500px] h-[500px] bottom-[-200px] left-20 opacity-[0.08]" />
      </div>

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
          <nav className="hidden lg:flex items-center gap-4">
            {categories.map((cat: any) => {
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
              if (hasSubcategories) {
                return (
                  <div key={cat.id} className="relative group/dropdown">
                    <Link
                      to="/category/$categorySlug"
                      params={{ categorySlug: cat.slug }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition text-foreground/75 hover:text-sky hover:bg-sky/5 relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-sky after:transition-all after:duration-300 hover:after:w-[60%] cursor-pointer outline-none"
                    >
                      <span>{cat.name}</span>
                      <ChevronDown
                        className="size-3 transition-transform duration-300 group-hover/dropdown:rotate-180 group-hover/dropdown:text-sky text-foreground/40"
                      />
                    </Link>

                    {/* Subcategories Dropdown */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 glass-strong border border-white/10 rounded-2xl p-3.5 shadow-2xl transition-all duration-200 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible z-50 space-y-1.5 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
                      <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest px-2 pb-1 border-b border-white/5 mb-1.5">
                        Roles / Sub-sectors
                      </div>
                      {cat.subcategories.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to="/category/$categorySlug/$subcategorySlug"
                          params={{
                            categorySlug: cat.slug,
                            subcategorySlug: sub.slug,
                          }}
                          className="block px-2.5 py-2 text-xs text-foreground/70 hover:text-sky hover:bg-sky/5 rounded-lg transition"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={cat.id}
                  to="/category/$categorySlug"
                  params={{ categorySlug: cat.slug }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition text-foreground/75 hover:text-sky hover:bg-sky/5 relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-sky after:transition-all after:duration-300 hover:after:w-[60%]"
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {/* Secure Admin Console Route Link & Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="hidden sm:inline-flex glass rounded-full px-5 py-2.5 text-xs font-bold items-center gap-2 hover:bg-white/10 hover:border-white/20 transition text-sky border border-sky/20 shadow-lg"
            >
              <Settings className="size-3.5" /> Admin Console
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground/80 hover:text-white transition"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 glass-strong border-b border-white/10 p-4 space-y-4 animate-fade-in flex flex-col items-center">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                to="/category/$categorySlug"
                params={{ categorySlug: cat.slug }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-bold uppercase tracking-wider text-foreground/80 hover:text-sky transition"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden glass rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 hover:bg-white/10 hover:border-white/20 transition text-sky border border-sky/20 shadow-lg mt-4"
            >
              <Settings className="size-3.5" /> Admin Console
            </Link>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto pt-14 pb-8 px-6 md:px-12 z-10 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Copy */}
          <div className="lg:col-span-7 text-left space-y-6 animate-fade-in flex flex-col items-start">
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="inline-flex items-center gap-2 chip py-1.5 px-4 bg-sky/10 border-sky/25 text-sky font-bold text-[11px] uppercase tracking-widest">
                <Sparkles className="size-3.5" /> The Standardized Digital Legacy for Distinguished Leaders
              </div>
            </ScrollReveal>
            <ScrollReveal animation="heading-reveal" delay={150}>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-gradient leading-tight tracking-tight mb-0 pb-0">
                Own the Narrative of Your Achievements. Secure Your Verified Legacy.
              </h2>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <p className="text-sm sm:text-base md:text-lg text-foreground/75 leading-relaxed font-sans max-w-2xl">
                We build premium, verified, and permanent digital portfolios for global pioneers,
                social innovators, and distinguished industry leaders. Distinguish your authentic life’s
                work from scattered algorithms and digital noise.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={450}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/admin"
                  className="btn-premium rounded-full px-8 py-4 text-xs font-bold inline-flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                  Apply for Verified Portfolio <ArrowUpRight className="size-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="glass rounded-full px-8 py-4 text-xs font-bold inline-flex items-center gap-2 border border-white/10 hover:bg-white/5 transition"
                >
                  Learn How It Works
                </a>
              </div>
              <p className="text-[10px] text-muted-foreground/60 tracking-wider uppercase mt-4">
                * Established on strict verification protocols. Shielded by absolute privacy. Recognized globally.
              </p>
            </ScrollReveal>
          </div>

          {/* Right Side: Verification Registry Dashboard Console */}
          <div className="lg:col-span-5 relative flex justify-center w-full">
            {/* Ambient glowing blobs */}
            <div className="absolute -inset-8 bg-gradient-to-tr from-[#0070c0]/20 via-[#16a34a]/10 to-[#eab308]/15 rounded-[60px] blur-3xl opacity-80 pointer-events-none" />
            
            <ScrollReveal animation="fade-up" delay={300} className="w-full max-w-[460px] relative">
              <div className="glass-strong border border-white/10 rounded-[36px] p-6 shadow-2xl relative overflow-hidden backdrop-blur-3xl bg-midnight/80">
                {/* Console header decoration */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-500/80" />
                    <span className="size-2.5 rounded-full bg-yellow-500/80" />
                    <span className="size-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[9px] font-mono text-foreground/40 font-bold uppercase tracking-widest">
                    Secure Verification System v2.4
                  </span>
                </div>

                {/* Registry Database Active Image banner */}
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 bg-white/5 relative group mb-4">
                  <img
                    src="/assets/premium_legacy_hero.png"
                    alt="Verified Legacy Network Database Graphic"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Futuristic overlay text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[9px] text-sky font-bold tracking-widest uppercase">REGISTRY DATABASE ACTIVE</span>
                    <h4 className="text-white font-display text-xs font-bold mt-1 tracking-wide">Global Leadership Directory</h4>
                  </div>
                </div>

                {/* Registry Info Details & QR side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-7 space-y-3.5 text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-[10px] uppercase tracking-wider">
                      <span className="size-1.5 rounded-full bg-green-400 animate-ping" />
                      VERIFIED ACTIVE
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">REGISTRY NO:</div>
                      <div className="text-sm font-mono font-bold text-white tracking-wide">#GLS-98X-04A</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">STATUS DETAIL:</div>
                      <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                        <ShieldCheck className="size-3.5 text-sky" /> Credentials Validated
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3.5 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="bg-white p-1 rounded-xl shadow-inner shrink-0">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https%3A%2F%2Fgloballeadersphere.org"
                        alt="Registry QR Code"
                        className="size-16 object-contain"
                      />
                    </div>
                    <span className="text-[8px] font-bold text-gold uppercase tracking-wider mt-2.5">
                      SCAN TO VERIFY
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Dynamic platform impact statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16 pt-8 border-t border-white/5">
          {[
            { val: "100%", label: "Verified Personas" },
            { val: "4,000+", label: "Youth Mobilised" },
            { val: "16+", label: "Global Citations" },
            { val: "Active", label: "UN Representation" },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1.5 p-4 glass rounded-3xl border-white/5">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-gold leading-none">
                {stat.val}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-foreground/50 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: WHO WE SERVE                                                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto py-14 px-6 md:px-12 z-10 relative">
        <div className="text-center space-y-3 mb-12">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-sky/20 bg-sky/5 text-sky font-semibold text-[10px] uppercase tracking-wider">
              <Compass className="size-3.5" /> Who We Serve
            </div>
          </ScrollReveal>
          <ScrollReveal animation="heading-reveal" delay={150}>
            <div className="mt-2 mb-4">
              <h3 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-0 pb-0">
                Designed for Those Who Inspire, Lead, and Create Impact
              </h3>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <p className="text-sm text-foreground/50 max-w-2xl mx-auto">
              True leadership is defined by impact, not algorithms. Global Leader Sphere serves as the
              exclusive registry for high-profile pioneers whose achievements shape societies,
              industries, and generations.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "Public Servants & Officials",
              audience: "IAS & IPS Officers, Defence Personnel, Public Servants, Diplomats",
              desc: "A dignified, structured portfolio displaying verified designations, national orders, and administrative milestones.",
              theme: "sky",
            },
            {
              title: "Visionaries & Philanthropists",
              audience: "NGO Founders, Social Activists, Philanthropists, Community Leaders",
              desc: "We preserve your public campaigns, grassroots milestones, and institutional vision with a high-fidelity slideshow experience.",
              theme: "gold",
            },
            {
              title: "Pioneers of Knowledge",
              audience: "Scientists, Researchers, Professors, Doctors, Educationists",
              desc: "Dynamic showcases for peer-reviewed papers, patents, academic citations, and certificates of credentialed excellence.",
              theme: "sky",
            },
            {
              title: "Builders of Enterprise",
              audience: "CEOs, Business Leaders, Entrepreneurs, Startup Founders",
              desc: "Premium executive timelines highlighting corporate governance milestones, organizational growth, and board initiatives.",
              theme: "gold",
            },
            {
              title: "Creators & Media Professionals",
              audience: "Artists, Musicians, Sports Personalities, Journalists, Speakers",
              desc: "High-fidelity grids showcasing media coverage, news columns, and televised features alongside click-to-lightbox galleries.",
              theme: "sky",
            },
            {
              title: "Distinguished Experts",
              audience: "Award Winners, Industry Experts, Distinguished Professionals",
              desc: "We translate a lifetime of unique, cross-disciplinary excellence into an authoritative digital landmark.",
              theme: "gold",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-white/15 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.theme === "sky" ? "bg-sky" : "bg-gold"}`} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {item.title}
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold text-foreground leading-tight">
                  {item.audience}
                </h4>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SEEDED CATEGORIES SHOWCASE GRID (DYNAMIC DIRECTORIES)                     */}
      {/* ========================================================================= */}
      {(() => {
        const categoryCoverImages: Record<string, string> = {
          "human-rights-peace-advocacy": "/assets/6.jpeg",
          "social-welfare-reform": "/assets/8.jpeg",
          "corporate-entrepreneurship": "/assets/4.jpeg",
        };
        const categoryIcons: Record<string, any> = {
          "human-rights-peace-advocacy": ShieldCheck,
          "social-welfare-reform": Users,
          "corporate-entrepreneurship": Scale,
        };

        return (
          <section className="max-w-7xl mx-auto py-11 px-6 md:px-12 z-10 relative">
            <div className="text-center space-y-3 mb-12">
              <ScrollReveal animation="fade-up" delay={0}>
                <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-sky/20 bg-sky/5 text-sky font-semibold text-[10px] uppercase tracking-wider">
                  <Compass className="size-3.5" /> Explore Sectors
                </div>
              </ScrollReveal>
              <ScrollReveal animation="heading-reveal" delay={150}>
                <div className="mt-2 mb-4">
                  <h3 className="font-display text-3xl font-bold text-gradient mb-0 pb-0">
                    Verified Leader Directories
                  </h3>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="fade-up" delay={300}>
                <p className="text-sm text-foreground/50 max-w-md mx-auto">
                  Choose a sector directory below to explore registered changemakers, delegates, and initiatives.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {categories.map((cat: any) => {
                const IconComponent = categoryIcons[cat.slug] || ShieldCheck;
                const description =
                  categoryDescriptions[cat.slug] ||
                  "Explore verified public profiles, leadership campaigns, and grassroots projects registered under this category sector.";
                const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
                const coverImage = categoryCoverImages[cat.slug] || "/assets/6.jpeg";

                return (
                  <div
                    key={cat.id}
                    className="glass rounded-[32px] overflow-hidden p-6 sm:p-8 hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300 border-white/10 flex flex-col justify-between h-full group relative bg-midnight/40"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-5">
                        {/* Icon badge */}
                        <div className="size-12 rounded-2xl btn-premium grid place-items-center group-hover:scale-105 transition-transform duration-300 shadow-xl border border-white/15">
                          <IconComponent className="size-6 text-white" />
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-2">
                          <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-sky transition-colors leading-tight">
                            {cat.name}
                          </h4>
                          <p className="text-xs leading-relaxed text-foreground/60">{description}</p>
                        </div>

                        {/* Nested Subcategories Pills */}
                        {hasSubcategories && (
                          <div className="space-y-2 pt-2">
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                              Roles in this Category
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subcategories.map((sub: any) => (
                                <Link
                                  key={sub.id}
                                  to="/category/$categorySlug/$subcategorySlug"
                                  params={{
                                    categorySlug: cat.slug,
                                    subcategorySlug: sub.slug,
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-sky/30 hover:bg-sky/5 hover:text-sky transition text-[11px] font-semibold text-foreground/75"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Call-to-action button */}
                      <div className="mt-8 pt-6 border-t border-white/5">
                        <Link
                          to="/category/$categorySlug"
                          params={{ categorySlug: cat.slug }}
                          className="w-full btn-premium rounded-full py-3.5 text-xs font-bold inline-flex items-center justify-center gap-2 group/btn"
                        >
                          Explore Sector Directory
                          <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* ========================================================================= */}
      {/* FEATURED LEADERS SECTION                                                  */}
      {/* ========================================================================= */}
      {profiles.length > 0 && (
        <section className="max-w-7xl mx-auto py-14 px-6 md:px-12 z-10 relative">
          <div className="text-center space-y-3 mb-12">
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-gold/25 bg-gold/5 text-gold font-semibold text-[10px] uppercase tracking-wider">
                <Star className="size-3.5" /> Registry Showcase
              </div>
            </ScrollReveal>
            <ScrollReveal animation="heading-reveal" delay={150}>
              <div className="mt-2 mb-4">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-0 pb-0">
                  Featured Verified Portfolios
                </h3>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <p className="text-sm text-foreground/50 max-w-md mx-auto">
                Explore official registries of distinguished leaders verified on our network.
              </p>
            </ScrollReveal>
          </div>

          {/* Gallery Carousel (Slideshow Card) */}
          <div className="max-w-4xl mx-auto relative group/carousel">
            {(() => {
              const p = profiles[activeLeaderIdx];
              if (!p) return null;
              const leaderUrl = origin ? `${origin}/leader/${p.slug}` : `https://globalleadersphere.org/leader/${p.slug}`;

              return (
                <div className="glass-strong rounded-[40px] p-6 md:p-8 border border-white/10 bg-midnight/70 shadow-2xl relative overflow-hidden transition-all duration-500 animate-fade-in">
                  <div className="grid md:grid-cols-12 gap-8 items-center">
                    
                    {/* Column 1: Portrait */}
                    <div className="md:col-span-5 relative w-full aspect-[4/5] rounded-[28px] overflow-hidden border border-white/15 bg-white/5 shadow-2xl shrink-0">
                      <img
                        src={p.portrait}
                        alt={p.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                      />
                      {p.category_name && (
                        <div className="absolute bottom-4 left-4 z-10">
                          <span className="chip py-1 px-2.5 text-[9px] bg-midnight/90 border border-white/15 text-sky font-bold uppercase backdrop-blur-md">
                            {p.category_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Details & Verification QR */}
                    <div className="md:col-span-7 flex flex-col justify-between h-full space-y-6 text-left">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-gold font-bold uppercase tracking-wider">
                          <VerifiedBadge className="size-4.5" />
                          <span>VERIFIED LEADERSHIP IDENTITY</span>
                        </div>
                        <h3 className="font-display text-3xl font-bold text-white tracking-tight leading-tight">
                          {p.name}
                        </h3>
                        <p className="text-sm font-semibold text-sky uppercase tracking-wide">
                          {p.title}
                        </p>
                        <p className="text-xs text-foreground/60 leading-relaxed font-sans line-clamp-3">
                          {p.subtitle}
                        </p>
                      </div>

                      {/* QR and CTA action row */}
                      <div className="pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-inner border border-white/10">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(leaderUrl)}`}
                              alt="Registry QR Code"
                              className="size-16 object-contain"
                            />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Verification QR</h4>
                            <p className="text-[9px] text-muted-foreground mt-0.5 max-w-[125px] leading-snug">
                              Scan this digital seal to instantly load and verify credentials.
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/leader/$slug"
                          params={{ slug: p.slug }}
                          className="btn-premium rounded-full px-6 py-3.5 text-xs font-bold inline-flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                        >
                          View Full Profile <ArrowRight className="size-3.5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Slider Navigation controls (next/prev arrows overlay) */}
            {profiles.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveLeaderIdx((prev) => (prev - 1 + profiles.length) % profiles.length)}
                  className="absolute left-[-20px] md:left-[-28px] top-1/2 -translate-y-1/2 size-10 md:size-12 rounded-full glass border border-white/10 flex items-center justify-center text-foreground hover:text-white hover:bg-white/10 hover:border-white/20 transition-all z-20 cursor-pointer shadow-lg hover:scale-105 outline-none"
                  title="Previous Profile"
                >
                  <ChevronLeft className="size-5 md:size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLeaderIdx((prev) => (prev + 1) % profiles.length)}
                  className="absolute right-[-20px] md:right-[-28px] top-1/2 -translate-y-1/2 size-10 md:size-12 rounded-full glass border border-white/10 flex items-center justify-center text-foreground hover:text-white hover:bg-white/10 hover:border-white/20 transition-all z-20 cursor-pointer shadow-lg hover:scale-105 outline-none"
                  title="Next Profile"
                >
                  <ArrowRight className="size-5 md:size-6" />
                </button>
              </>
            )}

            {/* Pagination dots */}
            {profiles.length > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                {profiles.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveLeaderIdx(idx)}
                    className={`size-2 rounded-full transition-all duration-300 cursor-pointer outline-none ${
                      activeLeaderIdx === idx ? "w-6 bg-sky" : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: WHY A VERIFIED PORTFOLIO                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto py-14 px-6 md:px-12 z-10 relative">
        <div className="glass-strong rounded-[40px] p-8 md:p-12 border-white/10 shadow-3xl">
          <div className="max-w-3xl space-y-4 mb-12">
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-gold/25 bg-gold/5 text-gold font-semibold text-[10px] uppercase tracking-wider">
                <Star className="size-3.5" /> Digital Integrity
              </div>
            </ScrollReveal>
            <ScrollReveal animation="heading-reveal" delay={150}>
              <div className="mt-2 mb-4">
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient leading-tight mb-0 pb-0">
                  Your Achievements Deserve More Than Social Media
                </h3>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <p className="text-sm text-foreground/70 leading-relaxed font-sans">
                Scattered profiles, temporary timelines, and volatile search engine algorithms are
                inadequate for a distinguished professional. A lifetime of public service, intellectual property,
                or enterprise builder milestones shouldn't be diluted by ad-supported feeds and impersonation threats.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
            {[
              {
                title: "Trust & Authenticity",
                desc: "A validated, certified presence rank-locked at the top of search results, establishing instantaneous authority.",
              },
              {
                title: "Unified Registry",
                desc: "A centralized, elegant dashboard holding your timeline events, certificates, publications, and projects.",
              },
              {
                title: "Impersonation Defense",
                desc: "Secure checked status that formally separates your authentic life's work from copycats and fake profiles.",
              },
              {
                title: "Permanent Legacy",
                desc: "A clean, ad-free digital record built on modern web standards to guide future generations for decades.",
              },
            ].map((phil, i) => (
              <div
                key={i}
                className="glass p-6 rounded-3xl border-white/5 space-y-4 hover:border-gold/30 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h4 className="font-display text-base font-bold text-sky flex items-center gap-2">
                    <ShieldCheck className="size-4 text-gold shrink-0" /> {phil.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-foreground/60 font-sans">
                    {phil.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: VERIFIED CERTIFICATION                                         */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto py-14 px-6 md:px-12 z-10 relative">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-sky/20 bg-sky/5 text-sky font-semibold text-[10px] uppercase tracking-wider">
                <Award className="size-3.5" /> Authenticity Seal
              </div>
            </ScrollReveal>
            <ScrollReveal animation="heading-reveal" delay={150}>
              <div className="mt-2 mb-4">
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient leading-tight mb-0 pb-0">
                  Verified. Trusted. Recognized.
                </h3>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Every published leader profile undergoes an exhaustive credential audit to validate public service honors,
                academic publications, corporate positions, and social achievements. Profiles that meet our standards receive
                the circular checkmark badge—the gold standard of digital integrity.
              </p>
              <div className="space-y-3 mt-4">
                {[
                  "Public trust and administrative credibility",
                  "Shielded separation from imposter accounts",
                  "Direct link to official verified credentials registry",
                  "Enhanced visibility for speaking panels and board selections",
                ].map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="size-5 rounded-full bg-sky/15 border border-sky/30 grid place-items-center shrink-0">
                      <Sparkles className="size-3 text-sky" />
                    </div>
                    <span className="text-xs text-foreground/90 font-medium">{pt}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 pt-4 leading-normal">
                * Note: Verification credentials are dynamically maintained. Profiles must update records periodically to keep checked status active.
              </p>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6 flex justify-center relative min-h-[360px] items-center">
            {/* Tilted, glass-framed official ceremony picture */}
            <div className="absolute w-[280px] md:w-[340px] aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-xl rotate-[-6deg] translate-x-[-20px] translate-y-[10px] bg-white/5 opacity-40 hover:opacity-60 hover:rotate-[-3deg] transition-all duration-700">
              <img
                src="/assets/7.jpeg"
                alt="Official ceremony representation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent" />
            </div>

            {/* Glowing checkmark badge floating in front */}
            <div className="relative group size-56 md:size-64 flex items-center justify-center translate-x-[20px] translate-y-[-10px] hover:scale-105 transition-transform duration-500">
              {/* Pulsing glow behind badge */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0070c0]/35 via-[#16a34a]/15 to-[#eab308]/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              {/* SVG circular badge */}
              <svg className="size-44 md:size-52 drop-shadow-2xl animate-spin-slow" viewBox="0 0 200 200" fill="none">
                <defs>
                  <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0070c0" />
                    <stop offset="50%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                  <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="80" stroke="url(#badgeGrad)" strokeWidth="6" strokeDasharray="10, 5" fill="rgba(0,0,0,0.5)" filter="url(#shadowFilter)" />
                <path d="M70,105 L90,125 L135,80" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Overlay Check label */}
              <span className="absolute bottom-2 backdrop-blur-md bg-black/75 border border-white/15 px-3 py-1 rounded-full text-[9px] font-bold text-sky shadow-lg uppercase tracking-widest">
                Official Certification
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: FEATURES                                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto py-14 px-6 md:px-12 z-10 relative">
        <div className="text-center space-y-3 mb-12">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-sky/20 bg-sky/5 text-sky font-semibold text-[10px] uppercase tracking-wider">
              <Layers className="size-3.5" /> Platform Capabilities
            </div>
          </ScrollReveal>
          <ScrollReveal animation="heading-reveal" delay={150}>
            <div className="mt-2 mb-4">
              <h3 className="font-display text-3xl font-bold text-gradient mb-0 pb-0">
                Everything You Need to Showcase Your Legacy
              </h3>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <p className="text-sm text-foreground/50 max-w-md mx-auto">
              Our framework is built to showcase a diverse range of accomplishments with premium design modules.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { title: "Milestone Timelines", desc: "Interactive event tracks dividing your achievements into historical milestones.", icon: BookOpen },
            { title: "Newspaper Press Grid", desc: "Equal-height newspaper cards linking press columns and televised features.", icon: FileText },
            { title: "Initiatives Slideshow", desc: "Premium carousels linking project photos with metadata and descriptors.", icon: Globe2 },
            { title: "Asymmetric Galleries", desc: "Asymmetric photo collage grids equipped with prev/next lightbox sliders.", icon: Compass },
            { title: "Credentials Registry", desc: "Secure index of qualifications and certificates, validated by our desk.", icon: ShieldCheck },
            { title: "Distinction Awards", desc: "Medals cabinet highlighted by gold gradients and hover pulse highlights.", icon: Award },
            { title: "Administrative Info", desc: "Dynamic biodata tables classifying official titles and locations.", icon: Users },
            { title: "Sovereign Domains", desc: "Independent name-locked profiles ranking at the top of Google searches.", icon: Lock },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass p-6 rounded-3xl border-white/5 space-y-3 hover:border-sky/25 transition-all duration-300">
                <div className="size-10 rounded-xl bg-sky/5 border border-sky/15 grid place-items-center text-sky">
                  <Icon className="size-5" />
                </div>
                <h4 className="font-display text-[15px] font-bold text-foreground">{feat.title}</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: HOW IT WORKS                                                   */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto py-14 px-6 md:px-12 z-10 relative">
        <div className="text-center space-y-3 mb-12">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-sky/20 bg-sky/5 text-sky font-semibold text-[10px] uppercase tracking-wider">
              <PlusCircle className="size-3.5" /> Onboarding Process
            </div>
          </ScrollReveal>
          <ScrollReveal animation="heading-reveal" delay={150}>
            <div className="mt-2 mb-4">
              <h3 className="font-display text-3xl font-bold text-gradient mb-0 pb-0">
                Simple. Professional. Verified.
              </h3>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto relative">
          {[
            { step: "01", title: "Submit Details", desc: "Select your directory category and enter your profile requirements." },
            { step: "02", title: "Share Evidence", desc: "Provide scans of certificates, awards, and published news links." },
            { step: "03", title: "Design Drafting", desc: "Our editors build your high-fidelity profile with clean layout modules." },
            { step: "04", title: "Registry Review", desc: "Our verification desk conducts audits to validate certifications." },
            { step: "05", title: "Global Release", desc: "Your portfolio goes live, secured with checkmark badges and fast load speeds." },
          ].map((st, idx) => (
            <div key={idx} className="glass p-5 rounded-2xl border-white/5 space-y-4 hover:bg-white/5 transition relative">
              <span className="text-3xl font-display font-extrabold text-gold/30 block">{st.step}</span>
              <h4 className="font-display text-sm font-bold text-sky">{st.title}</h4>
              <p className="text-[11px] text-foreground/60 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 11: FAQ SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="max-w-3xl mx-auto py-14 px-6 z-10 relative">
        <div className="text-center space-y-3 mb-12">
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-sky/20 bg-sky/5 text-sky font-semibold text-[10px] uppercase tracking-wider">
              <HelpCircle className="size-3.5" /> FAQ Registry
            </div>
          </ScrollReveal>
          <ScrollReveal animation="heading-reveal" delay={150}>
            <div className="mt-2 mb-4">
              <h3 className="font-display text-3xl font-bold text-gradient mb-0 pb-0">
                Frequently Asked Questions
              </h3>
            </div>
          </ScrollReveal>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div key={idx} className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-display font-bold text-sm text-foreground hover:bg-white/5 transition"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-sky shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-foreground/45 shrink-0" />
                  )}
                </button>
                <div
                  className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs text-foreground/75 leading-relaxed font-sans">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10: FINAL CTA                                                     */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto py-14 pb-24 px-6 z-10 relative">
        <div className="glass-strong rounded-[40px] p-8 md:p-14 border border-white/10 text-center space-y-6 relative overflow-hidden shadow-2xl">
          {/* Decorative glowing gradient inside card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0070c0]/5 to-[#b38f36]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <ScrollReveal animation="fade-up" delay={0}>
              <div className="inline-flex items-center gap-1.5 chip py-1 px-3 border-gold/25 bg-gold/5 text-gold font-semibold text-[10px] uppercase tracking-wider">
                <Sparkles className="size-3.5" /> Secure Your Legacy
              </div>
            </ScrollReveal>
            <ScrollReveal animation="heading-reveal" delay={150}>
              <div className="mt-2 mb-4">
                <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient leading-tight mb-0 pb-0">
                  The Story of Your Life Deserves a Home of Its Own
                </h3>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-sans max-w-2xl mx-auto">
                Your contributions to enterprise, science, public service, and community activism deserve a permanent
                digital home. Secure your authentic identity and establish your verified footprint today.
              </p>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={450}>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  to="/admin"
                  className="btn-premium rounded-full px-8 py-4 text-xs font-bold inline-flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                  Start Your Application <ArrowUpRight className="size-4" />
                </Link>
                <Link
                  to="/admin"
                  className="glass rounded-full px-8 py-4 text-xs font-bold inline-flex items-center gap-2 border border-white/10 hover:bg-white/5 transition"
                >
                  Request Executive Call
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
