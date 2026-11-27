import { BroadcastRules, CardProfile } from '../types/card';

function generateCardIdentifiers() {
  const num4 = Math.floor(1000 + Math.random() * 9000);
  const num3 = Math.floor(100 + Math.random() * 900);
  const num5 = Math.floor(10000 + Math.random() * 90000);
  const suffix = Math.random().toString(36).substring(2, 4).toUpperCase();
  return {
    corporateId: `ID-${num4}-${num3}`,
    passSerial: `SOV-${num4}-${suffix}`,
    cardToken: `id-${num4}-sec`,
    deviceId: `DEV-${num5}`,
  };
}

export function createEmptyProfile(): CardProfile {
  const ids = generateCardIdentifiers();
  return {
    fullName: '',
    title: '',
    company: '',
    companyLogo: '',
    department: '',
    officeAddress: '',
    taxId: '',
    phone: '',
    email: '',
    linkedinUrl: '',
    websiteUrl: '',
    ...ids,
  };
}

export const DEFAULT_RULES: BroadcastRules = {
  quickShareVcard: true,
  redactedFields: [],
};

export function getInitials(name: string, fallback = 'ID'): string {
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
