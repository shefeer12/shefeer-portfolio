import { launchChrome } from './cdp.mjs';

async function testItem5() {
  console.log('--- Testing Item 5: Hero Content Scroll Scrub ---');
  const browser = await launchChrome('http://localhost:3010');

  try {
    // 1. Desktop Test (1440px)
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Initial state at top of hero
    const topHeroState = await browser.eval(`
      (() => {
        const fg = document.querySelector('#home .site-container');
        if (!fg) return null;
        const style = window.getComputedStyle(fg);
        return {
          opacity: parseFloat(style.opacity),
          transform: style.transform
        };
      })()
    `);
    console.log('Top of Hero (Scroll 0) state:', topHeroState);

    // Scroll down 400px
    await browser.eval(`window.scrollTo(0, 450);`);
    await new Promise(r => setTimeout(r, 600));

    const scrolledHeroState = await browser.eval(`
      (() => {
        const fg = document.querySelector('#home .site-container');
        if (!fg) return null;
        const style = window.getComputedStyle(fg);
        return {
          opacity: parseFloat(style.opacity),
          transform: style.transform
        };
      })()
    `);
    console.log('Scrolled Hero (Scroll 450px) state:', scrolledHeroState);

    if (scrolledHeroState.opacity >= topHeroState.opacity) {
      throw new Error(`Expected opacity to fade on scroll down, got ${scrolledHeroState.opacity} >= ${topHeroState.opacity}`);
    }

    // Verify video layers intact
    const videoLayersIntact = await browser.eval(`
      (() => {
        const bg = document.querySelector('#home video');
        return Boolean(bg);
      })()
    `);
    console.log('Video layers intact in hero:', videoLayersIntact);
    if (!videoLayersIntact) {
      throw new Error('Video layer missing from hero!');
    }

    await browser.screenshot('scripts/screenshot-item5-desktop-1440.png');
    console.log('Saved scripts/screenshot-item5-desktop-1440.png');

    // 2. Mobile Test (390px)
    await browser.setViewport(390, 844, true);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    await browser.eval(`window.scrollTo(0, 350);`);
    await new Promise(r => setTimeout(r, 500));

    const mobileScrolledState = await browser.eval(`
      (() => {
        const fg = document.querySelector('#home .site-container');
        if (!fg) return null;
        return { opacity: parseFloat(window.getComputedStyle(fg).opacity) };
      })()
    `);
    console.log('Mobile 390px Scrolled Hero state:', mobileScrolledState);

    await browser.screenshot('scripts/screenshot-item5-mobile-390.png');
    console.log('Saved scripts/screenshot-item5-mobile-390.png');

    console.log('>>> ITEM 5 VERIFIED PASSED <<<');
  } finally {
    await browser.close();
  }
}

testItem5().catch((err) => {
  console.error('Test Item 5 FAILED:', err);
  process.exit(1);
});
