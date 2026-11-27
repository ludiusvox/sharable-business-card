import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { CardProfile, RedactableField } from '../types/card';

export function isCompanyConfigured(profile: CardProfile): boolean {
  return Boolean(
    profile.company.trim() ||
      profile.department.trim() ||
      profile.officeAddress.trim() ||
      profile.websiteUrl.trim()
  );
}

export function buildVCardPayload(
  profile: CardProfile,
  redactedFields: RedactableField[] = [],
  includeCompany = true
): string {
  const nameParts = profile.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Cardholder';
  const lastName = nameParts.slice(1).join(' ');

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${profile.fullName.trim() || 'Digital Cardholder'}`,
  ];

  if (profile.title.trim()) {
    lines.push(`TITLE:${profile.title.trim()}`);
  }

  if (includeCompany && profile.company.trim()) {
    const dept = profile.department.trim();
    lines.push(dept ? `ORG:${profile.company.trim()};${dept}` : `ORG:${profile.company.trim()}`);
  }

  if (!redactedFields.includes('phone') && profile.phone.trim()) {
    lines.push(`TEL;TYPE=WORK,VOICE:${profile.phone.trim()}`);
  }

  if (!redactedFields.includes('email') && profile.email.trim()) {
    lines.push(`EMAIL;TYPE=WORK,INTERNET:${profile.email.trim()}`);
  }

  if (includeCompany && !redactedFields.includes('officeAddress') && profile.officeAddress.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${profile.officeAddress.trim()};;;;`);
  }

  if (profile.websiteUrl.trim()) {
    lines.push(`URL:${profile.websiteUrl.trim()}`);
  } else if (profile.linkedinUrl.trim()) {
    const url = profile.linkedinUrl.startsWith('http')
      ? profile.linkedinUrl
      : `https://${profile.linkedinUrl}`;
    lines.push(`URL:${url}`);
  }

  const notes: string[] = [`Pass Serial: ${profile.passSerial}`];
  if (includeCompany && !redactedFields.includes('taxId') && profile.taxId.trim()) {
    notes.push(`Reg/Tax ID: ${profile.taxId.trim()}`);
  }
  lines.push(`NOTE:${notes.join(' | ')}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export async function downloadVCard(
  profile: CardProfile,
  redactedFields: RedactableField[] = [],
  includeCompany = true
): Promise<void> {
  const vcard = buildVCardPayload(profile, redactedFields, includeCompany);
  const safeName = (profile.fullName || 'sovereign-id')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const fileName = `${safeName || 'sovereign-id'}.vcf`;

  if (Capacitor.isNativePlatform()) {
    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: vcard,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: `${profile.fullName} — Digital Business Card vCard`,
        text: `Digital business card vCard (.vcf) for ${profile.fullName}`,
        files: [savedFile.uri],
      });
      return;
    } catch (err) {
      console.error('Error sharing/downloading vCard natively:', err);
    }
  }

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Shares vCard (.vcf) file via Android Quick Share / System Share sheet if supported.
 */
export async function shareVCard(
  profile: CardProfile,
  redactedFields: RedactableField[] = [],
  includeCompany = true
): Promise<boolean> {
  const vcard = buildVCardPayload(profile, redactedFields, includeCompany);
  const safeName = (profile.fullName || 'sovereign-id')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const fileName = `${safeName || 'sovereign-id'}.vcf`;

  if (Capacitor.isNativePlatform()) {
    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: vcard,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: `${profile.fullName} — Digital Business Card vCard`,
        text: `Digital business card vCard (.vcf) for ${profile.fullName}`,
        files: [savedFile.uri],
      });
      return true;
    } catch (err) {
      const errMsg = String(err);
      if (errMsg.includes('canceled') || (err as Error)?.name === 'AbortError') {
        return false;
      }
      console.error('Error sharing vCard natively:', err);
    }
  }

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const file = new File([blob], fileName, { type: 'text/vcard' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `${profile.fullName} — Digital Business Card vCard`,
        text: `Digital business card vCard (.vcf) for ${profile.fullName}`,
        files: [file],
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        downloadVCard(profile, redactedFields, includeCompany);
      }
      return false;
    }
  } else if (navigator.share) {
    try {
      await navigator.share({
        title: `${profile.fullName} — Digital Business Card`,
        text: buildShareLink(profile),
        url: buildShareLink(profile),
      });
      return true;
    } catch {
      // ignore
    }
  }

  downloadVCard(profile, redactedFields, includeCompany);
  return false;
}

export function buildShareLink(profile: CardProfile): string {
  if (typeof window === 'undefined') return 'https://sovereign.id/pass';
  const url = new URL(window.location.href);
  url.searchParams.set('pass', profile.passSerial);
  url.searchParams.set('holder', profile.fullName.trim() || 'Cardholder');
  if (profile.company.trim()) {
    url.searchParams.set('org', profile.company.trim());
  } else {
    url.searchParams.delete('org');
  }
  return url.toString();
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
