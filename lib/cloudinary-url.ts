/**
 * Centralized Cloudinary Delivery URL Helper
 *
 * Enforces high-performance, cost-effective media delivery:
 * 1. Automatic format and quality (f_auto, q_auto)
 * 2. Explicit width limiting (never serve unconstrained original master uploads)
 * 3. Video-to-image poster generation (first frame as optimized image)
 * 4. Short video preview clips for hover states (trimmed duration with du_4)
 * 5. Universal .mp4 transcoding for HTML5 cross-browser compliance
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'hvs5l0qz';

export interface VideoDeliveryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
  format?: 'auto' | 'mp4' | 'webm';
  crop?: 'limit' | 'fill' | 'scale' | 'fit';
}

export interface PosterOptions {
  width?: number;
  startOffset?: number | string; // e.g. 0 or '0'
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
  format?: 'auto' | 'jpg' | 'webp';
  crop?: 'limit' | 'fill' | 'scale' | 'fit';
}

export interface PreviewOptions {
  width?: number;
  duration?: number; // Duration in seconds (e.g. 4)
  startOffset?: number | string;
  crop?: 'limit' | 'fill' | 'scale' | 'fit';
}

/**
 * Checks whether a URL is a Cloudinary delivery URL.
 */
export function isCloudinaryUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Parses a Cloudinary delivery URL or public ID into clean asset path components.
 */
function parseCloudinaryPath(urlOrPublicId: string): {
  cloudName: string;
  resourceType: string;
  assetPath: string;
} {
  const defaultCloud = CLOUDINARY_CLOUD_NAME;

  if (!isCloudinaryUrl(urlOrPublicId)) {
    // Treat as raw public ID
    let cleanId = urlOrPublicId.replace(/^\/+/, '');
    return {
      cloudName: defaultCloud,
      resourceType: 'video',
      assetPath: cleanId
    };
  }

  // Handle full URL
  const secureUrl = urlOrPublicId.replace(/^http:\/\//i, 'https://');
  const uploadIndex = secureUrl.indexOf('/upload/');
  if (uploadIndex === -1) {
    return { cloudName: defaultCloud, resourceType: 'video', assetPath: urlOrPublicId };
  }

  const prefix = secureUrl.substring(0, uploadIndex);
  const afterUpload = secureUrl.substring(uploadIndex + '/upload/'.length);

  // Extract cloudName and resourceType from prefix
  // Format: https://res.cloudinary.com/{cloudName}/{resourceType}
  const prefixMatch = prefix.match(/res\.cloudinary\.com\/([^/]+)\/([^/]+)/);
  const cloudName = prefixMatch ? prefixMatch[1] : defaultCloud;
  const resourceType = prefixMatch ? prefixMatch[2] : 'video';

  // Strip existing transformation segment if present
  // Transformations typically precede the version prefix (v1234567890) or contain commas/underscores
  let assetPath = afterUpload;
  const firstSlash = afterUpload.indexOf('/');
  if (firstSlash !== -1) {
    const firstSegment = afterUpload.substring(0, firstSlash);
    const isVersion = /^v\d+$/.test(firstSegment);
    const hasTransformKeywords =
      firstSegment.includes(',') ||
      firstSegment.includes('_') ||
      /^(q|f|w|h|c|so|eo|du|b|e|dpr)_/.test(firstSegment);

    if (!isVersion && hasTransformKeywords) {
      assetPath = afterUpload.substring(firstSlash + 1);
    }
  }

  return { cloudName, resourceType, assetPath };
}

/**
 * Builds an optimized Cloudinary delivery video URL.
 * Never serves unconstrained original uploads.
 *
 * @param urlOrPublicId Cloudinary URL or public ID
 * @param options Delivery sizing, quality, and formatting options
 */
export function getDeliveryVideoUrl(
  urlOrPublicId?: string,
  options: VideoDeliveryOptions = {}
): string {
  if (!urlOrPublicId) return '';

  // Non-Cloudinary URLs (e.g. Vimeo, YouTube, external) pass through with HTTPS
  if (
    (urlOrPublicId.startsWith('http://') || urlOrPublicId.startsWith('https://')) &&
    !isCloudinaryUrl(urlOrPublicId)
  ) {
    return urlOrPublicId.replace(/^http:\/\//i, 'https://');
  }

  const { cloudName, assetPath } = parseCloudinaryPath(urlOrPublicId);
  const quality = options.quality || 'auto';
  const format = options.format || 'auto';
  const crop = options.crop || 'limit';

  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (options.width) {
    transforms.push(`w_${options.width}`);
    transforms.push(`c_${crop}`);
  } else if (options.height) {
    transforms.push(`h_${options.height}`);
    transforms.push(`c_${crop}`);
  }

  // Ensure .mov is replaced with .mp4 for universal HTML5 playback
  const cleanAsset = assetPath.replace(/\.mov$/i, '.mp4');
  const transformString = transforms.join(',');

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${cleanAsset}`;
}

/**
 * Generates an optimized poster image thumbnail URL from a Cloudinary video.
 * Extracts the first frame (so_0) and delivers it as an optimized JPG/WebP image.
 *
 * @param urlOrPublicId Cloudinary video URL or public ID
 * @param options Poster sizing and start offset options
 */
export function getPosterUrl(
  urlOrPublicId?: string,
  options: PosterOptions = {}
): string {
  if (!urlOrPublicId) return '';

  if (
    (urlOrPublicId.startsWith('http://') || urlOrPublicId.startsWith('https://')) &&
    !isCloudinaryUrl(urlOrPublicId)
  ) {
    return urlOrPublicId.replace(/^http:\/\//i, 'https://');
  }

  const { cloudName, assetPath } = parseCloudinaryPath(urlOrPublicId);
  const startOffset = options.startOffset !== undefined ? options.startOffset : 0;
  const quality = options.quality || 'auto';
  const format = options.format || 'auto';
  const crop = options.crop || 'limit';

  const transforms: string[] = [`so_${startOffset}`, `f_${format}`, `q_${quality}`];

  if (options.width) {
    transforms.push(`w_${options.width}`);
    transforms.push(`c_${crop}`);
  }

  // Replace video extension with .jpg for Cloudinary video-to-image delivery
  const imageAsset = assetPath.replace(/\.(mp4|mov|webm|mkv|avi)$/i, '.jpg');
  const transformString = transforms.join(',');

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${imageAsset}`;
}

/**
 * Generates a lightweight, short looping preview clip URL for hover interactions.
 * Trims duration with `du_4` and limits width to reduce data transfer.
 *
 * @param urlOrPublicId Cloudinary video URL or public ID
 * @param options Preview duration and sizing
 */
export function getPreviewVideoUrl(
  urlOrPublicId?: string,
  options: PreviewOptions = {}
): string {
  if (!urlOrPublicId) return '';

  if (
    (urlOrPublicId.startsWith('http://') || urlOrPublicId.startsWith('https://')) &&
    !isCloudinaryUrl(urlOrPublicId)
  ) {
    return urlOrPublicId.replace(/^http:\/\//i, 'https://');
  }

  const { cloudName, assetPath } = parseCloudinaryPath(urlOrPublicId);
  const duration = options.duration || 4;
  const startOffset = options.startOffset !== undefined ? options.startOffset : 0;
  const width = options.width || 540;
  const crop = options.crop || 'limit';

  const transforms: string[] = [
    `so_${startOffset}`,
    `du_${duration}`,
    'f_auto',
    'q_auto',
    `w_${width}`,
    `c_${crop}`
  ];

  const cleanAsset = assetPath.replace(/\.mov$/i, '.mp4');
  const transformString = transforms.join(',');

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${cleanAsset}`;
}
