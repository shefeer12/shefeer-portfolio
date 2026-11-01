import { launchChrome } from './cdp.mjs';

async function testItem3() {
  console.log('--- Testing Item 3: Gallery Stagger & Filter Crossfade ---');
  const browser = await launchChrome('http://localhost:3010');

  try {
    // 1. Desktop Test (1440px)
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Scroll toward gallery section
    await browser.eval(`
      (() => {
        const workSec = document.getElementById('work');
        if (workSec) workSec.scrollIntoView({ behavior: 'smooth' });
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));

    // Check all 13 cards rendered
    const cardCount = await browser.eval(`
      document.querySelectorAll('#work article[role="button"]').length
    `);
    console.log('Gallery total card count at 1440px:', cardCount);
    if (cardCount !== 13) {
      throw new Error(`Expected 13 gallery cards, found ${cardCount}`);
    }

    // Test filter crossfade: switch to 'Commercial'
    await browser.eval(`
      (() => {
        const commercialBtn = Array.from(document.querySelectorAll('#work button')).find(b => b.textContent.includes('Commercial'));
        if (commercialBtn) commercialBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    const commercialCount = await browser.eval(`
      document.querySelectorAll('#work article[role="button"]').length
    `);
    console.log('Commercial category card count:', commercialCount);

    // Switch back to 'All'
    await browser.eval(`
      (() => {
        const allBtn = Array.from(document.querySelectorAll('#work button')).find(b => b.textContent.includes('All'));
        if (allBtn) allBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    const allCount = await browser.eval(`
      document.querySelectorAll('#work article[role="button"]').length
    `);
    console.log('Reset to All count:', allCount);
    if (allCount !== 13) {
      throw new Error(`Failed to restore all 13 cards after filter reset`);
    }

    await browser.screenshot('scripts/screenshot-item3-desktop-1440.png');
    console.log('Saved scripts/screenshot-item3-desktop-1440.png');

    // 2. Mobile Test (390px)
    await browser.setViewport(390, 844, true);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    await browser.eval(`
      (() => {
        const workSec = document.getElementById('work');
        if (workSec) workSec.scrollIntoView({ behavior: 'instant' });
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    const mobileCardsCount = await browser.eval(`
      document.querySelectorAll('#work article[role="button"]').length
    `);
    console.log('Mobile 390px card count:', mobileCardsCount);
    if (mobileCardsCount !== 13) {
      throw new Error(`Expected 13 cards on mobile, found ${mobileCardsCount}`);
    }

    await browser.screenshot('scripts/screenshot-item3-mobile-390.png');
    console.log('Saved scripts/screenshot-item3-mobile-390.png');

    console.log('>>> ITEM 3 VERIFIED PASSED <<<');
  } finally {
    await browser.close();
  }
}

testItem3().catch((err) => {
  console.error('Test Item 3 FAILED:', err);
  process.exit(1);
});
