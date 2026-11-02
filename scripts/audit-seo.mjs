async function auditHtml() {
  console.log('--- STARTING HTML & METADATA AUDIT ---\n');

  // 1. Audit Homepage
  const res = await fetch('http://localhost:3010/');
  const html = await res.text();

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : null;
  console.log('Homepage Title:', title, '| Length:', title?.length, (title && title.length <= 60 ? 'PASS (<= 60 chars)' : 'FAIL'));

  // Description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
  const desc = descMatch ? descMatch[1] : null;
  console.log('Homepage Description:', desc, '| Length:', desc?.length, (desc && desc.length >= 130 && desc.length <= 155 ? 'PASS (130-155 chars)' : 'FAIL'));

  // Canonical
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || html.match(/<link\s+href="([^"]+)"\s+rel="canonical"/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  console.log('Canonical URL:', canonical, (canonical === 'https://shefeer.runs-on.dev' ? 'PASS' : 'FAIL'));

  // Open Graph
  const ogTitle = (html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:title"/i))?.[1];
  const ogDesc = (html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:description"/i))?.[1];
  const ogUrl = (html.match(/<meta\s+(?:property|name)="og:url"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:url"/i))?.[1];
  const ogImage = (html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i))?.[1];
  const ogSiteName = (html.match(/<meta\s+(?:property|name)="og:site_name"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:site_name"/i))?.[1];
  console.log('OG Title:', ogTitle ? 'PASS: ' + ogTitle : 'FAIL');
  console.log('OG Desc:', ogDesc ? 'PASS: ' + ogDesc.substring(0, 50) + '...' : 'FAIL');
  console.log('OG URL:', ogUrl ? 'PASS: ' + ogUrl : 'FAIL');
  console.log('OG Image:', ogImage ? 'PASS: ' + ogImage : 'FAIL');
  console.log('OG Site Name:', ogSiteName ? 'PASS: ' + ogSiteName : 'FAIL');

  // Twitter Cards
  const twCard = (html.match(/<meta\s+(?:property|name)="twitter:card"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:card"/i))?.[1];
  const twTitle = (html.match(/<meta\s+(?:property|name)="twitter:title"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:title"/i))?.[1];
  const twImage = (html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="twitter:image"/i))?.[1];
  console.log('Twitter Card:', twCard === 'summary_large_image' ? 'PASS (summary_large_image)' : 'FAIL');
  console.log('Twitter Title:', twTitle ? 'PASS' : 'FAIL');
  console.log('Twitter Image:', twImage ? 'PASS: ' + twImage : 'FAIL');

  // Headings
  const h1Matches = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || [];
  console.log('Total <h1> tags on homepage:', h1Matches.length, (h1Matches.length === 1 ? 'PASS (Strictly 1)' : 'FAIL'));

  // JSON-LD scripts
  const jsonLdMatches = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log('JSON-LD blocks found:', jsonLdMatches.length);
  for (let i = 0; i < jsonLdMatches.length; i++) {
    const raw = jsonLdMatches[i].replace(/<script[^>]*>|<\/script>/gi, '').trim();
    try {
      const parsed = JSON.parse(raw);
      console.log(`  JSON-LD #${i + 1} type: ${parsed['@type']} -> Valid Schema.org PASS`);
    } catch (err) {
      console.error(`  JSON-LD #${i + 1} Error:`, err.message, 'FAIL');
    }
  }

  // 2. Audit Robots.txt
  console.log('\n--- AUDITING ROBOTS.TXT ---');
  const robotsRes = await fetch('http://localhost:3010/robots.txt');
  const robotsText = await robotsRes.text();
  console.log('robots.txt content:\n' + robotsText.trim());
  const hasDisallowAdmin = robotsText.includes('Disallow: /admin');
  const hasSitemap = robotsText.includes('Sitemap: https://shefeer.runs-on.dev/sitemap.xml');
  console.log('robots.txt checks:', (hasDisallowAdmin && hasSitemap ? 'PASS' : 'FAIL'));

  // 3. Audit Sitemap.xml
  console.log('\n--- AUDITING SITEMAP.XML ---');
  const sitemapRes = await fetch('http://localhost:3010/sitemap.xml');
  const sitemapText = await sitemapRes.text();
  console.log('sitemap.xml content:\n' + sitemapText.trim());
  const hasLoc = sitemapText.includes('<loc>https://shefeer.runs-on.dev</loc>');
  console.log('sitemap.xml checks:', (hasLoc ? 'PASS' : 'FAIL'));

  // 4. Audit Admin Page
  console.log('\n--- AUDITING /ADMIN PAGE ---');
  const adminRes = await fetch('http://localhost:3010/admin');
  const adminHtml = await adminRes.text();
  const adminTitle = adminHtml.match(/<title>([^<]+)<\/title>/i)?.[1];
  const adminRobots = adminHtml.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1];
  console.log('Admin Title:', adminTitle, (adminTitle?.includes('Admin Dashboard') ? 'PASS' : 'FAIL'));
  console.log('Admin Robots tag:', adminRobots, (adminRobots?.includes('noindex') ? 'PASS' : 'FAIL'));
}

auditHtml().catch(console.error);
