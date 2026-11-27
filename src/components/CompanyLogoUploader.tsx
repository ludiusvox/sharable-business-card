import React, { useRef, useState } from 'react';
import { processLogoFile } from '../utils/image';

interface CompanyLogoUploaderProps {
  logo: string;
  companyName: string;
  onChange: (dataUrl: string) => void;
}

export const CompanyLogoUploader: React.FC<CompanyLogoUploaderProps> = ({
  logo,
  companyName,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await processLogoFile(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process image.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
          Company Logo
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-outline-variant">
          PNG · JPG · SVG
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex items-center justify-between gap-4 rounded-xl p-3.5 transition-colors border ${
          isDragging
            ? 'bg-surface-container border-primary'
            : 'bg-surface-container-low border-outline-variant/30'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
            {logo ? (
              <img
                src={logo}
                alt={companyName ? `${companyName} logo` : 'Company logo preview'}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="material-symbols-outlined text-outline text-[24px]">
                add_photo_alternate
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-on-surface truncate">
              {logo ? 'Company logo attached' : 'Upload company logo'}
            </span>
            <span className="text-xs text-on-surface-variant truncate">
              {logo
                ? 'Displayed on your 3D card & Wallet pass'
                : 'Drag and drop or choose an image file'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
            aria-label="Upload company logo image"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface transition-colors whitespace-nowrap"
          >
            {logo ? 'Replace' : 'Upload'}
          </button>
          {logo && (
            <button
              type="button"
              aria-label="Remove company logo"
              onClick={() => onChange('')}
              className="w-9 h-9 rounded-lg bg-surface-container hover:bg-error-container/40 text-on-surface-variant hover:text-error flex items-center justify-center transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
};
