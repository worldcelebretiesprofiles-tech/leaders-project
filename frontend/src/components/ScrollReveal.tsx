import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // delay in milliseconds
  animation?: "fade-up" | "fade-in" | "heading-reveal" | "stagger-container";
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
}: ScrollRevealProps) {
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
        threshold: 0.05, // trigger when 5% of the element is visible
        rootMargin: "0px 0px -60px 0px", // triggers slightly before entering the viewport fully
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

  // Map animation types to CSS classes
  const getAnimationClass = () => {
    switch (animation) {
      case "heading-reveal":
        return isVisible ? "reveal-heading active" : "reveal-heading";
      case "fade-in":
        return isVisible ? "reveal-fade-in active" : "reveal-fade-in";
      case "stagger-container":
        return isVisible ? "reveal-stagger active" : "reveal-stagger";
      case "fade-up":
      default:
        return isVisible ? "reveal-fade-up active" : "reveal-fade-up";
    }
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClass()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
