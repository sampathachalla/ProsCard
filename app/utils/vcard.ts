import { Alert, Platform, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export type VCardContact = {
  name?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  department?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  note?: string;
  photoUrl?: string;
  photoBase64?: string;
  socials?: { label?: string; type?: string; url: string }[];
  vcardDownloadUrl?: string;
};

export function buildVCard(contact: VCardContact): string {
  const parts: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
  const name = contact.name?.trim() || 'Contact';
  parts.push(`FN:${name}`);
  const firstName = contact.firstName?.trim();
  const lastName = contact.lastName?.trim();

  if (lastName || firstName) {
    parts.push(`N:${lastName || ''};${firstName || ''};;;`);
  } else {
    const nameParts = name.split(/\s+/);
    if (nameParts.length > 1) {
      parts.push(`N:${nameParts.slice(1).join(' ')};${nameParts[0]};;;`);
    } else {
      parts.push(`N:${name};;;;`);
    }
  }

  const orgParts = [contact.company?.trim(), contact.department?.trim()].filter(Boolean);
  if (orgParts.length > 0) parts.push(`ORG:${orgParts.join(';')}`);
  if (contact.title?.trim()) parts.push(`TITLE:${contact.title.trim()}`);
  if (contact.email?.trim()) parts.push(`EMAIL;TYPE=INTERNET,WORK:${contact.email.trim()}`);
  if (contact.phone?.trim()) parts.push(`TEL;TYPE=CELL,VOICE:${contact.phone.trim()}`);
  if (contact.website?.trim()) parts.push(`URL:${contact.website.trim()}`);
  if (contact.address?.trim()) parts.push(`ADR;TYPE=WORK:;;${contact.address.trim()};;;;`);

  if (contact.socials && contact.socials.length > 0) {
    for (const social of contact.socials) {
      if (social.url?.trim()) {
        const u = social.url.trim();
        const t = (social.type || social.label || 'other').toLowerCase();
        parts.push(`X-SOCIALPROFILE;type=${t}:${u}`);
      }
    }
  }

  const noteLines: string[] = [];
  if (contact.note?.trim()) noteLines.push(contact.note.trim());
  if (contact.socials && contact.socials.length > 0) {
    noteLines.push('--- Links ---');
    for (const s of contact.socials) {
      if (s.url?.trim()) {
        noteLines.push(`${s.label || s.type || 'Link'}: ${s.url.trim()}`);
      }
    }
  }
  if (noteLines.length > 0) {
    parts.push(`NOTE:${noteLines.join('\\n')}`);
  }

  if (contact.photoBase64?.trim()) {
    const raw = contact.photoBase64.trim().replace(/\s+/g, '');
    parts.push(`PHOTO;ENCODING=b;TYPE=JPEG:${raw}`);
  }

  parts.push('END:VCARD');
  return parts.join('\r\n');
}

async function fetchPhotoAsBase64(photoUrl: string): Promise<string | undefined> {
  try {
    if (photoUrl.startsWith('data:image/')) {
      const commaIndex = photoUrl.indexOf(',');
      if (commaIndex !== -1) {
        return photoUrl.substring(commaIndex + 1);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(photoUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return undefined;

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (res && res.includes(',')) {
          resolve(res.split(',')[1]);
        } else {
          resolve(undefined);
        }
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export async function saveOrShareContact(contact: VCardContact) {
  try {
    let photoBase64 = contact.photoBase64;
    if (!photoBase64 && contact.photoUrl) {
      photoBase64 = await fetchPhotoAsBase64(contact.photoUrl);
    }

    const vcard = buildVCard({ ...contact, photoBase64 });
    const fileName = `${(contact.name || 'contact').replace(/[^a-zA-Z0-9_-]/g, '_')}.vcf`;

    // 1. Web browser: Safari / Chrome
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (contact.vcardDownloadUrl) {
        window.location.href = contact.vcardDownloadUrl;
        return;
      }

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return;
    }

    // 2. Native iOS & Android
    try {
      const file = new File(Paths.cache, fileName);
      await file.write(vcard);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/vcard',
          dialogTitle: `Save ${contact.name || 'Contact'}`,
          UTI: 'public.vcard',
        });
        return;
      }
    } catch {
      // Fallback to React Native Share if native file system or expo-sharing fails
    }

    await Share.share({
      message: vcard,
      title: `${contact.name || 'Contact'} vCard`,
    });
  } catch (error) {
    Alert.alert('Unable to save contact', error instanceof Error ? error.message : 'Please try again.');
  }
}
