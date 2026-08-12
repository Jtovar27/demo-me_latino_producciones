import Link from 'next/link';

/**
 * Custom 404. Prevents an unstyled default not-found page and gives visitors a clear way back.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[#FDFAF7] px-6 text-center text-[#2A2421]">
      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-[#A56E52]">
        Error 404
      </p>
      <h1 className="font-serif text-3xl font-normal sm:text-4xl">
        Página no encontrada / Page not found
      </h1>
      <p className="max-w-md font-sans text-sm leading-relaxed text-[#5B4638]">
        La página que buscas no existe o fue movida.
        <br />
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 bg-[#2A2421] px-7 py-3.5 font-sans text-xs font-medium uppercase tracking-widest text-[#F7F3EE] transition-colors hover:bg-[#5B4638]"
      >
        Volver al inicio / Back home
      </Link>
    </main>
  );
}
