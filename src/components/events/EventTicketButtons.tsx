'use client';

import { useState } from 'react';
import Link from 'next/link';
import TicketPurchaseModal from '@/components/ui/TicketPurchaseModal';

interface EventData {
  title: string;
  date: string;
  city: string;
  state: string;
  price: number;
  price_vip: number | null;
  vip_benefits: string[] | null;
  status: string;
}

const WA_NUMBER = '13055252555';

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function EventTicketButtons({ event }: { event: EventData }) {
  const [modalOpen, setModalOpen] = useState(false);

  const isSoldOut = event.status === 'sold-out';
  const waWaitlist = encodeURIComponent(
    `Hola! Me interesa "${event.title}" el ${formatFullDate(event.date)} en ${event.city}, ${event.state}. ¿Pueden agregar mi nombre a la lista de espera?`
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {isSoldOut ? (
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waWaitlist}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-[#2A2421] bg-[#2A2421] px-8 py-4 font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors"
          >
            Lista de espera (WhatsApp)
          </a>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 border border-[#2A2421] bg-[#2A2421] px-8 py-4 font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors"
          >
            {event.price === 0 && !event.price_vip ? 'Reservar lugar' : 'Comprar tickets'}
          </button>
        )}
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 border border-[#D7C6B2] px-8 py-4 font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
        >
          Contactar al equipo
        </Link>
      </div>

      {modalOpen && (
        <TicketPurchaseModal
          eventTitle={event.title}
          eventDate={event.date}
          eventCity={event.city}
          eventState={event.state}
          eventPrice={event.price}
          eventPriceVip={event.price_vip}
          vipBenefits={event.vip_benefits}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
