import React, { useState } from 'react';
import { getInitials } from '../data/defaults';
import { CardProfile } from '../types/card';
import { CompanyLogoUploader } from './CompanyLogoUploader';

interface BootSetupScreenProps {
  initialProfile: CardProfile;
  onComplete: (profile: CardProfile) => void;
}

export const BootSetupScreen: React.FC<BootSetupScreenProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [draft, setDraft] = useState<CardProfile>(initialProfile);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const updateField = <K extends keyof CardProfile>(key: K, value: CardProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.fullName.trim()) {
      setValidationError('Please enter your full name to initialize your digital card.');
      return;
    }
    if (!draft.title.trim()) {
      setValidationError('Please enter your job title before continuing.');
      return;
    }

    setIsInitializing(true);
    setTimeout(() => {
      onComplete({
        ...draft,
        fullName: draft.fullName.trim(),
        title: draft.title.trim(),
        company: draft.company.trim(),
        phone: draft.phone.trim(),
        officeAddress: draft.officeAddress.trim(),
        email: draft.email.trim(),
      });
    }, 450);
  };

  const monogram = getInitials(draft.company || draft.fullName, 'ID');

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Minimal Boot Header */}
      <header className="sticky top-0 z-30 pt-safe bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto h-14 lg:h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">contactless</span>
            </div>
            <span className="font-display text-lg font-extrabold text-on-surface tracking-tight whitespace-nowrap">
              Sovereign ID
            </span>
          </div>
          <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
            Initial Card Setup
          </span>
        </div>
      </header>

      {/* Main Boot Setup Workspace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="mb-6 lg:mb-8 max-w-2xl">
          <h1
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Set up your personal business card
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
            Enter your real credentials once to generate your single active digital card, scannable QR code, and Google Wallet pass. Every field can be updated anytime in Card Details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Live Card Preview assembling in real time */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Live Card Preview
              </span>
              <span className="text-[11px] font-mono text-primary tabular-nums">
                {draft.passSerial}
              </span>
            </div>

            <div
              className="relative w-full rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest shadow-2xl overflow-hidden flex flex-col justify-between border border-white/10"
              style={{ aspectRatio: '1.586 / 1' }}
            >
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary-container/15 blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none" />

              {/* Top Row: Company Logo + Company Name */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center overflow-hidden shadow-inner shrink-0 border border-white/10">
                    {draft.companyLogo ? (
                      <img
                        src={draft.companyLogo}
                        alt={draft.company || 'Company logo'}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="font-display text-sm font-bold text-primary">
                        {monogram}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline truncate">
                      {draft.company.trim() || 'Your Company'}
                    </span>
                    <span className="text-[11px] font-semibold text-on-surface-variant tracking-tight">
                      Single Active Pass
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">
                  contactless
                </span>
              </div>

              {/* Middle: Name & Job Title */}
              <div className="relative z-10 my-auto flex flex-col min-w-0">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface tracking-tight leading-tight truncate">
                  {draft.fullName.trim() || 'Your Full Name'}
                </h2>
                <p className="text-xs sm:text-sm text-secondary font-medium truncate mt-0.5">
                  {draft.title.trim() || 'Your Job Title'}
                </p>
              </div>

              {/* Bottom: Contact & Address summary */}
              <div className="relative z-10 flex items-end justify-between gap-3 pt-2.5 border-t border-white/10">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[9px] font-bold text-outline uppercase tracking-widest">
                    Office &amp; Contact
                  </span>
                  <span className="text-xs text-on-surface-variant truncate max-w-[200px] sm:max-w-[240px]">
                    {draft.officeAddress.trim() ||
                      draft.email.trim() ||
                      draft.phone.trim() ||
                      'Contact details appear here'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-[9px] font-bold text-outline uppercase tracking-widest">
                    Corporate ID
                  </span>
                  <span className="text-[11px] font-bold text-primary font-mono tabular-nums">
                    {draft.corporateId}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Contact Matrix Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-0.5 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-outline">
                  Email
                </span>
                <span className="text-xs font-mono text-on-surface truncate">
                  {draft.email.trim() || '—'}
                </span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-0.5 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-outline">
                  Phone
                </span>
                <span className="text-xs font-mono tabular-nums text-on-surface truncate">
                  {draft.phone.trim() || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Personal Information & Company Boot Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-surface-container rounded-2xl p-5 sm:p-6 shadow-xl border border-outline-variant/25 flex flex-col gap-5"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
                Personal &amp; Company Information
              </h2>
            </div>

            {/* 1. Company Logo */}
            <CompanyLogoUploader
              logo={draft.companyLogo}
              companyName={draft.company}
              onChange={(dataUrl) => updateField('companyLogo', dataUrl)}
            />

            {/* 2. Name & 3. Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="boot-full-name"
                  className="text-[10px] font-bold uppercase tracking-widest text-outline"
                >
                  Full Name <span className="text-secondary">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container-high focus-within:ring-1 focus-within:ring-primary/60 transition-all">
                  <input
                    id="boot-full-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={draft.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                  />
                  <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                    person
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="boot-job-title"
                  className="text-[10px] font-bold uppercase tracking-widest text-outline"
                >
                  Job Title <span className="text-secondary">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container-high focus-within:ring-1 focus-within:ring-primary/60 transition-all">
                  <input
                    id="boot-job-title"
                    type="text"
                    required
                    value={draft.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter your job title"
                    className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                  />
                  <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                    work
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Company */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="boot-company"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Company
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container-high focus-within:ring-1 focus-within:ring-primary/60 transition-all">
                <input
                  id="boot-company"
                  type="text"
                  autoComplete="organization"
                  value={draft.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Enter your company or organization"
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                  domain
                </span>
              </div>
            </div>

            {/* 5. Phone Number & 6. Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="boot-phone"
                  className="text-[10px] font-bold uppercase tracking-widest text-outline"
                >
                  Phone Number
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container-high focus-within:ring-1 focus-within:ring-primary/60 transition-all">
                  <input
                    id="boot-phone"
                    type="tel"
                    autoComplete="tel"
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
                  htmlFor="boot-email"
                  className="text-[10px] font-bold uppercase tracking-widest text-outline"
                >
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container-high focus-within:ring-1 focus-within:ring-primary/60 transition-all">
                  <input
                    id="boot-email"
                    type="email"
                    autoComplete="email"
                    value={draft.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Enter work email address"
                    className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                  />
                  <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                    mail
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Office Address */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="boot-address"
                className="text-[10px] font-bold uppercase tracking-widest text-outline"
              >
                Office Address
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 focus-within:bg-surface-container-high focus-within:ring-1 focus-within:ring-primary/60 transition-all">
                <input
                  id="boot-address"
                  type="text"
                  autoComplete="street-address"
                  value={draft.officeAddress}
                  onChange={(e) => updateField('officeAddress', e.target.value)}
                  placeholder="Street address, city, postal code"
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none"
                />
                <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
                  pin_drop
                </span>
              </div>
            </div>

            {validationError && (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl bg-error-container/40 text-on-error-container text-xs font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{validationError}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isInitializing}
                className="w-full h-12 rounded-xl bg-primary-container hover:bg-inverse-primary disabled:opacity-75 text-on-primary-container text-sm font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all"
              >
                {isInitializing ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">
                      refresh
                    </span>
                    <span>Creating Your Card...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Create &amp; Load My Card</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-outline">
                Stored locally on your device · Editable anytime from the Card tab
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
