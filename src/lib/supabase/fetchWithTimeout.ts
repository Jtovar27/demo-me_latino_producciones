/**
 * A fetch wrapper that bounds a Supabase client's TOTAL request time with a shared deadline.
 *
 * WHY: the Supabase JS client has no request timeout, AND it retries failed requests internally.
 * A naive per-request timeout therefore never caps the retry loop — observed locally as a ~7s stall
 * per query (and up to ~21s for a page that issues several) against an unreachable host, which
 * presents the visitor with an "infinite loading" page and risks a platform gateway timeout.
 *
 * The deadline is captured once, when the client factory calls this (i.e. once per request/action),
 * and shared across every fetch that client makes — including retries. Once the deadline passes,
 * further attempts abort immediately, so the whole operation is bounded regardless of how many times
 * the client retries. The read actions already translate the resulting rejection into
 * { data: [], error }, so a Supabase outage degrades to a fast, graceful empty render.
 */
const DEFAULT_TIMEOUT_MS = 6000;

export function fetchWithTimeout(timeoutMs: number = DEFAULT_TIMEOUT_MS): typeof fetch {
  const deadline = Date.now() + timeoutMs;

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const remaining = deadline - Date.now();
    if (remaining <= 0) controller.abort();
    const timer = setTimeout(() => controller.abort(), Math.max(0, remaining));

    // Respect a caller-supplied signal (e.g. supabase .abortSignal()) by chaining it to ours.
    const external = init?.signal;
    if (external) {
      if (external.aborted) controller.abort();
      else external.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
}
