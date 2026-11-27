import React from 'react';
import { getInitials } from '../data/defaults';
import { BroadcastRules, CardProfile, WalletSyncState } from '../types/card';

interface WalletSyncTabProps {
  profile: CardProfile;
  rules: BroadcastRules;
  walletState: WalletSyncState;
  onToggleRule: (key: 'autoUpdateWallet' | 'lockscreenShortcut' | 'nearbyAutoTrigger') => void;
  onSyncNow: () => void;
  onOpenWalletModal: () => void;
  onRemoveFromWallet: () => void;
  onDownloadVCard: () => void;
}

export const WalletSyncTab: React.FC<WalletSyncTabProps> = ({
  profile,
  rules,
  walletState,
  onToggleRule,
  onSyncNow,
  onOpenWalletModal,
  onRemoveFromWallet,
  onDownloadVCard,
}) => {
  const organizationDisplay =
    rules.includeCompanyInWallet && profile.company.trim()
      ? profile.company.trim()
      : 'Single Active Credential';

  const isRemoved = walletState.status === 'removed';
  const isSyncing = walletState.status === 'syncing';
  const monogram = getInitials(profile.company || profile.fullName, 'ID');

  return (
    <div className="flex flex-col gap-6">
      {/* Notice Banner: Restriction Anchor */}
      <div className="p-4 rounded-2xl bg-surface-container-low shadow-sm flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Single Active Credential
          </span>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            1 Device, 1 Pass: Google Wallet is restricted to syncing your single active business card on this Android handset.
          </p>
        </div>
      </div>

      {/* Desktop 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Pass Visualizer + Native Integration Status */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Pass Visualizer
            </span>
            <span className="text-[11px] font-semibold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">contactless</span>
              <span>{isRemoved ? 'Wallet Disconnected' : 'NFC Live Ready'}</span>
            </span>
          </div>

          {/* Google Wallet Pass Mockup (Standard ISO Ratio 1.586:1) */}
          <div
            className={`relative w-full rounded-2xl bg-gradient-to-br from-surface-container-highest via-surface-container-high to-surface-container-lowest p-5 sm:p-6 flex flex-col justify-between shadow-xl overflow-hidden select-none border border-white/10 transition-opacity ${
              isRemoved ? 'opacity-60' : 'opacity-100'
            }`}
            style={{ aspectRatio: '1.586 / 1' }}
          >
            <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-36 h-36 rounded-full bg-secondary/10 blur-xl pointer-events-none" />

            {/* Pass Header */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-surface-container-lowest flex items-center justify-center shadow-inner shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                      fill="#dae2fd"
                    />
                    <path
                      d="M18 12C16.8954 12 16 12.8954 16 14C16 15.1046 16.8954 16 18 16C19.1046 16 20 15.1046 20 14C20 12.8954 19.1046 12 18 12Z"
                      fill="#4f46e5"
                    />
                    <path
                      d="M4 7V5C4 3.89543 4.89543 3 6 3H18"
                      stroke="#c7c4d8"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline leading-tight">
                    Google Wallet
                  </span>
                  <span className="text-sm text-on-surface font-semibold tracking-tight truncate">
                    PassCard Business ID
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-surface-container-lowest/85 px-2.5 py-1 rounded-md shrink-0">
                <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.05 4.05a10 10 0 0 1 9.9 0l-1.07 1.7a8 8 0 0 0-7.76 0L7.05 4.05zm2.14 3.39a6 6 0 0 1 5.62 0l-1.08 1.7a4 4 0 0 0-3.46 0L9.19 7.44zM12 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
                </svg>
                <span className="text-[10px] tracking-widest text-secondary font-bold">
                  NFC PASS
                </span>
              </div>
            </div>

            {/* Pass Center: Cryptographic Identification Nodes */}
            <div className="relative z-10 flex items-center justify-between gap-3 my-auto">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-white/10">
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                    Organization Node
                  </span>
                  <span className="text-sm text-on-surface-variant font-medium truncate">
                    {organizationDisplay}
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-md bg-surface-container-lowest/70 flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary hidden sm:inline">
                  Cryptographically Signed
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary sm:hidden">
                  Signed
                </span>
              </div>
            </div>

            {/* Pass Footer */}
            <div className="relative z-10 flex items-end justify-between gap-3 pt-1">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Cardholder
                </span>
                <span className="font-display text-lg sm:text-[22px] font-bold text-on-surface tracking-tight leading-none mt-0.5 truncate">
                  {profile.fullName.trim()}
                </span>
                <span className="text-[11px] font-semibold text-primary mt-1 truncate">
                  {profile.title.trim()}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Pass Serial
                </span>
                <span className="text-[11px] font-mono tabular-nums text-on-surface-variant tracking-wider">
                  {profile.passSerial}
                </span>
              </div>
            </div>
          </div>

          {/* Android Native Integration Status Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">nfc</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">NFC Target</span>
              </div>
              <span className="text-sm text-on-surface font-semibold">Active &amp; Armed</span>
              <span className="text-xs text-outline">Type A/B ISO 14443</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  phonelink_lock
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Keystore Node
                </span>
              </div>
              <span className="text-sm text-on-surface font-semibold">Hardware Backed</span>
              <span className="text-xs text-outline">StrongBox Enclave</span>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet Management & Quick Share Protocol */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Google Wallet Status & Direct Management Card */}
          <section className="rounded-2xl bg-surface-container p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`material-symbols-outlined text-[22px] shrink-0 ${
                    isRemoved
                      ? 'text-error'
                      : isSyncing
                      ? 'text-secondary'
                      : 'text-emerald-400'
                  }`}
                >
                  {isRemoved ? 'link_off' : isSyncing ? 'sync' : 'check_circle'}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-on-surface truncate">
                    {isRemoved
                      ? 'Disconnected from Google Wallet'
                      : isSyncing
                      ? 'Syncing with Google Wallet...'
                      : walletState.status === 'linked'
                      ? 'Connected to Google Wallet'
                      : 'Ready for Google Wallet Sync'}
                  </span>
                  <span className="text-xs text-on-surface-variant truncate">
                    {walletState.lastSyncedLabel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Sync Google Wallet pass now"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="w-11 h-11 rounded-xl bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-primary transition-colors shrink-0"
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                >
                  sync
                </span>
              </button>
            </div>

            {/* Sync Controls */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-high">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-on-surface font-medium leading-snug">
                    Auto-update Pass when Card Details change
                  </span>
                  <span className="text-xs text-on-surface-variant mt-0.5">
                    Direct push to Google Play Services background worker
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={rules.autoUpdateWallet}
                  onClick={() => onToggleRule('autoUpdateWallet')}
                  className={`w-12 h-6 rounded-full p-0.5 flex items-center shrink-0 transition-colors cursor-pointer ${
                    rules.autoUpdateWallet
                      ? 'bg-primary-container justify-end'
                      : 'bg-surface-variant justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-on-primary shadow-sm transition-transform duration-200" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-high">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-on-surface font-medium leading-snug">
                    Allow tap-to-share from Wallet lockscreen shortcut
                  </span>
                  <span className="text-xs text-on-surface-variant mt-0.5">
                    Instant NFC payload transmit without unlocking device
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={rules.lockscreenShortcut}
                  onClick={() => onToggleRule('lockscreenShortcut')}
                  className={`w-12 h-6 rounded-full p-0.5 flex items-center shrink-0 transition-colors cursor-pointer ${
                    rules.lockscreenShortcut
                      ? 'bg-primary-container justify-end'
                      : 'bg-surface-variant justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-on-primary shadow-sm transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={isRemoved ? onSyncNow : onOpenWalletModal}
                className="w-full h-11 rounded-xl bg-on-surface text-surface hover:opacity-90 flex items-center justify-center gap-2 text-sm font-semibold shadow-md active:scale-[0.99] transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" />
                  <path
                    d="M18 12C16.8954 12 16 12.8954 16 14C16 15.1046 16.8954 16 18 16C19.1046 16 20 15.1046 20 14C20 12.8954 19.1046 12 18 12Z"
                    fill="#171f33"
                  />
                </svg>
                <span>{isRemoved ? 'Reconnect to Google Wallet' : 'Open Google Wallet'}</span>
              </button>

              {!isRemoved && (
                <button
                  type="button"
                  onClick={onRemoveFromWallet}
                  className="w-full min-h-[44px] py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-error hover:text-on-error-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Remove from Google Wallet</span>
                </button>
              )}
            </div>
          </section>

          {/* Android Share Integration Section */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Android System Broadcast
              </span>
              <h2 className="font-display text-xl font-bold text-on-surface mt-0.5">
                Quick Share Protocol
              </h2>
            </div>

            <div className="rounded-2xl bg-surface-container p-4 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Default Share Payload
                </span>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  Direct Beam
                </span>
              </div>

              <button
                type="button"
                onClick={onDownloadVCard}
                className="p-3 rounded-xl bg-surface-container-high hover:bg-surface-bright flex items-center gap-3.5 text-left transition-colors"
                title="Download .vcf contact card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-[22px]">
                    contact_page
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm text-on-surface font-semibold truncate">
                    Digital Card link + .vcf Contact Card
                  </span>
                  <span className="text-xs text-on-surface-variant truncate">
                    Universal bundle with real-time web profile endpoint
                  </span>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  download
                </span>
              </button>

              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-high">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      nearby
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-on-surface font-medium leading-snug">
                      Nearby Share / Quick Share automatic trigger
                    </span>
                    <span className="text-xs text-on-surface-variant mt-0.5">
                      Broadcast on physical back-to-back phone tap
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={rules.nearbyAutoTrigger}
                  onClick={() => onToggleRule('nearbyAutoTrigger')}
                  className={`w-12 h-6 rounded-full p-0.5 flex items-center shrink-0 transition-colors cursor-pointer ${
                    rules.nearbyAutoTrigger
                      ? 'bg-primary-container justify-end'
                      : 'bg-surface-variant justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-on-primary shadow-sm transition-transform duration-200" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
