import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind CSS classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object into a human-readable string.
 * @example formatDate("2025-03-15") => "March 15, 2025"
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", options);
}

/**
 * Formats a number as USD currency.
 * @example formatCurrency(250) => "$250.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Returns a URL only if it is safe to place in an href/src: an http(s) absolute URL or a
 * site-relative path. Anything else (javascript:, data:, vbscript:, protocol-relative //host,
 * malformed) returns null. Database-sourced URLs (eventbrite_url, ticketplate_url, cta_href,
 * sponsor website) MUST be passed through this before rendering, to prevent stored/DOM XSS.
 * @example safeExternalUrl("javascript:alert(1)") => null
 * @example safeExternalUrl("https://eventbrite.com/e/x") => "https://eventbrite.com/e/x"
 */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Allow site-relative paths, but not protocol-relative //host which is effectively external.
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:" || u.protocol === "tel:") {
      return u.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Converts a string into a URL-friendly slug.
 * @example slugify("The Real Happiness 2025") => "the-real-happiness-2025"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")   // Remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with hyphens
    .replace(/-+/g, "-");           // Collapse consecutive hyphens
}

/**
 * Truncates a string to a given length, appending an ellipsis if needed.
 * @example truncate("A long sentence here", 10) => "A long sen..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
