import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getInitials } from '../data/defaults';
import { CardProfile } from '../types/card';
import { buildVCardPayload } from '../utils/vcard';

interface WalletPassModalProps {
  isOpen: boolean;
  profile: CardProfile;
  includeCompany: boolean;
  onClose: () => void;
  onDownloadVCard: () => void;
}

export const WalletPassModal: React.FC<WalletPassModalProps> = ({
  isOpen,
  profile,
  includeCompany,
  onClose,
  onDownloadVCard,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const vcard = buildVCardPayload(profile, [], includeCompany);
  const monogram = getInitials(profile.company || profile.fullName, 'ID');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Google Wallet Pass View"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wallet Header */}
        <div className="px-5 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center">
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
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Google Wallet Pass
              </span>
              <span className="text-sm font-semibold text-on-surface">
                PassCard Business ID
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close Google Wallet pass"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Pass Body */}
        <div className="p-6 flex flex-col items-center gap-5">
          <div className="w-full flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline truncate">
                {includeCompany && profile.company.trim()
                  ? profile.company.trim()
                  : 'Single Active Credential'}
              </span>
              <span className="font-display text-xl font-bold text-on-surface truncate">
                {profile.fullName.trim()}
              </span>
              <span className="text-xs font-medium text-primary truncate">
                {profile.title.trim()}
              </span>
            </div>
          </div>

          {/* Scannable QR Pass Code */}
          <div className="p-4 rounded-2xl bg-white shadow-inner">
            <QRCodeSVG
              value={vcard}
              size={184}
              bgColor="#ffffff"
              fgColor="#0b1326"
              level="M"
            />
          </div>

          <div className="w-full grid grid-cols-2 gap-3 text-xs bg-surface-container rounded-xl p-3.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                Pass Serial
              </span>
              <span className="font-mono font-semibold text-on-surface tabular-nums mt-0.5">
                {profile.passSerial}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                NFC Protocol
              </span>
              <span className="font-semibold text-secondary mt-0.5">
                ISO 14443 Armed
              </span>
            </div>
          </div>

          <div className="w-full flex items-center gap-3">
            <button
              type="button"
              onClick={onDownloadVCard}
              className="flex-1 h-11 rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary-container text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Save .vcf</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-sm font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
