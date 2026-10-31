import { isValidAspectRatio, ProjectCategory, VideoAspectRatio } from '@/lib/projects';

// Allowed categories matching SHEFEER_BRIEF.md
export const ALLOWED_CATEGORIES: ProjectCategory[] = [
  'Shorts & Reels',
  'Brand & Commercial',
  'Cinematic',
  'Creator Edits'
];

// Allowed aspect ratios
export const ALLOWED_ASPECT_RATIOS = [
  '9:16',
  '16:9',
  '1:1',
  '4:5',
  '4:3',
  '2.39:1'
];

// Allowed hosts for video URLs
export const ALLOWED_VIDEO_HOSTS = [
  'res.cloudinary.com',
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be'
];

// Allowed hosts for thumbnail URLs (plus relative paths starting with /)
export const ALLOWED_THUMBNAIL_HOSTS = [
  'res.cloudinary.com',
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
  'i.vimeocdn.com',
  'img.youtube.com',
  'youtube.com',
  'www.youtube.com'
];

// Known allowed fields on Project create/update payloads
const KNOWN_PROJECT_FIELDS = new Set([
  'id',
  'order',
  'title',
  'description',
  'category',
  'year',
  'duration',
  'durationSeconds',
  'aspectRatio',
  'featured',
  'published',
  'client',
  'role',
  'thumbnailUrl',
  'thumbnail',
  'videoUrl',
  'videoType',
  'isDemoPlaceholder',
  'brief',
  'overview',
  'editingApproach',
  'tools',
  'tags',
  'cloudinaryPublicId'
]);

/**
 * Validates a video delivery URL:
 * - Must be https protocol
 * - Must belong to allowlisted host
 * - Must not be private/loopback/internal SSRF targets
 */
export function validateVideoUrl(urlStr: string): { valid: boolean; error?: string } {
  if (!urlStr || typeof urlStr !== 'string') {
    return { valid: false, error: 'Video URL is required.' };
  }

  const trimmed = urlStr.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('http:') ||
    lower.startsWith('ftp:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return {
      valid: false,
      error: 'Only secure HTTPS video URLs from allowed video providers (Cloudinary, Vimeo, YouTube) are permitted.'
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Malformed video URL.' };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: 'Video URL must use HTTPS protocol.'
    };
  }

  // SSRF Protection: Reject private and loopback IPs
  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host)
  ) {
    return {
      valid: false,
      error: 'Private network and loopback addresses are not permitted.'
    };
  }

  // Check allowlist
  const isAllowedHost = ALLOWED_VIDEO_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );

  if (!isAllowedHost) {
    return {
      valid: false,
      error: `Video host "${host}" is not on the allowed providers list (Cloudinary, Vimeo, YouTube).`
    };
  }

  // Cloudinary account check: must belong to this cloud name if cloudinary URL
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'hvs5l0qz';
  if (host === 'res.cloudinary.com' && !parsed.pathname.startsWith(`/${cloudName}/`)) {
    return {
      valid: false,
      error: `Cloudinary video URL must belong to account "${cloudName}".`
    };
  }

  return { valid: true };
}

/**
 * Validates a thumbnail URL or relative asset path.
 */
export function validateThumbnailUrl(urlStr: string): { valid: boolean; error?: string } {
  if (!urlStr || typeof urlStr !== 'string') return { valid: true };

  const trimmed = urlStr.trim();
  if (trimmed.startsWith('/')) {
    // Relative local asset like /assets/shefeer.png is valid
    return { valid: true };
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('http:')
  ) {
    return {
      valid: false,
      error: 'Thumbnail URL must use HTTPS or be a relative asset path.'
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Malformed thumbnail URL.' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Thumbnail URL must use HTTPS protocol.' };
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
  ) {
    return { valid: false, error: 'Invalid thumbnail host.' };
  }

  const isAllowedHost = ALLOWED_THUMBNAIL_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );

  if (!isAllowedHost) {
    return {
      valid: false,
      error: `Thumbnail host "${host}" is not on the allowed providers list.`
    };
  }

  return { valid: true };
}

/**
 * Validates an incoming Project payload for create or update operations:
 * - Rejects any unknown field
 * - Validates title, category, aspect ratio, order, description, tags, etc.
 */
export function validateProjectPayload(
  body: any,
  isUpdate = false
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errors: ['Payload must be a JSON object.'] };
  }

  // 1. Reject unknown fields
  for (const key of Object.keys(body)) {
    if (!KNOWN_PROJECT_FIELDS.has(key)) {
      errors.push(`Unknown field "${key}" is not permitted.`);
    }
  }

  // 2. Title validation
  if (!isUpdate || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('Project title is required.');
    } else if (body.title.trim().length > 100) {
      errors.push('Project title must not exceed 100 characters.');
    }
  }

  // 3. Category validation (fixed list)
  if (!isUpdate || body.category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(body.category)) {
      errors.push(
        `Invalid category "${body.category}". Must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`
      );
    }
  }

  // 4. Aspect Ratio validation (fixed list)
  if (!isUpdate || body.aspectRatio !== undefined) {
    if (
      typeof body.aspectRatio !== 'string' ||
      (!ALLOWED_ASPECT_RATIOS.includes(body.aspectRatio.trim()) && !isValidAspectRatio(body.aspectRatio))
    ) {
      errors.push(
        `Invalid aspect ratio "${body.aspectRatio}". Must be one of: ${ALLOWED_ASPECT_RATIOS.join(', ')}.`
      );
    }
  }

  // 5. Order validation (must be integer)
  if (body.order !== undefined) {
    if (typeof body.order !== 'number' || !Number.isInteger(body.order) || body.order < 0) {
      errors.push('Order must be a non-negative integer.');
    }
  }

  // 6. Video URL validation (allowlist + HTTPS + SSRF protection)
  if (!isUpdate || body.videoUrl !== undefined) {
    const videoCheck = validateVideoUrl(body.videoUrl);
    if (!videoCheck.valid && videoCheck.error) {
      errors.push(videoCheck.error);
    }
  }

  // 7. Thumbnail URL validation
  const thumb = body.thumbnailUrl || body.thumbnail;
  if (thumb !== undefined) {
    const thumbCheck = validateThumbnailUrl(thumb);
    if (!thumbCheck.valid && thumbCheck.error) {
      errors.push(thumbCheck.error);
    }
  }

  // 8. Description length limit (max 500 characters)
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 500) {
      errors.push('Description must not exceed 500 characters.');
    }
  }

  // 9. Tags array limits: max 15 tags, each max 35 characters
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('Tags must be an array of strings.');
    } else if (body.tags.length > 15) {
      errors.push('Tags array must not exceed 15 items.');
    } else {
      for (let i = 0; i < body.tags.length; i++) {
        const tag = body.tags[i];
        if (typeof tag !== 'string' || tag.length > 35) {
          errors.push(`Tag at index ${i} must be a string up to 35 characters.`);
        }
      }
    }
  }

  // 10. Tools array limits: max 10 tools, each max 40 characters
  if (body.tools !== undefined) {
    if (!Array.isArray(body.tools)) {
      errors.push('Tools must be an array of strings.');
    } else if (body.tools.length > 10) {
      errors.push('Tools array must not exceed 10 items.');
    } else {
      for (let i = 0; i < body.tools.length; i++) {
        const tool = body.tools[i];
        if (typeof tool !== 'string' || tool.length > 40) {
          errors.push(`Tool at index ${i} must be a string up to 40 characters.`);
        }
      }
    }
  }

  // 11. Role & client length limits
  if (body.role !== undefined && typeof body.role === 'string' && body.role.length > 100) {
    errors.push('Role must not exceed 100 characters.');
  }
  if (body.client !== undefined && typeof body.client === 'string' && body.client.length > 100) {
    errors.push('Client must not exceed 100 characters.');
  }

  // 12. Duration and durationSeconds validation
  if (body.duration !== undefined && typeof body.duration === 'string' && body.duration.length > 20) {
    errors.push('Duration string must not exceed 20 characters.');
  }
  if (body.durationSeconds !== undefined && (typeof body.durationSeconds !== 'number' || body.durationSeconds < 0)) {
    errors.push('DurationSeconds must be a positive number.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
