'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary that catches errors thrown by the ROOT layout itself (which the
 * segment-level error.tsx cannot catch). It must render its own <html>/<body>. Without this,
 * a failure in the root layout produced a completely blank page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error?.digest ?? '', error?.message ?? error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          background: '#FDFAF7',
          color: '#2A2421',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <p style={{ letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: 11, color: '#A56E52', margin: 0 }}>
          ME Producciones
        </p>
        <h1 style={{ fontWeight: 400, fontSize: '2rem', margin: 0 }}>
          Algo salió mal / Something went wrong
        </h1>
        <p style={{ maxWidth: 420, fontSize: 14, lineHeight: 1.6, color: '#5B4638', margin: 0 }}>
          Por favor inténtalo de nuevo. / Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: '#2A2421',
            color: '#F7F3EE',
            border: 'none',
            padding: '0.9rem 1.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Reintentar / Retry
        </button>
      </body>
    </html>
  );
}
