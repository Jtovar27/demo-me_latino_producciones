export interface EditorialImage {
  src: string;
  alt: string;
}

export const editorialImages = {
  homeFeaturedExperience: {
    src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80',
    alt: 'Performance and audience energy during a transformational live experience',
  },
  homeImpact: {
    src: 'https://images.unsplash.com/photo-1758388551341-90ace8c332fe?auto=format&fit=crop&w=1400&q=80',
    alt: 'Outdoor community festival with families and cultural activations',
  },
  experiencesFlagship: {
    src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80',
    alt: 'Audience gathered for a keynote session inside a large event hall',
  },
  aboutTheRealHappiness: {
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    alt: 'Production team making final backstage preparations before doors open',
  },
  theRealHappinessHero: {
    src: 'https://images.unsplash.com/photo-1701506516420-3ef4b27413c9?auto=format&fit=crop&w=1800&q=80',
    alt: 'Large audience celebrating during a live transformational event',
  },
  theRealHappinessVenue: {
    src: 'https://images.unsplash.com/photo-1759688092325-37cf48d11dec?auto=format&fit=crop&w=1400&q=80',
    alt: 'Historic theater exterior with marquee lights at dusk',
  },
} satisfies Record<string, EditorialImage>;
