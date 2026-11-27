/**
 * Reads an uploaded logo image file and scales it to a lightweight data URL
 * suitable for crisp display on cards and safe localStorage persistence.
 */
export function processLogoFile(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (PNG, JPG, SVG, or WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const rawResult = typeof reader.result === 'string' ? reader.result : '';
      if (!rawResult) {
        reject(new Error('Image file was empty.'));
        return;
      }

      // Preserve crisp SVG directly if reasonably sized
      if (file.type === 'image/svg+xml' && rawResult.length < 120_000) {
        resolve(rawResult);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported or corrupted image file.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Preserve transparency with PNG for logos
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        resolve(dataUrl);
      };
      img.src = rawResult;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generates a clean, high-resolution Pass/Card photo snapshot PNG image
 * suitable for saving to device photo gallery / screenshot wallet apps.
 */
export function downloadPassScreenshot(profile: CardProfile, rules: BroadcastRules): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGrad.addColorStop(0, '#0b1326');
  bgGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Card container box
  ctx.fillStyle = '#111c38';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 40;
  ctx.roundRect(90, 200, 900, 1150, 48);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Header badge
  ctx.fillStyle = '#34A853';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('GOOGLE WALLET PHOTO PASS', 150, 290);

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText(profile.fullName || 'Cardholder', 150, 410);

  // Title & Company
  ctx.fillStyle = '#93c5fd';
  ctx.font = '36px sans-serif';
  ctx.fillText(profile.title || 'Digital Business ID', 150, 485);

  if (rules.includeCompanyInWallet && profile.company) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '32px sans-serif';
    ctx.fillText(profile.company, 150, 545);
  }

  // Details
  let y = 670;
  const addDetail = (label: string, val: string) => {
    if (!val) return;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(label.toUpperCase(), 150, y);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '28px sans-serif';
    ctx.fillText(val, 150, y + 38);
    y += 110;
  };

  if (!rules.redactedFields.includes('email') && profile.email) {
    addDetail('Email', profile.email);
  }
  if (!rules.redactedFields.includes('phone') && profile.phone) {
    addDetail('Phone', profile.phone);
  }
  if (profile.department) {
    addDetail('Department', profile.department);
  }

  // Footer / Serial
  ctx.fillStyle = '#64748b';
  ctx.font = '22px monospace';
  ctx.fillText(`Pass Serial: ${profile.passSerial}`, 150, 1580);
  ctx.fillText(`Secure Digital Identity — Sovereign ID`, 150, 1630);

  // Download image
  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = `pass-screenshot-${(profile.fullName || 'card').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
