import { Alert, Platform, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Contact } from '../types/contact.types';
import {
  buildContactsCsv,
  buildContactsListHtml,
  safeExportFileName,
  type ContactExportContext,
  type ContactExportFormat,
  type ContactExportScope,
} from '../Utils/contactExport';

async function shareTextFile(contents: string, fileName: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return;
  }

  const file = new File(Paths.cache, fileName);
  await file.write(contents);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: 'Export contacts' });
    return;
  }
  await Share.share({ message: contents, title: fileName });
}

export async function exportContactList(options: {
  contacts: Contact[];
  format: ContactExportFormat;
  scope: ContactExportScope;
  context: Omit<ContactExportContext, 'scope'>;
}): Promise<void> {
  const { contacts, format, scope, context } = options;
  if (contacts.length === 0) {
    Alert.alert('Nothing to export', 'Choose contacts or adjust filters, then try again.');
    return;
  }

  const exportContext: ContactExportContext = { ...context, scope, exportedAt: new Date() };
  const fileName = safeExportFileName(scope, format, context.eventName);

  try {
    if (format === 'csv') {
      const csv = buildContactsCsv(contacts);
      await shareTextFile(csv, fileName, 'text/csv;charset=utf-8');
      return;
    }

    const html = buildContactsListHtml(contacts, exportContext);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        await shareTextFile(html, fileName.replace('.pdf', '.html'), 'text/html;charset=utf-8');
      }
      return;
    }

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export contact list', UTI: 'com.adobe.pdf' });
      return;
    }
    await Share.share({ url: uri, title: fileName });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.';
    Alert.alert('Export failed', message);
  }
}
