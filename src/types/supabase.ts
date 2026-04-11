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
  id: number; total_events: number; total_attendees: number; total_speakers: number;
  cities_reached: number; years_active: number; satisfaction: number;
  site_name: string; site_tagline: string | null; contact_email: string | null;
  instagram_url: string | null; linkedin_url: string | null; facebook_url: string | null;
  updated_at: string;
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
    };
  };
}

// Convenience row types
export type DBEvent = EventRow;
export type DBSpeaker = SpeakerRow;
export type DBExperience = ExperienceRow;
export type DBSponsor = SponsorRow;
export type DBGalleryItem = GalleryItemRow;
export type DBLead = LeadRow;
export type DBBooking = BookingRow;
export type DBReview = ReviewRow;
export type DBSiteConfig = SiteConfigRow;
