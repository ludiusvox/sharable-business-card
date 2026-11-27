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
 * Checks if a live signed Google Wallet JWT or custom save URL is configured in env variables.
 */
export function hasSignedGoogleWalletJwt(): boolean {
  return Boolean(
    import.meta.env.VITE_GOOGLE_WALLET_JWT ||
      import.meta.env.VITE_GOOGLE_WALLET_TEST_JWT ||
      import.meta.env.VITE_GOOGLE_WALLET_SAVE_URL
  );
}

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
 * Triggers adding or syncing pass into Google Wallet safely without 404 errors.
 */
export async function openGoogleWalletPass(
  profile: CardProfile,
  rules: BroadcastRules,
  onNotify?: (msg: string) => void
): Promise<{ success: boolean; mode: 'jwt_redirect' | 'download_json' }> {
  const jwt =
    import.meta.env.VITE_GOOGLE_WALLET_JWT || import.meta.env.VITE_GOOGLE_WALLET_TEST_JWT;
  const saveUrl = import.meta.env.VITE_GOOGLE_WALLET_SAVE_URL;

  if (saveUrl || jwt) {
    const targetUrl = saveUrl || `https://pay.google.com/gp/v/save/${jwt}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (onNotify) onNotify('Opening Google Wallet save gateway...');
    return { success: true, mode: 'jwt_redirect' };
  }

  // If no signed JWT is configured in environment, export the pass JSON payload to prevent 404 error
  downloadGoogleWalletPassJson(profile, rules);
  if (onNotify) {
    onNotify(
      'Exported Google Wallet Pass JSON! Scan the pass QR code or import JSON into Google Pay & Wallet Console.'
    );
  }
  return { success: true, mode: 'download_json' };
}
