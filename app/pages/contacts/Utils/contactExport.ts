import type { Contact } from '../types/contact.types';
import { resolveCaptureKind } from './contactFilters';

export type ContactExportScope = 'filtered' | 'all' | 'selected';

export type ContactExportFormat = 'csv' | 'pdf';

export type ContactExportContext = {
  scope: ContactExportScope;
  /** Active event filter, if any — shown on PDF/CSV header. */
  eventName?: string;
  /** Human-readable filter summary for the export header. */
  filterSummary?: string;
  exportedAt?: Date;
};

const CSV_COLUMNS = [
  'Name',
  'Title',
  'Company',
  'Email',
  'Phone',
  'Website',
  'Address',
  'Event',
  'Notes',
  'Source',
  'Added',
] as const;

function escapeCsvCell(value: string): string {
  const text = value.replace(/\r?\n/g, ' ').trim();
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function formatCaptureKind(contact: Contact): string {
  const kind = resolveCaptureKind(contact);
  switch (kind) {
    case 'badge':
      return 'Event badge';
    case 'business_card':
      return 'Business card';
    case 'qr':
      return 'QR scan';
    default:
      return 'Manual';
  }
}

function formatAdded(contact: Contact): string {
  if (!contact.createdAt) return '';
  const ms = Date.parse(contact.createdAt);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toISOString().slice(0, 10);
}

export function contactToExportRow(contact: Contact): string[] {
  return [
    contact.name,
    contact.title,
    contact.company,
    contact.email ?? '',
    contact.phone ?? '',
    contact.website ?? '',
    contact.address ?? '',
    contact.eventName ?? '',
    contact.notes ?? '',
    formatCaptureKind(contact),
    formatAdded(contact),
  ];
}

export function buildContactsCsv(contacts: Contact[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = contacts.map((contact) => contactToExportRow(contact).map(escapeCsvCell).join(','));
  return [header, ...rows].join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildContactsListHtml(contacts: Contact[], context: ContactExportContext): string {
  const exportedAt = (context.exportedAt ?? new Date()).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const titleParts = ['VC Pros — Contact list'];
  if (context.eventName?.trim()) titleParts.push(context.eventName.trim());
  const title = titleParts.join(' · ');

  const metaLines = [
    `Exported ${exportedAt}`,
    `${contacts.length} contact${contacts.length === 1 ? '' : 's'}`,
  ];
  if (context.filterSummary?.trim()) metaLines.push(context.filterSummary.trim());

  const tableRows = contacts
    .map((contact) => {
      const cells = contactToExportRow(contact)
        .map((cell) => `<td>${escapeHtml(cell || '—')}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const headerCells = CSV_COLUMNS.map((col) => `<th>${escapeHtml(col)}</th>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; background: #f1f5f9; padding: 8px 6px; border-bottom: 2px solid #cbd5e1; }
    td { padding: 7px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">${metaLines.map(escapeHtml).join('<br/>')}</div>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${tableRows || '<tr><td colspan="11">No contacts</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}

export function resolveExportContacts(
  scope: ContactExportScope,
  options: {
    all: Contact[];
    filtered: Contact[];
    selectedIds: Set<string>;
  },
): Contact[] {
  switch (scope) {
    case 'all':
      return [...options.all];
    case 'selected':
      return options.all.filter((contact) => options.selectedIds.has(contact.id));
    case 'filtered':
    default:
      return [...options.filtered];
  }
}

export function buildFilterSummary(options: {
  query: string;
  eventName: string;
  source: string;
  recent: string;
  filtersActive: boolean;
}): string | undefined {
  if (!options.filtersActive) return undefined;
  const parts: string[] = [];
  if (options.eventName.trim()) parts.push(`Event: ${options.eventName.trim()}`);
  if (options.query.trim()) parts.push(`Search: “${options.query.trim()}”`);
  if (options.source !== 'all') parts.push(`Type: ${options.source}`);
  if (options.recent !== 'all') parts.push(`Recency: ${options.recent}`);
  return parts.length ? parts.join(' · ') : 'Filtered list';
}

export function safeExportFileName(scope: ContactExportScope, format: ContactExportFormat, eventName?: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const eventSlug = eventName?.trim()
    ? `-${eventName.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}`
    : '';
  const scopeSlug = scope === 'all' ? 'all' : scope === 'selected' ? 'selected' : 'filtered';
  return `vcpros-contacts-${scopeSlug}${eventSlug}-${stamp}.${format === 'csv' ? 'csv' : 'pdf'}`;
}
