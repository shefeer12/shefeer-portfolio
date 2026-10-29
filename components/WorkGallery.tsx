'use client';

import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Film, SlidersHorizontal } from 'lucide-react';
import { getGalleryProjects, projectCategories, type Project, type ProjectFilterCategory } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import TiltedCard from '@/components/reactbits/TiltedCard';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import Masonry from '@/components/reactbits/Masonry';

interface WorkGalleryProps {
  onSelectProject: (project: Project) => void;
}

export default function WorkGallery({ onSelectProject }: WorkGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectFilterCategory>('All Work');
  const galleryProjects = useMemo(() => getGalleryProjects(), []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All Work') return galleryProjects;
    return galleryProjects.filter((p) => p.category === selectedCategory);
  }, [galleryProjects, selectedCategory]);

  return (
    <section id="work" className="py-24 sm:py-32 relative border-t border-white/10">
      <div className="site-container">
        {/* Section Heading with ScrollReveal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase mb-3">
              <Film className="w-3.5 h-3.5" />
              <span>01 // SELECTED WORK</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans">
              <ScrollReveal baseOpacity={0.3} enableBlur={true}>
                THE WORK
              </ScrollReveal>{' '}
              <br />
              <span className="text-accent">SPEAKS.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-white/70 leading-relaxed font-light">
              Crafted primarily for 9:16 vertical displays. Every project is built around rhythm, emotional connection, and retention architecture.
            </p>
          </div>
        </div>

        {/* Toolbar: Category Filters and Project Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-white/10 mb-12">
          {/* Filter Pills */}
          <div
            className="flex flex-wrap items-center gap-1.5 sm:gap-2"
            role="group"
            aria-label="Filter projects by category"
          >
            {projectCategories.map((category) => {
              const isActive = selectedCategory === category;
              const count =
                category === 'All Work'
                  ? galleryProjects.length
                  : galleryProjects.filter((p) => p.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-mono tracking-wider transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-accent text-black border-accent font-semibold shadow-md shadow-accent/20'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                  aria-pressed={isActive}
                >
                  <span>{category}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Counter Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-muted tracking-wider self-end sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-white font-medium">
              {String(filteredProjects.length).padStart(2, '0')}
            </span>
            <span>OF {String(galleryProjects.length).padStart(2, '0')} PROJECTS</span>
          </div>
        </div>

        {/* Project Grid: React Bits Masonry with TiltedCard on top featured cards */}
        {filteredProjects.length > 0 ? (
          <Masonry
            items={filteredProjects}
            renderItem={(project, index) => {
              // Selectively apply 3D TiltedCard to the top featured cards without breaking modal opening
              const isTiltedFeatured = project.featured && index < 2;

              if (isTiltedFeatured) {
                return (
                  <AnimatedContent delay={index * 0.08} duration={0.5}>
                    <TiltedCard
                      maxTilt={6}
                      scaleOnHover={1.02}
                      glare={true}
                      glareOpacity={0.18}
                      onClick={() => onSelectProject(project)}
                    >
                      <ProjectCard
                        project={project}
                        index={index}
                        onSelect={onSelectProject}
                      />
                    </TiltedCard>
                  </AnimatedContent>
                );
              }

              return (
                <AnimatedContent delay={index * 0.06} duration={0.5}>
                  <ProjectCard
                    project={project}
                    index={index}
                    onSelect={onSelectProject}
                  />
                </AnimatedContent>
              );
            }}
          />
        ) : (
          /* Graceful Empty State */
          <div className="py-20 text-center border border-dashed border-white/15 rounded-lg bg-white/[0.01] p-8">
            <SlidersHorizontal className="w-8 h-8 text-muted mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-semibold text-white mb-1">No projects in this category</h3>
            <p className="text-xs text-muted mb-4 max-w-sm mx-auto">
              New client cuts are currently in post-production. You can reset filters to view all work.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All Work')}
              className="px-4 py-2 bg-white/10 hover:bg-accent hover:text-black text-white text-xs font-mono uppercase tracking-wider rounded transition"
            >
              Reset to All Work
            </button>
          </div>
        )}

        {/* Gallery Footnote */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
          <span className="tracking-wider">MORE CLIENT PROJECTS IN PRODUCTION WEEKLY</span>
          <a
            href="#contact"
            className="group flex items-center gap-2 text-white hover:text-accent transition-colors"
          >
            <span>Have raw footage? Let&apos;s cut it</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-accent" />
          </a>
        </div>
      </div>
    </section>
  );
}
