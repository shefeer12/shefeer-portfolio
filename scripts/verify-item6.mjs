import { launchChrome } from './cdp.mjs';

async function testItem6() {
  console.log('--- Testing Item 6: Magnetic Effect on Primary CTAs & WhatsApp Button ---');
  const browser = await launchChrome('http://localhost:3010');

  try {
    // 1. Desktop Test (1440px)
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Test floating WhatsApp button magnetic attraction
    const waBtnRect = await browser.eval(`
      (() => {
        const btn = document.querySelector('a[aria-label*="WhatsApp"]');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, top: r.top, width: r.width, height: r.height };
      })()
    `);
    console.log('Floating WhatsApp Button Pos:', waBtnRect);

    // Simulate mouse move over the button with an offset
    await browser.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: waBtnRect.x + 8,
      y: waBtnRect.y + 8
    });
    await new Promise(r => setTimeout(r, 300));

    const waTransformDisplaced = await browser.eval(`
      (() => {
        const magneticWrap = document.querySelector('a[aria-label*="WhatsApp"]').closest('[style*="transform"]');
        return magneticWrap ? magneticWrap.style.transform : 'none';
      })()
    `);
    console.log('WhatsApp Button Displaced Transform:', waTransformDisplaced);

    // Move mouse away
    await browser.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: 100,
      y: 100
    });
    await new Promise(r => setTimeout(r, 400));

    await browser.screenshot('scripts/screenshot-item6-desktop-1440.png');
    console.log('Saved scripts/screenshot-item6-desktop-1440.png');

    // 2. Mobile Test (390px)
    await browser.setViewport(390, 844, true);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    const mobileMagneticPresent = await browser.eval(`
      (() => {
        const wa = document.querySelector('a[aria-label*="WhatsApp"]').closest('div');
        return wa ? wa.hasAttribute('style') && wa.style.transform !== '' : false;
      })()
    `);
    console.log('Mobile 390px Magnetic disabled (must be false):', mobileMagneticPresent);
    if (mobileMagneticPresent) {
      throw new Error('Magnetic effect active on mobile touch! Violation of rule 6.');
    }

    await browser.screenshot('scripts/screenshot-item6-mobile-390.png');
    console.log('Saved scripts/screenshot-item6-mobile-390.png');

    console.log('>>> ITEM 6 VERIFIED PASSED <<<');
  } finally {
    await browser.close();
  }
}

testItem6().catch((err) => {
  console.error('Test Item 6 FAILED:', err);
  process.exit(1);
});
