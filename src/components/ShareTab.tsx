import React, { useState } from 'react';
import { BroadcastRules, CardProfile, WalletSyncState } from '../types/card';
import { isCompanyConfigured } from '../utils/vcard';
import { InteractiveCard3D } from './InteractiveCard3D';

interface ShareTabProps {
  profile: CardProfile;
  rules: BroadcastRules;
  walletState: WalletSyncState;
  onEditCard: () => void;
  onOpenShareSheet: () => void;
  onOpenNfcBeam: () => void;
  onSyncWallet: () => void;
  onOpenWalletModal: () => void;
  onCopyText: (text: string, label: string) => void;
  onDownloadVCard: () => void;
}

export const ShareTab: React.FC<ShareTabProps> = ({
  profile,
  rules,
  walletState,
  onEditCard,
  onOpenShareSheet,
  onOpenNfcBeam,
  onSyncWallet,
  onOpenWalletModal,
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

  const handleWalletClick = () => {
    onOpenWalletModal();
  };

  const walletStatusLabel =
    walletState.status === 'syncing'
      ? 'Syncing...'
      : walletState.status === 'linked'
      ? 'Pass Linked'
      : walletState.status === 'removed'
      ? 'Re-Link Pass'
      : 'Ready to Sync';

  const walletStatusColor =
    walletState.status === 'syncing'
      ? 'text-secondary'
      : walletState.status === 'linked'
      ? 'text-emerald-400'
      : walletState.status === 'removed'
      ? 'text-error'
      : 'text-primary';

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
            includeCompany={rules.includeCompanyInWallet}
            onEditCard={onEditCard}
            onCopyVCard={() => onDownloadVCard()}
          />

          {/* Quick desktop info strip under card */}
          <div className="hidden lg:grid grid-cols-3 gap-3">
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
            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Wallet Sync
              </span>
              <span className={`text-sm font-semibold ${walletStatusColor}`}>
                {walletStatusLabel}
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

            {/* Google Wallet Branded Integration Button */}
            <div className="flex items-center justify-between gap-2 bg-black rounded-xl p-2 shadow-md border border-white/10">
              <button
                type="button"
                onClick={handleWalletClick}
                className="flex-1 min-h-[44px] flex items-center gap-3 py-1.5 px-2.5 hover:opacity-90 active:scale-[0.99] transition-transform text-left min-w-0"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-container-high/60 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M19.5 8.5H4.5C3.39543 8.5 2.5 9.39543 2.5 10.5V17.5C2.5 18.6046 3.39543 19.5 4.5 19.5H19.5C20.6046 19.5 21.5 18.6046 21.5 17.5V10.5C21.5 9.39543 20.6046 8.5 19.5 8.5Z"
                      fill="#34A853"
                    />
                    <path
                      d="M4.5 4.5H19.5C20.6046 4.5 21.5 5.39543 21.5 6.5V8.5H2.5V6.5C2.5 5.39543 3.39543 4.5 4.5 4.5Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M17.5 15C18.0523 15 18.5 14.5523 18.5 14C18.5 13.4477 18.0523 13 17.5 13C16.9477 13 16.5 13.4477 16.5 14C16.5 14.5523 16.9477 15 17.5 15Z"
                      fill="#FBBC05"
                    />
                    <path d="M2.5 11.5H21.5V13.5H2.5V11.5Z" fill="#EA4335" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-white font-semibold leading-tight truncate">
                    {walletState.status === 'linked'
                      ? 'Open Google Wallet Pass'
                      : 'Add to Google Wallet'}
                  </span>
                  <span className="text-[11px] text-white/60 truncate">
                    Offline access &amp; quick tile
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleWalletClick}
                className={`shrink-0 px-3 py-1.5 rounded-lg bg-surface-container-high/90 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${walletStatusColor}`}
              >
                {walletStatusLabel}
              </button>
            </div>

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
