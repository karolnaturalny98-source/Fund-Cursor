import { Twitter, Facebook, Instagram, Youtube, MessageCircle, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SocialLink {
  name: string;
  icon: LucideIcon;
  url: string;
  label: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: "Twitter",
    icon: Twitter,
    url: "https://twitter.com/fundedrank",
    label: "Śledź nas na Twitter (X)",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/fundedrank",
    label: "Polub nas na Facebook",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://instagram.com/fundedrank",
    label: "Obserwuj nas na Instagram",
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com/@fundedrank",
    label: "Subskrybuj nasz kanał YouTube",
  },
  {
    name: "Discord",
    icon: MessageCircle,
    url: "https://discord.gg/fundedrank",
    label: "Dołącz do naszej społeczności Discord",
  },
];

export interface ContactLink {
  name: string;
  icon: LucideIcon;
  url: string;
  label: string;
}

export const contactLinks: ContactLink[] = [
  {
    name: "Email Support",
    icon: Mail,
    url: "mailto:support@fundedrank.com",
    label: "Skontaktuj się przez email",
  },
  {
    name: "Discord Support",
    icon: MessageCircle,
    url: "https://discord.gg/fundedrank",
    label: "Pomoc na Discord",
  },
];

