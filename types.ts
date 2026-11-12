import type { LucideIcon } from 'lucide-react';

export interface Skill {
  name: string;
  icon: LucideIcon;
}

export interface Project {
  title: string;
  subtitle?: string;
  date?: string;
  description: string;
  fullDescription?: string;
  keyHighlights?: string[];
  tags: string[];
  imageUrl: string;
  liveUrl?: string;
  sourceUrl?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface Experience {
  title: string;
  company: string;
  type: string;
  period: string;
  location: string;
  logoUrl?: string;
  highlights: string[];
  skills: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  skills: string[];
  credentialUrl?: string;
}

export interface Publication {
  title: string;
  venue: string;
  year: string;
  description: string;
  tags: string[];
  url?: string;
  imageUrl?: string;
  status?: string;
}
