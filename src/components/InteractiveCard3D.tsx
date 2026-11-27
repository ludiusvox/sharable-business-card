import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getInitials } from '../data/defaults';
import { CardProfile, RedactableField } from '../types/card';
import { buildVCardPayload, isCompanyConfigured } from '../utils/vcard';

interface InteractiveCard3DProps {
  profile: CardProfile;
  redactedFields?: RedactableField[];
  includeCompany?: boolean;
  onEditCard?: () => void;
  onCopyVCard?: () => void;
}

export const InteractiveCard3D: React.FC<InteractiveCard3DProps> = ({
  profile,
  redactedFields = [],
  includeCompany = true,
  onEditCard,
  onCopyVCard,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 0, sy: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const companySet = isCompanyConfigured(profile);
  const vcardPayload = buildVCardPayload(profile, redactedFields, includeCompany);
  const monogram = getInitials(profile.company || profile.fullName, 'ID');

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isFlipped || !cardRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -9;
    const ry = ((x - cx) / cx) * 9;
    setTilt({ rx, ry, sx: ry * 4, sy: rx * 4 });
  };

  const resetTilt = () => {
    setTilt({ rx: 0, ry: 0, sx: 0, sy: 0 });
  };

  return (
    <section className="relative w-full" style={{ perspective: '1100px' }}>
      <div
        ref={cardRef}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseLeave={resetTilt}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={resetTilt}
        onClick={() => setIsFlipped((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Flip card back to front credential view' : 'Flip card to reveal scannable QR code'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }}
        className="relative w-full cursor-pointer select-none transition-transform duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
        style={{
          aspectRatio: '1.586 / 1',
          transformStyle: 'preserve-3d',
          transform: isFlipped
            ? 'rotateY(180deg)'
            : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        }}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 rounded-2xl p-5 sm:p-6 bg-surface-container-high shadow-2xl overflow-hidden flex flex-col justify-between border border-white/10"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Specular metallic gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-primary/5 to-transparent pointer-events-none" />
          <div
            className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none opacity-45 transition-transform duration-100 ease-linear"
            style={{ transform: `translate(${tilt.sx}%, ${tilt.sy}%)` }}
          />

          {/* Top Layer: Company Logo / Chip & NFC Node */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {profile.companyLogo ? (
                <div className="w-11 h-11 rounded-xl bg-surface-container-lowest/90 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                  <img
                    src={profile.companyLogo}
                    alt={profile.company || 'Company logo'}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-surface-container-lowest/80 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="font-display text-xs font-bold text-primary">{monogram}</span>
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest leading-none">
                  Cryptographic Pass
                </span>
                <span className="text-xs text-on-surface font-semibold tracking-tight mt-0.5 truncate">
                  {profile.company.trim() || 'SOVEREIGN CORE'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container-lowest/85 px-2.5 py-1 rounded-lg backdrop-blur-md shrink-0">
              <span className="material-symbols-outlined text-[15px] text-tertiary">contactless</span>
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">
                NFC Emit
              </span>
            </div>
          </div>

          {/* Card Body: Holder, Title & Company/Department */}
          <div className="relative z-10 my-auto flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-[21px] sm:text-[24px] font-bold text-on-surface tracking-tight truncate">
                {profile.fullName.trim()}
              </span>
              <span
                className="material-symbols-outlined material-symbols-filled text-primary text-[18px] shrink-0"
                title="Verified Credential"
              >
                verified
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
              <span className="text-secondary font-medium tracking-wide truncate max-w-[220px] sm:max-w-none">
                {profile.title.trim()}
              </span>
              {companySet && (profile.company.trim() || profile.department.trim()) && (
                <>
                  <span className="text-outline" aria-hidden="true">
                    /
                  </span>
                  <span className="text-on-surface-variant font-medium tracking-wide truncate">
                    {profile.department.trim() || profile.company.trim()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom Strip: Office Address & Corporate ID */}
          <div className="relative z-10 flex items-end justify-between gap-4 pt-2 border-t border-white/5">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest">
                Office Address
              </span>
              <span className="text-xs text-on-surface-variant/90 truncate max-w-[190px] sm:max-w-[260px]">
                {profile.officeAddress.trim() || 'Not specified'}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="text-[9px] font-bold text-outline uppercase tracking-widest">
                Corporate ID
              </span>
              <span className="text-[11px] font-bold text-primary font-mono tabular-nums tracking-wider">
                {profile.corporateId}
              </span>
            </div>
          </div>
        </div>

        {/* BACK FACE: LIVE SCANNABLE QR CODE */}
        <div
          className="absolute inset-0 rounded-2xl p-5 sm:p-6 bg-surface-container-lowest shadow-2xl overflow-hidden flex items-center justify-between gap-4 border border-primary/25"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-col justify-between h-full min-w-0 flex-1">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                vCard 3.0 · Offline QR
              </span>
              <h3 className="font-display text-lg font-bold text-on-surface mt-1 truncate">
                {profile.fullName.trim()}
              </h3>
              <p className="text-xs text-on-surface-variant truncate">
                {profile.email.trim() || profile.phone.trim() || profile.title.trim()}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-outline tabular-nums">
                SERIAL · {profile.passSerial}
              </span>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {onCopyVCard && (
                  <button
                    type="button"
                    onClick={onCopyVCard}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface transition-colors whitespace-nowrap"
                  >
                    Save vCard
                  </button>
                )}
                {onEditCard && (
                  <button
                    type="button"
                    onClick={onEditCard}
                    className="px-3 py-1.5 rounded-lg bg-primary-container/80 hover:bg-primary-container text-xs font-semibold text-on-primary-container transition-colors whitespace-nowrap"
                  >
                    Edit Info
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            className="p-2.5 rounded-xl bg-white shadow-lg shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeSVG
              value={vcardPayload}
              size={112}
              bgColor="#ffffff"
              fgColor="#0b1326"
              level="M"
            />
          </div>
        </div>
      </div>

      {/* Interactive Hint */}
      <div className="flex items-center justify-center gap-2 mt-2.5 text-outline">
        <span className="material-symbols-outlined text-[15px]">touch_app</span>
        <span className="text-[10px] font-bold tracking-wider uppercase">
          Interactive 3D preview · Tilt to inspect · Tap card to flip QR
        </span>
      </div>
    </section>
  );
};
