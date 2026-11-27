import { BroadcastRules, CardProfile } from '../types/card';
import { buildShareLink, buildVCardPayload } from './vcard';

export interface GoogleWalletPassObject {
  id: string;
  classId: string;
  logo?: {
    sourceUri: { uri: string };
    contentDescription: { defaultValue: { language: string; value: string } };
  };
  cardTitle: { defaultValue: { language: string; value: string } };
  header: { defaultValue: { language: string; value: string } };
  subheader?: { defaultValue: { language: string; value: string } };
  textModulesData: Array<{ id: string; header: string; body: string }>;
  barcode: {
    type: 'QR_CODE';
    value: string;
    alternateText: string;
  };
  hexBackgroundColor: string;
}

export interface GoogleWalletPassPayload {
  iss?: string;
  aud: string;
  typ: string;
  iat: number;
  payload: {
    genericObjects: GoogleWalletPassObject[];
  };
}

const DEFAULT_ISSUER_ID = '3388000000022149182';

/**
 * Compiles a card profile into a formal Google Wallet Generic Pass JSON structure.
 */
export function buildGoogleWalletPassPayload(
  profile: CardProfile,
  rules: BroadcastRules
): GoogleWalletPassPayload {
  const issuerId = import.meta.env.VITE_GOOGLE_WALLET_ISSUER_ID || DEFAULT_ISSUER_ID;
  const passId = `${issuerId}.${profile.passSerial.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  const classId = `${issuerId}.sovereign_business_card_v1`;

  const vcardPayload = buildVCardPayload(
    profile,
    rules.redactedFields,
    rules.includeCompanyInWallet
  );

  const textModules: Array<{ id: string; header: string; body: string }> = [];

  if (rules.includeCompanyInWallet && profile.company.trim()) {
    textModules.push({
      id: 'company',
      header: 'COMPANY / ORGANIZATION',
      body: profile.company.trim(),
    });
  }

  if (profile.department.trim()) {
    textModules.push({
      id: 'department',
      header: 'DEPARTMENT',
      body: profile.department.trim(),
    });
  }

  if (!rules.redactedFields.includes('email') && profile.email.trim()) {
    textModules.push({
      id: 'email',
      header: 'WORK EMAIL',
      body: profile.email.trim(),
    });
  }

  if (!rules.redactedFields.includes('phone') && profile.phone.trim()) {
    textModules.push({
      id: 'phone',
      header: 'DIRECT PHONE',
      body: profile.phone.trim(),
    });
  }

  if (
    rules.includeCompanyInWallet &&
    !rules.redactedFields.includes('officeAddress') &&
    profile.officeAddress.trim()
  ) {
    textModules.push({
      id: 'office',
      header: 'OFFICE ADDRESS',
      body: profile.officeAddress.trim(),
    });
  }

  textModules.push({
    id: 'share_link',
    header: 'DIGITAL CARD LINK',
    body: buildShareLink(profile),
  });

  const genericObject: GoogleWalletPassObject = {
    id: passId,
    classId: classId,
    cardTitle: {
      defaultValue: {
        language: 'en-US',
        value: profile.company.trim()
          ? `${profile.company.trim().toUpperCase()} ID`
          : 'SOVEREIGN DIGITAL CARD',
      },
    },
    header: {
      defaultValue: {
        language: 'en-US',
        value: profile.fullName.trim() || 'Digital Cardholder',
      },
    },
    subheader: {
      defaultValue: {
        language: 'en-US',
        value: profile.title.trim() || 'Business ID',
      },
    },
    textModulesData: textModules,
    barcode: {
      type: 'QR_CODE',
      value: vcardPayload,
      alternateText: `Pass Serial: ${profile.passSerial}`,
    },
    hexBackgroundColor: '#0b1326',
  };

  if (profile.companyLogo && profile.companyLogo.startsWith('http')) {
    genericObject.logo = {
      sourceUri: { uri: profile.companyLogo },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: profile.company || 'Company Logo',
        },
      },
    };
  }

  return {
    aud: 'google',
    typ: 'savetoandroidpay',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      genericObjects: [genericObject],
    },
  };
}

/**
 * Builds the direct "Save to Google Wallet" link or web intent.
 */
export function buildGoogleWalletSaveUrl(
  profile: CardProfile,
  rules: BroadcastRules
): string {
  const jwt = import.meta.env.VITE_GOOGLE_WALLET_TEST_JWT;
  if (jwt) {
    return `https://pay.google.com/gp/v/save/${jwt}`;
  }

  // Fallback web deep link targeting Google Wallet pass save web service or pass viewer
  const passPayload = buildGoogleWalletPassPayload(profile, rules);
  const jsonStr = JSON.stringify(passPayload);
  const encoded = encodeURIComponent(jsonStr);

  return `https://wallet.google.com/pay/v/save?pass=${encoded}`;
}

/**
 * Downloads the full Google Wallet Generic Pass JSON object file for deployment / API console test.
 */
export function downloadGoogleWalletPassJson(
  profile: CardProfile,
  rules: BroadcastRules
): void {
  const passData = buildGoogleWalletPassPayload(profile, rules);
  const jsonString = JSON.stringify(passData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const safeName = (profile.fullName || 'sovereign-id')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `google-wallet-pass-${safeName || 'card'}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Triggers adding or syncing pass into Google Wallet.
 * Handles web, mobile deep-linking, and Capacitor native launch.
 */
export async function openGoogleWalletPass(
  profile: CardProfile,
  rules: BroadcastRules
): Promise<void> {
  const url = buildGoogleWalletSaveUrl(profile, rules);

  // If Capacitor is present natively on device, use window.open or system location
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
