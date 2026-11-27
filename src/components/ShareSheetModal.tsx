import React, { useEffect } from 'react';
import { CardProfile } from '../types/card';

interface ShareSheetModalProps {
  isOpen: boolean;
  profile: CardProfile;
  onClose: () => void;
  onTriggerNearbyShare: () => void;
  onDownloadVCard: () => void;
  onCopyLink: () => void;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({
  isOpen,
  profile,
  onClose,
  onTriggerNearbyShare,
  onDownloadVCard,
  onCopyLink,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end lg:items-center lg:justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Android Fast Exchange Share Sheet"
    >
      <div
        className="w-full lg:max-w-lg bg-surface-container-low rounded-t-3xl lg:rounded-2xl p-6 flex flex-col gap-5 shadow-2xl border-t lg:border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-outline/40 rounded-full mx-auto lg:hidden" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <h2 className="font-display text-xl font-bold text-on-surface truncate">
              Android Fast Exchange
            </h2>
            <p className="text-xs text-on-surface-variant truncate">
              Instant transmission protocols for {profile.fullName || 'Cardholder'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close share sheet"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-bright flex items-center justify-center text-on-surface transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 3 Transmission Protocol Cards */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onTriggerNearbyShare();
            }}
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-high p-4 rounded-xl hover:bg-surface-variant active:scale-[0.98] transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">tap_and_play</span>
            </div>
            <span className="text-xs font-semibold text-on-surface text-center">
              Nearby Share
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDownloadVCard();
              onClose();
            }}
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-high p-4 rounded-xl hover:bg-surface-variant active:scale-[0.98] transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <span className="text-xs font-semibold text-on-surface text-center">
              vCard File
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCopyLink();
              onClose();
            }}
            className="flex flex-col items-center justify-center gap-2 bg-surface-container-high p-4 rounded-xl hover:bg-surface-variant active:scale-[0.98] transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">link</span>
            </div>
            <span className="text-xs font-semibold text-on-surface text-center">
              Direct Link
            </span>
          </button>
        </div>

        {/* Device Proximity Indicator */}
        <div className="flex items-center gap-3 bg-surface-container px-4 py-3 rounded-xl">
          <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">
            radar
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-on-surface">
              Broadcasting Device Pulse
            </span>
            <span className="text-xs text-on-surface-variant">
              Hold back-to-back with recipient phone or choose Nearby Share
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
