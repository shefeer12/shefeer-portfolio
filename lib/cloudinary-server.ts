import crypto from 'crypto';

export interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: string;
  allowedFormats: string[];
  uploadUrl: string;
  maxSizeBytes: number;
}

// Fixed folder for portfolio video uploads (server-enforced)
export const FIXED_CLOUDINARY_FOLDER =
  'Muhammed Shefeer K | Video Editing Portfolio/01_Social_Media_Reels';

// Allowed video formats (server-enforced)
export const ALLOWED_VIDEO_FORMATS = ['mp4', 'mov', 'webm'] as const;

// Sensible max upload size limit: 250 MB
export const MAX_VIDEO_UPLOAD_BYTES = process.env.MAX_VIDEO_UPLOAD_BYTES
  ? parseInt(process.env.MAX_VIDEO_UPLOAD_BYTES, 10)
  : 250 * 1024 * 1024;

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v'
];

/**
 * Returns true if server Cloudinary credentials are fully configured.
 */
export function isCloudinaryServerConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)
  );
}

/**
 * Generates an authenticated, signed parameter bundle for direct Cloudinary video upload.
 * Signs strictly the parameters chosen by the server (fixed folder, timestamp, video resource_type).
 * Never signs arbitrary client-supplied parameters.
 */
export function generateCloudinaryUploadSignature(): CloudinarySignatureResult {
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    'hvs5l0qz';

  if (!apiSecret || !apiKey) {
    throw new Error('Cloudinary server credentials (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing.');
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Cloudinary signature algorithm:
  // Sort parameters alphabetically, serialize as param1=value1&param2=value2, append API secret, compute SHA-1.
  const paramsToSign: Record<string, string | number> = {
    folder: FIXED_CLOUDINARY_FOLDER,
    timestamp
  };

  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join('&');
  const stringToSign = `${serialized}${apiSecret}`;

  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder: FIXED_CLOUDINARY_FOLDER,
    resourceType: 'video',
    allowedFormats: [...ALLOWED_VIDEO_FORMATS],
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    maxSizeBytes: MAX_VIDEO_UPLOAD_BYTES
  };
}

/**
 * Constructs an optimized Cloudinary thumbnail URL from a video URL or public ID.
 */
export function constructCloudinaryThumbnail(videoUrl: string): string {
  if (!videoUrl) return '';
  if (videoUrl.includes('res.cloudinary.com')) {
    const transformed = videoUrl.replace(/\.(mp4|mov|webm)$/i, '.jpg');
    if (!transformed.includes('/so_')) {
      return transformed.replace('/video/upload/', '/video/upload/so_1,q_auto,f_auto/');
    }
    return transformed;
  }
  return videoUrl;
}
