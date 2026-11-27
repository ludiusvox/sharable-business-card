import React, { useEffect, useRef, useState } from 'react';
import { AppTab } from '../types/card';

interface TopBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenNfcBroadcast: () => void;
  onDownloadVCard: () => void;
  onCopyShareLink: () => void;
  onResetSetup: () => void;
}

const TAB_TITLES: Record<AppTab, string> = {
  share: 'Preview And Share',
  card: 'Card Details',
  wallet: 'Wallet Sync',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNfcBroadcast,
  onDownloadVCard,
  onCopyShareLink,
  onResetSetup,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.22)] border-b border-outline-variant/20">
      <div className="max-w-6xl mx-auto h-14 lg:h-16 px-4 lg:px-8 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand / Mobile Screen Title */}
        <button
          type="button"
          onClick={() => onSelectTab('share')}
          className="flex items-center gap-2.5 text-left shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">contactless</span>
          </div>
          <div className="flex flex-col lg:hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline leading-none">
              Sovereign ID
            </span>
            <span className="font-display text-[19px] font-bold text-on-surface tracking-tight leading-tight">
              {TAB_TITLES[activeTab]}
            </span>
          </div>
          <span className="hidden lg:inline font-display text-lg font-extrabold text-on-surface tracking-tight whitespace-nowrap shrink-0">
            Sovereign ID
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectTab('share')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'share'
                ? 'text-primary border-primary font-semibold'
                : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            Preview &amp; Share
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('card')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'card'
                ? 'text-primary border-primary font-semibold'
                : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            Card Details
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('wallet')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'wallet'
                ? 'text-primary border-primary font-semibold'
                : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            Wallet Sync
          </button>
          <button
            type="button"
            onClick={onDownloadVCard}
            className="py-1 text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition-colors whitespace-nowrap shrink-0"
          >
            Export vCard
          </button>
        </nav>

        {/* Zone 3: Primary Action + Mobile Overflow / Profile */}
        <div className="flex items-center gap-1.5 shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={onOpenNfcBroadcast}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container text-xs font-semibold transition-colors whitespace-nowrap shrink-0 shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">nfc</span>
            <span>NFC Broadcast</span>
          </button>

          <div className="relative">
            <button
              aria-label="Card Settings and Overflow Menu"
              aria-expanded={menuOpen}
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">more_vert</span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-xl bg-surface-container-high border border-outline-variant/40 shadow-2xl py-1.5 z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDownloadVCard();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-surface-bright flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">download</span>
                  <span>Export vCard (.vcf)</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onCopyShareLink();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-surface-bright flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">content_copy</span>
                  <span>Copy Share Link</span>
                </button>
                <div className="my-1 border-t border-outline-variant/30" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onResetSetup();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-error-container/30 flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  <span>Reset &amp; Re-run Setup</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Edit Card Identity"
            onClick={() => onSelectTab('card')}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity lg:hidden"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
