export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Row types extracted to avoid circular self-references inside Database interface
type EventRow = {
  id: string; title: string; slug: string; date: string; end_date: string | null;
  city: string; state: string; venue: string; category: string; status: string;
  description: string | null; image_url: string | null; video_url: string | null;
  capacity: number; registered: number; price: number; featured: boolean;
  tags: string[]; created_at: string; updated_at: string;
};

type SpeakerRow = {
  id: string; name: string; title: string | null; organization: string | null;
  bio: string | null; image_url: string | null; expertise: string[];
  featured: boolean; instagram: string | null; created_at: string; updated_at: string;
};

type ExperienceRow = {
  id: string; title: string; slug: string; category: string; short_desc: string | null;
  description: string | null; image_url: string | null; video_url: string | null;
  featured: boolean; tags: string[]; created_at: string; updated_at: string;
};

type SponsorRow = {
  id: string; name: string; tier: string; website: string | null;
  logo_url: string | null; description: string | null; active: boolean; created_at: string;
};

type GalleryItemRow = {
  id: string; storage_path: string; public_url: string; alt: string | null;
  media_type: 'image' | 'video'; category: string | null; featured: boolean;
  thumbnail_url: string | null; duration: number | null;
  file_size: number | null; mime_type: string | null; created_at: string;
};

type LeadRow = {
  id: string; name: string; email: string; phone: string | null; interest: string | null;
  message: string | null; status: string; source: string | null;
  internal_notes: string | null; created_at: string; updated_at: string;
};

type BookingRow = {
  id: string; name: string; email: string; phone: string | null;
  event_id: string | null; event_name: string | null; booking_type: string | null;
  guests: number; source: string | null; status: string; notes: string | null;
  internal_notes: string | null; follow_up: boolean; amount: number;
  submitted_at: string; updated_at: string;
};

type ReviewRow = {
  id: string; name: string; email: string | null; event_id: string | null;
  event_name: string | null; rating: number | null; text: string | null;
  role: string | null; company: string | null;
  status: string; featured: boolean; submitted_at: string; updated_at: string;
};

type SiteConfigRow = {
  id: number;
  // Stats
  total_events: number;
  total_attendees: number;
  total_speakers: number;
  cities_reached: number;
  years_active: number;
  satisfaction: number;
  // Identity
  site_name: string;
  site_tagline: string | null;
  contact_email: string | null;
  // Social links
  instagram_url: string | null;
  linkedin_url:  string | null;
  facebook_url:  string | null;
  twitter_url:   string | null;
  youtube_url:   string | null;
  whatsapp_url:  string | null;
  tiktok_url:    string | null;
  // Hero content (bilingual)
  hero_badge_es:              string | null;
  hero_badge_en:              string | null;
  hero_headline_es:           string | null;
  hero_headline_en:           string | null;
  hero_body_es:               string | null;
  hero_body_en:               string | null;
  hero_cta_primary_label_es:  string | null;
  hero_cta_primary_label_en:  string | null;
  hero_cta_primary_href:      string | null;
  hero_cta_secondary_label_es: string | null;
  hero_cta_secondary_label_en: string | null;
  hero_cta_secondary_href:    string | null;
  // Brand statement (bilingual)
  brand_quote_es: string | null;
  brand_quote_en: string | null;
  brand_body_es:  string | null;
  brand_body_en:  string | null;
  updated_at: string;
};

type HeroSlideRow = {
  id: string;
  image_url:    string;
  alt_es:       string;
  alt_en:       string;
  category_es:  string;
  category_en:  string;
  title_es:     string;
  title_en:     string;
  location:     string;
  cta_label_es: string | null;
  cta_label_en: string | null;
  cta_href:     string | null;
  sort_order:   number;
  active:       boolean;
  created_at:   string;
  updated_at:   string;
};

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      events: {
        Row: EventRow;
        Insert: Partial<EventRow>;
        Update: Partial<EventRow>;
        Relationships: [];
      };
      speakers: {
        Row: SpeakerRow;
        Insert: Partial<SpeakerRow>;
        Update: Partial<SpeakerRow>;
        Relationships: [];
      };
      experiences: {
        Row: ExperienceRow;
        Insert: Partial<ExperienceRow>;
        Update: Partial<ExperienceRow>;
        Relationships: [];
      };
      sponsors: {
        Row: SponsorRow;
        Insert: Partial<SponsorRow>;
        Update: Partial<SponsorRow>;
        Relationships: [];
      };
      gallery_items: {
        Row: GalleryItemRow;
        Insert: Partial<GalleryItemRow>;
        Update: Partial<GalleryItemRow>;
        Relationships: [];
      };
      leads: {
        Row: LeadRow;
        Insert: Partial<LeadRow>;
        Update: Partial<LeadRow>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: Partial<BookingRow>;
        Update: Partial<BookingRow>;
        Relationships: [];
      };
      reviews: {
        Row: ReviewRow;
        Insert: Partial<ReviewRow>;
        Update: Partial<ReviewRow>;
        Relationships: [];
      };
      site_config: {
        Row: SiteConfigRow;
        Insert: Partial<SiteConfigRow>;
        Update: Partial<SiteConfigRow>;
        Relationships: [];
      };
      hero_slides: {
        Row: HeroSlideRow;
        Insert: Partial<HeroSlideRow>;
        Update: Partial<HeroSlideRow>;
        Relationships: [];
      };
    };
  };
}

// Convenience row types
export type DBEvent       = EventRow;
export type DBSpeaker     = SpeakerRow;
export type DBExperience  = ExperienceRow;
export type DBSponsor     = SponsorRow;
export type DBGalleryItem = GalleryItemRow;
export type DBLead        = LeadRow;
export type DBBooking     = BookingRow;
export type DBReview      = ReviewRow;
export type DBSiteConfig  = SiteConfigRow;
export type DBHeroSlide   = HeroSlideRow;
