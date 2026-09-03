import piexif from 'piexifjs';

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  base64: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as Data URL'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

export function readOrientation(dataUrl: string): number {
  try {
    const exif = piexif.load(dataUrl);
    const zeroth = exif['0th'] as Record<number, unknown> | undefined;
    if (zeroth && zeroth[piexif.ImageIFD.Orientation]) {
      return Number(zeroth[piexif.ImageIFD.Orientation]);
    }
    return 1;
  } catch {
    return 1;
  }
}

function drawCorrectedCover(
  dataUrl: string,
  targetW: number,
  targetH: number,
  orientation: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const rotate90 = orientation >= 5 && orientation <= 8;
      canvas.width = rotate90 ? targetH : targetW;
      canvas.height = rotate90 ? targetW : targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to create canvas 2D context'));
        return;
      }

      // Handle EXIF orientation transform
      switch (orientation) {
        case 2:
          ctx.setTransform(-1, 0, 0, 1, targetW, 0);
          break;
        case 3:
          ctx.setTransform(-1, 0, 0, -1, targetW, targetH);
          break;
        case 4:
          ctx.setTransform(1, 0, 0, -1, 0, targetH);
          break;
        case 5:
          ctx.setTransform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.setTransform(0, 1, -1, 0, targetH, 0);
          break;
        case 7:
          ctx.setTransform(0, -1, -1, 0, targetH, targetW);
          break;
        case 8:
          ctx.setTransform(0, -1, 1, 0, 0, targetW);
          break;
        default:
          ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      // Calculate cover crop to fit exactly targetW x targetH without stretching
      const imgRatio = img.width / img.height;
      const targetRatio = targetW / targetH;

      let drawW: number;
      let drawH: number;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        // Image is wider than 3:4 target
        drawH = targetH;
        drawW = img.width * (targetH / img.height);
        offsetX = (targetW - drawW) / 2;
      } else {
        // Image is taller than or equal to 3:4 target
        drawW = targetW;
        drawH = img.height * (targetW / img.width);
        offsetY = (targetH - drawH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => reject(new Error('Failed to load image into canvas'));
    img.src = dataUrl;
  });
}

function buildMetaExif(sourceDataUrl: string): piexif.ExifDict {
  let exif: piexif.ExifDict;
  try {
    exif = piexif.load(sourceDataUrl);
  } catch {
    exif = {
      '0th': {},
      Exif: {},
      GPS: {},
      '1st': {},
      thumbnail: undefined,
      Interop: {}
    };
  }

  if (!exif['0th']) exif['0th'] = {};
  if (!exif.Exif) exif.Exif = {};
  exif.GPS = {};

  const zeroth = exif['0th'] as Record<number, unknown>;
  const exifSection = exif.Exif as Record<number, unknown>;

  // Clean unwanted markers
  delete zeroth[piexif.ImageIFD.Software];
  delete zeroth[piexif.ImageIFD.HostComputer];
  delete exifSection[piexif.ExifIFD.MakerNote];
  delete exifSection[piexif.ExifIFD.LensMake];
  delete exifSection[piexif.ExifIFD.LensModel];
  delete exifSection[piexif.ExifIFD.LensSpecification];

  // Set Ray-Ban Meta identity
  zeroth[piexif.ImageIFD.Make] = 'Meta AI';
  zeroth[piexif.ImageIFD.Model] = 'Ray-Ban Meta Smart Glasses 2';
  zeroth[piexif.ImageIFD.Orientation] = 1;
  exifSection[piexif.ExifIFD.ColorSpace] = 1;
  exifSection[piexif.ExifIFD.PixelXDimension] = 3024;
  exifSection[piexif.ExifIFD.PixelYDimension] = 4032;

  return exif;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

export async function processImage(file: File): Promise<ProcessedImageResult> {
  const TARGET_W = 3024;
  const TARGET_H = 4032;

  // 1. Read source data URL
  const sourceDataUrl = await fileToDataUrl(file);

  // 2. Read existing orientation
  const orientation = readOrientation(sourceDataUrl);

  // 3. Draw corrected canvas at 3024x4032
  const correctedDataUrl = await drawCorrectedCover(
    sourceDataUrl,
    TARGET_W,
    TARGET_H,
    orientation
  );

  // 4. Build Meta EXIF
  const exif = buildMetaExif(sourceDataUrl);
  const exifBytes = piexif.dump(exif);

  // 5. Insert EXIF into corrected JPEG
  const finalDataUrl = piexif.insert(exifBytes, correctedDataUrl);
  const pureBase64 = finalDataUrl.split(',')[1] || '';
  const blob = dataUrlToBlob(finalDataUrl);

  return {
    blob,
    dataUrl: finalDataUrl,
    base64: pureBase64,
    width: TARGET_W,
    height: TARGET_H,
    sizeBytes: blob.size
  };
}
