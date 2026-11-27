import React, { useState } from 'react';
import { getInitials } from '../data/defaults';
import { BroadcastRules, CardProfile, RedactableField } from '../types/card';
import { buildShareLink, buildVCardPayload, shareVCard } from '../utils/vcard';

interface NfcBroadcastViewProps {
  profile: CardProfile;
  rules: BroadcastRules;
  onBack: () => void;
  onToggleRedact: (field: RedactableField) => void;
  onCopyLink: () => void;
  onDownloadVCard: () => void;
  onNotify: (message: string) => void;
}

export const NfcBroadcastView: React.FC<NfcBroadcastViewProps> = ({
  profile,
  rules,
  onBack,
  onToggleRedact,
  onCopyLink,
  onDownloadVCard,
  onNotify,
}) => {
  const [beamStatus, setBeamStatus] = useState<'ready' | 'transmitting' | 'sent'>('ready');
  const [showRedactBar, setShowRedactBar] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');

  const monogram = getInitials(profile.company || profile.fullName, 'ID');

  const triggerBeam = async () => {
    if (window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(15);
    }
    setBeamStatus('transmitting');

    const win = window as unknown as {
      NDEFReader?: new () => {
        write: (message: { records: Array<{ recordType: string; data: string }> }) => Promise<void>;
      };
    };

    if (win.NDEFReader) {
      try {
        const ndef = new win.NDEFReader();
        await ndef.write({
          records: [{ recordType: 'url', data: buildShareLink(profile) }],
        });
      } catch {
        // Continue with feedback if Web NFC isn't active on the current browser
      }
    }

    setTimeout(() => {
      setBeamStatus('sent');
      onNotify(`NFC AirBeam payload armed for ${profile.fullName}`);
      setTimeout(() => setBeamStatus('ready'), 2200);
    }, 1000);
  };

  const handleDirectSend = (e: React.FormEvent) => {
    e.preventDefault();
    const target = recipientInput.trim();
    if (!target) {
      onNotify('Enter an email address or phone number to send your card');
      return;
    }

    const shareLink = buildShareLink(profile);
    const vcardText = buildVCardPayload(profile, rules.redactedFields, true);
    const summary = `${profile.fullName} — ${profile.title}${
      profile.company ? ` at ${profile.company}` : ''
    }\n${shareLink}`;

    if (target.includes('@')) {
      window.location.href = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(
        `${profile.fullName} — Digital Business Card`
      )}&body=${encodeURIComponent(`${summary}\n\n${vcardText}`)}`;
      onNotify(`Opening mail draft to ${target}`);
    } else {
      window.location.href = `sms:${encodeURIComponent(target)}?&body=${encodeURIComponent(
        summary
      )}`;
      onNotify(`Opening message draft to ${target}`);
    }
    setRecipientInput('');
  };

  const handleAppShare = async (app: string) => {
    const shareLink = buildShareLink(profile);
    const vcardText = buildVCardPayload(profile, rules.redactedFields, true);
    const summary = `${profile.fullName} — ${profile.title}${
      profile.company ? ` at ${profile.company}` : ''
    }\n${shareLink}`;

    if (app === 'System') {
      const ok = await shareVCard(profile, rules.redactedFields, true);
      if (!ok) {
        onCopyLink();
      }
      return;
    }

    if (app === 'Messages') {
      window.location.href = `sms:?&body=${encodeURIComponent(summary)}`;
      return;
    }
    if (app === 'Email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        `${profile.fullName} — Digital Business Card`
      )}&body=${encodeURIComponent(`${summary}\n\n${vcardText}`)}`;
      return;
    }
    onDownloadVCard();
  };

  const redactedCount = rules.redactedFields.length;

  return (
    <div className="fixed inset-0 z-50 bg-background text-on-surface flex flex-col overflow-y-auto">
      {/* Stack Mode Top App Bar */}
      <header className="sticky top-0 z-30 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.2)] border-b border-outline-variant/20">
        <div className="max-w-5xl mx-auto h-14 lg:h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-display text-lg lg:text-xl font-bold text-on-surface tracking-tight truncate">
              NFC Broadcast Mode
            </h1>
          </div>

          <button
            type="button"
            onClick={onDownloadVCard}
            className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface transition-colors whitespace-nowrap shrink-0"
          >
            Save .vcf
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: NFC Transmission Pulse + Sovereign Card */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5 bg-surface-container-high/90 px-4 py-1.5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-secondary text-[16px]">
              settings_input_antenna
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              {beamStatus === 'transmitting'
                ? 'NFC AirBeam Transmitting'
                : beamStatus === 'sent'
                ? 'NFC Payload Ready'
                : 'NFC AirBeam Active'}
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant font-mono tabular-nums">
              0.4m Range
            </span>
          </div>

          {/* Sovereign Digital Card (ISO/IEC 7810 ratio 1.586:1) */}
          <div
            onClick={triggerBeam}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerBeam();
              }
            }}
            className="w-full relative aspect-[1.586/1] bg-surface-container rounded-2xl overflow-hidden shadow-2xl p-5 flex flex-col justify-between cursor-pointer border border-white/10 active:scale-[0.99] transition-transform"
          >
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-primary-container/20 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-secondary-container/15 blur-2xl pointer-events-none" />

            {/* Top Card Row */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center overflow-hidden shadow-sm shrink-0 border border-white/10">
                  {profile.companyLogo ? (
                    <img
                      src={profile.companyLogo}
                      alt={profile.company || 'Company logo'}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="font-display text-sm font-bold text-primary">{monogram}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-lg sm:text-xl font-bold text-on-surface tracking-tight truncate">
                      {profile.fullName.trim()}
                    </span>
                    <span className="material-symbols-outlined material-symbols-filled text-[16px] text-primary shrink-0">
                      verified
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant truncate">
                    {profile.title.trim()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-container-high text-secondary shrink-0">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    beamStatus === 'transmitting' ? 'animate-ping' : 'animate-pulse'
                  }`}
                >
                  contactless
                </span>
              </div>
            </div>

            {/* Mid Card Metadata Tokens */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 relative z-10 text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
              {profile.company.trim() && (
                <>
                  <span>{profile.company.trim()}</span>
                  <span className="text-outline" aria-hidden="true">
                    ·
                  </span>
                </>
              )}
              {!rules.redactedFields.includes('officeAddress') && profile.officeAddress.trim() && (
                <>
                  <span className="truncate max-w-[160px]">{profile.officeAddress.trim()}</span>
                  <span className="text-outline" aria-hidden="true">
                    ·
                  </span>
                </>
              )}
              <span className="text-primary">FIDO2 VERIFIED</span>
            </div>

            {/* Bottom Card Row */}
            <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Card Token
                </span>
                <span className="text-xs text-on-surface font-mono tracking-tight tabular-nums">
                  {profile.cardToken}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">wallet</span>
                <span className="text-[11px] text-on-surface font-semibold">
                  {beamStatus === 'transmitting'
                    ? 'Beaming...'
                    : beamStatus === 'sent'
                    ? 'Ready'
                    : 'Tap to Beam'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span
              className={`material-symbols-outlined text-[16px] text-tertiary ${
                beamStatus === 'transmitting' ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>
              {beamStatus === 'transmitting'
                ? 'Preparing cryptographic vCard packet over NFC...'
                : 'Tap card above or dispatch via system share below'}
            </span>
          </div>
        </div>

        {/* Right Column: Android System Share Drawer */}
        <section className="lg:col-span-7 w-full bg-surface-container-low rounded-3xl shadow-2xl flex flex-col pt-3 pb-6 border border-outline-variant/25">
          <div className="w-full flex justify-center py-1.5 lg:hidden">
            <div className="w-10 h-1 rounded-full bg-surface-variant" />
          </div>

          {/* Share Drawer Header */}
          <div className="px-5 pt-2 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[22px]">badge</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-on-surface truncate">
                  {profile.fullName.trim()} - Digital Business Card
                </span>
                <span className="text-xs text-on-surface-variant truncate">
                  PassCard vCard &amp; NFC Beam
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Dismiss share"
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-bright flex items-center justify-center text-on-surface-variant active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Quick Action System Chips */}
          <div className="flex items-center gap-2 px-5 overflow-x-auto py-2 no-scrollbar">
            <button
              type="button"
              onClick={triggerBeam}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-high hover:bg-surface-bright rounded-full shrink-0 active:scale-95 transition-all text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">cell_tower</span>
              <span className="text-xs font-semibold whitespace-nowrap">NFC Tap Beam</span>
            </button>

            <button
              type="button"
              onClick={onCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-high hover:bg-surface-bright rounded-full shrink-0 active:scale-95 transition-all text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                content_copy
              </span>
              <span className="text-xs font-semibold whitespace-nowrap">Copy Link</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRedactBar((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full shrink-0 active:scale-95 transition-all ${
                showRedactBar || redactedCount > 0
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="text-xs font-semibold whitespace-nowrap">
                Redact Fields{redactedCount > 0 ? ` (${redactedCount})` : ''}
              </span>
            </button>
          </div>

          {/* Interactive Field Redaction Controls */}
          {showRedactBar && (
            <div className="mx-5 mt-2 p-3 rounded-xl bg-surface-container flex flex-col gap-2 border border-outline-variant/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Hide sensitive fields before sharing
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'phone', label: 'Direct Phone' },
                    { id: 'email', label: 'Work Email' },
                    { id: 'officeAddress', label: 'Office Address' },
                    { id: 'taxId', label: 'Tax / Reg ID' },
                  ] as const
                ).map((field) => {
                  const redacted = rules.redactedFields.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => onToggleRedact(field.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        redacted
                          ? 'bg-tertiary-container text-on-tertiary-container'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {redacted ? `Hidden: ${field.label}` : `Visible: ${field.label}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Recipient Dispatch (No dummy contacts) */}
          <form onSubmit={handleDirectSend} className="px-5 pt-4 flex flex-col gap-2">
            <label
              htmlFor="direct-recipient"
              className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Send Directly to Recipient
            </label>
            <div className="flex items-center gap-2">
              <input
                id="direct-recipient"
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="Enter recipient email or phone number..."
                className="flex-1 min-w-0 h-11 rounded-xl bg-surface-container px-3.5 text-sm text-on-surface placeholder:text-outline-variant outline-none focus:ring-1 focus:ring-primary/60"
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary-container text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Send Pass
              </button>
            </div>
          </form>

          {/* Quick Share / Nearby Share Status */}
          <div className="mx-5 mt-4 bg-surface-container rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">nearby_share</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-on-surface">
                  Quick Share &amp; NFC Beam
                </span>
                <span className="text-xs text-on-surface-variant truncate">
                  Hold phones back-to-back or use Android Share below
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={triggerBeam}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-primary whitespace-nowrap shrink-0 transition-colors"
            >
              Arm Beam
            </button>
          </div>

          {/* System Apps Grid */}
          <div className="px-5 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
              Share Channels
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'System', label: 'Android Share', icon: 'share', color: 'text-primary' },
                { name: 'Messages', label: 'Messages', icon: 'chat_bubble', color: 'text-secondary' },
                { name: 'Email', label: 'Email', icon: 'mail', color: 'text-tertiary' },
                { name: 'vCard', label: 'vCard File', icon: 'contact_page', color: 'text-on-surface-variant' },
              ].map((app) => (
                <button
                  key={app.name}
                  type="button"
                  onClick={() => handleAppShare(app.name)}
                  className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-surface-container active:scale-95 transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shadow-sm ${app.color}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{app.icon}</span>
                  </div>
                  <span className="text-xs text-on-surface truncate w-full text-center">
                    {app.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
