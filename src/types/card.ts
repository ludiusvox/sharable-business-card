export type AppTab = 'share' | 'card' | 'wallet';

export type RedactableField = 'phone' | 'email' | 'officeAddress' | 'taxId';

export interface CardProfile {
  fullName: string;
  title: string;
  company: string;
  companyLogo: string;
  department: string;
  officeAddress: string;
  taxId: string;
  phone: string;
  email: string;
  linkedinUrl: string;
  websiteUrl: string;
  corporateId: string;
  passSerial: string;
  cardToken: string;
  deviceId: string;
}

export interface BroadcastRules {
  includeCompanyInWallet: boolean;
  quickShareVcard: boolean;
  autoUpdateWallet: boolean;
  lockscreenShortcut: boolean;
  nearbyAutoTrigger: boolean;
  redactedFields: RedactableField[];
}

export type WalletStatus = 'ready' | 'syncing' | 'linked' | 'removed';

export interface WalletSyncState {
  status: WalletStatus;
  lastSyncedLabel: string;
}
