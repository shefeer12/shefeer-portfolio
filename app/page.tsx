'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WorkGallery from '@/components/WorkGallery';
import ServicesSection from '@/components/ServicesSection';
import AboutSection from '@/components/AboutSection';
import ProcessSection from '@/components/ProcessSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ProjectModal from '@/components/ProjectModal';
import { getGalleryProjects, type Project } from '@/lib/projects';
import { getWhatsAppUrl } from '@/lib/site-config';

// React Bits Components
import TargetCursor from '@/components/reactbits/TargetCursor';
import LogoLoop from '@/components/reactbits/LogoLoop';
import GlassSurface from '@/components/reactbits/GlassSurface';

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const galleryProjects = getGalleryProjects();

  const handleNextProject = () => {
    if (!selectedProject || galleryProjects.length <= 1) return;
    const currentIndex = galleryProjects.findIndex((p) => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % galleryProjects.length;
    setSelectedProject(galleryProjects[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!selectedProject || galleryProjects.length <= 1) return;
    const currentIndex = galleryProjects.findIndex((p) => p.id === selectedProject.id);
    const prevIndex = (currentIndex - 1 + galleryProjects.length) % galleryProjects.length;
    setSelectedProject(galleryProjects[prevIndex]);
  };

  const floatingWhatsAppUrl = getWhatsAppUrl(
    'Hi Shefeer, I am browsing your portfolio and would like to discuss an upcoming video edit.'
  );

  // Confirmed software and editing capability stack for LogoLoop
  const verifiedTools = [
    { name: 'Adobe Premiere Pro', category: 'Regular Use · Primary NLE' },
    { name: 'Adobe After Effects', category: 'Regular Use · Motion Graphics' },
    { name: 'CapCut', category: 'Regular Use · Social Edits' },
    { name: 'DaVinci Resolve', category: 'Basic Level · Color Correction' },
    { name: 'Adobe Photoshop', category: 'Additional Tool · Graphic Assets' },
    { name: 'Canva', category: 'Additional Tool · Visual Elements' },
    { name: '2+ Years Experience', category: 'Freelance Editor · Kochi, IN' },
    { name: 'Indian & Global Clients', category: 'Remote Collaboration' }
  ];

  return (
    <main className="min-h-screen bg-[#070709] text-[#f5f3ef] selection:bg-accent selection:text-black">
      {/* React Bits: Desktop Target Cursor reticle */}
      <TargetCursor />

      {/* 1. Header and Navigation */}
      <Navbar />

      {/* 2. Hero with Headline “I MAKE EVERY FRAME MATTER.” */}
      <Hero />

      {/* 3. Full Work Gallery Containing All 12 Existing Videos */}
      <WorkGallery onSelectProject={(project) => setSelectedProject(project)} />

      {/* 4. Services */}
      <ServicesSection />

      {/* React Bits: LogoLoop verified tool marquee */}
      <LogoLoop items={verifiedTools} speed={32} direction="left" />

      {/* 5. About Shefeer, Featuring His Real Photograph */}
      <AboutSection />

      {/* 6. Three-Step Project Process */}
      <ProcessSection />

      {/* 7. Final Contact CTA */}
      <ContactSection />

      {/* 8. Footer */}
      <Footer />

      {/* Video Preview Modal with ElasticSlider */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onNext={galleryProjects.length > 1 ? handleNextProject : undefined}
        onPrev={galleryProjects.length > 1 ? handlePrevProject : undefined}
      />

      {/* Floating Quick WhatsApp Trigger with GlassSurface */}
      <div className="fixed bottom-6 right-6 z-30">
        <GlassSurface intensity="deep" glowOnHover className="rounded-full shadow-2xl shadow-accent/20">
          <a
            href={floatingWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-full bg-accent text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center block"
            aria-label="Direct message Shefeer on WhatsApp"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
          </a>
        </GlassSurface>
      </div>
    </main>
  );
}
