/**
 * Exact pre-analyzed video durations for all Muhammed Shefeer portfolio videos.
 * Durations extracted directly from Cloudinary MP4 atom headers (mvhd).
 */

export interface VideoDurationMeta {
  seconds: number;
  formatted: string;
}

export const KNOWN_VIDEO_DURATIONS: Record<string, VideoDurationMeta> = {
  // Main Hero & Featured cut
  'hanansha_home': { seconds: 34.03, formatted: '00:34' },
  'hanansha-home': { seconds: 34.03, formatted: '00:34' },

  // Commercial & Brand Ads
  'real_estate_sale_s': { seconds: 56.31, formatted: '00:56' },
  'real-estate-sales': { seconds: 56.31, formatted: '00:56' },
  'shop': { seconds: 45.00, formatted: '00:45' },
  'shop-commercial': { seconds: 45.00, formatted: '00:45' },
  'election': { seconds: 52.43, formatted: '00:52' },
  'election-campaign': { seconds: 52.43, formatted: '00:52' },
  'saffron': { seconds: 32.27, formatted: '00:32' },
  'saffron-restaurant': { seconds: 32.27, formatted: '00:32' },
  'audi': { seconds: 27.33, formatted: '00:27' },
  'audi-cinematic': { seconds: 27.33, formatted: '00:27' },

  // Social Reels & Creator Edits
  'alphy_actress': { seconds: 29.57, formatted: '00:29' },
  'alphy-actress-reel': { seconds: 29.57, formatted: '00:29' },
  'mescollegeprogram': { seconds: 19.53, formatted: '00:19' },
  'mes-college-program': { seconds: 19.53, formatted: '00:19' },
  'actorsuryapooja': { seconds: 23.08, formatted: '00:23' },
  'actor-suryapooja': { seconds: 23.08, formatted: '00:23' },
  'football_freestyle': { seconds: 21.63, formatted: '00:21' },
  'football-freestyle': { seconds: 21.63, formatted: '00:21' },
  'drananthupodacst': { seconds: 44.84, formatted: '00:44' },
  'drananthu-podcast': { seconds: 44.84, formatted: '00:44' },

  // Cinematic & Travel
  'attappady': { seconds: 24.20, formatted: '00:24' },
  'attappady-travel': { seconds: 24.20, formatted: '00:24' },
  'onroad': { seconds: 28.17, formatted: '00:28' },
  'onroad-car-edit': { seconds: 28.17, formatted: '00:28' },
};

/**
 * Resolves the exact analyzed duration in seconds for any video URL, public ID, or slug.
 * Returns the exact duration in seconds (defaults to 34.03 if Hanansha, or fallback if unknown).
 */
export function resolveVideoDuration(srcOrId?: string, fallback = 34.03): number {
  if (!srcOrId) return fallback;
  const lower = srcOrId.toLowerCase();

  for (const [key, meta] of Object.entries(KNOWN_VIDEO_DURATIONS)) {
    if (lower.includes(key.toLowerCase())) {
      return meta.seconds;
    }
  }

  return fallback;
}

/**
 * Resolves the formatted time string (mm:ss) for any video.
 */
export function resolveVideoFormattedDuration(srcOrId?: string, fallback = '00:34'): string {
  if (!srcOrId) return fallback;
  const lower = srcOrId.toLowerCase();

  for (const [key, meta] of Object.entries(KNOWN_VIDEO_DURATIONS)) {
    if (lower.includes(key.toLowerCase())) {
      return meta.formatted;
    }
  }

  return fallback;
}
