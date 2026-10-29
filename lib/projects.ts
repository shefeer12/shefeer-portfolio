/**
 * Centralized, file-based project registry for Shefeer's Video Editor Portfolio.
 * 
 * Single source of truth for:
 * 1. The Hero featured video showcase (getHeroProject).
 * 2. The Full Work gallery (getGalleryProjects - all 12 cuts).
 * 3. The Video Preview Player & Case Study modal.
 * 
 * No database required. To add, edit, reorder, or hide videos, update this file.
 * See ADDING_A_VIDEO.md for instructions and copyable templates.
 */

export type VideoAspectRatio = '9:16' | '16:9' | '1:1' | '4:5' | '4:3' | '2.39:1' | string;

export interface Project {
  /** Stable, unique slug identifier (e.g. 'prime-property-promo') */
  id: string;
  /** Numeric display order in the gallery (1, 2, 3...) */
  order: number;
  /** Project title */
  title: string;
  /** Short summary or brief */
  description?: string;
  /** Work category */
  category: 'Shorts & Reels' | 'Brand & Commercial' | 'Cinematic' | 'Creator Edits';
  /** Hosted Cloudinary / HTML5 video delivery URL */
  videoUrl: string;
  /** Poster / thumbnail image URL */
  thumbnailUrl: string;
  /** Thumbnail alias for backward compatibility */
  thumbnail: string;
  /** Flexible video aspect ratio (supports '9:16', '16:9', '1:1', '4:5', '2.39:1', etc.) */
  aspectRatio: VideoAspectRatio;
  /** Optional analyzed duration in seconds for initial scrubber calibration */
  durationSeconds?: number;
  /** Optional formatted duration string (mm:ss) */
  duration?: string;
  /** Whether this project is featured in the Hero showcase */
  featured?: boolean;
  /** Whether the project is publicly visible in the gallery */
  published: boolean;
  /** Release / production year */
  year?: string;
  /** Post-production role */
  role?: string;
  /** Talent or subject (when verified from source) */
  client?: string;
  /** Creative brief */
  brief?: string;
  /** In-depth overview */
  overview?: string;
  /** Craft breakdown */
  editingApproach?: {
    hookStrategy: string;
    pacingAndRhythm: string;
    soundDesign: string;
    colorGrading: string;
  };
  /** Software stack */
  tools?: string[];
  /** Search / filter tags */
  tags?: string[];
  /** Cloudinary public ID if applicable */
  cloudinaryPublicId?: string;
  /** Video delivery type */
  videoType?: 'html5' | 'cloudinary' | 'youtube' | 'vimeo' | 'demo';
  /** Placeholder flag */
  isDemoPlaceholder?: boolean;
}

export type ProjectCategory = 'Shorts & Reels' | 'Brand & Commercial' | 'Cinematic' | 'Creator Edits';

export const projectCategories = [
  'All Work',
  'Shorts & Reels',
  'Brand & Commercial',
  'Cinematic',
  'Creator Edits'
] as const;

export type ProjectFilterCategory = typeof projectCategories[number];

/**
 * Validates whether an aspect ratio string is in a recognized numeric ratio format
 * (e.g. '9:16', '16:9', '1:1', '4:5', '2.39:1').
 */
export function isValidAspectRatio(ratio?: string): boolean {
  if (!ratio || typeof ratio !== 'string') return false;
  const trimmed = ratio.trim().replace(':', '/');
  const parts = trimmed.split('/');
  if (parts.length === 2) {
    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);
    return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
  }
  const decimal = parseFloat(trimmed);
  return Number.isFinite(decimal) && decimal > 0;
}

/**
 * Normalizes aspect ratio strings like '9:16', '16:9', '1:1', '4:5'
 * into standard CSS aspect-ratio values ('9 / 16', '16 / 9', etc.).
 */
export function parseAspectRatio(ratio?: string, fallback = '9 / 16'): string {
  if (!ratio || typeof ratio !== 'string') return fallback;
  const trimmed = ratio.trim().replace(':', '/');
  const parts = trimmed.split('/');
  if (parts.length === 2) {
    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      return `${w} / ${h}`;
    }
  }
  const decimal = parseFloat(trimmed);
  if (Number.isFinite(decimal) && decimal > 0) {
    return `${decimal} / 1`;
  }
  return fallback;
}

import rawProjectsData from '@/data/projects.json';

/**
 * Portfolio video projects loaded from centralized data/projects.json.
 * Contains the Hero featured showcase cut plus all gallery projects.
 */
export const projects: Project[] = (rawProjectsData as unknown) as Project[];

/**
 * Returns the Hero showcase video project.
 * Uses the project flagged as featured, falling back to the first item.
 */
export function getHeroProject(): Project {
  return projects.find((p) => p.featured) || projects[0];
}

/**
 * Curated list of stable project IDs for the cinematic Hero background rotation sequence.
 * 4 visually distinctive cuts showcasing interior architecture, wilderness landscape,
 * nocturnal automotive, and talent portraiture:
 * 1. hanansha-home: Hanansha Luxury Home (Interior Architecture & calm elegance)
 * 2. attappady-travel: Attappady Wilderness Journey (Misty mountain & river landscape)
 * 3. onroad-car-edit: Night Highway Drift & Roll (Nocturnal automotive neon reflections)
 * 4. alphy-actress-reel: Alphy Panjikaran Spotlight (Celebrity fashion portraiture)
 */
export const HERO_ROTATION_PROJECT_IDS = [
  'hanansha-home',
  'attappady-travel',
  'onroad-car-edit',
  'alphy-actress-reel'
] as const;

/**
 * Returns the curated selection of video projects for the Hero cinematic background rotation.
 * Validates that each referenced project exists and is published.
 */
export function getHeroRotationProjects(): Project[] {
  const rotationProjects = HERO_ROTATION_PROJECT_IDS
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p && p.published));

  if (rotationProjects.length === 0) {
    return [getHeroProject()];
  }
  return rotationProjects;
}

/**
 * Returns all published client video projects for the Full Work gallery (12 projects),
 * sorted by their display order.
 */
export function getGalleryProjects(): Project[] {
  return projects
    .filter((p) => p.published && !p.featured)
    .sort((a, b) => a.order - b.order);
}

/**
 * Returns all published projects (both hero and gallery).
 */
export function getAllProjects(): Project[] {
  return projects
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order);
}

/**
 * Lightweight runtime validation for the project registry.
 * Validates unique IDs, required URLs, and valid aspect ratios.
 */
export function validateProjects(items: Project[] = projects): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.id || item.id.trim() === '') {
      errors.push(`Project at index ${i} has an empty id.`);
    } else if (seenIds.has(item.id)) {
      errors.push(`Duplicate project ID detected: "${item.id}". IDs must be unique.`);
    } else {
      seenIds.add(item.id);
    }

    if (!item.title || item.title.trim() === '') {
      errors.push(`Project "${item.id || i}" is missing a title.`);
    }

    if (!item.videoUrl || item.videoUrl.trim() === '') {
      errors.push(`Project "${item.id || i}" is missing a videoUrl.`);
    }

    if (!item.thumbnailUrl && !item.thumbnail) {
      errors.push(`Project "${item.id || i}" is missing a thumbnailUrl.`);
    }

    if (item.aspectRatio && !isValidAspectRatio(item.aspectRatio)) {
      errors.push(`Project "${item.id || i}" has invalid aspectRatio "${item.aspectRatio}". Use formats like '9:16', '16:9', '1:1', '4:5', or decimal '2.39:1'.`);
    }
  }

  return { valid: errors.length === 0, errors };
}
