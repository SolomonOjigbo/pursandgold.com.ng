import {
  Church,
  ShoppingCart,
  MapPin,
  GraduationCap,
  HeartHandshake,
  Rocket,
  Globe,
  Boxes,
  Building2,
  Cloud,
  Palette,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Pill,
  Store,
  Stethoscope,
  Landmark,
  Hotel,
  Mail,
  Phone,
  MessageCircle,
  Sparkles,
  Zap,
  Crown,
  Database,
  Newspaper,
  PhoneCall,
  PencilRuler,
  FileCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export const productIcons: Record<string, LucideIcon> = {
  parishhub: Church,
  pursberry: ShoppingCart,
  veritory: MapPin,
  "school-erp": GraduationCap,
  tenaville: Building2,
  goodheart: HeartHandshake,
};

export const serviceIcons: Record<string, LucideIcon> = {
  "digital-growth-engine": Rocket,
  "web-and-mobile": Globe,
  "enterprise-software": Boxes,
  "vertical-systems": Building2,
  "cloud-and-managed-it": Cloud,
  "branding-and-creative": Palette,
  marketing: Megaphone,
};

export const promiseIcons: LucideIcon[] = [Globe, TrendingUp, BrainCircuit, ShieldCheck];

export const stepIcons: LucideIcon[] = [PhoneCall, PencilRuler, FileCheck, Rocket];

export const industryIcons: Record<string, LucideIcon> = {
  pharmaceutical: Pill,
  retail: Store,
  healthcare: Stethoscope,
  education: GraduationCap,
  churches: Church,
  institutions: Landmark,
  hospitality: Hotel,
};

export const planIcons: Record<string, LucideIcon> = {
  "DGE-SOC": Sparkles,
  "DGE-STR": Zap,
  "DGE-GRW": Rocket,
  "DGE-SCL": TrendingUp,
  "DGE-ENT": Crown,
};

export const proofIcons: LucideIcon[] = [Database, Newspaper, Church];

export { Mail, Phone, MessageCircle, MapPin, Users, ShieldCheck };

export function IconBadge({ icon: Icon, dark = false, size = "md" }: { icon: LucideIcon; dark?: boolean; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4", md: "h-11 w-11 [&>svg]:h-5 [&>svg]:w-5", lg: "h-14 w-14 [&>svg]:h-7 [&>svg]:w-7" }[size];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg ${dims} ${
        dark ? "bg-gold/15 text-gold-2 ring-1 ring-gold/30" : "bg-gold-soft text-gold-ink"
      }`}
      aria-hidden="true"
    >
      <Icon strokeWidth={1.75} />
    </span>
  );
}
