import React, { useEffect, useRef, useState } from "react";

interface HeadingFrameProps {
  children: React.ReactNode;
  theme?: "green" | "sky" | "gold" | "gradient" | "biodata";
  className?: string;
  glow?: boolean;
}

export function HeadingFrame({
  children,
  theme = "sky",
  className = "",
  glow = true,
}: HeadingFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  // Theme configurations for the border/glow around the heading text
  const themeStyles = {
    green: {
      border: "border-[#86EFAC]/30 hover:border-[#16A34A]/50",
      accentBorder: "border-[#16A34A]/40",
      glowBg: "bg-[#16A34A]/4",
    },
    sky: {
      border: "border-sky/20 hover:border-sky/40",
      accentBorder: "border-sky/40",
      glowBg: "bg-sky/4",
    },
    gold: {
      border: "border-gold/20 hover:border-gold/40",
      accentBorder: "border-gold/40",
      glowBg: "bg-gold/4",
    },
    gradient: {
      border: "border-sky/20 hover:border-sky/40",
      accentBorder: "border-sky/40",
      glowBg: "bg-sky/4",
    },
    biodata: {
      border: "border-sky/20 hover:border-sky/40",
      accentBorder: "", // Handled individually below
      glowBg: "bg-sky/4",
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div
      ref={ref}
      className={`
        relative inline-block overflow-hidden transition-all duration-1000 ease-out
        px-6 py-3 rounded-2xl border ${currentTheme.border} bg-white/[0.01] 
        backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.02)]
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${className}
      `}
    >
      {/* Subtle Glowing Background Blob */}
      {glow && (
        <div
          className={`
            absolute -inset-10 rounded-full blur-[40px] pointer-events-none transition-opacity duration-1000
            ${currentTheme.glowBg}
            ${isVisible ? "opacity-100" : "opacity-0"}
          `}
        />
      )}

      {/* Elegant Corner Brackets */}
      <span
        className={`absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] ${
          theme === "biodata" ? "border-[#16A34A]" : currentTheme.accentBorder
        } rounded-tl-sm transition-all duration-700 delay-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
      <span
        className={`absolute top-0 right-0 w-3 h-3 border-t-[1.5px] border-r-[1.5px] ${
          theme === "biodata" ? "border-[#b38f36]" : currentTheme.accentBorder
        } rounded-tr-sm transition-all duration-700 delay-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
      <span
        className={`absolute bottom-0 left-0 w-3 h-3 border-b-[1.5px] border-l-[1.5px] ${
          theme === "biodata" ? "border-sky" : currentTheme.accentBorder
        } rounded-bl-sm transition-all duration-700 delay-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] ${
          theme === "biodata" ? "border-[#b38f36]" : currentTheme.accentBorder
        } rounded-br-sm transition-all duration-700 delay-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
