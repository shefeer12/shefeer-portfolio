/**
 * Cloudinary Delivery Utilities for Shefeer Portfolio.
 * 
 * Re-exports and aliases from lib/cloudinary-url.ts for backward compatibility.
 * 
 * SECURITY NOTE:
 * - Only the Cloud Name is public (used for building delivery URLs).
 * - API Key and API Secret are NEVER accessed or included here.
 * - All videos are delivered over HTTPS via Cloudinary's global CDN.
 */

export {
  CLOUDINARY_CLOUD_NAME,
  isCloudinaryUrl,
  getDeliveryVideoUrl,
  getPosterUrl,
  getPreviewVideoUrl
} from '@/lib/cloudinary-url';

import {
  getDeliveryVideoUrl,
  getPosterUrl,
  type VideoDeliveryOptions,
  type PosterOptions
} from '@/lib/cloudinary-url';

export type CloudinaryVideoOptions = VideoDeliveryOptions & PosterOptions;

/**
 * Backward compatibility alias for getDeliveryVideoUrl.
 */
export function getCloudinaryVideoUrl(
  publicIdOrUrl?: string,
  options: CloudinaryVideoOptions = {}
): string {
  return getDeliveryVideoUrl(publicIdOrUrl, options);
}

/**
 * Backward compatibility alias for getPosterUrl.
 */
export function getCloudinaryVideoPosterUrl(
  publicIdOrUrl?: string,
  options: CloudinaryVideoOptions = {}
): string {
  return getPosterUrl(publicIdOrUrl, options);
}
