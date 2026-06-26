import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Building2,
  Globe2,
  GraduationCap,
  Heart,
  Instagram,
  Landmark,
  Link as LinkIcon,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  CalendarDays,
  ArrowUpRight,
  Briefcase,
  Scale,
  Megaphone,
  ChevronDown,
  Plus,
  Settings,
  Video,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Menu,
} from "lucide-react";
import { DynamicIcon } from "./DynamicIcon";
import { ScrollReveal } from "./ScrollReveal";
import { HeadingFrame } from "./HeadingFrame";
import { VerifiedBadge } from "./VerifiedBadge";

interface LeaderProfileViewProps {
  leader: {
    id: number;
    slug: string;
    name: string;
    title: string;
    subtitle: string;
    portrait: string;
    is_published?: boolean;
    data: {
      roles?: Array<{ icon: string; label: string }>;
      stats?: Array<{ value: string; label: string }>;
      bio?: Array<{ k: string; v: string }>;
      biography?: { earlyLife: string; career: string };
      timeline?: Array<{
        period: string;
        title: string;
        body: string;
        highlight: string;
        icon: string;
        span: string;
      }>;
      orgLabel?: string;
      orgTitle?: string;
      orgSubtitle?: string;
      orgWebsite?: string;
      orgDescription?: string;
      biodataImage?: string;
      orgFocus?: string[];
      initiatives?: Array<{ icon: string; title: string; body: string }>;
      awards?: Array<{
        year: string;
        title: string;
        org: string;
        body: string;
        img?: string;
        link?: string;
        links?: Array<{ label: string; url: string }>;
      }>;
      recent?: Array<{ title: string; body: string }>;
      inspirations?: Array<{ name: string; quote: string; body: string }>;
      connect?: {
        instagram?: string;
        website?: string;
        council?: string;
        facebook?: string;
        linkedin?: string;
        twitter?: string;
        youtube?: string;
        customLinks?: Array<{ label: string; url: string }>;
      };
      certificates?: Array<{ image: string; title: string; org: string; description: string; date: string; order?: number; alt?: string }>;
      myInitiatives?: Array<{
        id: string;
        title: string;
        images: Array<{
          image: string;
          title: string;
          description: string;
          order?: number;
          alt?: string;
        }>;
      }>;
      newsArticles?: Array<{ image: string; title: string; description: string; source: string; date: string; link?: string; order?: number; alt?: string }>;
      recentActivities?: Array<{ image: string; title: string; description: string; date: string; location?: string; order?: number; alt?: string }>;
    };
  };
  allProfiles: any[];
}

export function SectionLabel({ children, className = "mb-5" }: { children: React.ReactNode; className?: string }) {
  // Color configuration variables (premium green palette)
  const primaryGreen = "#16A34A";
  const lightGreenBg = "#F0FDF4";
  const borderGreen = "#86EFAC";
  const textGreen = "#166534";
  const hoverBorderGreen = "#15803D"; // Richer/darker green on hover
  const hoverBgGreen = "#DCFCE7";     // Richer green bg on hover
  const hoverTextGreen = "#14532D";   // High contrast prominent text on hover

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        border-[1.5px] border-[#86EFAC] bg-[#F0FDF4] text-[#166534]
        shadow-[0_3px_12px_-3px_rgba(22,163,74,0.12),_0_6px_16px_-8px_rgba(22,163,74,0.08)]
        transition-all duration-300 ease-out
        hover:border-[#16A34A] hover:bg-[#DCFCE7] hover:text-[#14532D]
        hover:shadow-[0_4px_18px_-2px_rgba(22,163,74,0.22),_0_10px_28px_-10px_rgba(22,163,74,0.12)]
        hover:scale-[1.02] active:scale-[0.98]
        cursor-default select-none group
        ${className}
      `}
      style={{
        "--primary-green": primaryGreen,
        "--light-green-bg": lightGreenBg,
        "--border-green": borderGreen,
        "--text-green": textGreen,
        "--hover-border-green": hoverBorderGreen,
        "--hover-bg-green": hoverBgGreen,
        "--hover-text-green": hoverTextGreen,
      } as React.CSSProperties}
    >
      <Sparkles className="size-3.5 text-[#16A34A] transition-colors duration-300 group-hover:text-[#166534] shrink-0" />
      <span className="text-[11px] font-bold tracking-[0.08em] uppercase transition-colors duration-300">
        {children}
      </span>
    </div>
  );
}

export function LeaderProfileView({ leader, allProfiles }: LeaderProfileViewProps) {
  const [activeRole, setActiveRole] = useState(0);
  const [profileUrl, setProfileUrl] = useState("");
  const [activeQrModal, setActiveQrModal] = useState<{ name: string; url: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileUrl(`${window.location.origin}/leader/${leader.slug}`);
      setIsAdmin(!!localStorage.getItem("admin_token"));
    }
  }, [leader.slug]);

  const parsedData = (typeof leader.data === "string" ? JSON.parse(leader.data) : leader.data || {}) as LeaderProfileViewProps["leader"]["data"];

  const {
    roles = [],
    stats = [],
    bio = [],
    biography = { earlyLife: "", career: "" },
    timeline = [],
    orgFocus = [],
    initiatives = [],
    awards = [],
    recent = [],
    inspirations = [],
    connect = {},
    certificates = [],
    myInitiatives = [],
    newsArticles = [],
    recentActivities = [],
    orgLabel,
    orgTitle,
    orgSubtitle,
    orgWebsite,
    orgDescription,
  } = parsedData;

  const [lightboxData, setLightboxData] = useState<{
    section: "certificates" | "myInitiatives" | "newsArticles" | "recentActivities";
    items: any[];
    index: number;
  } | null>(null);
  const [selectedAward, setSelectedAward] = useState<any | null>(null);

  const [activeInitIdx, setActiveInitIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Reset active image index when switching initiatives
  useEffect(() => {
    setActiveImageIdx(0);
  }, [activeInitIdx]);

  // Autoplay effect for Initiatives slideshow
  useEffect(() => {
    if (!isAutoplay) return;
    const activeInit = myInitiatives[activeInitIdx];
    const images = activeInit?.images || [];
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoplay, activeInitIdx, myInitiatives]);

  // News Articles Pagination states
  const [newsPageIdx, setNewsPageIdx] = useState(0);
  const [newsItemsPerPage, setNewsItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setNewsItemsPerPage(3);
      } else if (window.innerWidth >= 768) {
        setNewsItemsPerPage(2);
      } else {
        setNewsItemsPerPage(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setNewsPageIdx(0);
  }, [newsItemsPerPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxData(null);
        setSelectedAward(null);
      } else if (lightboxData !== null) {
        const { items, index } = lightboxData;
        if (items.length === 0) return;

        if (e.key === "ArrowLeft") {
          setLightboxData({
            ...lightboxData,
            index: index > 0 ? index - 1 : items.length - 1,
          });
        } else if (e.key === "ArrowRight") {
          setLightboxData({
            ...lightboxData,
            index: index < items.length - 1 ? index + 1 : 0,
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxData]);

  // Dynamic grid classes for Recent Activities collage
  const getActivityGridClasses = (idx: number) => {
    const pattern = idx % 6;
    switch (pattern) {
      case 0:
        return "lg:col-span-2 lg:row-span-2 col-span-2 aspect-[4/3] lg:aspect-auto";
      case 1:
        return "lg:col-span-1 lg:row-span-2 col-span-1 aspect-[3/4] lg:aspect-auto";
      case 2:
        return "lg:col-span-1 lg:row-span-1 col-span-1 aspect-square lg:aspect-auto";
      case 3:
        return "lg:col-span-1 lg:row-span-1 col-span-1 aspect-square lg:aspect-auto";
      case 4:
        return "lg:col-span-2 lg:row-span-1 col-span-2 aspect-[2/1] lg:aspect-auto";
      case 5:
        return "lg:col-span-2 lg:row-span-1 col-span-2 aspect-[2/1] lg:aspect-auto";
      default:
        return "lg:col-span-1 lg:row-span-1 col-span-1 aspect-square lg:aspect-auto";
    }
  };

  // Safe bounds check for active role selection
  const safeActiveRole = activeRole < timeline.length ? activeRole : 0;
  const currentRole = timeline[safeActiveRole];


  return (
    <main className="relative overflow-hidden text-foreground bg-midnight min-h-screen">
      {/* Ambient background blobs */}
      <div className="blob bg-[#0070c0] w-[620px] h-[620px] -top-40 -right-32 opacity-12" />
      <div className="blob bg-[#b38f36] w-[520px] h-[520px] top-[10%] -left-32 opacity-[0.06]" />
      <div className="blob bg-[#0070c0] w-[620px] h-[620px] top-[40%] -right-32 opacity-10" />
      <div className="blob bg-[#b38f36] w-[700px] h-[700px] bottom-[-200px] left-[10%] opacity-[0.05]" />

      {/* NAV */}
      <header className="sticky top-0 z-50 transition-all duration-300 bg-midnight/80 backdrop-blur-md border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl btn-premium grid place-items-center">
              <Globe2 className="size-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-[17px] text-sky">
                WHRC · Leader Profile
              </div>
              <div className="text-[13px] text-foreground/60">Verified global identity</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 shadow-2xl backdrop-blur-3xl">
            <span className="px-4.5 py-2 text-xs font-bold text-sky bg-sky/10 border border-sky/20 rounded-full shadow-inner">
              Biography Portfolio
            </span>
            {(leader.is_published || isAdmin) && (
              <Link
                to="/leader/$slug/professional-expertise"
                params={{ slug: leader.slug }}
                className="px-4.5 py-2 text-xs font-bold text-foreground/75 hover:text-sky hover:bg-sky/5 rounded-full transition"
              >
                Professional Expertise
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic Profile Selector Dropdown */}
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
                    {allProfiles.map((p) => {
                      return (
                        <Link
                          key={p.slug}
                          to="/leader/$slug"
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
                      );
                    })}
                  </div>
                  <div className="border-t border-white/5 mt-2 pt-2">
                    <Link
                      to="/admin"
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-linear-to-br from-[#7BA4D0]/10 to-[#2E5E99]/15 hover:from-[#7BA4D0]/20 hover:to-[#2E5E99]/30 transition text-xs font-bold text-sky border border-sky/20"
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

            <a
              href="#connect"
              className="bg-linear-to-br from-[#7BA4D0] to-[#2E5E99] text-white shadow-[0_10px_30px_-10px_rgba(46,94,153,0.5)] rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              Connect <ArrowUpRight className="size-3.5" />
            </a>

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
              <span className="text-center py-2 text-xs font-bold text-sky bg-sky/10 border border-sky/20 rounded-xl shadow-inner">
                Biography Portfolio
              </span>
              {(leader.is_published || isAdmin) && (
                <Link
                  to="/leader/$slug/professional-expertise"
                  params={{ slug: leader.slug }}
                  className="text-center py-2 text-xs font-bold text-foreground/75 hover:text-sky rounded-xl transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Professional Expertise
                </Link>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-1.5">
                Biography Sections
              </div>
              {[
                { label: "Biography", hash: "#profile" },
                { label: "Awards", hash: "#awards" },
                { label: "Certificates", hash: "#certificates" },
                { label: "News Articles", hash: "#news-articles" },
                { label: "Recent Activities", hash: "#recent-activities" },
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

      {/* Secondary Sticky Sub-Navbar for Biography Anchors */}
      <div className="sticky top-[73px] z-40 bg-midnight/90 backdrop-blur-md border-b border-white/5 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-start gap-1 overflow-x-auto no-scrollbar">
          {[
            { label: "Biography", hash: "#profile" },
            { label: "Awards", hash: "#awards" },
            { label: "Certificates", hash: "#certificates" },
            { label: "News Articles", hash: "#news-articles" },
            { label: "Recent Activities", hash: "#recent-activities" },
            { label: "Connect", hash: "#connect" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.hash}
              className="px-4 py-2 text-xs rounded-full hover:bg-white/5 hover:text-sky text-foreground/80 font-semibold tracking-wide transition shrink-0"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-24 lg:pt-32 pb-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 fade-up">
            <div className="chip mb-6">
              Verified leader profile · World Human Rights Council
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight flex items-center flex-wrap gap-x-3.5 gap-y-2">
              <span className="text-gradient">{leader.name}</span>
              <VerifiedBadge className="size-8 md:size-9 lg:size-10 shrink-0" />
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-foreground/75 max-w-2xl leading-relaxed">
              {leader.subtitle}
            </p>
            {leader.title && (
              <div className="mt-3 flex items-center gap-2 text-base text-[#7BA4D0]/80 font-medium">
                <GraduationCap className="size-5" /> {leader.title}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2.5">
              {roles.map(({ icon, label }) => (
                <span key={label} className="role-chip-gold-shimmer">
                  <DynamicIcon name={icon} className="size-3.5" /> {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="#connect"
                className="btn-premium rounded-full px-8 py-4 text-base font-semibold inline-flex items-center gap-2.5"
              >
                Get in touch <ArrowUpRight className="size-5" />
              </a>
              <a
                href="#timeline"
                className="glass rounded-full px-8 py-4 text-base font-medium inline-flex items-center gap-2.5 text-foreground hover:bg-white/10 transition"
              >
                View leadership story
              </a>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4" /> Hyderabad, India
              </div>
              <div className="hidden sm:flex items-center gap-2.5">
                <Globe2 className="size-4" /> Active in 2 states · UN partnered
              </div>
            </div>
          </div>

          {/* Portrait */}
          <div className="lg:col-span-5 relative fade-up" style={{ animationDelay: ".15s" }}>
            <div className="relative mx-auto w-[320px] sm:w-[380px] lg:w-[420px] aspect-4/5">
              <div className="absolute -inset-10 rounded-full bg-linear-to-tr from-[#2E5E99] to-[#7BA4D0] opacity-20 blur-[100px] animate-pulse" />
              <div className="ring-halo absolute -inset-6 rounded-[80px] opacity-40 blur-2xl" />
              <div className="ring-halo absolute -inset-2 rounded-[80px] opacity-60" />
              <div className="absolute inset-0 rounded-[80px] overflow-hidden glass-strong p-2">
                <img
                  src={leader.portrait}
                  alt={`Portrait of ${leader.name}`}
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover rounded-[72px] object-top"
                />
              </div>

              {profileUrl && (
                <div 
                  className="absolute -right-4 -top-4 glass rounded-3xl p-2.5 flex flex-col items-center gap-1 border border-white/15 z-20 shadow-2xl cursor-pointer bg-midnight/95 hover:scale-105 transition-transform duration-300 group/qr-stamp"
                  onClick={() => setActiveQrModal({ name: leader.name, url: profileUrl })}
                  title="Click to view large verification QR"
                >
                  <div className="bg-white p-1 rounded-xl shadow-inner border border-white/10 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(profileUrl)}`}
                      alt="Verification Registry QR Code"
                      className="size-11 object-contain"
                    />
                  </div>
                  <span className="text-[7.5px] font-bold text-sky uppercase tracking-wider leading-none">
                    REGISTRY QR
                  </span>
                </div>
              )}

              {stats.length > 4 && (
                <div className="float absolute -left-8 sm:-left-20 top-[55%] glass rounded-2xl p-4 pr-5 flex items-center gap-4 shadow-lg border-white/10 z-20">
                  <div className="size-11 rounded-xl btn-premium grid place-items-center">
                    <Star className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[13px] text-foreground/60">Primary impact</div>
                    <div className="text-[15px] font-bold text-sky">
                      {stats[4].value} {stats[4].label}
                    </div>
                  </div>
                </div>
              )}
              {stats.length > 1 && (
                <div
                  className="float absolute -right-4 sm:-right-12 bottom-10 glass rounded-2xl p-4 pr-5 flex items-center gap-4 border-white/10 z-20"
                  style={{ animationDelay: "1.5s" }}
                >
                  <div className="size-11 rounded-xl bg-linear-to-br from-[#7BA4D0] to-[#2E5E99] grid place-items-center">
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[13px] text-foreground/60">Mobilised</div>
                    <div className="text-[15px] font-bold text-sky">
                      {stats[1].value} {stats[1].label}
                    </div>
                  </div>
                </div>
              )}
              <div
                className="float absolute -right-6 -top-4 glass rounded-2xl px-4 py-2.5 text-foreground flex items-center gap-2.5 font-bold border-[#7BA4D0]/40 shadow-[0_4px_20px_-5px_rgba(123,164,208,0.3)] z-20"
                style={{ animationDelay: ".8s" }}
              >
                <span className="size-2 rounded-full bg-[#7BA4D0] animate-pulse shadow-[0_0_8px_#7BA4D0]" />{" "}
                Verified · WHRC
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      {stats.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 -mt-6 pb-14">
          <div className="glass-strong rounded-2xl p-8 lg:p-10 border-white/10">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <ScrollReveal animation="fade-up" delay={0}>
                  <SectionLabel>Impact at a glance</SectionLabel>
                </ScrollReveal>
                <div className="mt-2">
                  <HeadingFrame theme="gradient">
                    <h2 className="text-3xl md:text-4xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                      Strategic & Humanitarian Footprint
                    </h2>
                  </HeadingFrame>
                </div>
              </div>
              <ScrollReveal animation="fade-up" delay={300} className="text-base text-foreground/60 max-w-sm leading-relaxed">
                A snapshot of the key records, milestones, and advocacy achievements built up over
                years of service.
              </ScrollReveal>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="shimmer-card rounded-2xl glass p-6 hover:shadow-glow hover:translate-y-[-3px] transition text-center group"
                >
                  <div className="font-display text-4xl font-bold text-sky group-hover:scale-110 transition-transform">
                    {s.value}
                  </div>
                  <div className="text-[13px] text-foreground/50 mt-2.5 leading-snug font-bold uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROFILE / BIODATA */}
      {bio.length > 0 && (
        <section id="profile" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <ScrollReveal animation="fade-up" delay={0}>
                <SectionLabel>Personal information</SectionLabel>
              </ScrollReveal>
              <div className="mt-2">
                <HeadingFrame theme="biodata">
                  <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">Biodata</h2>
                </HeadingFrame>
              </div>
              <ScrollReveal animation="fade-up" delay={300}>
                <p className="mt-4 text-foreground/70 leading-relaxed font-medium">
                  A verified record of identity, background, education, and current professional standing.
                </p>
              </ScrollReveal>
              <div className="mt-8 glass rounded-3xl p-6 flex items-center gap-4 border-white/10">
                <Quote className="size-8 text-gold shrink-0" />
                <p className="font-display italic text-foreground">
                  "Vasudhaiva Kutumbakam — the world as one family."
                </p>
              </div>

              {/* Profile Image inside Biodata Section */}
              <ScrollReveal animation="fade-up" delay={400}>
                <div className="mt-6 glass rounded-3xl p-3 border-white/10 shadow-2xl relative group overflow-hidden">
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden relative border border-white/5">
                    <img
                      src={leader.data?.biodataImage || leader.portrait}
                      alt={leader.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-midnight/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-7 glass-strong rounded-xl p-2 border-white/10 relative overflow-hidden">
              {/* Corner accents for the biodata details card */}
              <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#16A34A] rounded-tl-md pointer-events-none" />
              <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#b38f36] rounded-tr-md pointer-events-none" />
              <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sky rounded-bl-md pointer-events-none" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#b38f36] rounded-br-md pointer-events-none" />
              <div className="rounded-[28px] glass divide-y divide-[#7BA4D0]/15">
                {bio.map((b) => (
                  <div key={b.k} className="grid grid-cols-3 gap-6 px-8 py-5">
                    <div className="text-[13px] text-sky font-bold uppercase tracking-wider">
                      {b.k}
                    </div>
                    <div className="col-span-2 text-base lg:text-lg font-medium text-foreground">
                      {b.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BIOGRAPHY */}
      {(biography.earlyLife || biography.career) && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Biography</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-2">
            <HeadingFrame theme="gradient">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                Early life & education
              </h2>
            </HeadingFrame>
          </div>
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            {biography.earlyLife && (
              <article className="glass rounded-xl p-10 border-white/10">
                <div className="flex items-center gap-2.5 text-base font-bold text-sky mb-4">
                  <BookOpen className="size-5" /> Early life & education
                </div>
                <p className="text-lg text-foreground/80 leading-relaxed">{biography.earlyLife}</p>
              </article>
            )}
            {biography.career && (
              <article className="glass rounded-xl p-10 border-white/10">
                <div className="flex items-center gap-2.5 text-base font-bold text-sky mb-4">
                  <Briefcase className="size-5" /> Career & professional journey
                </div>
                <p className="text-lg text-foreground/80 leading-relaxed">{biography.career}</p>
              </article>
            )}
          </div>
        </section>
      )}

      {/* LEADERSHIP ROLES - INTERACTIVE TIMELINE DEEP DIVE */}
      {timeline.length > 0 && currentRole && (
        <section id="timeline" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
            <ScrollReveal animation="fade-up" delay={0}>
              <SectionLabel>Leadership ecosystem</SectionLabel>
            </ScrollReveal>
            <div className="mt-2 mb-2">
              <HeadingFrame theme="gradient">
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                  Strategic roles & impact
                </h2>
              </HeadingFrame>
            </div>

          <div className="mt-6 glass-strong rounded-[40px] p-2 lg:p-4 overflow-hidden border-white/10">
            <div className="grid lg:grid-cols-12 min-h-[600px]">
              {/* Left Column: Role Selection */}
              <div className="lg:col-span-5 glass rounded-xl p-6 lg:p-8 space-y-3 max-h-[660px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-6 px-4">
                  Select a role to explore
                </div>
                {timeline.map((t, i) => (
                  <button
                    key={t.title}
                    onClick={() => setActiveRole(i)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 group flex items-center gap-4 border ${
                      safeActiveRole === i
                        ? "bg-linear-to-br from-[#0D2440] to-[#2E5E99] text-white shadow-xl scale-[1.02] border-[#0d2c6c]/20"
                        : "bg-white/40 hover:bg-[#0D2440]/5 text-[#1a1a1a] border-[#0d2c6c]/10"
                    }`}
                  >
                    <div
                      className={`size-12 rounded-xl grid place-items-center transition-colors border ${
                        safeActiveRole === i ? "bg-white/10 border-white/20" : "bg-white/80 border-[#0d2c6c]/10"
                      }`}
                    >
                      <DynamicIcon
                        name={t.icon}
                        className={`size-5 transition-colors ${
                          safeActiveRole === i ? "text-white" : "text-[#1a1a1a]"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-bold transition-colors ${
                          safeActiveRole === i ? "text-sky-300" : "text-[#1a1a1a]/75"
                        }`}
                      >
                        {t.period}
                      </div>
                      <h3 className={`font-display text-base font-bold truncate leading-tight mt-1 ${
                        safeActiveRole === i ? "text-white" : "text-[#1a1a1a]"
                      }`}>
                        {t.title}
                      </h3>
                    </div>
                    {safeActiveRole === i && <ArrowUpRight className="size-4 text-sky shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Right Column: Detailed Content */}
              <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
                {/* Animated background index indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black text-foreground/5 select-none pointer-events-none">
                  0{safeActiveRole + 1}
                </div>

                <div key={safeActiveRole} className="relative z-10 animate-fade-in">
                  <SectionLabel className="mb-8">Strategic highlight</SectionLabel>

                  <h3 className="text-3xl lg:text-5xl font-display font-bold text-gradient leading-[1.1] mb-6">
                    {currentRole.title}
                  </h3>

                  <div className="text-xl lg:text-2xl text-foreground/80 leading-relaxed mb-10 max-w-xl">
                    {currentRole.body}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                    <div>
                      <div className="text-xs font-bold text-sky/80 uppercase tracking-widest mb-2">
                        Span of achievement
                      </div>
                      <div className="text-base font-medium text-foreground">
                        {currentRole.period}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-sky/80 uppercase tracking-widest mb-2">
                        Duration
                      </div>
                      <div className="text-lg font-bold text-foreground">{currentRole.period}</div>
                    </div>
                  </div>

                  <a
                    href="#initiatives"
                    className="mt-12 btn-premium rounded-full px-8 py-4 text-base font-bold inline-flex items-center gap-3 hover:scale-105 transition-transform"
                  >
                    Explore full initiative <ArrowUpRight className="size-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CORE ORGANISATIONAL FOCUS */}
      {(orgFocus.length > 0 || orgTitle) && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <div className="glass-strong rounded-[40px] p-8 lg:p-12 grid lg:grid-cols-12 gap-10 border-white/10">
            <div className="lg:col-span-5">
              <ScrollReveal animation="fade-up" delay={0}>
                <SectionLabel>{orgLabel || "Organisation"}</SectionLabel>
              </ScrollReveal>
              <div className="mt-2 mb-2">
                <HeadingFrame theme="gradient">
                  <h2 className="font-display text-3xl lg:text-4xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                    {orgTitle || "About World Human Rights Council"}
                  </h2>
                </HeadingFrame>
              </div>
              {(orgSubtitle || (!orgTitle && "Founded May 2017 · Active across multiple States")) && (
                <ScrollReveal animation="fade-up" delay={300}>
                  <div className="text-sm text-sky font-semibold mt-2">
                    {orgSubtitle || "Founded May 2017 · Active across multiple States"}
                  </div>
                </ScrollReveal>
              )}
              {(orgWebsite || (!orgTitle && connect.website)) && (
                <a
                  href={`https://${orgWebsite || connect.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-sky hover:underline"
                >
                  <LinkIcon className="size-3.5" /> {orgWebsite || connect.website}
                </a>
              )}
              <p className="mt-4 text-foreground/80 leading-relaxed">
                {orgDescription ||
                  "A grassroots-based human rights council dedicated to grievance redressal, legal aid, social equity, and connecting local advocacy with global platforms."}
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-2 gap-3">
                {orgFocus.map((f) => (
                  <div
                    key={f}
                    className="glass rounded-2xl px-5 py-4 flex items-center gap-3 hover:translate-y-[-2px] transition border-white/10"
                  >
                    <div className="size-9 rounded-xl btn-premium grid place-items-center">
                      <ShieldCheck className="size-4 text-white" />
                    </div>
                    <span className="font-medium text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* INITIATIVES */}
      {initiatives.length > 0 && (
        <section id="initiatives" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Programs</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-2">
            <HeadingFrame theme="gradient">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                Key initiatives & programs
              </h2>
            </HeadingFrame>
          </div>
          <div className="mt-6 max-h-[660px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {initiatives.map(({ icon, title, body }) => (
                <article
                  key={title}
                  className="glass rounded-[28px] p-6 hover:shadow-glow hover:-translate-y-1 transition border-white/10"
                >
                  <div className="size-12 rounded-2xl btn-premium grid place-items-center mb-5">
                    <DynamicIcon name={icon} className="size-5 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-foreground/75 leading-relaxed">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AWARDS */}
      {awards.length > 0 && (
        <section id="awards" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Recognition</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-2">
            <HeadingFrame theme="gradient">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                Awards & recognition
              </h2>
            </HeadingFrame>
          </div>
          <div className="mt-6 max-h-[660px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-4">
              {awards.map((a) => (
                <article
                  key={a.title}
                  onClick={() => setSelectedAward(a)}
                  className="glass rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition group border-white/10 cursor-pointer"
                >
                  {a.img && (
                    <div className="aspect-4/3 w-full overflow-hidden border-b border-[#7BA4D0]/10 bg-white/5">
                      <img
                        src={a.img}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex gap-4 items-start flex-1">
                    <div className="shrink-0 size-11 rounded-xl bg-linear-to-br from-[#d4af37] via-[#b38f36] to-[#8c6b23] grid place-items-center shadow-[0_4px_16px_-3px_rgba(179,143,54,0.4)] group-hover:scale-105 group-hover:shadow-[0_4px_20px_rgba(179,143,54,0.5)] transition-all duration-300">
                      <Award className="size-5 text-white animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between h-full">
                      <div>
                        <div className="text-[11px] font-bold text-sky tracking-wider uppercase truncate">
                          {a.year} · {a.org}
                        </div>
                        <h3 className="mt-1 font-display text-[15px] font-bold text-foreground leading-tight line-clamp-2">
                          {a.title}
                        </h3>

                        {/* Clickable links rendered FIRST (below title, above description) */}
                        {((a.link) || (a.links && a.links.length > 0)) && (
                          <div 
                            className="mt-2 mb-2 flex flex-wrap gap-x-2.5 gap-y-1 border-t border-b border-[#7BA4D0]/10 py-1.5" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            {a.link && (
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky hover:underline w-fit"
                              >
                                <Video className="size-3 text-sky shrink-0" />
                                <span>Watch Ceremony</span>
                                <ArrowUpRight className="size-2.5 text-sky/60 shrink-0" />
                              </a>
                            )}
                            {a.links && a.links.map((lnk: any, lIdx: number) => {
                              if (!lnk.url) return null;
                              return (
                                <a
                                  key={lIdx}
                                  href={lnk.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-sky hover:underline w-fit"
                                >
                                  <Video className="size-3 text-sky shrink-0" />
                                  <span>{lnk.label || "Watch Ceremony"}</span>
                                  <ArrowUpRight className="size-2.5 text-sky/60 shrink-0" />
                                </a>
                              );
                            })}
                          </div>
                        )}

                        <p className="mt-2 text-xs text-foreground/75 leading-relaxed line-clamp-4">
                          {a.body}
                        </p>
                      </div>

                      {/* Read More indicator */}
                      <span className="mt-3 text-[10px] font-bold text-sky group-hover:underline flex items-center gap-0.5">
                        Read Full Details <ArrowUpRight className="size-3 shrink-0" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CERTIFICATES */}
      {certificates.length > 0 && (
        <section id="certificates" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16 animate-fade-in">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Qualifications</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-6">
            <HeadingFrame theme="gradient">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                Certificates
              </h2>
            </HeadingFrame>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certificates.map((cert, idx) => (
              <article
                key={idx}
                onClick={() => setLightboxData({ section: "certificates", items: certificates, index: idx })}
                className="group relative rounded-2xl overflow-hidden glass p-2.5 border border-white/10 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden relative bg-white/5 border border-[#7BA4D0]/10">
                  <img
                    src={cert.image}
                    alt={cert.alt || cert.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 px-1.5 pb-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                    {cert.org}
                  </span>
                  <h3 className="mt-1 font-display text-[15px] font-bold text-foreground line-clamp-1 leading-tight">
                    {cert.title}
                  </h3>
                  <p className="mt-2 text-xs text-foreground/75 leading-relaxed line-clamp-2">
                    {cert.description}
                  </p>
                  {cert.date && (
                    <div className="mt-2 text-[10px] text-muted-foreground font-semibold">
                      {cert.date}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* MY INITIATIVES */}
      {myInitiatives.length > 0 && (
        <section id="my-initiatives" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16 animate-fade-in">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Social Impact</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <HeadingFrame theme="gradient">
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                  My Initiatives
                </h2>
              </HeadingFrame>
            </div>
            
            {/* Initiative selector tabs */}
            <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
              {myInitiatives.map((init: any, idx: number) => (
                <button
                  key={init.id || idx}
                  onClick={() => setActiveInitIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider ${
                    activeInitIdx === idx
                      ? "bg-linear-to-br from-[#7BA4D0] to-[#2E5E99] text-white shadow-lg shadow-sky/20"
                      : "text-foreground/70 hover:text-sky hover:bg-sky/5"
                  }`}
                >
                  {init.title}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Stories Slideshow Frame */}
          {(() => {
            const activeInit = myInitiatives[activeInitIdx];
            if (!activeInit) return null;
            const images = activeInit.images || [];
            const activeImg = images[activeImageIdx];

            if (images.length === 0) {
              return (
                <div className="glass p-12 rounded-3xl text-center text-muted-foreground text-sm border-white/5">
                  No images added to this initiative yet.
                </div>
              );
            }

            return (
              <div 
                className="glass rounded-[32px] overflow-hidden border border-white/10 p-4 md:p-6 shadow-glow transition-all duration-500 relative flex flex-col lg:flex-row gap-6 md:gap-8 min-h-[400px] hover:shadow-2xl"
                onMouseEnter={() => setIsAutoplay(false)}
                onMouseLeave={() => setIsAutoplay(true)}
              >
                {/* Left Side: Dynamic Image view */}
                <div className="w-full lg:w-3/5 aspect-[16/10] lg:aspect-auto lg:h-[420px] rounded-2xl overflow-hidden relative bg-black/10 border border-[#7BA4D0]/10 group shadow-md shrink-0">
                  {images.map((img: any, idx: number) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        idx === activeImageIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <img
                        src={img.image}
                        alt={img.alt || img.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                  ))}

                  {/* Previous / Next Arrow Overlays inside Image box */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 border border-white/10 text-white hover:bg-black/75 hover:border-gold/50 transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        onClick={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 border border-white/10 text-white hover:bg-black/75 hover:border-gold/50 transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Right Side: Initiative Meta Description */}
                <div className="flex-1 flex flex-col justify-between py-2 min-w-0">
                  <div className="space-y-4">
                    {/* Tiny Initiative Identifier Label */}
                    <div className="flex items-center gap-2">
                      <span className="h-[2px] w-8 bg-sky rounded-full" />
                      <span className="text-[10px] font-bold text-sky uppercase tracking-widest">
                        {activeInit.title}
                      </span>
                    </div>

                    {/* Image Slide Title */}
                    <h3 className="font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight select-none">
                      {activeImg?.title}
                    </h3>

                    {/* Image Slide Description */}
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed max-w-xl select-none font-medium">
                      {activeImg?.description}
                    </p>
                  </div>

                  {/* Bottom: Pagination Dots and Page Indicator Controls */}
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    {/* Pagination Dots */}
                    {images.length > 1 && (
                      <div className="flex items-center gap-2">
                        {images.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIdx(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              idx === activeImageIdx
                                ? "w-6 bg-sky shadow-md shadow-sky/20"
                                : "w-2 bg-foreground/20 hover:bg-foreground/45"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Fraction Page Indicator */}
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">
                      {activeImageIdx + 1} / {images.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* NEWS ARTICLES */}
      {newsArticles.length > 0 && (
        <section id="news-articles" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16 animate-fade-in">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Media Coverage</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-6">
            <HeadingFrame theme="gradient">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                News Articles
              </h2>
            </HeadingFrame>
          </div>

          {/* Newspaper Cards Grid with smooth transition */}
          {(() => {
            const totalPages = Math.ceil(newsArticles.length / newsItemsPerPage);
            const startIndex = newsPageIdx * newsItemsPerPage;
            const paginatedArticles = newsArticles.slice(startIndex, startIndex + newsItemsPerPage);

            return (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
                  {paginatedArticles.map((art, idx) => (
                    <article
                      key={startIndex + idx}
                      onClick={() => setLightboxData({ section: "newsArticles", items: newsArticles, index: startIndex + idx })}
                      className="group relative rounded-2xl overflow-hidden glass p-4 border border-white/10 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full bg-white/70"
                    >
                      {/* News Image */}
                      <div className="aspect-[16/10] w-full rounded-xl overflow-hidden relative bg-black/5 border border-[#7BA4D0]/10 shadow-sm shrink-0">
                        <img
                          src={art.image}
                          alt={art.alt || art.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 backdrop-blur-md bg-black/60 border border-white/15 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-lg">
                          {art.source}
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="mt-4 flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-2">
                          <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky animate-pulse" />
                            {art.date}
                          </div>
                          
                          {/* Headline */}
                          <h3 className="font-display text-[17px] font-extrabold text-foreground leading-snug group-hover:text-sky transition-colors line-clamp-2">
                            {art.title}
                          </h3>

                          {/* Short Summary */}
                          <p className="text-xs text-foreground/75 leading-relaxed line-clamp-3 font-medium">
                            {art.description}
                          </p>
                        </div>

                        {art.link && (
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <a
                              href={art.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky hover:underline"
                            >
                              Read Full Article →
                            </a>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {/* Numbered Pagination Buttons */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    {Array.from({ length: totalPages }).map((_, pageIdx) => (
                      <button
                        key={pageIdx}
                        onClick={() => setNewsPageIdx(pageIdx)}
                        className={`size-9 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center border cursor-pointer ${
                          newsPageIdx === pageIdx
                            ? "bg-sky text-white border-sky shadow-lg shadow-sky/20"
                            : "bg-white/5 border-white/10 text-foreground/70 hover:bg-white/10 hover:text-foreground"
                        }`}
                      >
                        {pageIdx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      )}

      {/* RECENT ACTIVITIES */}
      {recentActivities.length > 0 && (
        <section id="recent-activities" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16 animate-fade-in">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Public Stages</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-6">
            <HeadingFrame theme="gradient">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                Recent Activities
              </h2>
            </HeadingFrame>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:auto-rows-[220px] gap-6">
            {recentActivities.map((act, idx) => (
              <article
                key={idx}
                onClick={() => setLightboxData({ section: "recentActivities", items: recentActivities, index: idx })}
                className={`group relative rounded-2xl overflow-hidden glass border border-white/10 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between ${getActivityGridClasses(idx)}`}
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={act.image}
                    alt={act.alt || act.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dark bottom-vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 group-hover:from-black/90 group-hover:via-black/45 transition-all duration-300" />
                </div>

                {/* Date & Location Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                  {act.date && (
                    <span className="backdrop-blur-md bg-black/60 border border-white/15 px-2.5 py-1 rounded-full text-[9px] font-bold text-sky uppercase tracking-wider shadow-lg">
                      {act.date}
                    </span>
                  )}
                  {act.location && (
                    <span className="backdrop-blur-md bg-black/60 border border-white/15 px-2.5 py-1 rounded-full text-[9px] font-bold text-white shadow-lg">
                      {act.location}
                    </span>
                  )}
                </div>

                {/* Description Panel slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col justify-end">
                  <h3 className="font-display text-sm md:text-base font-bold text-white leading-snug transform transition-transform duration-300 group-hover:-translate-y-1">
                    {act.title}
                  </h3>
                  <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 ease-in-out mt-0 group-hover:mt-2">
                    <p className="text-xs text-white/75 line-clamp-3 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* RECENT ACTIVITIES */}
      {recent.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <ScrollReveal animation="fade-up" delay={0}>
            <SectionLabel>Recent activities</SectionLabel>
          </ScrollReveal>
          <div className="mt-2 mb-2">
            <HeadingFrame theme="gradient">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                On the global stage
              </h2>
            </HeadingFrame>
          </div>
          <div className="mt-6 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid lg:grid-cols-2 gap-6 pb-4">
              {recent.map((r, i) => (
                <article
                  key={r.title}
                  className="glass rounded-[28px] p-6 hover:-translate-y-1 transition border-white/10"
                >
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="chip py-1! px-3! bg-[#7BA4D0]/5 border-[#7BA4D0]/20 text-[#7BA4D0] font-bold">
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground font-bold">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/75 leading-relaxed">{r.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PHILOSOPHY */}
      {inspirations.length > 0 && (
        <section id="vision" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <div className="glass-strong rounded-[40px] p-8 lg:p-12 border-white/10">
            <ScrollReveal animation="fade-up" delay={0}>
              <SectionLabel>Philosophy & inspirations</SectionLabel>
            </ScrollReveal>
            <div className="mt-2 mb-2">
              <HeadingFrame theme="gradient">
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                  "Educate. Agitate. Organise."
                </h2>
              </HeadingFrame>
            </div>
            <p className="mt-4 max-w-3xl text-foreground/80 leading-relaxed">
              worldviews and guiding values rooted in structural reform, self-reliance, and
              humanitarian service.
            </p>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {inspirations.map((i) => (
                <div
                  key={i.name}
                  className="rounded-[28px] glass p-6 flex flex-col justify-between"
                >
                  <div>
                    <Quote className="size-6 text-gold/40" />
                    <p className="mt-3 font-display italic text-foreground leading-snug">
                      <span className="text-gold font-bold">"</span>{i.quote}<span className="text-gold font-bold">"</span>
                    </p>
                  </div>
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-sky">{i.name}</div>
                    <p className="mt-1 text-xs text-foreground/70 leading-relaxed">{i.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[28px] p-6 lg:p-8 bg-linear-to-br from-[#0D2440] to-[#2E5E99] text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-sky/20">
              <p className="text-base lg:text-lg leading-relaxed text-white/90">
                True servant leadership focuses on expanding global representation, providing
                structural legal aid to the underrepresented, and creating robust institutional
                frameworks that empower communities sustainably. The goal of this sphere is to unify
                verified humanitarian voices onto a single global stage.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CONNECT / FOOTER */}
      <footer id="connect" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">
        <div className="glass-strong rounded-[40px] p-8 lg:p-12 border-white/10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <ScrollReveal animation="fade-up" delay={0}>
                <SectionLabel>Connect</SectionLabel>
              </ScrollReveal>
              <div className="mt-2 mb-2">
                <HeadingFrame theme="gradient">
                  <h2 className="font-display text-3xl lg:text-4xl font-bold text-gradient reveal-heading-underline mb-0 pb-0">
                    Engage with a global leadership identity.
                  </h2>
                </HeadingFrame>
              </div>
              <p className="mt-3 text-foreground/70 max-w-xl">
                For speaking engagements, partnerships, CSR programs, and global institutional
                collaborations.
              </p>
              {profileUrl && (
                <div className="mt-6 flex flex-row items-center gap-5 p-4 glass rounded-3xl border-white/5 max-w-sm">
                  <div className="bg-white p-2.5 rounded-2xl shadow-inner border border-white/10 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl)}`}
                      alt="Verification Registry QR Code"
                      className="size-24 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground">Secure Profile QR</h3>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                      Scan this unique digital seal to instantly verify {leader.name}'s credentials on the official registry directory.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-5 grid gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
              {connect.instagram && (
                <a
                  href={`https://instagram.com/${connect.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center">
                    <Instagram className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-sky font-semibold">Instagram</div>
                    <div className="font-semibold text-foreground">{connect.instagram}</div>
                  </div>
                  <ArrowUpRight className="size-4 text-sky" />
                </a>
              )}
              {connect.website && (
                <a
                  href={connect.website.startsWith("http") ? connect.website : `https://${connect.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center">
                    <Globe2 className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-sky font-semibold">Website</div>
                    <div className="font-semibold text-foreground">{connect.website}</div>
                  </div>
                  <ArrowUpRight className="size-4 text-sky" />
                </a>
              )}
              {connect.council && (
                <a
                  href={connect.council.startsWith("http") ? connect.council : `https://${connect.council}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center">
                    <Building2 className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-sky font-semibold">Council</div>
                    <div className="font-semibold text-foreground">{connect.council}</div>
                  </div>
                  <ArrowUpRight className="size-4 text-sky" />
                </a>
              )}
              {connect.facebook && (
                <a
                  href={connect.facebook.startsWith("http") ? connect.facebook : `https://${connect.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center">
                    <Facebook className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-sky font-semibold">Facebook</div>
                    <div className="font-semibold text-foreground truncate max-w-[200px]">View Profile</div>
                  </div>
                  <ArrowUpRight className="size-4 text-sky" />
                </a>
              )}
              {connect.linkedin && (
                <a
                  href={connect.linkedin.startsWith("http") ? connect.linkedin : `https://${connect.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center">
                    <Linkedin className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-sky font-semibold">LinkedIn</div>
                    <div className="font-semibold text-foreground truncate max-w-[200px]">Connect Professional</div>
                  </div>
                  <ArrowUpRight className="size-4 text-sky" />
                </a>
              )}
              {connect.twitter && (
                <a
                  href={connect.twitter.startsWith("http") ? connect.twitter : `https://${connect.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center">
                    <Twitter className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-sky font-semibold">Twitter / X</div>
                    <div className="font-semibold text-foreground truncate max-w-[200px]">Follow Updates</div>
                  </div>
                  <ArrowUpRight className="size-4 text-sky" />
                </a>
              )}
              {connect.youtube && (
                <a
                  href={connect.youtube.startsWith("http") ? connect.youtube : `https://${connect.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                >
                  <div className="size-10 rounded-xl btn-premium grid place-items-center">
                    <Youtube className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-sky font-semibold">YouTube</div>
                    <div className="font-semibold text-foreground truncate max-w-[200px]">Watch Channel</div>
                  </div>
                  <ArrowUpRight className="size-4 text-sky" />
                </a>
              )}
              {connect.customLinks && connect.customLinks.map((link, idx) => {
                if (!link.label || !link.url) return null;
                const linkHref = link.url.startsWith("http") ? link.url : `https://${link.url}`;
                return (
                  <a
                    key={idx}
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/10 transition border-white/10"
                  >
                    <div className="size-10 rounded-xl btn-premium grid place-items-center">
                      <LinkIcon className="size-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-sky font-semibold">Link</div>
                      <div className="font-semibold text-foreground truncate max-w-[200px]">{link.label}</div>
                    </div>
                    <ArrowUpRight className="size-4 text-sky" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              © {new Date().getFullYear()} World Human Rights Council · All rights reserved.
            </div>
            <div className="flex items-center gap-2 font-bold text-[#7BA4D0]">
              <VerifiedBadge className="size-[18px]" /> Verified leader identity · Sapphire Veil premium
              profile
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxData !== null && (() => {
        const { section, items, index } = lightboxData;
        const validItems = items ? items.filter(i => i && i.image) : [];
        if (validItems.length === 0) return null;

        const activeItem = validItems[index] || validItems[0];

        const handlePrev = (e: React.MouseEvent) => {
          e.stopPropagation();
          setLightboxData({
            ...lightboxData,
            index: index > 0 ? index - 1 : validItems.length - 1
          });
        };

        const handleNext = (e: React.MouseEvent) => {
          e.stopPropagation();
          setLightboxData({
            ...lightboxData,
            index: index < validItems.length - 1 ? index + 1 : 0
          });
        };

        const sectionNames = {
          certificates: "Certificate Showcase",
          myInitiatives: "Initiative Showcase",
          newsArticles: "News Coverage",
          recentActivities: "Recent Activities Showcase"
        };

        return (
          <div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl p-4 md:p-8"
            onClick={() => setLightboxData(null)}
          >
            {/* Header / Title */}
            <div className="w-full max-w-6xl flex items-center justify-between text-white border-b border-white/10 pb-4" onClick={e => e.stopPropagation()}>
              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block font-mono">
                  {sectionNames[section]}
                </span>
                <h3 className="font-display text-lg md:text-xl font-bold text-sky truncate max-w-md md:max-w-xl">
                  {activeItem.title}
                </h3>
              </div>
              <button
                onClick={() => setLightboxData(null)}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Main Stage (Image, Metadata Description & Navigation Arrows) */}
            <div className="relative flex-1 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-6 py-6 overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* Image & Navigation area */}
              <div className="relative flex-1 w-full h-full max-h-[50vh] md:max-h-full flex items-center justify-center">
                {/* Previous Button */}
                {validItems.length > 1 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 z-10 p-3 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 hover:border-gold/50 transition-all text-white/80 hover:text-gold cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                )}

                {/* Main Image Container */}
                <div className="relative max-h-[50vh] md:max-h-[60vh] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-neutral-900/50">
                  <img
                    src={activeItem.image}
                    alt={activeItem.alt || activeItem.title}
                    className="w-full h-full max-h-[50vh] md:max-h-[60vh] object-contain select-none"
                  />
                </div>

                {/* Next Button */}
                {validItems.length > 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-2 z-10 p-3 rounded-full bg-black/40 border border-white/10 hover:bg-black/70 hover:border-gold/50 transition-all text-white/80 hover:text-gold cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                )}
              </div>

              {/* Side Info Panel */}
              <div className="w-full md:w-80 shrink-0 text-white space-y-4 max-h-[30vh] md:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                {section === "certificates" && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold uppercase tracking-wider block font-bold">Organization</span>
                    <p className="text-sm font-semibold text-sky">{activeItem.org}</p>
                  </div>
                )}
                {section === "newsArticles" && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold uppercase tracking-wider block font-bold">Publisher Source</span>
                    <p className="text-sm font-semibold text-sky">{activeItem.source}</p>
                  </div>
                )}
                {section === "recentActivities" && activeItem.location && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold uppercase tracking-wider block font-bold">Location</span>
                    <p className="text-sm font-semibold text-sky">{activeItem.location}</p>
                  </div>
                )}
                {activeItem.date && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold uppercase tracking-wider block font-bold">Date</span>
                    <p className="text-sm font-semibold text-white/90">{activeItem.date}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] text-gold uppercase tracking-wider block font-bold font-mono">Description</span>
                  <p className="text-xs text-white/80 leading-relaxed max-w-full break-words">
                    {activeItem.description}
                  </p>
                </div>

                {section === "newsArticles" && activeItem.link && (
                  <div className="pt-2">
                    <a
                      href={activeItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium w-full text-center rounded-xl py-2 font-bold text-xs inline-flex items-center justify-center gap-1 text-white shadow-lg"
                    >
                      Read Full Article
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions & Thumbnail Strip */}
            <div className="w-full max-w-3xl flex flex-col items-center gap-4 pb-4" onClick={e => e.stopPropagation()}>
              {/* Pagination text */}
              <div className="text-xs text-white/60 font-bold tracking-wider font-mono">
                ITEM {index + 1} OF {validItems.length}
              </div>

              {/* Thumbnail strip */}
              {validItems.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto p-1.5 max-w-full custom-scrollbar">
                  {validItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxData({ ...lightboxData, index: i })}
                      className={`relative size-14 md:size-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        i === index
                          ? "border-gold scale-105 shadow-glow"
                          : "border-white/10 hover:border-white/40 scale-100 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={`thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Award Detail Popup Modal */}
      {selectedAward && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-6"
          onClick={() => setSelectedAward(null)}
        >
          <div 
            className="glass-strong max-w-2xl w-full rounded-[28px] overflow-hidden shadow-2xl relative border border-white/10 animate-fade-in flex flex-col bg-white/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon absolute */}
            <button
              onClick={() => setSelectedAward(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/5 hover:bg-black/10 transition text-foreground/80"
              aria-label="Close details"
            >
              <X className="size-4" />
            </button>

            {selectedAward.img && (
              <div className="w-full aspect-video overflow-hidden bg-neutral-100 border-b border-[#7BA4D0]/10 flex items-center justify-center">
                <img
                  src={selectedAward.img}
                  alt={selectedAward.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 md:p-8 space-y-5">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 size-12 rounded-2xl bg-linear-to-br from-[#d4af37] via-[#b38f36] to-[#8c6b23] grid place-items-center shadow-[0_4px_16px_-3px_rgba(179,143,54,0.4)] shadow-gold/30">
                  <Award className="size-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-sky tracking-wider uppercase">
                    {selectedAward.year} · {selectedAward.org}
                  </div>
                  <h3 className="mt-1 font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
                    {selectedAward.title}
                  </h3>
                </div>
              </div>

              <div className="text-xs md:text-sm text-foreground/85 leading-relaxed max-h-[220px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-line font-medium border-t border-[#7BA4D0]/10 pt-4">
                {selectedAward.body}
              </div>

              {((selectedAward.link) || (selectedAward.links && selectedAward.links.length > 0)) && (
                <div className="pt-4 border-t border-[#7BA4D0]/10">
                  <h4 className="text-[10px] font-bold text-sky uppercase tracking-wider mb-2.5">
                    Ceremony & Event Links
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAward.link && (
                      <a
                        href={selectedAward.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky/5 border border-sky/20 hover:bg-sky/10 text-[11px] font-bold text-sky transition"
                      >
                        <Video className="size-3.5 text-sky shrink-0" />
                        <span>Watch Ceremony</span>
                        <ArrowUpRight className="size-3 text-sky/60 shrink-0" />
                      </a>
                    )}
                    {selectedAward.links && selectedAward.links.map((lnk: any, lIdx: number) => {
                      if (!lnk.url) return null;
                      return (
                        <a
                          key={lIdx}
                          href={lnk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky/5 border border-sky/20 hover:bg-sky/10 text-[11px] font-bold text-sky transition"
                        >
                          <Video className="size-3.5 text-sky shrink-0" />
                          <span>{lnk.label || "Watch Ceremony"}</span>
                          <ArrowUpRight className="size-3 text-sky/60 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedAward(null)}
                  className="px-5 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[11px] font-bold text-foreground transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeQrModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setActiveQrModal(null)}
        >
          <div 
            className="glass-strong border border-white/15 max-w-sm w-full rounded-3xl p-6 shadow-2xl relative text-center space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              onClick={() => setActiveQrModal(null)}
              className="absolute top-4 right-4 text-foreground/50 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="mx-auto size-14 rounded-2xl btn-premium grid place-items-center mb-2">
              <QrCode className="size-7 text-white" />
            </div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight">
              {activeQrModal.name}
            </h3>
            <p className="text-xs text-sky font-semibold uppercase tracking-wider">
              Verification Registry QR
            </p>
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-white/10 mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeQrModal.url)}`}
                alt="Verification QR Code"
                className="size-48 object-contain mx-auto"
              />
            </div>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-normal">
              Scan this secure seal to verify credentials or share this link:
              <br />
              <a 
                href={activeQrModal.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-sky hover:underline break-all font-mono mt-1.5 inline-block"
              >
                {activeQrModal.url}
              </a>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
