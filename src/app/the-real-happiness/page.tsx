import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import SponsorPackagesSection from '@/components/sponsors/SponsorPackagesSection';
import RealHappinessLeadForm from '@/components/realHappiness/RealHappinessLeadForm';
import { getSpeakers } from '@/app/actions/speakers';
import { getFlagshipEvents } from '@/app/actions/flagship';
import { getLang } from '@/lib/i18n/getLang';
import type { DBSpeaker, FlagshipVenue } from '@/types/supabase';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meproducciones.com';

export const metadata: Metadata = {
  title: 'The Real Happiness Experience',
  description:
    'An experience and business summit designed to empower leaders, entrepreneurs, brands, and conscious communities through personal happiness, corporate happiness, and meaningful connection. Hosted by ME Producciones.',
  keywords: [
    'The Real Happiness',
    'Real Happiness Experience',
    'The Real MasterClass',
    'Mónica Espinoza',
    'Joyce Urdaneta',
    'Latino business summit',
    'corporate happiness',
    'wellness summit',
    'sponsorship Miami Orlando Ecuador',
  ],
  alternates: { canonical: '/the-real-happiness' },
  openGraph: {
    title: 'The Real Happiness Experience | ME Producciones',
    description:
      'An experience designed to empower people, leaders, entrepreneurs, and organizations through personal growth, emotional well-being, and meaningful connection.',
    url: `${SITE_URL}/the-real-happiness`,
    siteName: 'ME Producciones',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Real Happiness Experience',
    description:
      'An experience and business summit designed to empower leaders, entrepreneurs, brands, and communities.',
  },
};

// ── Static, polished copy rewritten from the OCR brief ───────────────────────
// Speakers come from DB (preferred). If a featured speaker matches by name we
// surface the DB photo. Otherwise we fall back to this curated topic list.

type ConfirmedSpeaker = {
  name: string;
  topicEs: string;
  topicEn: string;
};

const CONFIRMED_SPEAKERS: ConfirmedSpeaker[] = [
  { name: 'María Alejandra Celis', topicEs: 'El ritmo de la felicidad: pausa, siente, avanza.', topicEn: 'The rhythm of happiness: pause, feel, move forward.' },
  { name: 'Antonella Baricelli',   topicEs: 'Liderazgo consciente y comunicación con propósito.', topicEn: 'Conscious leadership and purposeful communication.' },
  { name: 'Alexandra Ramírez',     topicEs: 'Cómo la felicidad libera emociones y nos protege de la enfermedad.', topicEn: 'How happiness unlocks emotions and frees us from disease.' },
  { name: 'Yordamis Megret',       topicEs: 'Felicidad financiera: salud, libertad y decisiones.', topicEn: 'Financial happiness: health, freedom, and decisions.' },
  { name: 'Carlos Calderón',       topicEs: 'Soy feliz: relaciones significativas y una sana relación con uno mismo.', topicEn: 'I am happy: meaningful relationships and a healthy relationship with yourself.' },
  { name: 'Jesmig Hernández',      topicEs: 'Inteligencia emocional aplicada a la vida diaria.', topicEn: 'Emotional intelligence applied to everyday life.' },
  { name: 'Jhonny Aponza',         topicEs: 'Felicidad: entrenando la mente más allá del éxito.', topicEn: 'Happiness: training the mind beyond success.' },
  { name: 'César Jaime',           topicEs: 'Propósito, disciplina y bienestar sostenible.', topicEn: 'Purpose, discipline, and sustainable well-being.' },
  { name: 'Eliecer Marte',         topicEs: 'Gratitud: la práctica que transforma vidas.', topicEn: 'Thankfulness: the practice that transforms lives.' },
  { name: 'Jimmy Arenas',          topicEs: 'El poder de la comunicación genuina.', topicEn: 'The power of genuine communication.' },
  { name: 'Silvia Cobos',          topicEs: 'Bienestar integral y comunidad.', topicEn: 'Integral well-being and community.' },
];

function dbSpeakerByName(speakers: DBSpeaker[], name: string): DBSpeaker | undefined {
  // Strip combining diacritical marks (Unicode block U+0300–U+036F) so
  // "Mónica" matches "Monica" if the DB uses the unaccented form.
  const COMBINING_MARKS = /[̀-ͯ]/g;
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '').trim();
  const target = norm(name);
  return speakers.find((s) => norm(s.name) === target);
}

function CTAButton({
  href,
  variant = 'primary',
  size = 'md',
  children,
}: {
  href: string;
  variant?: 'primary' | 'secondary' | 'terracotta' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}) {
  return (
    <Button href={href} variant={variant} size={size}>
      {children}
    </Button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TheRealHappinessPage() {
  const lang = await getLang();
  const [{ data: dbSpeakers }, { data: flagship }] = await Promise.all([
    getSpeakers(),
    getFlagshipEvents(),
  ]);

  const featuredHosts = ['Mónica Espinoza', 'Joyce Urdaneta'];
  const featuredSpeakerCards = CONFIRMED_SPEAKERS.map((cs) => ({
    ...cs,
    db: dbSpeakerByName(dbSpeakers ?? [], cs.name),
  }));

  // Use the latest active flagship venues if present, otherwise show curated cities
  const flagshipRow = flagship?.find((f) => f.title.toLowerCase().includes('real happiness'))
    ?? flagship?.[0];
  const venues: FlagshipVenue[] = flagshipRow?.venues ?? [
    { city: 'Miami', region: 'Florida, USA',  date_es: 'Agosto 29, 2026',     date_en: 'August 29, 2026',     tag_es: 'Primera sede', tag_en: '1st venue' },
    { city: 'Samborondón', region: 'Ecuador', date_es: 'Septiembre 2026',     date_en: 'September 2026',      tag_es: 'Segunda sede', tag_en: '2nd venue' },
    { city: 'Orlando', region: 'Florida, USA', date_es: 'Octubre 11, 2026',    date_en: 'October 11, 2026',    tag_es: 'Tercera sede', tag_en: '3rd venue' },
  ];

  const heroImage =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80';

  // ── Bilingual copy ────────────────────────────────────────────────────────
  const copy = lang === 'en'
    ? {
        // Hero
        eyebrow: 'Experience & Business Summit',
        h1Lead: 'The Real Happiness',
        h1Tail: 'Experience',
        sub: 'An experience designed to empower people, leaders, entrepreneurs, and organizations through personal growth, emotional well-being, and meaningful connection.',
        ctaSponsor: 'Become a Sponsor',
        ctaSpeaker: 'View Speaker Opportunities',
        ctaInfo: 'Request Information',
        ctaContact: 'Contact Us',
        venuesTitle: 'Three cities. One transformation.',
        // Section 2
        s2Eyebrow: 'What is Real Happiness?',
        s2Title: 'The engine of your evolution.',
        s2Body1: 'Real happiness begins when people learn to understand their emotions, manage stress, and live with purpose. It is not about avoiding challenges — it is about developing the inner tools to face life with balance and well-being.',
        s2Body2: 'Real happiness shapes our health, our relationships, our leadership, and our lifestyle. When a person reconnects with what matters, every decision changes — and so does the world around them.',
        // Pillars
        pillarsEyebrow: 'Program pillars',
        pillarsTitle: 'Three parts. One experience.',
        pillar1Tag: 'Part 01',
        pillar1Title: 'Personal Happiness',
        pillar1Body: 'Tools for emotional balance, stress management, and living with purpose. We give you a personal toolkit to face life from a place of clarity, energy, and self-leadership.',
        pillar2Tag: 'Part 02',
        pillar2Title: 'Corporate Happiness',
        pillar2Body: 'Well-being is a strategy, not a perk. Teams that feel valued create with more commitment, deliver more sustainable results, and build stronger cultures. We share what is working inside the most human-centered companies.',
        pillar3Tag: 'Part 03',
        pillar3Title: 'Testimonials & Speakers',
        pillar3Body: 'Stories that move you. Voices that challenge you. A community of leaders, coaches, therapists, and entrepreneurs sharing what changed everything — and why it can change you, too.',
        // MasterClass
        mcEyebrow: 'The Real MasterClass',
        mcTitle: 'A summit where business, purpose, and emotional intelligence meet.',
        mcBody1: 'The Real MasterClass is the immersive day inside The Real Happiness Experience — an experience and business summit designed to empower leaders, entrepreneurs, professionals, and organizations.',
        mcBody2: 'Attendees walk away with practical tools to lead with emotional intelligence, build healthier relationships, take care of their well-being as a strategic asset, and design a life and business aligned with what truly matters.',
        mcLearn: 'What you will learn',
        mcLearnList: [
          'How emotional intelligence shapes leadership and decision-making.',
          'Frameworks for building corporate cultures where people thrive.',
          'Practices to manage stress, recover focus, and protect energy.',
          'How purpose, gratitude, and authentic communication drive performance.',
        ],
        mcWho: 'Who should attend',
        mcWhoList: [
          'Business owners, founders, and executives.',
          'Conscious leaders, coaches, and therapists.',
          'Wellness, education, and community professionals.',
          'Anyone seeking growth, perspective, and meaningful connection.',
        ],
        // Hosts
        hostsEyebrow: 'Hosted by',
        hostsTitle: 'Voices that lead the experience.',
        host1Name: 'Mónica Espinoza',
        host1Role: 'CEO & Founder · ME Producciones',
        host1Body:
          'A leader in entertainment and corporate event production, Mónica is known for creating purposeful experiences across the United States and Ecuador. ME Producciones specializes in events that inspire and entertain — including the Stand Up Latin Tour in Ecuador and large-scale brand activations recognized for their cultural merit.',
        host2Name: 'Joyce Urdaneta',
        host2Role: 'Host · El Sol Network TV Orlando',
        host2Body:
          'Communicator, writer, and coach, Joyce promotes happiness, well-being, and personal development through every platform she touches. Host of "De Noche y Sin Sueño con Joy", she brings warmth, depth, and presence — and will host The Real Happiness Experience on stage.',
        // Speakers
        spkEyebrow: 'Confirmed speakers',
        spkTitle: 'Voices in the room.',
        spkSub: 'A line-up curated for clarity, depth, and lived experience.',
        // Why
        whyEyebrow: 'Why be part of this experience',
        whyTitle: 'For people who want to grow with intention.',
        whyAudienceTitle: 'Who comes to the room',
        whyAudienceList: [
          'Business owners and entrepreneurs',
          'Conscious leaders and visionaries',
          'Coaches, therapists, and wellness professionals',
          'People seeking growth and meaningful connection',
          'Optimists building a better future',
        ],
        whyBenefitsTitle: 'What you take home',
        whyBenefitsList: [
          'Frameworks from people leading the industry.',
          'A community aligned with what really matters.',
          'Practical tools for happiness, leadership, and balance.',
          'The understanding that happiness is a skill — not a destination.',
          'Reconnection with your purpose and your next step.',
        ],
        // Speaker / sponsor package
        spPkgEyebrow: 'Speaker / Sponsor package',
        spPkgTitle: 'Your stage. Your brand. Your message.',
        spPkgSub: 'A high-impact package for brands and experts who want presence on stage and across the campaign.',
        spPkgPrice: '$2,500',
        spPkgIncludes: [
          '20 minutes on stage to share one of the summit topics, plus brand introduction.',
          'Brand visibility throughout the promotional campaign.',
          'Brand logo on the event step-and-repeat backdrop.',
          'Brand logo, info card, and 30-second video shown on screen during the event.',
          '4 VIP tickets.',
          'Exhibitor table inside the venue.',
          'Conference video recap delivered to your team.',
          'Professional photography of your activation and stage moment.',
          'Post-event promotion across social channels.',
        ],
        // Sponsor plans intro
        spnEyebrow: 'Sponsor plans',
        spnTitle: 'Find the level that fits your brand.',
        spnSub: 'Each plan is designed to maximize your brand presence while deepening your connection with the community.',
        spnFootnote: '* Pricing shown is per city. Each summit stop is contracted independently.',
        // Brands
        brandsEyebrow: 'Opportunity for brands',
        brandsTitle: 'Connect your brand with a conscious community.',
        brandsBody:
          'Reach a high-intent audience in person and across thousands of digital impacts. Partnering with The Real Happiness Experience puts your brand inside the conversation about leadership, well-being, and growth — not next to it.',
        brandsCta: 'Talk to our team',
        // FAQ
        faqEyebrow: 'Frequently asked questions',
        faqTitle: 'Good questions, clear answers.',
        faqs: [
          { q: 'What is The Real Happiness Experience?', a: 'It is an experience and business summit hosted by ME Producciones that brings together speakers, leaders, and a conscious community around personal happiness, corporate happiness, and meaningful connection.' },
          { q: 'Who should attend?', a: 'Business owners, leaders, entrepreneurs, coaches, therapists, and anyone seeking growth, balance, and a stronger community of practice.' },
          { q: 'Can brands become sponsors?', a: 'Yes. We offer Exclusive, Platinum, Silver, Blue, and Pink sponsor plans, plus a $2,500 Speaker / Sponsor package that includes time on stage.' },
          { q: 'How is the pricing structured?', a: 'Sponsor pricing is per city. Each summit stop is its own activation, so brands choose where they want to show up.' },
          { q: 'Can I participate as a speaker?', a: 'Yes. Submit a request through the form below. Our team reviews each application personally and replies within 5 to 7 business days.' },
          { q: 'How do I request more information?', a: 'Use the form on this page, write to melatinoevents@gmail.com, or call +1 (305) 525-2555. WhatsApp is welcome.' },
        ],
        // Final CTA
        finalEyebrow: 'Ready to step in?',
        finalTitle: 'Be part of the experience that changes the room.',
        finalBody: 'Join us as a sponsor, speaker, or attendee. Tell us how you want to participate and our team will get back to you within 48 business hours.',
        ctaPhone: 'Call +1 (305) 525-2555',
        ctaIg: 'Instagram @melatinoproducciones',
        ctaEmail: 'Email melatinoevents@gmail.com',
      }
    : {
        // Hero
        eyebrow: 'Experience & Business Summit',
        h1Lead: 'The Real Happiness',
        h1Tail: 'Experience',
        sub: 'Una experiencia diseñada para empoderar a personas, líderes, emprendedores y organizaciones a través del crecimiento personal, el bienestar emocional y la conexión con propósito.',
        ctaSponsor: 'Convertirme en Sponsor',
        ctaSpeaker: 'Oportunidades para Speakers',
        ctaInfo: 'Solicitar información',
        ctaContact: 'Contáctanos',
        venuesTitle: 'Tres ciudades. Una transformación.',
        // Section 2
        s2Eyebrow: '¿Qué es la verdadera felicidad?',
        s2Title: 'El motor de tu evolución.',
        s2Body1: 'La verdadera felicidad comienza cuando las personas aprenden a comprender sus emociones, gestionar el estrés y vivir con propósito. No se trata de evitar los desafíos — se trata de desarrollar las herramientas internas para enfrentar la vida con equilibrio y bienestar.',
        s2Body2: 'La verdadera felicidad transforma nuestra salud, nuestras relaciones, nuestro liderazgo y nuestro estilo de vida. Cuando una persona se reconecta con lo que importa, cada decisión cambia — y también el mundo a su alrededor.',
        // Pillars
        pillarsEyebrow: 'Pilares del programa',
        pillarsTitle: 'Tres partes. Una experiencia.',
        pillar1Tag: 'Parte 01',
        pillar1Title: 'Felicidad personal',
        pillar1Body: 'Herramientas para el equilibrio emocional, la gestión del estrés y vivir con propósito. Te llevamos un kit personal para enfrentar la vida con claridad, energía y autoliderazgo.',
        pillar2Tag: 'Parte 02',
        pillar2Title: 'Felicidad corporativa',
        pillar2Body: 'El bienestar es estrategia, no un beneficio extra. Los equipos que se sienten valorados crean con más compromiso, generan resultados más sostenibles y construyen culturas más fuertes. Compartimos lo que está funcionando dentro de las empresas más humanas.',
        pillar3Tag: 'Parte 03',
        pillar3Title: 'Testimonios & Speakers',
        pillar3Body: 'Historias que mueven. Voces que retan. Una comunidad de líderes, coaches, terapeutas y emprendedores compartiendo lo que cambió todo — y por qué también puede cambiarte a ti.',
        // MasterClass
        mcEyebrow: 'The Real MasterClass',
        mcTitle: 'Un summit donde se conectan los negocios, el propósito y la inteligencia emocional.',
        mcBody1: 'The Real MasterClass es el día inmersivo dentro de The Real Happiness Experience — un summit empresarial y experiencial diseñado para empoderar a líderes, emprendedores, profesionales y organizaciones.',
        mcBody2: 'Los asistentes salen con herramientas prácticas para liderar con inteligencia emocional, construir relaciones más sanas, cuidar su bienestar como un activo estratégico y diseñar una vida y un negocio alineados con lo que realmente importa.',
        mcLearn: 'Lo que aprenderás',
        mcLearnList: [
          'Cómo la inteligencia emocional moldea el liderazgo y la toma de decisiones.',
          'Marcos para construir culturas corporativas donde las personas florecen.',
          'Prácticas para manejar el estrés, recuperar enfoque y proteger tu energía.',
          'Cómo el propósito, la gratitud y la comunicación auténtica impulsan el desempeño.',
        ],
        mcWho: 'Para quién es',
        mcWhoList: [
          'Dueños de negocio, fundadores y ejecutivos.',
          'Líderes conscientes, coaches y terapeutas.',
          'Profesionales de bienestar, educación y comunidad.',
          'Personas que buscan crecer, ganar perspectiva y conectar con propósito.',
        ],
        // Hosts
        hostsEyebrow: 'Conducción',
        hostsTitle: 'Las voces que lideran la experiencia.',
        host1Name: 'Mónica Espinoza',
        host1Role: 'CEO & Fundadora · ME Producciones',
        host1Body:
          'Líder en entretenimiento y producción de eventos corporativos, Mónica es reconocida por crear experiencias con propósito en Estados Unidos y Ecuador. ME Producciones se especializa en eventos que inspiran y entretienen — incluyendo el Stand Up Latin Tour en Ecuador y activaciones de marca a gran escala reconocidas por su mérito cultural.',
        host2Name: 'Joyce Urdaneta',
        host2Role: 'Host · El Sol Network TV Orlando',
        host2Body:
          'Comunicadora, escritora y coach, Joyce promueve la felicidad, el bienestar y el desarrollo personal en cada plataforma donde participa. Conductora de "De Noche y Sin Sueño con Joy", aporta calidez, profundidad y presencia — y será la host de The Real Happiness Experience en escena.',
        // Speakers
        spkEyebrow: 'Speakers confirmados',
        spkTitle: 'Las voces en la sala.',
        spkSub: 'Una selección curada por claridad, profundidad y experiencia vivida.',
        // Why
        whyEyebrow: 'Por qué ser parte de esta experiencia',
        whyTitle: 'Para personas que quieren crecer con intención.',
        whyAudienceTitle: 'Quiénes están en la sala',
        whyAudienceList: [
          'Dueños de negocio y emprendedores',
          'Líderes conscientes y visionarios',
          'Coaches, terapeutas y profesionales del bienestar',
          'Personas que buscan crecimiento y conexión real',
          'Optimistas construyendo un mejor futuro',
        ],
        whyBenefitsTitle: 'Lo que te llevas',
        whyBenefitsList: [
          'Marcos de personas que lideran la industria.',
          'Una comunidad alineada con lo que realmente importa.',
          'Herramientas prácticas para felicidad, liderazgo y equilibrio.',
          'La comprensión de que la felicidad es una habilidad — no un destino.',
          'Reconexión con tu propósito y tu siguiente paso.',
        ],
        // Speaker / sponsor package
        spPkgEyebrow: 'Paquete Speaker / Sponsor',
        spPkgTitle: 'Tu escenario. Tu marca. Tu mensaje.',
        spPkgSub: 'Un paquete de alto impacto para marcas y expertos que buscan presencia en escena y en toda la campaña.',
        spPkgPrice: '$2,500',
        spPkgIncludes: [
          '20 minutos en escena para compartir uno de los temas del summit, más presentación de marca.',
          'Visibilidad de marca durante toda la campaña promocional.',
          'Logo de marca en el backdrop step-and-repeat del evento.',
          'Logo, ficha y video de 30 segundos en pantallas durante el evento.',
          '4 entradas VIP.',
          'Mesa de exhibición dentro del venue.',
          'Resumen en video de la conferencia entregado a tu equipo.',
          'Fotografía profesional de tu activación y momento en escena.',
          'Promoción post-evento en redes sociales.',
        ],
        // Sponsor plans intro
        spnEyebrow: 'Planes de patrocinio',
        spnTitle: 'Encuentra el nivel que se ajusta a tu marca.',
        spnSub: 'Cada plan está diseñado para maximizar la presencia de tu marca y profundizar tu conexión con la comunidad.',
        spnFootnote: '* El precio mostrado es por ciudad. Cada sede del summit se contrata de forma independiente.',
        // Brands
        brandsEyebrow: 'Oportunidad para marcas',
        brandsTitle: 'Conecta tu marca con una comunidad consciente.',
        brandsBody:
          'Llega a una audiencia de alto interés en persona y a miles de impactos digitales. Asociarte con The Real Happiness Experience pone tu marca dentro de la conversación sobre liderazgo, bienestar y crecimiento — no al lado de ella.',
        brandsCta: 'Hablar con el equipo',
        // FAQ
        faqEyebrow: 'Preguntas frecuentes',
        faqTitle: 'Buenas preguntas, respuestas claras.',
        faqs: [
          { q: '¿Qué es The Real Happiness Experience?', a: 'Es un summit empresarial y experiencial producido por ME Producciones que reúne speakers, líderes y una comunidad consciente alrededor de la felicidad personal, la felicidad corporativa y la conexión con propósito.' },
          { q: '¿Para quién es?', a: 'Para dueños de negocio, líderes, emprendedores, coaches, terapeutas y cualquier persona que busque crecimiento, equilibrio y una comunidad de práctica más sólida.' },
          { q: '¿Las marcas pueden ser sponsors?', a: 'Sí. Ofrecemos planes Exclusive, Platinum, Silver, Blue y Pink, además del paquete Speaker / Sponsor de $2,500 que incluye tiempo en escena.' },
          { q: '¿Cómo está estructurado el precio?', a: 'El precio de patrocinio es por ciudad. Cada sede del summit es su propia activación, así que las marcas eligen dónde quieren mostrarse.' },
          { q: '¿Puedo participar como speaker?', a: 'Sí. Envía una solicitud a través del formulario al final de esta página. Revisamos cada aplicación personalmente y respondemos en 5 a 7 días hábiles.' },
          { q: '¿Cómo solicito más información?', a: 'Usa el formulario de esta página, escríbenos a melatinoevents@gmail.com o llama al +1 (305) 525-2555. WhatsApp es bienvenido.' },
        ],
        // Final CTA
        finalEyebrow: '¿Listo para entrar?',
        finalTitle: 'Sé parte de la experiencia que transforma la sala.',
        finalBody: 'Únete como sponsor, speaker o asistente. Cuéntanos cómo quieres participar y nuestro equipo te responderá en menos de 48 horas hábiles.',
        ctaPhone: 'Llamar +1 (305) 525-2555',
        ctaIg: 'Instagram @melatinoproducciones',
        ctaEmail: 'Email melatinoevents@gmail.com',
      };

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative bg-[#2A2421] overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="The Real Happiness Experience"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2A2421]/90 via-[#2A2421]/70 to-[#2A2421]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#A56E52] shrink-0" />
            <span className="font-sans text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] sm:tracking-[0.25em] text-[#A56E52]">
              {copy.eyebrow}
            </span>
          </div>

          <h1 className="font-serif text-[2.25rem] sm:text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-[#F7F3EE] break-words">
            {copy.h1Lead}<br />
            <span className="italic text-[#D7C6B2]">{copy.h1Tail}</span>
          </h1>

          <p className="mt-8 max-w-2xl font-sans text-base md:text-lg leading-relaxed text-[#D7C6B2]">
            {copy.sub}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <CTAButton href="#sponsor" variant="terracotta" size="lg">{copy.ctaSponsor}</CTAButton>
            <CTAButton href="#speaker-package" variant="secondary" size="lg">{copy.ctaSpeaker}</CTAButton>
            <CTAButton href="#contact" variant="ghost" size="lg">{copy.ctaInfo}</CTAButton>
          </div>

          {/* Cities strip */}
          <div className="mt-14 border-t border-[#5B4638]/40 pt-8">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#A56E52] mb-4">
              {copy.venuesTitle}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#3D342F]">
              {venues.map((v) => (
                <div key={`${v.city}-${v.region}`} className="bg-[#2A2421] px-5 sm:px-6 py-5 min-w-0">
                  <p className="font-serif text-xl sm:text-2xl text-[#F7F3EE] break-words">{v.city}</p>
                  <p className="font-sans text-[11px] text-[#D7C6B2] mt-0.5 break-words">{v.region}</p>
                  <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-widest text-[#A56E52] mt-2 break-words">
                    {lang === 'en' ? v.date_en : v.date_es}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WHAT IS REAL HAPPINESS ─────────────── */}
      <section className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
            {copy.s2Eyebrow}
          </span>
          <div className="mt-3 mb-8 h-px w-8 bg-[#A56E52]" />
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-[#2A2421]">
            {copy.s2Title}
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <p className="font-sans text-base leading-relaxed text-[#5B4638]">{copy.s2Body1}</p>
            <p className="font-sans text-base leading-relaxed text-[#5B4638]">{copy.s2Body2}</p>
          </div>
        </div>
      </section>

      {/* ── 3. PROGRAM PILLARS ──────────────────── */}
      <section className="bg-[#F7F3EE] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 max-w-2xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              {copy.pillarsEyebrow}
            </span>
            <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#2A2421]">
              {copy.pillarsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#D7C6B2]">
            {[
              { tag: copy.pillar1Tag, title: copy.pillar1Title, body: copy.pillar1Body },
              { tag: copy.pillar2Tag, title: copy.pillar2Title, body: copy.pillar2Body },
              { tag: copy.pillar3Tag, title: copy.pillar3Title, body: copy.pillar3Body },
            ].map((p) => (
              <div key={p.tag} className="flex flex-col gap-4 bg-[#FDFAF7] p-8 md:p-10">
                <span className="font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                  {p.tag}
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#2A2421]">{p.title}</h3>
                <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. THE REAL MASTERCLASS ─────────────── */}
      <section className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
                {copy.mcEyebrow}
              </span>
              <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
              <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight text-[#2A2421]">
                {copy.mcTitle}
              </h2>
              <p className="mt-6 font-sans text-base leading-relaxed text-[#5B4638]">{copy.mcBody1}</p>
              <p className="mt-4 font-sans text-base leading-relaxed text-[#5B4638]">{copy.mcBody2}</p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#A56E52] mb-4">
                  {copy.mcLearn}
                </p>
                <ul className="flex flex-col gap-3">
                  {copy.mcLearnList.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                      <span className="font-sans text-sm leading-relaxed text-[#2A2421]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#A56E52] mb-4">
                  {copy.mcWho}
                </p>
                <ul className="flex flex-col gap-3">
                  {copy.mcWhoList.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                      <span className="font-sans text-sm leading-relaxed text-[#2A2421]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HOSTS ────────────────────────────── */}
      <section className="bg-[#EAE1D6] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 max-w-2xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              {copy.hostsEyebrow}
            </span>
            <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#2A2421]">
              {copy.hostsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#C4B09A]">
            {[
              { name: copy.host1Name, role: copy.host1Role, body: copy.host1Body, db: dbSpeakerByName(dbSpeakers ?? [], 'Mónica Espinoza') },
              { name: copy.host2Name, role: copy.host2Role, body: copy.host2Body, db: dbSpeakerByName(dbSpeakers ?? [], 'Joyce Urdaneta') },
            ].map((h) => (
              <div key={h.name} className="flex flex-col bg-[#FDFAF7] p-6 sm:p-8 md:p-10">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden border border-[#D7C6B2] bg-[#EAE1D6]">
                    {h.db?.image_url ? (
                      <Image src={h.db.image_url} alt={h.name} fill className="object-cover object-top" sizes="80px" unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-serif text-2xl text-[#5B4638]">
                          {h.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#2A2421] break-words">{h.name}</h3>
                    <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-widest text-[#A56E52] mt-1 break-words">{h.role}</p>
                  </div>
                </div>
                <p className="mt-6 font-sans text-sm leading-relaxed text-[#5B4638]">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CONFIRMED SPEAKERS ───────────────── */}
      <section className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 max-w-2xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              {copy.spkEyebrow}
            </span>
            <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#2A2421]">
              {copy.spkTitle}
            </h2>
            <p className="mt-3 font-sans text-base leading-relaxed text-[#5B4638]">{copy.spkSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#D7C6B2]">
            {featuredSpeakerCards
              .filter((s) => !featuredHosts.includes(s.name))
              .map((s) => (
                <article key={s.name} className="bg-[#FDFAF7] p-5 sm:p-6 md:p-8 flex gap-4 sm:gap-5">
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden border border-[#D7C6B2] bg-[#EAE1D6]">
                    {s.db?.image_url ? (
                      <Image src={s.db.image_url} alt={s.name} fill className="object-cover object-top" sizes="64px" unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-serif text-lg text-[#5B4638]">
                          {s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base sm:text-lg font-normal text-[#2A2421] leading-snug break-words">{s.name}</h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#5B4638]">
                      {lang === 'en' ? s.topicEn : s.topicEs}
                    </p>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>

      {/* ── 7. WHY BE PART ──────────────────────── */}
      <section className="bg-[#2A2421] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 max-w-2xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              {copy.whyEyebrow}
            </span>
            <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#F7F3EE]">
              {copy.whyTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#A56E52] mb-4">
                {copy.whyAudienceTitle}
              </p>
              <ul className="flex flex-col gap-3">
                {copy.whyAudienceList.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                    <span className="font-sans text-sm leading-relaxed text-[#D7C6B2]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#A56E52] mb-4">
                {copy.whyBenefitsTitle}
              </p>
              <ul className="flex flex-col gap-3">
                {copy.whyBenefitsList.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                    <span className="font-sans text-sm leading-relaxed text-[#D7C6B2]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SPEAKER / SPONSOR PACKAGE ────────── */}
      <section id="speaker-package" className="bg-[#A56E52] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#F7F3EE]/80">
                {copy.spPkgEyebrow}
              </span>
              <div className="mt-3 mb-6 h-px w-8 bg-[#F7F3EE]/80" />
              <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight text-[#F7F3EE]">
                {copy.spPkgTitle}
              </h2>
              <p className="mt-6 font-sans text-base leading-relaxed text-[#F7F3EE]/85">
                {copy.spPkgSub}
              </p>
              <p className="mt-8 font-serif text-4xl sm:text-5xl md:text-6xl text-[#F7F3EE] break-words">
                {copy.spPkgPrice}
              </p>
              <p className="mt-2 font-sans text-[10px] sm:text-[11px] uppercase tracking-widest text-[#F7F3EE]/70 break-words">
                {lang === 'en' ? 'Per city · single investment' : 'Por ciudad · inversión única'}
              </p>
              <div className="mt-8">
                <CTAButton href="#contact" variant="secondary" size="lg">
                  {copy.ctaInfo}
                </CTAButton>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#2A2421] p-6 sm:p-8 md:p-10">
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#F7F3EE]/70 mb-6">
                {lang === 'en' ? 'What is included' : 'Qué incluye'}
              </p>
              <ul className="flex flex-col gap-3">
                {copy.spPkgIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                    <span className="font-sans text-sm leading-relaxed text-[#D7C6B2]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. SPONSOR PLANS ────────────────────── */}
      <section id="sponsor" className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 text-center flex flex-col items-center gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              {copy.spnEyebrow}
            </span>
            <div className="mt-3 h-px w-8 bg-[#A56E52]" />
            <h2 className="mt-4 font-serif text-3xl md:text-4xl font-normal text-[#2A2421]">
              {copy.spnTitle}
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-[#5B4638]">
              {copy.spnSub}
            </p>
          </div>

          <SponsorPackagesSection />

          <p className="mt-10 text-center font-sans text-xs italic text-[#5B4638]">
            {copy.spnFootnote}
          </p>
        </div>
      </section>

      {/* ── 10. OPPORTUNITY FOR BRANDS ──────────── */}
      <section className="bg-[#EAE1D6] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
                {copy.brandsEyebrow}
              </span>
              <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
              <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight text-[#2A2421]">
                {copy.brandsTitle}
              </h2>
              <p className="mt-6 font-sans text-base leading-relaxed text-[#5B4638]">
                {copy.brandsBody}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <CTAButton href="#contact" variant="primary" size="lg">{copy.brandsCta}</CTAButton>
                <CTAButton href="#sponsor" variant="secondary" size="lg">{copy.spnEyebrow}</CTAButton>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#C4B09A]">
              {[
                { value: '18,500+', label: lang === 'en' ? 'Attendees in person' : 'Asistentes en persona' },
                { value: '3', label: lang === 'en' ? 'Cities · Miami · Orlando · Ecuador' : 'Ciudades · Miami · Orlando · Ecuador' },
                { value: 'M+', label: lang === 'en' ? 'Digital impressions per campaign' : 'Impactos digitales por campaña' },
                { value: '97%', label: lang === 'en' ? 'Average satisfaction' : 'Satisfacción promedio' },
              ].map((m) => (
                <div key={m.label} className="bg-[#FDFAF7] flex flex-col items-center text-center gap-3 px-4 py-8 md:py-12 min-w-0">
                  <span className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2A2421] break-words">{m.value}</span>
                  <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-[#A56E52] leading-relaxed break-words">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ─────────────────────────────── */}
      <section className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 md:px-12">
          <div className="mb-12">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              {copy.faqEyebrow}
            </span>
            <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#2A2421]">
              {copy.faqTitle}
            </h2>
          </div>
          <div className="divide-y divide-[#EAE1D6] border-y border-[#EAE1D6]">
            {copy.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex items-start justify-between gap-4 sm:gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-normal text-[#2A2421] leading-snug min-w-0 break-words pr-1">
                    {f.q}
                  </h3>
                  <span className="shrink-0 inline-flex items-center justify-center h-7 w-7 font-sans text-2xl leading-none text-[#A56E52] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 font-sans text-sm sm:text-base leading-relaxed text-[#5B4638]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. FINAL CTA + LEAD FORM ───────────── */}
      <section id="contact" className="bg-[#2A2421] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
                {copy.finalEyebrow}
              </span>
              <div className="mt-3 mb-6 h-px w-8 bg-[#A56E52]" />
              <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-[#F7F3EE]">
                {copy.finalTitle}
              </h2>
              <p className="mt-6 font-sans text-base leading-relaxed text-[#D7C6B2]">
                {copy.finalBody}
              </p>

              <div className="mt-10 flex flex-col gap-3">
                <a
                  href="tel:+13055252555"
                  className="font-sans text-sm text-[#F7F3EE] hover:text-[#A56E52] transition-colors break-all min-h-[44px] inline-flex items-center"
                >
                  {copy.ctaPhone}
                </a>
                <a
                  href="mailto:melatinoevents@gmail.com"
                  className="font-sans text-sm text-[#F7F3EE] hover:text-[#A56E52] transition-colors break-all min-h-[44px] inline-flex items-center"
                >
                  {copy.ctaEmail}
                </a>
                <a
                  href="https://instagram.com/melatinoproducciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm text-[#F7F3EE] hover:text-[#A56E52] transition-colors break-all min-h-[44px] inline-flex items-center"
                >
                  {copy.ctaIg}
                </a>
              </div>

              <div className="mt-10 pt-8 border-t border-[#5B4638]/40">
                <p className="font-sans text-[11px] uppercase tracking-widest text-[#A56E52]">
                  {lang === 'en' ? 'Other links' : 'Otros enlaces'}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  <Link href="/contact" className="font-sans text-xs uppercase tracking-widest text-[#D7C6B2] hover:text-[#F7F3EE] underline underline-offset-4 min-h-[36px] inline-flex items-center">
                    {lang === 'en' ? 'General contact form' : 'Formulario general'}
                  </Link>
                  <Link href="/events" className="font-sans text-xs uppercase tracking-widest text-[#D7C6B2] hover:text-[#F7F3EE] underline underline-offset-4 min-h-[36px] inline-flex items-center">
                    {lang === 'en' ? 'See all events' : 'Ver todos los eventos'}
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#FDFAF7] p-5 sm:p-6 md:p-10">
              <RealHappinessLeadForm />
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
