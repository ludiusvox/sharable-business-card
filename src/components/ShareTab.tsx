import React, { useState } from 'react';
import { BroadcastRules, CardProfile } from '../types/card';
import { isCompanyConfigured } from '../utils/vcard';
import { InteractiveCard3D } from './InteractiveCard3D';

interface ShareTabProps {
  profile: CardProfile;
  rules: BroadcastRules;
  onEditCard: () => void;
  onOpenShareSheet: () => void;
  onOpenNfcBeam: () => void;
  onCopyText: (text: string, label: string) => void;
  onDownloadVCard: () => void;
}

export const ShareTab: React.FC<ShareTabProps> = ({
  profile,
  rules,
  onEditCard,
  onOpenShareSheet,
  onOpenNfcBeam,
  onCopyText,
  onDownloadVCard,
}) => {
  const [nfcLocalState, setNfcLocalState] = useState<'idle' | 'beaming'>('idle');
  const companyConfigured = isCompanyConfigured(profile);

  const handleNfcClick = () => {
    setNfcLocalState('beaming');
    setTimeout(() => {
      setNfcLocalState('idle');
      onOpenNfcBeam();
    }, 450);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Status Notification Bar */}
      <div className="flex items-center justify-between gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
          <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
            Single Card Active
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-lg">
          <span className="material-symbols-outlined material-symbols-filled text-[14px] text-primary">
            devices
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant font-mono tabular-nums">
            {profile.deviceId}·SECURE
          </span>
        </div>
      </div>

      {/* Desktop 2-Column Workspace / Mobile Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Interactive 3D Credential Card */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <InteractiveCard3D
            profile={profile}
            redactedFields={rules.redactedFields}
            includeCompany={true}
            onEditCard={onEditCard}
            onCopyVCard={() => onDownloadVCard()}
          />

          {/* Quick desktop info strip under card */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Pass Serial
              </span>
              <span className="text-sm font-mono font-semibold text-on-surface tabular-nums">
                {profile.passSerial}
              </span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Share Format
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {rules.quickShareVcard ? 'vCard 4.0 + Link' : 'Direct URL Only'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Card Parameter Matrix & Main System Actions */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Card Parameter Matrix */}
          <section className="bg-surface-container-low rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                <h2 className="text-sm font-semibold text-on-surface">
                  Card Parameter Matrix
                </h2>
              </div>
              <button
                type="button"
                onClick={onEditCard}
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  companyConfigured
                    ? 'text-primary bg-primary-container/25 hover:bg-primary-container/40'
                    : 'text-tertiary bg-tertiary-container/30 hover:bg-tertiary-container/50'
                }`}
              >
                {companyConfigured ? 'Configured · Edit' : 'Unconfigured · Setup'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onCopyText(profile.email, 'Work Email')}
                className="bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex flex-col justify-center text-left transition-colors min-w-0"
                title="Copy work email"
              >
                <span className="text-[9px] font-bold text-outline uppercase tracking-wider">
                  Work Email
                </span>
                <span className="text-xs text-on-surface truncate font-mono mt-0.5">
                  {profile.email.trim() || 'Not set'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onCopyText(profile.phone, 'Direct Line')}
                className="bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex flex-col justify-center text-left transition-colors min-w-0"
                title="Copy direct phone"
              >
                <span className="text-[9px] font-bold text-outline uppercase tracking-wider">
                  Direct Line
                </span>
                <span className="text-xs text-on-surface truncate font-mono tabular-nums mt-0.5">
                  {profile.phone.trim() || 'Not set'}
                </span>
              </button>
            </div>
          </section>

          {/* Main System Actions */}
          <section className="flex flex-col gap-3">
            {/* Primary Android System Share Trigger */}
            <button
              type="button"
              onClick={onOpenShareSheet}
              className="w-full min-h-[56px] bg-primary-container hover:bg-inverse-primary active:scale-[0.98] transition-all rounded-xl flex items-center justify-between px-5 py-3 shadow-lg group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                    share
                  </span>
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-sm text-on-primary-container font-bold leading-tight truncate">
                    Share via Android Share
                  </span>
                  <span className="text-[11px] text-on-primary-container/80 font-normal truncate">
                    Nearby Share · vCard File · Direct Link
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-primary-container text-[22px] shrink-0">
                send_to_mobile
              </span>
            </button>

            {/* Secondary NFC Direct Interaction Node */}
            <button
              type="button"
              onClick={handleNfcClick}
              className="w-full min-h-[52px] bg-surface-container hover:bg-surface-bright active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2.5 px-4 text-on-surface"
            >
              {nfcLocalState === 'beaming' ? (
                <>
                  <span className="material-symbols-outlined text-tertiary text-[22px] animate-spin">
                    autorenew
                  </span>
                  <span className="text-sm font-semibold text-tertiary">
                    Arming NFC AirBeam...
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-secondary text-[22px]">nfc</span>
                  <span className="text-sm font-semibold tracking-wide">
                    Tap to Share via NFC Beam
                  </span>
                </>
              )}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
