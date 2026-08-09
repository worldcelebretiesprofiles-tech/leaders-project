import React from "react";

export function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}
