/**
 * Generuje slug z tytułu artykułu
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Usuń znaki specjalne
    .replace(/[\s_-]+/g, "-") // Zamień spacje i podkreślenia na myślniki
    .replace(/^-+|-+$/g, ""); // Usuń myślniki na początku i końcu
}

/**
 * Oblicza szacowany czas czytania artykułu w minutach
 * Zakłada ~200 słów na minutę
 */
export function calculateReadingTime(content: string): number {
  // Usuń tagi HTML i policz słowa
  const text = content.replace(/<[^>]*>/g, "").trim();
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words.length / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minuta
}

/**
 * Sanityzuje HTML - usuwa niebezpieczne tagi i atrybuty
 * Używa prostego regex, dla produkcyjnego użycia lepiej użyć DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Podstawowa sanitization - usuwa script, iframe, object, embed
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/on\w+="[^"]*"/gi, ""); // Usuń event handlery

  return sanitized;
}

