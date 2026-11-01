import { launchChrome } from './cdp.mjs';

async function testItem7() {
  console.log('--- Testing Item 7: Orange Scroll Progress Line ---');
  const browser = await launchChrome('http://localhost:3010');

  try {
    // 1. Desktop Test (1440px)
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Progress bar at scroll 0
    const initialBarState = await browser.eval(`
      (() => {
        const bar = document.querySelector('div[aria-hidden="true"].bg-accent');
        if (!bar) return null;
        return {
          exists: true,
          style: bar.style.transform,
          className: bar.className
        };
      })()
    `);
    console.log('Initial Bar State (Scroll 0):', initialBarState);

    if (!initialBarState || !initialBarState.exists) {
      throw new Error('Scroll progress bar not found in DOM!');
    }

    // Scroll down 50% of the page
    await browser.eval(`
      (() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, totalHeight * 0.5);
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    const halfBarState = await browser.eval(`
      (() => {
        const bar = document.querySelector('div[aria-hidden="true"].bg-accent');
        if (!bar) return null;
        return {
          style: bar.style.transform
        };
      })()
    `);
    console.log('Halfway Scrolled Bar State:', halfBarState);

    if (!halfBarState.style || !halfBarState.style.includes('scaleX')) {
      throw new Error('Scroll progress bar is not animating scaleX!');
    }

    await browser.screenshot('scripts/screenshot-item7-desktop-1440.png');
    console.log('Saved scripts/screenshot-item7-desktop-1440.png');

    // 2. Admin Check: must NOT exist on /admin
    await browser.navigate('http://localhost:3010/admin');
    await new Promise(r => setTimeout(r, 1000));

    const adminBarState = await browser.eval(`
      (() => Boolean(document.querySelector('div[aria-hidden="true"].bg-accent')))()
    `);
    console.log('Admin Bar State (must be false):', adminBarState);
    if (adminBarState) {
      throw new Error('Scroll progress bar leaked to /admin! Rule violation.');
    }

    // 3. Mobile Test (390px)
    await browser.setViewport(390, 844, true);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    await browser.eval(`
      (() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, totalHeight * 0.7);
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    const mobileBarTransform = await browser.eval(`
      (() => {
        const bar = document.querySelector('div[aria-hidden="true"].bg-accent');
        return bar ? bar.style.transform : null;
      })()
    `);
    console.log('Mobile 390px Bar Transform:', mobileBarTransform);

    await browser.screenshot('scripts/screenshot-item7-mobile-390.png');
    console.log('Saved scripts/screenshot-item7-mobile-390.png');

    console.log('>>> ITEM 7 VERIFIED PASSED <<<');
  } finally {
    await browser.close();
  }
}

testItem7().catch((err) => {
  console.error('Test Item 7 FAILED:', err);
  process.exit(1);
});
