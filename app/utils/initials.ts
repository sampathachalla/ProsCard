/** First letter of up to two whitespace-separated name parts (e.g. "Sampath Kambhampati" → "SK"). */
export function getInitials(name?: string | null): string {
  if (!name?.trim()) return '?';

  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || '?'
  );
}
