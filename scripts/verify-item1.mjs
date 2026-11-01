import { launchChrome } from './cdp.mjs';

async function testItem1() {
  console.log('--- Testing Item 1: Smooth Scroll with Lenis ---');
  const browser = await launchChrome('http://localhost:3010');

  try {
    // 1. Desktop Test (1440px)
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    const publicLenisState = await browser.eval(`
      ({
        hasLenis: typeof window.__lenis !== 'undefined',
        isStopped: window.__lenis ? window.__lenis.isStopped : null,
        smoothWheel: window.__lenis ? window.__lenis.options.smoothWheel : null,
        syncTouch: window.__lenis ? window.__lenis.options.syncTouch : null,
        htmlClass: document.documentElement.className
      })
    `);
    console.log('Desktop 1440px Public Page Lenis state:', publicLenisState);

    if (!publicLenisState.hasLenis || !publicLenisState.smoothWheel || publicLenisState.syncTouch !== false) {
      throw new Error('Public page Lenis configuration failed');
    }

    // Test anchor link scroll
    const initialScrollY = await browser.eval('window.scrollY');
    console.log('Initial scrollY:', initialScrollY);

    await browser.eval(`
      const link = document.querySelector('a[href="#work"]');
      if (link) link.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    const scrolledY = await browser.eval('window.scrollY');
    console.log('After anchor click scrollY:', scrolledY);

    if (scrolledY <= 100) {
      throw new Error('Anchor smooth scroll failed to scroll down to #work');
    }

    // Test Modal: Open first project modal and verify Lenis is paused and data-lenis-prevent is present
    await browser.eval(`
      const card = document.querySelector('article[role="button"]');
      if (card) card.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    const modalLenisState = await browser.eval(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        return {
          isModalOpen: Boolean(modal),
          hasLenisPrevent: modal ? modal.hasAttribute('data-lenis-prevent') : false,
          lenisIsStopped: window.__lenis ? window.__lenis.isStopped : null
        };
      })()
    `);
    console.log('Modal Open State:', modalLenisState);

    if (!modalLenisState.isModalOpen || !modalLenisState.hasLenisPrevent || !modalLenisState.lenisIsStopped) {
      throw new Error('Modal failed to pause Lenis or lacks data-lenis-prevent');
    }

    // Close modal
    await browser.eval(`
      const closeBtn = document.querySelector('button[aria-label*="Close"]');
      if (closeBtn) closeBtn.click();
    `);
    await new Promise(r => setTimeout(r, 600));

    const modalClosedLenisState = await browser.eval(`
      ({
        lenisIsStopped: window.__lenis ? window.__lenis.isStopped : null
      })
    `);
    console.log('Modal Closed Lenis State (resumed):', modalClosedLenisState);

    if (modalClosedLenisState.lenisIsStopped !== false) {
      throw new Error('Lenis failed to resume after closing modal');
    }

    // 2. Admin Check: Navigate to /admin and verify Lenis is NEVER present
    await browser.navigate('http://localhost:3010/admin');
    await new Promise(r => setTimeout(r, 1000));

    const adminLenisState = await browser.eval(`
      ({
        hasLenis: typeof window.__lenis !== 'undefined',
        htmlClass: document.documentElement.className
      })
    `);
    console.log('Admin Page Lenis State (must be false):', adminLenisState);

    if (adminLenisState.hasLenis) {
      throw new Error('Lenis is active on /admin! Violation of rule 1.');
    }

    // 3. Mobile Check (390px)
    await browser.setViewport(390, 844, true);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1000));

    const mobileState = await browser.eval(`
      ({
        hasLenis: typeof window.__lenis !== 'undefined',
        syncTouch: window.__lenis ? window.__lenis.options.syncTouch : null
      })
    `);
    console.log('Mobile 390px State (touch stays native):', mobileState);

    if (mobileState.syncTouch !== false) {
      throw new Error('Mobile touch is not native!');
    }

    await browser.screenshot('scripts/screenshot-item1-mobile-390.png');
    console.log('Captured scripts/screenshot-item1-mobile-390.png');

    console.log('>>> ITEM 1 VERIFIED PASSED <<<');
  } finally {
    await browser.close();
  }
}

testItem1().catch((err) => {
  console.error('Test Item 1 FAILED:', err);
  process.exit(1);
});
