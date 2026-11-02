import React from 'react';
import { siteConfig, SITE_URL } from '@/lib/site-config';

/**
 * JsonLd component injecting Schema.org structured data:
 * - Person (Muhammed Shefeer K)
 * - WebSite (Portfolio)
 * - BreadcrumbList (Home > Work > About > Services > Contact)
 * 
 * Strict JSON.stringify prevents any syntax errors or invalid formatting.
 */
export default function JsonLd() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: siteConfig.fullName,
    alternateName: siteConfig.brandName,
    jobTitle: siteConfig.profession,
    url: SITE_URL,
    image: `${SITE_URL}/assets/shefeer.png`,
    description: siteConfig.bio.paragraphs[0],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kochi',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
    },
    email: `mailto:${siteConfig.contact.email}`,
    telephone: `+${siteConfig.contact.whatsappNumber}`,
    sameAs: [
      siteConfig.contact.instagramUrl,
      siteConfig.contact.linkedinUrl,
      'https://github.com/shefeer12',
    ],
    knowsAbout: [
      'Video Editing',
      'Adobe Premiere Pro',
      'Adobe After Effects',
      'CapCut',
      'DaVinci Resolve',
      'Color Grading',
      'Sound Design',
      'Visual Storytelling',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: `${siteConfig.brandName} | ${siteConfig.profession}`,
    description: siteConfig.tagline,
    publisher: {
      '@id': `${SITE_URL}/#person`,
    },
    inLanguage: 'en-US',
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Selected Work',
        item: `${SITE_URL}#work`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'About',
        item: `${SITE_URL}#about`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Services',
        item: `${SITE_URL}#services`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Contact',
        item: `${SITE_URL}#contact`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
    </>
  );
}
