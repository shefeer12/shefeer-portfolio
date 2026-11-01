import { launchChrome } from './cdp.mjs';
import fs from 'node:fs';

const VIEWPORTS = [
  { name: 'mobile-portrait', width: 390, height: 844, mobile: true },
  { name: 'mobile-landscape', width: 844, height: 390, mobile: true },
  { name: 'tablet-portrait', width: 768, height: 1024, mobile: true },
  { name: 'desktop', width: 1440, height: 900, mobile: false }
];

async function captureModalScreenshots(prefix = 'before') {
  console.log(`--- Capturing ${prefix} screenshots for 9:16 and 16:9 modal ---`);
  const browser = await launchChrome('http://localhost:3010');

  try {
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    // First load page
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Helper to open modal for 9:16 (Card 0: Hanansha Luxury Home)
    const open916 = async () => {
      await browser.eval(`
        (() => {
          const card = document.querySelector('#work article[role="button"]');
          if (card) card.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 600));
    };

    // Helper to open modal for 16:9 (using React props on the card or simulated project)
    const open169 = async () => {
      await browser.eval(`
        (() => {
          // Find card fiber or click handler
          const cards = document.querySelectorAll('#work article[role="button"]');
          if (cards.length > 0) {
            const card = cards[0];
            const key = Object.keys(card).find(k => k.startsWith('__reactProps'));
            if (key && card[key] && card[key].onClick) {
              // Get first project from window or fiber
              const fiberKey = Object.keys(card).find(k => k.startsWith('__reactFiber'));
              let projectData = null;
              if (fiberKey) {
                let cur = card[fiberKey];
                while (cur && !projectData) {
                  if (cur.memoizedProps && cur.memoizedProps.project) {
                    projectData = cur.memoizedProps.project;
                  }
                  cur = cur.return;
                }
              }
              if (projectData) {
                // Simulate 16:9 project
                const p169 = {
                  ...projectData,
                  id: 'prime-property-promo-169',
                  title: 'Prime Property Ad Promo (16:9)',
                  aspectRatio: '16:9'
                };
                card[key].onClick({ currentTarget: card });
                // Now replace the selected project in parent state if possible or trigger
              }
            }
          }
        })()
      `);
    };

    // Let's test how 9:16 opens first
    for (const vp of VIEWPORTS) {
      console.log(`Capturing 9:16 at ${vp.width}x${vp.height} (${vp.name})...`);
      await browser.setViewport(vp.width, vp.height, vp.mobile);
      await browser.navigate('http://localhost:3010');
      await new Promise(r => setTimeout(r, 1000));

      await open916();
      const filename = `screenshots/${prefix}-modal-9x16-${vp.width}x${vp.height}.png`;
      await browser.screenshot(filename);
      console.log(`Saved ${filename}`);

      // Close modal
      await browser.eval(`
        (() => {
          const btn = document.querySelector('button[aria-label*="Close"]');
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 400));
    }

    // Now for 16:9: we can set the active project via window.__openModal169 or by modifying the project aspectRatio in DOM/fiber
    for (const vp of VIEWPORTS) {
      console.log(`Capturing 16:9 at ${vp.width}x${vp.height} (${vp.name})...`);
      await browser.setViewport(vp.width, vp.height, vp.mobile);
      await browser.navigate('http://localhost:3010');
      await new Promise(r => setTimeout(r, 1000));

      // Open with 16:9
      await browser.eval(`
        (() => {
          const card = document.querySelector('#work article[role="button"]');
          if (!card) return;
          const fiberKey = Object.keys(card).find(k => k.startsWith('__reactFiber'));
          let p = null;
          let setProj = null;
          let cur = card[fiberKey];
          while (cur) {
            if (cur.memoizedProps && cur.memoizedProps.project) {
              p = cur.memoizedProps.project;
            }
            if (cur.memoizedProps && cur.memoizedProps.onSelectProject) {
              setProj = cur.memoizedProps.onSelectProject;
            }
            cur = cur.return;
          }
          if (p && setProj) {
            setProj({
              ...p,
              id: 'sample-commercial-169',
              title: 'Prime Property Ad Promo (16:9)',
              category: 'Brand & Commercial',
              aspectRatio: '16:9',
              brief: 'Widescreen 16:9 commercial cutdown for web broadcast and OTT campaigns.'
            }, card.getBoundingClientRect());
          } else {
            card.click();
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 600));

      const filename = `screenshots/${prefix}-modal-16x9-${vp.width}x${vp.height}.png`;
      await browser.screenshot(filename);
      console.log(`Saved ${filename}`);

      // Close modal
      await browser.eval(`
        (() => {
          const btn = document.querySelector('button[aria-label*="Close"]');
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 400));
    }

    console.log(`--- All 8 ${prefix} screenshots captured successfully ---`);
  } finally {
    await browser.close();
  }
}

captureModalScreenshots('before').catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
