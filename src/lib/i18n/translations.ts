// ─────────────────────────────────────────────────────────
//  ME Producciones — Bilingual Translations (ES / EN)
//  Strategy: All UI strings live here. Never hardcode in JSX.
//  Server components: pass lang as prop from getLang()
//  Client components: use useLanguage() hook
// ─────────────────────────────────────────────────────────

export type Lang = 'es' | 'en';

export const t = {
  // ── Navigation ──────────────────────────────────────────
  nav: {
    home:         { es: 'Inicio',       en: 'Home' },
    about:        { es: 'Nosotros',     en: 'About' },
    experiences:  { es: 'Experiencias', en: 'Experiences' },
    events:       { es: 'Eventos',      en: 'Events' },
    speakers:     { es: 'Speakers',     en: 'Speakers' },
    gallery:      { es: 'Galería',      en: 'Gallery' },
    sponsors:     { es: 'Sponsors',     en: 'Sponsors' },
    contact:      { es: 'Contacto',     en: 'Contact' },
    book:         { es: 'Reservar',     en: 'Book Now' },
    bookExp:      { es: 'Reservar experiencia', en: 'Book Experience' },
    tagline:      { es: 'Eventos que transforman.', en: 'Events that transform.' },
  },

  // ── Homepage Hero ────────────────────────────────────────
  hero: {
    eyebrow:    { es: 'Productora de Eventos Premium', en: 'Premium Event Production' },
    line1:      { es: 'Experiencias que',               en: 'Experiences that' },
    line2:      { es: 'transforman',                    en: 'transform' },
    line3:      { es: 'comunidades.',                   en: 'communities.' },
    body:       {
      es: 'ME Producciones produce eventos y experiencias de clase mundial para la comunidad latina en Estados Unidos — con propósito, precisión y un estándar de excelencia que lo cambia todo.',
      en: 'ME Producciones creates world-class events and experiences for the Latino community in the United States — with purpose, precision, and a standard of excellence that changes everything.',
    },
    cta1:       { es: 'Próximos eventos',    en: 'Upcoming Events' },
    cta2:       { es: 'Nuestras experiencias', en: 'Our Experiences' },
    stat1Label: { es: 'Asistentes', en: 'Attendees' },
    stat2Label: { es: 'Ciudades',   en: 'Cities' },
    stat3Label: { es: 'Eventos',    en: 'Events' },
  },

  // ── Brand Statement ──────────────────────────────────────
  brandStatement: {
    eyebrow: { es: 'Nuestra visión', en: 'Our vision' },
    quote:   {
      es: '"No producimos eventos. Producimos posibilidad — para la comunidad latina que merece experiencias de clase mundial."',
      en: '"We don\'t produce events. We produce possibility — for the Latino community that deserves world-class experiences."',
    },
    body:    {
      es: 'Durante más de cuatro años y más de 100 eventos, ME Producciones ha reunido a líderes, emprendedores, artistas y familias en escenarios que inspiran, conectan y elevan. The Real Happiness MasterClass, Raíces Summit, Bienestar Retreats y más — cada experiencia es una obra de arte en sí misma.',
      en: 'Over four years and more than 100 events, ME Producciones has brought together leaders, entrepreneurs, artists, and families in settings that inspire, connect, and elevate. The Real Happiness MasterClass, Raíces Summit, Bienestar Retreats and more — each experience is a work of art in itself.',
    },
  },

  // ── What We Do ───────────────────────────────────────────
  whatWeDo: {
    eyebrow:  { es: 'Qué hacemos',     en: 'What we do' },
    title:    { es: 'Producción que define estándares.', en: 'Production that sets standards.' },
    subtitle: {
      es: 'Desde masterclasses transformacionales hasta experiencias de marca exclusivas — ejecutamos con precisión y alma.',
      en: 'From transformational masterclasses to exclusive brand experiences — we execute with precision and soul.',
    },
  },

  // ── Experiences Section ──────────────────────────────────
  experiences: {
    eyebrow:  { es: 'Nuestros formatos',  en: 'Our formats' },
    title:    { es: 'Experiencias diseñadas para cada etapa.', en: 'Experiences designed for every stage.' },
    subtitle: {
      es: 'Cada formato es una puerta diferente hacia el mismo destino: crecimiento, conexión y transformación.',
      en: 'Each format is a different door to the same destination: growth, connection, and transformation.',
    },
    seeMore:  { es: 'Ver más', en: 'See more' },
  },

  // ── Upcoming Events ──────────────────────────────────────
  upcomingEvents: {
    eyebrow:  { es: 'Próximos eventos',   en: 'Upcoming events' },
    title:    { es: 'Dónde nos vemos.',   en: 'Where we meet.' },
    subtitle: {
      es: 'Reserva tu lugar antes de que se agoten. Nuestros eventos se llenan rápido.',
      en: 'Reserve your spot before they\'re gone. Our events fill up fast.',
    },
    seeAll:    { es: 'Ver todos los eventos', en: 'See all events' },
    freeEntry: { es: 'Entrada libre',         en: 'Free entry' },
    perPerson: { es: 'por persona',            en: 'per person' },
    reserve:   { es: 'Reservar lugar',         en: 'Reserve spot' },
    soldOut:   { es: 'Agotado',                en: 'Sold out' },
    upcoming:  { es: 'Próximo',                en: 'Upcoming' },
    request:   { es: 'Solicitar información',  en: 'Request info' },
  },

  // ── Speakers ─────────────────────────────────────────────
  speakers: {
    eyebrow:  { es: 'Voces que inspiran',         en: 'Voices that inspire' },
    title:    { es: 'Speakers de clase mundial.', en: 'World-class speakers.' },
    subtitle: {
      es: 'Cada speaker es cuidadosamente seleccionado por su autenticidad, profundidad y capacidad de transformar salas enteras.',
      en: 'Each speaker is carefully selected for their authenticity, depth, and ability to transform entire rooms.',
    },
    seeAll: { es: 'Ver todos los speakers', en: 'See all speakers' },
  },

  // ── Impact Section ───────────────────────────────────────
  impact: {
    eyebrow:  { es: 'Impacto & comunidad', en: 'Impact & community' },
    title:    { es: 'Cada sala es un espejo de lo que somos capaces.', en: 'Every room is a mirror of what we\'re capable of.' },
    body1:    {
      es: 'Más de 18,500 personas han cruzado las puertas de nuestros eventos. Han llorado, reído, debatido y celebrado. Han encontrado mentores, socios y amigos de por vida. Han recordado quiénes son y decidido quiénes quieren ser.',
      en: 'Over 18,500 people have walked through the doors of our events. They\'ve cried, laughed, debated, and celebrated. They\'ve found mentors, partners, and lifelong friends. They\'ve remembered who they are and decided who they want to be.',
    },
    body2:    {
      es: 'Eso es lo que hacemos. No producimos eventos — producimos posibilidad.',
      en: 'That\'s what we do. We don\'t produce events — we produce possibility.',
    },
    ourStory: { es: 'Nuestra historia', en: 'Our story' },
    satisfaction: { es: 'Satisfacción', en: 'Satisfaction' },
  },

  // ── Metrics ──────────────────────────────────────────────
  metrics: {
    eyebrow:         { es: 'En números',          en: 'By the numbers' },
    totalEvents:     { es: 'Eventos producidos',  en: 'Events produced' },
    totalAttendees:  { es: 'Vidas impactadas',    en: 'Lives impacted' },
    totalSpeakers:   { es: 'Speakers y facilitadores', en: 'Speakers & facilitators' },
    citiesReached:   { es: 'Ciudades en EEUU',    en: 'Cities in the US' },
    yearsActive:     { es: 'Años de trayectoria', en: 'Years of experience' },
    satisfaction:    { es: 'Satisfacción general', en: 'Overall satisfaction' },
  },

  // ── Testimonials ─────────────────────────────────────────
  testimonials: {
    eyebrow:  { es: 'Testimonios',                      en: 'Testimonials' },
    title:    { es: 'Lo que dice nuestra comunidad.',   en: 'What our community says.' },
    subtitle: {
      es: 'Cada historia es prueba de lo que es posible cuando te rodeas de la comunidad correcta.',
      en: 'Each story is proof of what\'s possible when you surround yourself with the right community.',
    },
    seeEvents:    { es: 'Ver eventos',             en: 'See events' },
    shareTitle:   { es: '¿Asististe a uno de nuestros eventos?', en: 'Did you attend one of our events?' },
    shareEyebrow: { es: 'Comparte tu experiencia', en: 'Share your experience' },
    shareBody:    {
      es: 'Tu testimonio inspira a otros a dar el siguiente paso. Cuéntanos cómo fue tu experiencia y lo publicaremos en nuestra comunidad.',
      en: 'Your testimonial inspires others to take the next step. Tell us about your experience and we\'ll share it with our community.',
    },
  },

  // ── Sponsors ─────────────────────────────────────────────
  sponsors: {
    eyebrow:  { es: 'Sponsors & Partners', en: 'Sponsors & Partners' },
    seeAll:   { es: 'Ver todos los sponsors →', en: 'See all sponsors →' },
    heroTitle: { es: 'Una comunidad de marcas con propósito.', en: 'A community of brands with purpose.' },
    heroBody:  {
      es: 'Nuestros patrocinadores no son vendedores — son aliados invertidos en construir algo que perdura.',
      en: 'Our sponsors are not vendors — they are allies invested in building something that lasts.',
    },
    becomeHero: { es: 'Convertirme en sponsor', en: 'Become a sponsor' },
    viewPackages: { es: 'Ver paquetes', en: 'View packages' },
    currentTitle: { es: 'Quienes nos acompañan', en: 'Who supports us' },
    currentEyebrow: { es: 'Patrocinadores actuales', en: 'Current sponsors' },
    beFirst: {
      title: { es: 'Sé el primero en asociarte', en: 'Be the first to partner with us' },
      body:  {
        es: 'Estamos construyendo una comunidad de marcas comprometidas con la cultura latina.',
        en: 'We\'re building a community of brands committed to Latino culture.',
      },
      cta: { es: 'Iniciar conversación', en: 'Start a conversation' },
    },
    why: {
      eyebrow: { es: 'Por qué asociarse', en: 'Why partner with us' },
      title:   { es: 'Más que visibilidad.', en: 'More than visibility.' },
      body:    {
        es: 'El patrocinio con ME Producciones es una inversión en comunidad, credibilidad y relevancia cultural.',
        en: 'Sponsoring ME Producciones is an investment in community, credibility, and cultural relevance.',
      },
    },
    packages: {
      eyebrow:  { es: 'Paquetes de patrocinio', en: 'Sponsorship packages' },
      title:    { es: 'Encuentra tu nivel.', en: 'Find your level.' },
      subtitle: {
        es: 'Cada nivel está diseñado para maximizar la presencia de tu marca.',
        en: 'Each tier is designed to maximize your brand\'s presence.',
      },
      investment: { es: 'Inversión inicial', en: 'Starting investment' },
      cta:        { es: 'Solicitar información', en: 'Request information' },
      pinkNote:   {
        es: '¿Buscas una colaboración más pequeña o a medida? El nivel Pink ($500) está disponible para organizaciones con objetivos específicos.',
        en: 'Looking for a smaller or custom collaboration? The Pink tier ($500) is available for organizations with specific goals.',
      },
      pinkCta:    { es: 'Conversemos', en: 'Let\'s talk' },
    },
    finalCta: {
      eyebrow: { es: 'Construyamos juntos',          en: 'Let\'s build together' },
      title:   { es: 'Los acuerdos de patrocinio a medida están disponibles para marcas con objetivos únicos.', en: 'Custom sponsorship agreements are available for brands with unique goals.' },
      body:    {
        es: 'Nuestro equipo trabajará contigo para diseñar una presencia que se sienta auténtica.',
        en: 'Our team will work with you to design a presence that feels authentic.',
      },
      cta1: { es: 'Iniciar conversación', en: 'Start a conversation' },
      cta2: { es: 'Ver paquetes',         en: 'View packages' },
    },
  },

  // ── Sponsor Inquiry Form ─────────────────────────────────
  sponsorForm: {
    title:         { es: 'Solicitar paquete de sponsor', en: 'Request Sponsorship Package' },
    subtitle:      {
      es: 'Completa el formulario y nos pondremos en contacto contigo. Después del envío te redirigiremos al pago.',
      en: 'Fill out the form and we\'ll be in touch. After submitting you\'ll be redirected to payment.',
    },
    nameLbl:       { es: 'Nombre completo *',      en: 'Full name *' },
    emailLbl:      { es: 'Email *',                en: 'Email *' },
    phoneLbl:      { es: 'Teléfono',               en: 'Phone' },
    companyLbl:    { es: 'Empresa / Organización', en: 'Company / Organization' },
    messageLbl:    { es: 'Mensaje (opcional)',      en: 'Message (optional)' },
    namePh:        { es: 'Tu nombre',              en: 'Your name' },
    emailPh:       { es: 'tu@email.com',           en: 'you@email.com' },
    phonePh:       { es: '+1 (555) 000-0000',      en: '+1 (555) 000-0000' },
    companyPh:     { es: 'Nombre de tu empresa',   en: 'Your company name' },
    messagePh:     { es: '¿Algo más que debamos saber?', en: 'Anything else we should know?' },
    tierLbl:       { es: 'Paquete seleccionado',   en: 'Selected package' },
    submit:        { es: 'Enviar solicitud',        en: 'Send request' },
    submitting:    { es: 'Enviando...',             en: 'Sending...' },
    successTitle:  { es: '¡Solicitud enviada!',    en: 'Request sent!' },
    successBody:   {
      es: 'Tu información fue registrada. Redirigiendo al pago...',
      en: 'Your information was recorded. Redirecting to payment...',
    },
    errorName:     { es: 'El nombre es requerido.',   en: 'Name is required.' },
    errorEmail:    { es: 'Email inválido.',            en: 'Invalid email.' },
    cancel:        { es: 'Cancelar',                  en: 'Cancel' },
    redirecting:   { es: 'Si no eres redirigido automáticamente,', en: 'If not redirected automatically,' },
    clickHere:     { es: 'haz click aquí', en: 'click here' },
  },

  // ── Event Booking Form ───────────────────────────────────
  bookingForm: {
    title:      { es: 'Solicitar información',           en: 'Request Information' },
    subtitle:   {
      es: 'Completa el formulario y te contactaremos con los detalles para completar tu registro.',
      en: 'Fill out the form and we\'ll contact you with details to complete your registration.',
    },
    nameLbl:    { es: 'Nombre completo *',  en: 'Full name *' },
    emailLbl:   { es: 'Email *',            en: 'Email *' },
    phoneLbl:   { es: 'Teléfono',           en: 'Phone' },
    guestsLbl:  { es: 'Número de personas', en: 'Number of guests' },
    messageLbl: { es: 'Mensaje (opcional)', en: 'Message (optional)' },
    namePh:     { es: 'Tu nombre',          en: 'Your name' },
    emailPh:    { es: 'tu@email.com',       en: 'you@email.com' },
    phonePh:    { es: '+1 (555) 000-0000',  en: '+1 (555) 000-0000' },
    messagePh:  { es: '¿Alguna pregunta o información adicional?', en: 'Any questions or additional information?' },
    eventLbl:   { es: 'Evento',             en: 'Event' },
    submit:     { es: 'Enviar solicitud',   en: 'Send request' },
    submitting: { es: 'Enviando...',        en: 'Sending...' },
    successTitle: { es: '¡Solicitud enviada!', en: 'Request sent!' },
    successBody: {
      es: 'Hemos recibido tu información. El equipo se pondrá en contacto contigo pronto.',
      en: 'We\'ve received your information. Our team will be in touch with you soon.',
    },
    errorName:  { es: 'El nombre es requerido.', en: 'Name is required.' },
    errorEmail: { es: 'Email inválido.',          en: 'Invalid email.' },
    cancel:     { es: 'Cancelar',                 en: 'Cancel' },
    cta:        { es: 'Solicitar información',    en: 'Request Information' },
    ctaSoldOut: { es: 'Lista de espera',          en: 'Join waitlist' },
    ctaContact: { es: 'Contactar al equipo',      en: 'Contact the team' },
  },

  // ── Contact Form ─────────────────────────────────────────
  contact: {
    submit:     { es: 'Enviar mensaje', en: 'Send message' },
    submitting: { es: 'Enviando...',    en: 'Sending...' },
    success:    { es: '¡Mensaje enviado! Te contactaremos pronto.', en: 'Message sent! We\'ll be in touch soon.' },
  },

  // ── Final CTA (homepage) ─────────────────────────────────
  finalCta: {
    eyebrow:  { es: 'Tu próximo paso', en: 'Your next step' },
    title:    { es: 'La experiencia que buscabas te está esperando.', en: 'The experience you\'ve been looking for is waiting.' },
    body:     {
      es: 'No importa en qué etapa de tu vida te encuentres — tenemos una experiencia diseñada para ti.',
      en: 'No matter what stage of life you\'re in — we have an experience designed for you.',
    },
    cta1: { es: 'Ver experiencias',  en: 'See experiences' },
    cta2: { es: 'Ser sponsor',       en: 'Become a sponsor' },
    cta3: { es: 'Contactar al equipo', en: 'Contact the team' },
  },

  // ── General ──────────────────────────────────────────────
  general: {
    flagship:  { es: 'Insignia',   en: 'Flagship' },
    wellness:  { es: 'Bienestar',  en: 'Wellness' },
    summit:    { es: 'Summit',     en: 'Summit' },
    community: { es: 'Comunidad',  en: 'Community' },
    branded:   { es: 'Branded',    en: 'Branded' },
    featured:  { es: 'Destacado',  en: 'Featured' },
    past:      { es: 'Finalizado', en: 'Past' },
    upcoming:  { es: 'Próximo',    en: 'Upcoming' },
    soldOut:   { es: 'Agotado',    en: 'Sold out' },
  },
} as const;

/** Pick the string for the given language */
export function tr<T extends { es: string; en: string }>(entry: T, lang: Lang): string {
  return entry[lang];
}
