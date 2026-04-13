import PublicLayout from '@/components/layout/PublicLayout';
import ContactForm from '@/components/contact/ContactForm';
import { getUpcomingEvents } from '@/app/actions/events';

// ── Inquiry types ────────────────────────────────

const INQUIRY_PATHS = [
  {
    label: 'Asistentes',
    description:
      'Preguntas sobre boletos, disponibilidad, accesibilidad o qué esperar en uno de nuestros eventos.',
  },
  {
    label: 'Sponsors',
    description:
      'Consultas de patrocinio, paquetes de partnership y oportunidades de co-producción con marcas.',
  },
  {
    label: 'Speakers',
    description:
      'Aplicaciones para hablar en un próximo evento o propuestas para nueva programación.',
  },
  {
    label: 'Producción',
    description:
      'Comisiona a ME Producciones para producir tu evento corporativo, reunión cultural o experiencia de marca.',
  },
];

// ── Page ────────────────────────────────────────

export default async function ContactPage() {
  const { data: upcomingEvents } = await getUpcomingEvents();
  return (
    <PublicLayout>

      {/* ── A. PAGE HERO ───────────────────────── */}
      <section className="bg-[#2A2421] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-2xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Contacto
            </span>
            <div className="mt-2 mb-8 h-px w-8 bg-[#A56E52]" />
            <h1
              className="font-serif text-5xl font-normal leading-tight text-[#F7F3EE] md:text-6xl lg:text-7xl"

            >
              Hablemos.
            </h1>
            <p className="mt-6 font-sans text-base leading-relaxed text-[#D7C6B2]">
              Estamos aquí para responder.
            </p>
          </div>
        </div>
      </section>

      {/* ── B. TWO-COLUMN SECTION ──────────────── */}
      <section className="bg-[#FDFAF7] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-[2fr_3fr]">

            {/* Left: Contact info (40%) */}
            <div className="flex flex-col gap-12">

              {/* Contact details */}
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1.5">
                  <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#A56E52]">
                    Email
                  </span>
                  <a
                    href="mailto:melatinoevents@gmail.com"
                    className="font-serif text-lg font-normal text-[#2A2421] transition-colors hover:text-[#A56E52]"
                  >
                    melatinoevents@gmail.com
                  </a>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#A56E52]">
                    Teléfono / WhatsApp
                  </span>
                  <a
                    href="tel:+13055252555"
                    className="font-serif text-lg font-normal text-[#2A2421] transition-colors hover:text-[#A56E52]"
                  >
                    +1 (305) 525-2555
                  </a>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#A56E52]">
                    Tiempo de respuesta
                  </span>
                  <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                    Respondemos en menos de 48 horas hábiles.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#EAE1D6]" />

              {/* Inquiry types */}
              <div className="flex flex-col gap-6">
                <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#A56E52]">
                  Tipos de consulta
                </span>
                <div className="flex flex-col gap-6">
                  {INQUIRY_PATHS.map((path) => (
                    <div
                      key={path.label}
                      className="flex flex-col gap-1.5 border-l-2 border-[#A56E52] pl-5"
                    >
                      <p
                        className="font-serif text-base font-normal text-[#2A2421]"

                      >
                        {path.label}
                      </p>
                      <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                        {path.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Contact Form (60%) */}
            <div>
              <div className="mb-10">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                  Enviar mensaje
                </span>
                <div className="mt-2 h-px w-8 bg-[#A56E52]" />
                <h2
                  className="mt-5 font-serif text-3xl font-normal text-[#2A2421]"

                >
                  Cuéntanos más.
                </h2>
              </div>
              <ContactForm upcomingEvents={upcomingEvents} />
            </div>

          </div>
        </div>
      </section>

      {/* ── C. LOCATION BLOCK ──────────────────── */}
      <section className="bg-[#EAE1D6] py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex min-h-[200px] w-full items-center justify-center bg-[#D7C6B2]">
            <p
              className="font-serif text-xl font-normal text-[#2A2421] md:text-2xl"

            >
              Miami, FL — Orlando, FL — Ecuador
            </p>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
