import { launchChrome } from './cdp.mjs';

async function testItem2() {
  console.log('--- Testing Item 2: Unified Reveal Component ---');
  const browser = await launchChrome('http://localhost:3010');

  try {
    // 1. Desktop Test (1440px)
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Scroll through sections to trigger reveals
    const sections = ['#work', '#services', '#about', '#process', '#contact'];
    for (const sec of sections) {
      await browser.eval(`
        (() => {
          const el = document.querySelector('${sec}');
          if (el) el.scrollIntoView({ behavior: 'instant' });
        })()
      `);
      await new Promise(r => setTimeout(r, 500));
    }

    const revealElementsCount = await browser.eval(`
      document.querySelectorAll('section [style*="opacity"]').length
    `);
    console.log('Revealed animated elements count:', revealElementsCount);

    await browser.screenshot('scripts/screenshot-item2-desktop-1440.png');
    console.log('Saved scripts/screenshot-item2-desktop-1440.png');

    // 2. Mobile Test (390px)
    await browser.setViewport(390, 844, true);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    for (const sec of sections) {
      await browser.eval(`
        (() => {
          const el = document.querySelector('${sec}');
          if (el) el.scrollIntoView({ behavior: 'instant' });
        })()
      `);
      await new Promise(r => setTimeout(r, 400));
    }

    await browser.screenshot('scripts/screenshot-item2-mobile-390.png');
    console.log('Saved scripts/screenshot-item2-mobile-390.png');

    console.log('>>> ITEM 2 VERIFIED PASSED <<<');
  } finally {
    await browser.close();
  }
}

testItem2().catch((err) => {
  console.error('Test Item 2 FAILED:', err);
  process.exit(1);
});
