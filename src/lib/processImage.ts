import piexif from 'piexifjs';

export interface EditConfig {
  freeRotation: number; // -180 to +180 degrees
  cw90Count: number; // 0, 1, 2, 3 (number of 90° CW rotations)
  flipH: boolean; // flip horizontal (mirror)
  panX: number; // pan offset X in percentage (-50 to +50)
  panY: number; // pan offset Y in percentage (-50 to +50)
  zoom: number; // 1.0 to 5.0
  fitMode: 'fill' | 'fit' | 'stretch';
}

export const DEFAULT_EDIT_CONFIG: EditConfig = {
  freeRotation: 0,
  cw90Count: 0,
  flipH: false,
  panX: 0,
  panY: 0,
  zoom: 1,
  fitMode: 'fill'
};

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

// Renders the source image onto an intermediate canvas with EXIF orientation corrected
function getUprightCanvas(img: HTMLImageElement, orientation: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const rotate90 = orientation >= 5 && orientation <= 8;
  canvas.width = rotate90 ? img.height : img.width;
  canvas.height = rotate90 ? img.width : img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  switch (orientation) {
    case 2:
      ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
      break;
    case 3:
      ctx.setTransform(-1, 0, 0, -1, canvas.width, canvas.height);
      break;
    case 4:
      ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
      break;
    case 5:
      ctx.setTransform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.setTransform(0, 1, -1, 0, canvas.width, 0);
      break;
    case 7:
      ctx.setTransform(0, -1, -1, 0, canvas.width, canvas.height);
      break;
    case 8:
      ctx.setTransform(0, -1, 1, 0, 0, canvas.height);
      break;
    default:
      ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  ctx.drawImage(img, 0, 0);
  return canvas;
}

function drawEditedCanvas(
  dataUrl: string,
  targetW: number,
  targetH: number,
  orientation: number,
  editConfig: EditConfig
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const upright = getUprightCanvas(img, orientation);
      const baseW = upright.width;
      const baseH = upright.height;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to create canvas 2D context'));
        return;
      }

      const totalAngleDeg = editConfig.freeRotation + editConfig.cw90Count * 90;
      const totalRad = (totalAngleDeg * Math.PI) / 180;
      const cosA = Math.abs(Math.cos(totalRad));
      const sinA = Math.abs(Math.sin(totalRad));

      // Bounding box of rotated base image
      const rotW = baseW * cosA + baseH * sinA;
      const rotH = baseW * sinA + baseH * cosA;

      // 1. If fit mode, render blurred background photo filling the canvas
      if (editConfig.fitMode === 'fit') {
        ctx.save();
        const bgScale = Math.max(targetW / baseW, targetH / baseH) * 1.15;
        const bgW = baseW * bgScale;
        const bgH = baseH * bgScale;
        ctx.filter = 'blur(45px) brightness(0.65)';
        ctx.drawImage(
          upright,
          (targetW - bgW) / 2,
          (targetH - bgH) / 2,
          bgW,
          bgH
        );
        ctx.filter = 'none';
        ctx.restore();
      } else {
        // Black background for clean framing
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // 2. Draw the edited main image
      ctx.save();
      // Offset pan: panX and panY are percentages of target dimensions
      const pixelPanX = (editConfig.panX / 100) * targetW;
      const pixelPanY = (editConfig.panY / 100) * targetH;

      ctx.translate(targetW / 2 + pixelPanX, targetH / 2 + pixelPanY);

      if (editConfig.flipH) {
        ctx.scale(-1, 1);
      }

      ctx.rotate(totalRad);

      if (editConfig.fitMode === 'stretch') {
        // Stretch mode: fill target width and height directly
        const sW = targetW * editConfig.zoom;
        const sH = targetH * editConfig.zoom;
        ctx.drawImage(upright, -sW / 2, -sH / 2, sW, sH);
      } else if (editConfig.fitMode === 'fit') {
        // Fit mode: contain within target dimensions without cropping
        const containScale = Math.min(targetW / rotW, targetH / rotH) * editConfig.zoom;
        const drawW = baseW * containScale;
        const drawH = baseH * containScale;
        ctx.drawImage(upright, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        // Fill mode (default): cover target dimensions completely
        const coverScale = Math.max(targetW / rotW, targetH / rotH) * editConfig.zoom;
        const drawW = baseW * coverScale;
        const drawH = baseH * coverScale;
        ctx.drawImage(upright, -drawW / 2, -drawH / 2, drawW, drawH);
      }

      ctx.restore();
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

export async function processImage(
  file: File,
  editConfig: EditConfig = DEFAULT_EDIT_CONFIG
): Promise<ProcessedImageResult> {
  const TARGET_W = 3024;
  const TARGET_H = 4032;

  // 1. Read source data URL
  const sourceDataUrl = await fileToDataUrl(file);

  // 2. Read existing orientation
  const orientation = readOrientation(sourceDataUrl);

  // 3. Draw canvas with EditConfig at 3024x4032
  const correctedDataUrl = await drawEditedCanvas(
    sourceDataUrl,
    TARGET_W,
    TARGET_H,
    orientation,
    editConfig
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
