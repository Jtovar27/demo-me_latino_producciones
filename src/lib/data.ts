// ─────────────────────────────────────────────
//  ME Producciones — Structured Mock Data
//  Sub-brand: The Real Happiness
// ─────────────────────────────────────────────

// ── Types ──────────────────────────────────────

export type EventCategory =
  | "flagship"
  | "wellness"
  | "summit"
  | "community"
  | "branded";

export type EventStatus = "upcoming" | "sold-out" | "past";

export interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  endDate: string;
  city: string;
  state: string;
  venue: string;
  category: EventCategory;
  status: EventStatus;
  description: string;
  image: string;
  capacity: number;
  registered: number;
  price: number;
  featured: boolean;
  tags: string[];
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  image: string;
  expertise: string[];
  eventIds: string[];
  featured: boolean;
  instagram?: string;
}

export interface Experience {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  shortDesc: string;
  description: string;
  image: string;
  featured: boolean;
  tags: string[];
}

export type SponsorTier = "exclusive" | "platinum" | "silver" | "blue" | "pink";

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  website: string;
  logo: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  text: string;
  event: string;
  avatar: string;
}

export type GalleryCategory =
  | "backstage"
  | "moments"
  | "audience"
  | "stage"
  | "details";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  featured: boolean;
}

export interface Stats {
  totalEvents: number;
  totalAttendees: number;
  totalSpeakers: number;
  citiesReached: number;
  yearsActive: number;
  satisfaction: number;
}


// ── Events ─────────────────────────────────────

export const events: Event[] = [
  {
    id: "evt-001",
    title: "The Real Happiness",
    slug: "the-real-happiness-miami-2025",
    date: "2025-10-17",
    endDate: "2025-10-18",
    city: "Miami",
    state: "FL",
    venue: "The Fillmore Miami Beach",
    category: "flagship",
    status: "upcoming",
    description:
      "Two immersive days designed to reconnect you with your purpose, your community, and your most authentic self. The Real Happiness is our flagship experience — a curated journey of keynotes, workshops, breathwork, and transformational conversations for the modern Latino leader.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
    capacity: 1200,
    registered: 940,
    price: 397,
    featured: true,
    tags: ["transformation", "community", "purpose", "wellness", "leadership"],
  },
  {
    id: "evt-002",
    title: "Raíces Summit: Latino Leadership Forum",
    slug: "raices-summit-nyc-2025",
    date: "2025-07-12",
    endDate: "2025-07-12",
    city: "New York",
    state: "NY",
    venue: "Manhattan Center Grand Ballroom",
    category: "summit",
    status: "upcoming",
    description:
      "A full-day summit bringing together Latino executives, founders, and community organizers to share strategy, stories, and the shared vision of what leadership looks like for the next generation. Panel discussions, networking, and keynote addresses.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80",
    capacity: 600,
    registered: 580,
    price: 195,
    featured: true,
    tags: ["leadership", "networking", "business", "community", "summit"],
  },
  {
    id: "evt-003",
    title: "Bienestar Wellness Retreat",
    slug: "bienestar-wellness-los-angeles-2025",
    date: "2025-08-23",
    endDate: "2025-08-24",
    city: "Los Angeles",
    state: "CA",
    venue: "Hotel Bel-Air",
    category: "wellness",
    status: "upcoming",
    description:
      "An intimate two-day wellness retreat for 150 attendees seeking deep restoration. Daily breathwork sessions, sound baths, nutritional guidance, yoga flow, and panel conversations with leading Latino wellness practitioners.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80",
    capacity: 150,
    registered: 150,
    price: 595,
    featured: false,
    tags: ["wellness", "retreat", "breathwork", "yoga", "restoration"],
  },
  {
    id: "evt-004",
    title: "Comunidad en Acción",
    slug: "comunidad-en-accion-houston-2025",
    date: "2025-09-06",
    endDate: "2025-09-06",
    city: "Houston",
    state: "TX",
    venue: "George R. Brown Convention Center",
    category: "community",
    status: "upcoming",
    description:
      "A free community day bringing together nonprofits, local businesses, and families across Greater Houston. Live music, panel talks, mentorship roundtables, and resource fairs — all under one roof.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    capacity: 3000,
    registered: 1840,
    price: 0,
    featured: false,
    tags: ["community", "free", "family", "nonprofits", "Houston"],
  },
  {
    id: "evt-005",
    title: "Visión Nocturna: Branded Experience",
    slug: "vision-nocturna-chicago-2025",
    date: "2025-11-08",
    endDate: "2025-11-08",
    city: "Chicago",
    state: "IL",
    venue: "Venue SIX10",
    category: "branded",
    status: "upcoming",
    description:
      "An exclusive curated evening blending art, culture, and brand storytelling. ME Producciones partners with leading brands to create an unforgettable sensory experience for 400 tastemakers.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80",
    capacity: 400,
    registered: 278,
    price: 150,
    featured: false,
    tags: ["branded", "culture", "art", "nightlife", "experience"],
  },
  {
    id: "evt-006",
    title: "The Real Happiness",
    slug: "the-real-happiness-la-2024",
    date: "2024-10-11",
    endDate: "2024-10-12",
    city: "Los Angeles",
    state: "CA",
    venue: "The Novo by Microsoft",
    category: "flagship",
    status: "past",
    description:
      "The inaugural edition of The Real Happiness — 1,000 attendees, 14 speakers, two transformational days. A milestone for the Latino community in Southern California.",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80",
    capacity: 1000,
    registered: 1000,
    price: 350,
    featured: false,
    tags: ["transformation", "community", "purpose", "inaugural"],
  },
  {
    id: "evt-007",
    title: "Poder Wellness Workshop",
    slug: "poder-wellness-nyc-2024",
    date: "2024-06-15",
    endDate: "2024-06-15",
    city: "New York",
    state: "NY",
    venue: "Soho House New York",
    category: "wellness",
    status: "past",
    description:
      "A half-day wellness workshop for Latina professionals navigating the intersection of ambition and self-care. Guided journaling, peer circles, and a closing meditation ceremony.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1400&q=80",
    capacity: 80,
    registered: 80,
    price: 120,
    featured: false,
    tags: ["wellness", "women", "journaling", "meditation", "professionals"],
  },
  {
    id: "evt-008",
    title: "Summit del Sur",
    slug: "summit-del-sur-miami-2024",
    date: "2024-04-20",
    endDate: "2024-04-20",
    city: "Miami",
    state: "FL",
    venue: "InterContinental Miami",
    category: "summit",
    status: "past",
    description:
      "Business and innovation summit focused on Latin American entrepreneurs and investors building in the US market. Pitch competitions, VC panels, and founder spotlights.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
    capacity: 500,
    registered: 483,
    price: 225,
    featured: false,
    tags: ["entrepreneurship", "business", "investment", "Latin America", "innovation"],
  },
  {
    id: "evt-009",
    title: "Encuentro Comunitario Chicago",
    slug: "encuentro-comunitario-chicago-2024",
    date: "2024-09-14",
    endDate: "2024-09-14",
    city: "Chicago",
    state: "IL",
    venue: "Pilsen Community Center",
    category: "community",
    status: "past",
    description:
      "A neighborhood-level gathering celebrating the cultural richness of Chicago's Latino community. Music, food, art installations, and panel discussions with local leaders.",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80",
    capacity: 800,
    registered: 750,
    price: 0,
    featured: false,
    tags: ["community", "culture", "Chicago", "art", "free"],
  },
  {
    id: "evt-010",
    title: "Elevar: A Branded Evening",
    slug: "elevar-branded-miami-2024",
    date: "2024-12-06",
    endDate: "2024-12-06",
    city: "Miami",
    state: "FL",
    venue: "1 Hotel South Beach",
    category: "branded",
    status: "sold-out",
    description:
      "An invitation-only branded experience celebrating the close of the year in style. Premium cocktail reception, live performances, and an intimate conversation with ME Producciones' founders.",
    image: "https://images.unsplash.com/photo-1560523857-00a8c8a9e9f6?auto=format&fit=crop&w=1400&q=80",
    capacity: 200,
    registered: 200,
    price: 250,
    featured: false,
    tags: ["branded", "luxury", "VIP", "year-end", "culture"],
  },
];

// ── Speakers ───────────────────────────────────

export const speakers: Speaker[] = [
  {
    id: "spk-001",
    name: "Mariana Ríos Delgado",
    title: "Founder & CEO",
    organization: "ME Producciones",
    bio: "Mariana founded ME Producciones after 15 years in live event production across Latin America and the United States. A tireless champion of the Latino story, she built The Real Happiness from a vision into one of the most anticipated Latino cultural events in the country.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    expertise: ["Event Production", "Latino Leadership", "Brand Strategy", "Community Building"],
    eventIds: ["evt-001", "evt-006", "evt-010"],
    featured: true,
    instagram: "@marianamd_oficial",
  },
  {
    id: "spk-002",
    name: "Dr. Tomás Valenzuela",
    title: "Clinical Psychologist & Author",
    organization: "Centro de Bienestar Latino",
    bio: "Dr. Valenzuela is a licensed clinical psychologist specializing in Latino mental health and trauma-informed healing. His bestselling book, 'Raíces que Sanan,' has sold over 100,000 copies across the Americas. He speaks with both clinical precision and profound warmth.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    expertise: ["Mental Health", "Trauma Healing", "Mindfulness", "Latino Identity"],
    eventIds: ["evt-001", "evt-003", "evt-006", "evt-007"],
    featured: true,
    instagram: "@drtomasvalenzuela",
  },
  {
    id: "spk-003",
    name: "Catalina Montoya",
    title: "Executive Vice President",
    organization: "Univision Communications",
    bio: "With nearly two decades in media and communications, Catalina has shaped how Latino stories are told on national television. She now leads initiatives that expand Latino representation across streaming and digital platforms.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    expertise: ["Media", "Communications", "Latino Representation", "Digital Strategy"],
    eventIds: ["evt-002", "evt-008"],
    featured: true,
    instagram: "@catalina.montoya",
  },
  {
    id: "spk-004",
    name: "Roberto Fuentes-Herrera",
    title: "Founder",
    organization: "Fuentes Capital",
    bio: "Roberto is a first-generation immigrant who built Fuentes Capital from the ground up into a $200M venture fund focused exclusively on Latino-founded startups. He is a sought-after voice on inclusion in venture capital and entrepreneurship.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    expertise: ["Venture Capital", "Entrepreneurship", "Finance", "Impact Investing"],
    eventIds: ["evt-002", "evt-008"],
    featured: false,
    instagram: "@robertofuentesvc",
  },
  {
    id: "spk-005",
    name: "Sofía Guerrero",
    title: "Certified Breathwork Facilitator",
    organization: "Alma en Paz Institute",
    bio: "Sofía is one of the leading breathwork facilitators in the US Latino wellness space. Her sessions have guided thousands through emotional release, clarity, and deep restoration. She brings ancient techniques and modern psychology into her facilitation.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    expertise: ["Breathwork", "Somatic Healing", "Meditation", "Group Facilitation"],
    eventIds: ["evt-001", "evt-003", "evt-007"],
    featured: true,
    instagram: "@sofiaguerrero.breath",
  },
  {
    id: "spk-006",
    name: "Miguel Ángel Restrepo",
    title: "Grammy-Nominated Artist & Motivational Speaker",
    organization: "Independent",
    bio: "Grammy-nominated singer-songwriter Miguel Ángel Restrepo weaves storytelling, music, and purpose into captivating keynote experiences. His talks on creativity, resilience, and Latino identity have moved audiences from Bogotá to Los Angeles.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    expertise: ["Music", "Storytelling", "Creativity", "Cultural Identity"],
    eventIds: ["evt-001", "evt-005", "evt-006"],
    featured: true,
    instagram: "@miguelangel.restrepo",
  },
  {
    id: "spk-007",
    name: "Adriana Castellanos, MBA",
    title: "Chief Marketing Officer",
    organization: "Vive Foods",
    bio: "Adriana leads brand strategy for one of the fastest-growing Latino food companies in the US. A storyteller at heart, she speaks on authentic brand building, consumer trust, and the power of cultural marketing for the next generation of businesses.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
    expertise: ["Brand Strategy", "Marketing", "Consumer Culture", "Latino Market"],
    eventIds: ["evt-002", "evt-005"],
    featured: false,
    instagram: "@adriana.cmo",
  },
  {
    id: "spk-008",
    name: "Padre Ernesto Salinas",
    title: "Community Leader & Theologian",
    organization: "Iglesia del Pueblo, Chicago",
    bio: "Padre Ernesto is a beloved community theologian who bridges faith, social justice, and cultural pride. His perspective on purpose, service, and belonging resonates across generations and denominations.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    expertise: ["Community Leadership", "Faith", "Social Justice", "Purpose"],
    eventIds: ["evt-004", "evt-009"],
    featured: false,
  },
];

// ── Experiences ────────────────────────────────

export const experiences: Experience[] = [
  {
    id: "exp-001",
    title: "The Real Happiness — Flagship Experience",
    slug: "the-real-happiness",
    category: "flagship",
    shortDesc: "A two-day immersive journey into purpose, community, and personal transformation.",
    description:
      "The Real Happiness is our signature event — a carefully curated two-day experience that blends keynote storytelling, facilitated workshops, breathwork sessions, and peer connection. Designed for the modern Latino leader who is ready to go deeper, this experience is a commitment to your most authentic life.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    tags: ["flagship", "transformation", "community", "purpose", "immersive"],
  },
  {
    id: "exp-002",
    title: "Raíces Summit",
    slug: "raices-summit",
    category: "summit",
    shortDesc: "A premier leadership forum for Latino executives, founders, and changemakers.",
    description:
      "Raíces Summit is our annual leadership gathering — a day of sharp strategic conversation, inspiring panels, and meaningful networking for Latino professionals at the top of their fields. Every session is designed to be both thought-provoking and immediately actionable.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    tags: ["summit", "leadership", "executives", "networking", "strategy"],
  },
  {
    id: "exp-003",
    title: "Bienestar Wellness Retreats",
    slug: "bienestar-wellness",
    category: "wellness",
    shortDesc: "Intimate retreat experiences for deep rest, healing, and restoration.",
    description:
      "Our Bienestar Retreats are immersive wellness experiences limited to small cohorts for maximum depth. Hosted at premium venues, they feature breathwork, sound healing, yoga, nutritional guidance, and facilitated conversations around health — physical, emotional, and spiritual.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    tags: ["wellness", "retreat", "healing", "intimate", "luxury"],
  },
  {
    id: "exp-004",
    title: "Comunidad en Acción",
    slug: "comunidad-en-accion",
    category: "community",
    shortDesc: "Free community days celebrating Latino culture, connection, and collective action.",
    description:
      "Comunidad en Acción events are our commitment to accessibility. Free to attend and open to all, these community days bring together local organizations, artists, families, and leaders around shared celebration and shared responsibility.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    tags: ["community", "free", "culture", "family", "access"],
  },
  {
    id: "exp-005",
    title: "Branded Experiences",
    slug: "branded-experiences",
    category: "branded",
    shortDesc: "Premium curated evenings blending brand, culture, and unforgettable aesthetics.",
    description:
      "Our Branded Experience series offers select brand partners the opportunity to co-create exclusive events that speak directly to the Latino premium consumer. Each event is a unique sensory environment — with art, music, conversation, and product in perfect harmony.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    tags: ["branded", "luxury", "culture", "partnerships", "exclusive"],
  },
  {
    id: "exp-006",
    title: "Corporate Workshops",
    slug: "corporate-workshops",
    category: "wellness",
    shortDesc: "Tailored workshops for teams seeking cultural intelligence, belonging, and performance.",
    description:
      "ME Producciones brings its signature energy into corporate settings. Our facilitated workshops help teams build cultural intelligence, explore inclusion with authenticity, and create the psychological safety that drives high performance. Custom designed for each client.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    tags: ["corporate", "DEI", "workshops", "teams", "culture"],
  },
];

// ── Sponsors ───────────────────────────────────

export const sponsors: Sponsor[] = [
  {
    id: "spo-001",
    name: "Confianza Bank",
    tier: "platinum",
    website: "https://confianzabank.com",
    logo: "/images/sponsor-confianza.png",
    description:
      "Confianza Bank is the leading Latino-owned financial institution in the southeastern US, committed to empowering families and small businesses through accessible, culturally responsive banking.",
  },
  {
    id: "spo-002",
    name: "Vive Foods",
    tier: "platinum",
    website: "https://vivefoods.com",
    logo: "/images/sponsor-vivefoods.png",
    description:
      "Vive Foods creates premium plant-forward products inspired by Latin American culinary traditions. Their mission is to nourish the Latino community while honoring its roots.",
  },
  {
    id: "spo-003",
    name: "Univision Communications",
    tier: "blue",
    website: "https://univision.com",
    logo: "/images/sponsor-univision.png",
    description:
      "The largest Spanish-language media company in the United States, Univision connects brands with the Latino audience through television, radio, and digital platforms.",
  },
  {
    id: "spo-004",
    name: "Salud Health Systems",
    tier: "blue",
    website: "https://saludhealth.com",
    logo: "/images/sponsor-salud.png",
    description:
      "Salud Health Systems operates a network of culturally competent clinics and telehealth services, serving Latino communities across five states.",
  },
  {
    id: "spo-005",
    name: "Raíz Tequila",
    tier: "blue",
    website: "https://raiztequila.com",
    logo: "/images/sponsor-raiz.png",
    description:
      "Raíz Tequila is a small-batch, family-owned tequila brand from Jalisco, Mexico — crafted with artisanal methods and a deep respect for tradition.",
  },
  {
    id: "spo-006",
    name: "Fuentes Capital",
    tier: "silver",
    website: "https://fuentescapital.com",
    logo: "/images/sponsor-fuentes.png",
    description:
      "A venture fund exclusively investing in Latino-founded technology and consumer companies building the next generation of iconic brands.",
  },
  {
    id: "spo-007",
    name: "Paloma PR Group",
    tier: "silver",
    website: "https://palomaprgroup.com",
    logo: "/images/sponsor-paloma.png",
    description:
      "Paloma PR Group is a boutique public relations agency specializing in Latino brands, cultural events, and consumer lifestyle campaigns across the US and Latin America.",
  },
  {
    id: "spo-008",
    name: "Cultura Collective",
    tier: "pink",
    website: "https://culturacollective.org",
    logo: "/images/sponsor-cultura.png",
    description:
      "A nonprofit dedicated to amplifying Latino voices in the arts, media, and civic life through grants, mentorship, and community programming.",
  },
];

// ── Testimonials ───────────────────────────────

export const testimonials: Testimonial[] = [
  {
    id: "tst-001",
    name: "Isabel Moreno",
    title: "Marketing Director, Los Angeles",
    text: "The Real Happiness was unlike anything I have ever attended. I walked in carrying months of burnout and walked out with clarity, a renewed sense of purpose, and connections that already feel like lifelong friendships. This event is essential.",
    event: "The Real Happiness — Los Angeles 2024",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "tst-002",
    name: "Carlos Jiménez",
    title: "Entrepreneur, Miami",
    text: "Raíces Summit gave me the room to think bigger. Every conversation, every panel — there was real substance. I left with three new business relationships and a whiteboard full of ideas. This is where the serious work happens.",
    event: "Raíces Summit — New York 2025",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "tst-003",
    name: "Valentina Ochoa",
    title: "Yoga Instructor & Wellness Coach",
    text: "Bienestar was the most carefully produced wellness event I have ever been part of. Every detail — the space, the facilitators, the flow — was intentional. I left feeling genuinely restored in a way I haven't felt in years.",
    event: "Bienestar Wellness Retreat — Los Angeles 2025",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "tst-004",
    name: "Marco Delgado",
    title: "High School Teacher, Chicago",
    text: "Comunidad en Acción showed me what's possible when we organize with love. I brought my students and they haven't stopped talking about it. Events like this change the trajectory of young people. I'm grateful every time.",
    event: "Encuentro Comunitario — Chicago 2024",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "tst-005",
    name: "Daniela Rios",
    title: "Brand Strategist, New York",
    text: "Visión Nocturna was gorgeous — the aesthetics, the energy, the curation. But what surprised me was how meaningful the conversations were. ME Producciones creates spaces where beauty and depth coexist. That's rare.",
    event: "Elevar: A Branded Evening — Miami 2024",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "tst-006",
    name: "Andrés Castillo",
    title: "Therapist & Author, Houston",
    text: "I've attended three ME Producciones events now. Each time, the production quality improves, but what stays constant is the soul. You can feel how much the team cares. That care transmits to every person in the room.",
    event: "The Real Happiness — Miami 2025",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80",
  },
];

// ── Gallery ────────────────────────────────────

export const galleryItems: GalleryItem[] = [
  {
    id: "gal-001",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    alt: "Main stage during opening keynote at The Real Happiness Miami",
    category: "stage",
    featured: true,
  },
  {
    id: "gal-002",
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    alt: "Attendees connecting during morning networking session",
    category: "moments",
    featured: true,
  },
  {
    id: "gal-003",
    src: "https://images.unsplash.com/photo-1571173961509-f2c0a69b0aa2?auto=format&fit=crop&w=1200&q=80",
    alt: "Mariana Ríos Delgado backstage before keynote",
    category: "backstage",
    featured: false,
  },
  {
    id: "gal-004",
    src: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    alt: "Full audience during afternoon panel at Raíces Summit",
    category: "audience",
    featured: true,
  },
  {
    id: "gal-005",
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    alt: "Breathwork session led by Sofía Guerrero at Bienestar Retreat",
    category: "moments",
    featured: true,
  },
  {
    id: "gal-006",
    src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    alt: "Floral and table details at Elevar branded evening",
    category: "details",
    featured: false,
  },
  {
    id: "gal-007",
    src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    alt: "Dr. Tomás Valenzuela speaking to standing-room audience",
    category: "stage",
    featured: false,
  },
  {
    id: "gal-008",
    src: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    alt: "Attendees journaling during reflection workshop",
    category: "moments",
    featured: false,
  },
  {
    id: "gal-009",
    src: "https://images.unsplash.com/photo-1560523857-00a8c8a9e9f6?auto=format&fit=crop&w=1200&q=80",
    alt: "Sound bath ceremony at sunset, Hotel Bel-Air",
    category: "details",
    featured: true,
  },
  {
    id: "gal-010",
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
    alt: "Community gathering at Encuentro Comunitario Chicago",
    category: "audience",
    featured: false,
  },
  {
    id: "gal-011",
    src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
    alt: "Miguel Ángel Restrepo performing on stage",
    category: "stage",
    featured: true,
  },
  {
    id: "gal-012",
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    alt: "Backstage team preparing for doors open at The Real Happiness",
    category: "backstage",
    featured: false,
  },
];

// ── Stats ──────────────────────────────────────

export const stats: Stats = {
  totalEvents: 24,
  totalAttendees: 18500,
  totalSpeakers: 62,
  citiesReached: 8,
  yearsActive: 4,
  satisfaction: 97,
};

// ── (mock admin data removed — use Supabase actions instead) ──
