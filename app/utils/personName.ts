/** Capitalize each displayed name segment without altering the stored spelling. */
export function formatPersonName(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(^|[\s\-’'])([^\s\-’'])/gu, (_, boundary: string, character: string) =>
      `${boundary}${character.toLocaleUpperCase()}`,
    );
}
