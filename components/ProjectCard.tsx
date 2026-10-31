'use client';

import React from 'react';
import { ArrowUpRight, Clock, Film } from 'lucide-react';
import { parseAspectRatio, type Project } from '@/lib/projects';
import { getCloudinaryVideoPosterUrl } from '@/lib/cloudinary';

interface ProjectCardProps {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}

export default function ProjectCard({ project, index, onSelect }: ProjectCardProps) {
  const thumbnailSrc =
    project.thumbnailUrl ||
    project.thumbnail ||
    (project.cloudinaryPublicId ? getCloudinaryVideoPosterUrl(project.cloudinaryPublicId) : '');

  // Display card's position in displayed list (01, 02, 03...), never raw order value
  const displayNumber = String(index + 1).padStart(2, '0');

  return (
    <article
      className="group relative flex flex-col cursor-pointer bg-card/60 border border-white/8 hover:border-accent/40 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1"
      onClick={() => onSelect(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details and playback for ${project.title}`}
    >
      {/* Media Aspect Ratio Container (Flexible to 9:16, 16:9, 1:1, 4:5, etc.) */}
      <div
        className="relative w-full bg-[#0c0c11] overflow-hidden"
        style={{ aspectRatio: parseAspectRatio(project.aspectRatio, '9 / 16') }}
      >
        {/* Background Thumbnail */}
        {thumbnailSrc && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
            style={{ backgroundImage: `url("${thumbnailSrc}")` }}
          />
        )}

        {/* Cinematic Film Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 border border-white/5 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[10px] font-mono tracking-widest text-white/80 z-10">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-white font-bold">{displayNumber}</span>
          </div>
          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-accent font-semibold">
            {project.aspectRatio}
          </span>
        </div>

        {/* Center Hover Action Pill */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-black font-semibold text-xs tracking-wider uppercase shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Film className="w-3.5 h-3.5" />
            <span>Watch Cut</span>
          </div>
        </div>

        {/* Bottom Card Overlay Details */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between z-10 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-mono">
              <Clock className="w-3 h-3 text-accent" />
              <span>{project.duration}</span>
              <span>·</span>
              <span>{project.year}</span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-accent uppercase">
              {project.category}
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-200 group-hover:bg-accent group-hover:text-black group-hover:border-accent group-hover:rotate-45">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Card Footer Information */}
      <div className="p-4 flex flex-col justify-between flex-grow bg-card border-t border-white/5 space-y-2">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
            {project.description || project.overview}
          </p>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
