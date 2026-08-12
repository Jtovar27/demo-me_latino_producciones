'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Segment-level error boundary. Catches render/runtime errors thrown by any page (e.g. a
 * transient Supabase failure) and shows a graceful, on-brand fallback with a retry — instead
 * of the bare HTTP 500 the app produced before, which read as "the site is broken".
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in Vercel/server logs so real production failures are detectable.
    console.error('[route-error]', error?.digest ?? '', error?.message ?? error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[#FDFAF7] px-6 text-center text-[#2A2421]">
      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-[#A56E52]">
        ME Producciones
      </p>
      <h1 className="font-serif text-3xl font-normal sm:text-4xl">
        Algo salió mal / Something went wrong
      </h1>
      <p className="max-w-md font-sans text-sm leading-relaxed text-[#5B4638]">
        Tuvimos un problema temporal al cargar esta página. Por favor inténtalo de nuevo.
        <br />
        We hit a temporary problem loading this page. Please try again.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 bg-[#2A2421] px-7 py-3.5 font-sans text-xs font-medium uppercase tracking-widest text-[#F7F3EE] transition-colors hover:bg-[#5B4638]"
        >
          Reintentar / Retry
        </button>
        <Link
          href="/"
          className="font-sans text-xs font-medium uppercase tracking-widest text-[#5B4638] underline underline-offset-4 transition-colors hover:text-[#A56E52]"
        >
          Inicio / Home
        </Link>
      </div>
    </main>
  );
}
