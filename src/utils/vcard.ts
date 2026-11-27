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

export function downloadVCard(
  profile: CardProfile,
  redactedFields: RedactableField[] = [],
  includeCompany = true
): void {
  const vcard = buildVCardPayload(profile, redactedFields, includeCompany);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = (profile.fullName || 'sovereign-id')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName || 'sovereign-id'}.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
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
