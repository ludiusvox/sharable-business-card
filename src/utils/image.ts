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
