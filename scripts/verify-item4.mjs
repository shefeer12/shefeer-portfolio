import { launchChrome } from './cdp.mjs';

async function testItem4() {
  console.log('--- Testing Item 4: Modal Scale & Fade from Clicked Card ---');
  const browser = await launchChrome('http://localhost:3010');

  try {
    // 1. Desktop Test (1440px)
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to work gallery
    await browser.eval(`
      (() => {
        const sec = document.getElementById('work');
        if (sec) sec.scrollIntoView({ behavior: 'instant' });
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    // Get position of card 2
    const cardRect = await browser.eval(`
      (() => {
        const cards = document.querySelectorAll('#work article[role="button"]');
        if (cards.length > 1) {
          const r = cards[1].getBoundingClientRect();
          return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
        }
        return null;
      })()
    `);
    console.log('Clicked Card Rect:', cardRect);

    // Click card 2
    await browser.eval(`
      (() => {
        const cards = document.querySelectorAll('#work article[role="button"]');
        if (cards.length > 1) cards[1].click();
      })()
    `);
    await new Promise(r => setTimeout(r, 450));

    // Check modal dialog transformOrigin
    const modalStyle = await browser.eval(`
      (() => {
        const dialog = document.querySelector('[role="dialog"] > div');
        if (!dialog) return null;
        return {
          transformOrigin: dialog.style.transformOrigin || window.getComputedStyle(dialog).transformOrigin,
          opacity: window.getComputedStyle(dialog).opacity
        };
      })()
    `);
    console.log('Modal Dialog Active Style:', modalStyle);

    if (!modalStyle || modalStyle.opacity !== '1') {
      throw new Error('Modal failed to open or reach full opacity');
    }

    await browser.screenshot('scripts/screenshot-item4-desktop-1440.png');
    console.log('Saved scripts/screenshot-item4-desktop-1440.png');

    // Close modal via Escape
    await browser.eval(`
      (() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 450));

    const isClosed = await browser.eval(`
      (() => !document.querySelector('[role="dialog"]'))()
    `);
    console.log('Modal closed after Escape:', isClosed);
    if (!isClosed) {
      throw new Error('Modal failed to close properly on Escape');
    }

    // 2. Mobile Test (390px)
    await browser.setViewport(390, 844, true);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    await browser.eval(`
      (() => {
        const sec = document.getElementById('work');
        if (sec) sec.scrollIntoView({ behavior: 'instant' });
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    // Click first card on mobile
    await browser.eval(`
      (() => {
        const firstCard = document.querySelector('#work article[role="button"]');
        if (firstCard) firstCard.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 450));

    const mobileModalOpen = await browser.eval(`
      (() => Boolean(document.querySelector('[role="dialog"]')))()
    `);
    console.log('Mobile modal open:', mobileModalOpen);
    if (!mobileModalOpen) {
      throw new Error('Modal failed to open on mobile');
    }

    await browser.screenshot('scripts/screenshot-item4-mobile-390.png');
    console.log('Saved scripts/screenshot-item4-mobile-390.png');

    // Close mobile modal via close button
    await browser.eval(`
      (() => {
        const closeBtn = document.querySelector('button[aria-label*="Close"]');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 450));

    const mobileModalClosed = await browser.eval(`
      (() => !document.querySelector('[role="dialog"]'))()
    `);
    console.log('Mobile modal closed after button click:', mobileModalClosed);
    if (!mobileModalClosed) {
      throw new Error('Mobile modal failed to close');
    }

    console.log('>>> ITEM 4 VERIFIED PASSED <<<');
  } finally {
    await browser.close();
  }
}

testItem4().catch((err) => {
  console.error('Test Item 4 FAILED:', err);
  process.exit(1);
});
