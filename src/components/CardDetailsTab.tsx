import React, { useEffect, useState } from 'react';
import { getInitials } from '../data/defaults';
import { BroadcastRules, CardProfile } from '../types/card';
import { isCompanyConfigured } from '../utils/vcard';
import { CompanyLogoUploader } from './CompanyLogoUploader';

interface CardDetailsTabProps {
  profile: CardProfile;
  rules: BroadcastRules;
  onSave: (nextProfile: CardProfile, nextRules: BroadcastRules) => void;
}

export const CardDetailsTab: React.FC<CardDetailsTabProps> = ({
  profile,
  rules,
  onSave,
}) => {
  const [draft, setDraft] = useState<CardProfile>(profile);
  const [draftRules, setDraftRules] = useState<BroadcastRules>(rules);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setDraft(profile);
    setDraftRules(rules);
    setIsModified(false);
  }, [profile, rules]);

  const updateField = <K extends keyof CardProfile>(key: K, value: CardProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setIsModified(true);
  };

  const toggleRule = (key: 'includeCompanyInWallet' | 'quickShareVcard') => {
    setDraftRules((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsModified(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(draft, draftRules);
      setIsSaving(false);
      setIsModified(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }, 450);
  };

  const companyConfigured = isCompanyConfigured(draft);
  const monogram = getInitials(draft.company || draft.fullName, 'ID');

  return (
    <div className="flex flex-col gap-5">
      {/* Status & Architecture Banner */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">shield_person</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            Device Card Profile (1 of 1 allowed)
          </span>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-md bg-surface-container-high text-primary tracking-wider uppercase font-bold whitespace-nowrap">
          Single Pass
        </span>
      </div>

      {/* Desktop 2-Column Split: Sticky Live Preview + Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Realtime Minimal Card Preview Canvas */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
          <div
            className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest p-5 sm:p-6 shadow-xl border border-white/10"
            style={{ aspectRatio: '1.586 / 1' }}
          >
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary-container/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shadow-sm overflow-hidden shrink-0 border border-white/10">
                    {draft.companyLogo ? (
                      <img
                        src={draft.companyLogo}
                        alt={draft.company || 'Company logo'}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="font-display text-xs font-bold text-primary">
                        {monogram}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider truncate">
                      {draft.company.trim()
                        ? draft.company.trim().toUpperCase()
                        : 'UNASSIGNED ENTITY'}
                    </span>
                    <span className="text-[10px] text-tertiary font-bold tracking-widest uppercase">
                      Verified Node
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined material-symbols-filled text-outline text-[20px] shrink-0">
                  contactless
                </span>
              </div>

              {/* Middle / Main Identity */}
              <div className="flex flex-col mt-auto mb-2 min-w-0">
                <h2 className="font-display text-xl sm:text-[22px] font-bold text-on-surface tracking-tight leading-none mb-1 truncate">
                  {draft.fullName.trim() || 'Full Name'}
                </h2>
                <p className="text-sm text-on-surface-variant truncate">
                  {draft.title.trim() || 'Job Title'}
                </p>
              </div>

              {/* Bottom Metadata Row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-outline min-w-0">
                  <span className="material-symbols-outlined text-[14px] shrink-0">
                    format_image_left
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                    NFC Cryptographic Ledger
                  </span>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest shrink-0 ${
                    isModified ? 'text-secondary' : 'text-primary'
                  }`}
                >
                  {isModified ? 'Modified' : 'In Sync'}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-2 bg-surface-container-low rounded-2xl p-4 text-xs text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Live Sync Policy
            </span>
            <p className="leading-relaxed">
              Changes made here update your 3D Share Card, Android NFC Beam payload, vCard export, and Google Wallet Pass simultaneously.
            </p>
          </div>
        </div>

        {/* Right Column: Configuration Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 flex flex-col gap-8">
          {/* Section 1: Personal Information */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
                1. Personal Information
              </h3>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="full-name"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Full Legal &amp; Display Name
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="full-name"
                  type="text"
                  autoComplete="name"
                  value={draft.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                  edit
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="prof-title"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Job Title
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="prof-title"
                  type="text"
                  value={draft.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter your job title"
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                  badge
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Company & Organization */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">domain</span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
                  2. Company &amp; Organization
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  companyConfigured ? 'text-primary' : 'text-outline'
                }`}
              >
                {companyConfigured ? 'Configured' : 'Unconfigured'}
              </span>
            </div>

            {/* Company Logo Uploader */}
            <CompanyLogoUploader
              logo={draft.companyLogo}
              companyName={draft.company}
              onChange={(dataUrl) => updateField('companyLogo', dataUrl)}
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="company-name"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Company / Organization
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="company-name"
                  type="text"
                  value={draft.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Enter registered enterprise or startup name..."
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline-variant text-[18px] shrink-0">
                  business_center
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dept-division"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Department / Division
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="dept-division"
                  type="text"
                  value={draft.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  placeholder="Enter department or division..."
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline-variant text-[18px] shrink-0">
                  schema
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="corporate-address"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Corporate Office Address
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="corporate-address"
                  type="text"
                  value={draft.officeAddress}
                  onChange={(e) => updateField('officeAddress', e.target.value)}
                  placeholder="Street Address, City, Postal Code, Country..."
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline-variant text-[18px] shrink-0">
                  pin_drop
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="tax-id"
                  className="text-[10px] font-bold uppercase tracking-widest text-outline"
                >
                  Company Registration / Tax ID
                </label>
                <span className="text-[10px] font-bold text-outline-variant uppercase">
                  Optional
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="tax-id"
                  type="text"
                  value={draft.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  placeholder="EIN, VAT, UID or Registration Code..."
                  className="w-full bg-transparent text-sm font-mono text-on-surface placeholder:font-body placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline-variant text-[18px] shrink-0">
                  policy
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: Contact & Direct Touchpoints */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px]">
                alternate_email
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
                3. Contact &amp; Direct Touchpoints
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone-number"
                  className="text-[10px] font-bold uppercase tracking-widest text-outline"
                >
                  Direct Phone
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                  <input
                    id="phone-number"
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="Enter direct phone number"
                    className="w-full bg-transparent text-sm font-mono text-on-surface placeholder:font-body placeholder:text-outline-variant outline-none"
                  />
                  <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                    call
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="work-email"
                  className="text-[10px] font-bold uppercase tracking-widest text-outline"
                >
                  Work Email
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                  <input
                    id="work-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                  />
                  <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                    mail
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="linkedin-url"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                LinkedIn Profile URL
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="linkedin-url"
                  type="text"
                  value={draft.linkedinUrl}
                  onChange={(e) => updateField('linkedinUrl', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                  link
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="website-url"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Company Website
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <input
                  id="website-url"
                  type="url"
                  value={draft.websiteUrl}
                  onChange={(e) => updateField('websiteUrl', e.target.value)}
                  placeholder="https://company-domain.com"
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline-variant text-[18px] shrink-0">
                  language
                </span>
              </div>
            </div>
          </section>

          {/* Toggle Configuration Hub */}
          <section className="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Broadcast &amp; Synchronization Rules
            </span>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-on-surface">
                  Include Company Info in Wallet Pass
                </span>
                <span className="text-xs text-on-surface-variant">
                  Inject company entity into Google Wallet credential metadata
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draftRules.includeCompanyInWallet}
                onClick={() => toggleRule('includeCompanyInWallet')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary ${
                  draftRules.includeCompanyInWallet ? 'bg-primary-container' : 'bg-surface-variant'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full shadow transition duration-200 mt-0.5 ${
                    draftRules.includeCompanyInWallet
                      ? 'translate-x-5 bg-on-primary'
                      : 'translate-x-0.5 bg-outline-variant'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-on-surface">
                  Android Quick Share vCard Format
                </span>
                <span className="text-xs text-on-surface-variant">
                  Standardized vCard 4.0 packet over Nearby Share broadcast
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draftRules.quickShareVcard}
                onClick={() => toggleRule('quickShareVcard')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary ${
                  draftRules.quickShareVcard ? 'bg-primary-container' : 'bg-surface-variant'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full shadow transition duration-200 mt-0.5 ${
                    draftRules.quickShareVcard
                      ? 'translate-x-5 bg-on-primary'
                      : 'translate-x-0.5 bg-outline-variant'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Save & Update Action */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 rounded-xl bg-primary-container hover:bg-inverse-primary disabled:opacity-70 text-on-primary-container text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    refresh
                  </span>
                  <span>Compiling Pass Payload...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                  <span>Save &amp; Update Wallet Pass</span>
                </>
              )}
            </button>

            {showToast && (
              <div
                role="status"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-container text-on-surface text-xs"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span>Local profile synced. Wallet payload recompiled.</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
