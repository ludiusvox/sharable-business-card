export type AppTab = 'share' | 'card';

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
  quickShareVcard: boolean;
  redactedFields: RedactableField[];
}
