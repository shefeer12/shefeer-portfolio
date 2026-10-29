/**
 * Cloudinary Delivery Utilities for Shefeer Portfolio.
 * 
 * SECURITY NOTE:
 * - Only the Cloud Name is public (used for building delivery URLs).
 * - API Key and API Secret are NEVER accessed or included here.
 * - All videos are delivered over HTTPS via Cloudinary's global CDN.
 */

// Reads the public cloud name from environment variable, with default fallback
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'hvs5l0qz';

export interface CloudinaryVideoOptions {
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
  format?: 'auto' | 'mp4' | 'webm';
  width?: number;
  height?: number;
  crop?: string;
  startOffset?: number | string; // e.g. 0, 1, 'auto'
}

/**
 * Checks if a string is already a full Cloudinary delivery URL.
 */
export function isCloudinaryUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Builds an optimized Cloudinary video streaming URL.
 * 
 * Ensures:
 * 1. HTTPS delivery
 * 2. Automatic quality & format (q_auto,f_auto)
 * 3. Transcoding .mov to universal .mp4 so all mobile & desktop browsers play it natively.
 */
export function getCloudinaryVideoUrl(
  publicIdOrUrl?: string,
  options: CloudinaryVideoOptions = {}
): string {
  if (!publicIdOrUrl) return '';

  const cloudName = CLOUDINARY_CLOUD_NAME;
  const quality = options.quality || 'auto';
  const format = options.format || 'auto';

  // If already a full URL
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    let url = publicIdOrUrl.replace(/^http:\/\//i, 'https://');

    // If it's a Cloudinary URL, ensure transformations and .mp4 compatibility
    if (isCloudinaryUrl(url)) {
      // Convert .mov extension to .mp4 for universal HTML5 playback
      url = url.replace(/\.mov$/i, '.mp4');

      // Inject q_auto,f_auto if not already present
      if (!url.includes('/video/upload/q_') && !url.includes('/video/upload/f_')) {
        url = url.replace('/video/upload/', `/video/upload/q_${quality},f_${format}/`);
      }
    }
    return url;
  }

  const transformations: string[] = [];
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);

  const transformString = transformations.join(',');

  // Clean public ID (remove leading slash and replace .mov with .mp4 if specified)
  let cleanId = publicIdOrUrl.replace(/^\/+/, '');
  cleanId = cleanId.replace(/\.mov$/i, '.mp4');

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${cleanId}`;
}

/**
 * Generates an optimized poster image thumbnail URL from a Cloudinary video.
 * Cloudinary extracts frame (e.g. at 1 second) and delivers it as an optimized JPG/WebP.
 * 
 * Example:
 * https://res.cloudinary.com/<cloud_name>/video/upload/so_1,q_auto,f_auto/<public_id>.jpg
 */
export function getCloudinaryVideoPosterUrl(
  publicIdOrUrl?: string,
  options: CloudinaryVideoOptions = {}
): string {
  if (!publicIdOrUrl) return '';

  const cloudName = CLOUDINARY_CLOUD_NAME;
  const startOffset = options.startOffset !== undefined ? options.startOffset : '1';

  // If it's already a full Cloudinary video URL, convert extension to .jpg with so_1
  if (isCloudinaryUrl(publicIdOrUrl)) {
    let url = publicIdOrUrl.replace(/^http:\/\//i, 'https://');
    
    // Remove existing transformations to inject clean poster transformations
    if (url.includes('/video/upload/')) {
      const parts = url.split('/video/upload/');
      const afterUpload = parts[1];
      // strip any existing transformations (e.g. q_auto,f_auto/)
      const cleanPath = afterUpload.replace(/^[^/]+\//, (match) => {
        return match.includes(',') || match.includes('_') ? '' : match;
      });
      return `https://res.cloudinary.com/${cloudName}/video/upload/so_${startOffset},q_auto,f_auto/${cleanPath.replace(/\.[^/.]+$/, '.jpg')}`;
    }
    return url.replace(/\.[^/.]+$/, '.jpg');
  }

  // If public ID
  const cleanId = publicIdOrUrl.replace(/^\/+/, '').replace(/\.[^/.]+$/, '');
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_${startOffset},q_auto,f_auto/${cleanId}.jpg`;
}
