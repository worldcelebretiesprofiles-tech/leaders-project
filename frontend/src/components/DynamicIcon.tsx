import {
  ShieldCheck,
  Landmark,
  Globe2,
  Briefcase,
  Sparkles,
  Award,
  Building2,
  MapPin,
  Users,
  Heart,
  Megaphone,
  Scale,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Quote,
  Star,
  HeartHandshake,
  HelpCircle,
} from "lucide-react";

// Explicit lookup map of Lucide Icons for optimal compiler and runtime bundle performance
const IconMap: Record<string, React.ComponentType<any>> = {
  ShieldCheck,
  Landmark,
  Globe2,
  Briefcase,
  Sparkles,
  Award,
  Building2,
  MapPin,
  Users,
  Heart,
  Megaphone,
  Scale,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Quote,
  Star,
  HeartHandshake,
  HelpCircle,
};

interface DynamicIconProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  // Safe lookup against the explicit map, fallback to HelpCircle
  const IconComponent = IconMap[name] || IconMap.HelpCircle || ShieldCheck;
  return <IconComponent className={className} />;
}

// Export a list of popular icons suitable for leader profiles to show in the selector UI
export const POPULAR_LEADER_ICONS = [
  { name: "ShieldCheck", label: "Advocacy & Human Rights" },
  { name: "Landmark", label: "Founder / Organisation" },
  { name: "Globe2", label: "UN / Global / Regional" },
  { name: "Briefcase", label: "Business / Entrepreneurship" },
  { name: "Sparkles", label: "Special Representative" },
  { name: "Award", label: "Awards & Recognition" },
  { name: "Building2", label: "Real Estate / Corporate" },
  { name: "MapPin", label: "Location / Regional Link" },
  { name: "Users", label: "Community / Youth / People" },
  { name: "Heart", label: "Social Welfare / Charity" },
  { name: "Megaphone", label: "Awareness Campaign" },
  { name: "Scale", label: "Legal Aid / Justice" },
  { name: "BookOpen", label: "Education & Learning" },
  { name: "GraduationCap", label: "Academic Degree" },
  { name: "CalendarDays", label: "History / Event" },
  { name: "Quote", label: "Philosophical / Quote" },
  { name: "Star", label: "Key Stat / Rating" },
  { name: "HeartHandshake", label: "Partnership / Cooperation" },
];
