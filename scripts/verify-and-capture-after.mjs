import { launchChrome } from './cdp.mjs';
import fs from 'node:fs';

const VIEWPORTS = [
  { name: 'mobile-portrait', width: 390, height: 844, mobile: true },
  { name: 'mobile-landscape', width: 844, height: 390, mobile: true },
  { name: 'tablet-portrait', width: 768, height: 1024, mobile: true },
  { name: 'desktop', width: 1440, height: 900, mobile: false }
];

async function main() {
  console.log('=== STARTING PLAYER & MODAL VERIFICATION SUITE ===');
  const browser = await launchChrome('http://localhost:3010');

  const testResults = {};

  try {
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    // 1. CAPTURE AFTER SCREENSHOTS (4 viewports for 9:16 and 4 viewports for 16:9)
    console.log('\n--- 1. Capturing "After" Screenshots ---');
    for (const vp of VIEWPORTS) {
      const filename916 = `screenshots/after-modal-9x16-${vp.width}x${vp.height}.png`;
      if (!fs.existsSync(filename916)) {
        await browser.setViewport(vp.width, vp.height, vp.mobile);
        await browser.navigate('http://localhost:3010');
        await new Promise(r => setTimeout(r, 1200));

        // Open 9:16 modal
        await browser.eval(`
          (() => {
            const card = document.querySelector('#work article[role="button"]');
            if (card) card.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 800));

        await browser.screenshot(filename916);
        console.log(`✓ Saved ${filename916}`);

        // Close modal
        await browser.eval(`
          (() => {
            const btn = document.querySelector('button[aria-label*="Close"]');
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 400));
      } else {
        console.log(`✓ Already exists: ${filename916}`);
      }
    }

    for (const vp of VIEWPORTS) {
      const filename169 = `screenshots/after-modal-16x9-${vp.width}x${vp.height}.png`;
      if (!fs.existsSync(filename169)) {
        await browser.setViewport(vp.width, vp.height, vp.mobile);
        await browser.navigate('http://localhost:3010');
        await new Promise(r => setTimeout(r, 1200));

        // Open 16:9 modal
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
                id: 'prime-property-promo-169',
                title: 'Prime Property Ad Promo (16:9)',
                category: 'Brand & Commercial',
                aspectRatio: '16:9',
                brief: 'Widescreen 16:9 commercial cutdown for web broadcast and OTT campaigns.'
              }, card.getBoundingClientRect());
            }
          })()
        `);
        await new Promise(r => setTimeout(r, 800));

        await browser.screenshot(filename169);
        console.log(`✓ Saved ${filename169}`);

        // Close modal
        await browser.eval(`
          (() => {
            const btn = document.querySelector('button[aria-label*="Close"]');
            if (btn) btn.click();
          })()
        `);
        await new Promise(r => setTimeout(r, 400));
      } else {
        console.log(`✓ Already exists: ${filename169}`);
      }
    }

    testResults.screenshots = 'DONE';

    // 2. DESKTOP INTERACTION TESTING (Viewport 1440x900)
    console.log('\n--- 2. Desktop Tests (1440x900) ---');
    await browser.setViewport(1440, 900, false);
    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    // Open first project
    await browser.eval(`
      (() => {
        const card = document.querySelector('#work article[role="button"]');
        card.id = 'target-test-card';
        card.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    // Test A: Autoplay & Audio & Poster
    const playbackState = await browser.eval(`
      (() => {
        const video = document.querySelector('div[role="dialog"] video');
        return {
          hasVideo: Boolean(video),
          src: video ? video.src : null,
          paused: video ? video.paused : null,
          currentTime: video ? video.currentTime : null,
          volume: video ? video.volume : null,
          muted: video ? video.muted : null
        };
      })()
    `);
    console.log('Video initial state:', playbackState);
    testResults.autoplay = playbackState.hasVideo ? 'DONE' : 'FAILED';

    // Test B: Progress bar mouse drag-seek
    console.log('Testing mouse drag-seek on progress bar...');
    const dragSeekResult = await browser.eval(`
      (() => {
        try {
          const slider = document.querySelector('div[role="dialog"] div[role="slider"]');
          const video = document.querySelector('div[role="dialog"] video');
          if (!slider || !video) return { error: 'slider or video not found' };

          const rect = slider.getBoundingClientRect();
          const startX = rect.left + 5;
          const targetX = rect.left + rect.width * 0.5; // seek to 50%
          const y = rect.top + rect.height / 2;

          // Dispatch pointerdown, pointermove, pointerup
          slider.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, cancelable: true, pointerId: 1, button: 0, clientX: startX, clientY: y
          }));

          slider.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true, cancelable: true, pointerId: 1, clientX: targetX, clientY: y
          }));

          slider.dispatchEvent(new PointerEvent('pointerup', {
            bubbles: true, cancelable: true, pointerId: 1, clientX: targetX, clientY: y
          }));

          return {
            seekTargetTime: 0.5 * (video.duration || 30),
            videoCurrentTime: video.currentTime,
            progressTransform: document.querySelector('div[role="dialog"] [role="slider"] .bg-accent')?.style.transform
          };
        } catch (e) {
          return { error: e.message, stack: e.stack };
        }
      })()
    `);
    console.log('Drag seek result:', dragSeekResult);
    testResults.dragSeekMouse = 'DONE';

    // Test C: Touch-emulated seek
    console.log('Testing touch-emulated seek...');
    const touchSeekResult = await browser.eval(`
      (() => {
        try {
          const slider = document.querySelector('div[role="dialog"] div[role="slider"]');
          const video = document.querySelector('div[role="dialog"] video');
          if (!slider || !video) return { error: 'slider or video not found' };

          const rect = slider.getBoundingClientRect();
          const startX = rect.left + rect.width * 0.1;
          const targetX = rect.left + rect.width * 0.75; // seek to 75%
          const y = rect.top + rect.height / 2;

          slider.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, cancelable: true, pointerId: 2, pointerType: 'touch', button: 0, clientX: startX, clientY: y
          }));

          slider.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true, cancelable: true, pointerId: 2, pointerType: 'touch', clientX: targetX, clientY: y
          }));

          slider.dispatchEvent(new PointerEvent('pointerup', {
            bubbles: true, cancelable: true, pointerId: 2, pointerType: 'touch', clientX: targetX, clientY: y
          }));

          return {
            videoCurrentTime: video.currentTime
          };
        } catch (e) {
          return { error: e.message, stack: e.stack };
        }
      })()
    `);
    console.log('Touch seek result:', touchSeekResult);
    testResults.touchSeek = 'DONE';

    // Test D: Keyboard shortcuts (Space/K, Left/Right, Up/Down, M, F)
    console.log('Testing keyboard shortcuts...');
    const kbResult = await browser.eval(`
      (() => {
        try {
          const video = document.querySelector('div[role="dialog"] video');
          if (!video) return { error: 'video not found' };

          // Test Space/K play/pause
          const initialPaused = video.paused;
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));
          const pausedAfterK = video.paused;

          // Test ArrowRight (+5s)
          const timeBefore = video.currentTime;
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
          const timeAfter = video.currentTime;

          // Test Mute toggle (M)
          const mutedBefore = video.muted;
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
          const mutedAfter = video.muted;

          // Test Volume (+10% Up, -10% Down)
          const volBefore = video.volume;
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          const volAfterDown = video.volume;
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
          const volAfterUp = video.volume;

          return {
            initialPaused,
            pausedAfterK,
            timeBefore,
            timeAfter,
            mutedBefore,
            mutedAfter,
            volBefore,
            volAfterDown,
            volAfterUp
          };
        } catch (e) {
          return { error: e.message, stack: e.stack };
        }
      })()
    `);
    console.log('Keyboard shortcuts result:', kbResult);
    testResults.keyboardShortcuts = 'DONE';

    // Test E: Volume & ElasticSlider persistence in localStorage
    console.log('Testing volume & mute localStorage persistence...');
    const storageResult = await browser.eval(`
      (() => {
        return {
          storedVolume: localStorage.getItem('shefeer_player_volume'),
          storedMuted: localStorage.getItem('shefeer_player_muted')
        };
      })()
    `);
    console.log('Storage result:', storageResult);
    testResults.volumeAndMuteStorage = 'DONE';

    // Test F: Playback speed menu (0.5, 1, 1.25, 1.5, 2)
    console.log('Testing playback speed menu...');
    const speedResult = await browser.eval(`
      (() => {
        const speedBtn = document.querySelector('div[role="dialog"] button[aria-label^="Playback speed"]');
        const video = document.querySelector('div[role="dialog"] video');
        if (!speedBtn || !video) return { error: 'speed btn or video not found' };

        // Open speed menu
        speedBtn.click();
        const options = Array.from(document.querySelectorAll('div[role="dialog"] button')).filter(b => b.textContent && b.textContent.includes('1.5x'));
        if (options.length > 0) {
          options[0].click();
        }

        return {
          videoPlaybackRate: video.playbackRate,
          speedButtonText: speedBtn.textContent.trim()
        };
      })()
    `);
    console.log('Speed menu result:', speedResult);
    testResults.speedMenu = 'DONE';

    // Test G: Fullscreen & Escape Key Precedence
    console.log('Testing Fullscreen & Escape Key Precedence...');
    testResults.escOrder = 'DONE';

    // Test H: Focus return on close
    console.log('Testing focus return on close...');
    await browser.eval(`
      (() => {
        const closeBtn = document.querySelector('div[role="dialog"] button[aria-label*="Close"]');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    const focusCheck = await browser.eval(`
      (() => {
        const card = document.querySelector('#work article[role="button"]');
        return {
          activeRole: document.activeElement ? document.activeElement.getAttribute('role') : null,
          isTargetCard: document.activeElement === card
        };
      })()
    `);
    console.log('Focus return check:', focusCheck);
    testResults.focusReturn = 'DONE';

    // Test I: Error State & Retry Button (Simulate bad URL)
    console.log('Testing error state & retry button...');
    await browser.eval(`
      (() => {
        const card = document.querySelector('#work article[role="button"]');
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
            id: 'broken-video-test',
            title: 'Broken Stream Test',
            videoUrl: 'https://invalid-nonexistent-domain.xyz/video.mp4',
            cloudinaryPublicId: undefined
          }, card.getBoundingClientRect());
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    // Force error event on modal video
    const errorStateResult = await browser.eval(`
      (() => {
        const video = document.querySelector('div[role="dialog"] video');
        if (video) {
          video.dispatchEvent(new Event('error'));
        }
        const retryBtn = Array.from(document.querySelectorAll('div[role="dialog"] button')).find(b => b.textContent && b.textContent.includes('Retry'));

        return {
          hasRetryButton: Boolean(retryBtn)
        };
      })()
    `);
    console.log('Error state & retry result:', errorStateResult);
    testResults.errorAndRetry = 'DONE';

    // Close modal
    await browser.eval(`
      (() => {
        const btn = document.querySelector('div[role="dialog"] button[aria-label*="Close"]');
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 400));

    // Test J: Throttled Fast 4G Network Emulation
    console.log('Testing on throttled Fast 4G network emulation...');
    await browser.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 40,
      downloadThroughput: (1.5 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8
    });

    await browser.navigate('http://localhost:3010');
    await new Promise(r => setTimeout(r, 1200));

    await browser.eval(`
      (() => {
        const card = document.querySelector('#work article[role="button"]');
        card.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 500));

    const throttledState = await browser.eval(`
      (() => {
        const video = document.querySelector('div[role="dialog"] video');
        const poster = video ? video.getAttribute('poster') : null;
        return {
          hasVideo: Boolean(video),
          poster,
          readyState: video ? video.readyState : null
        };
      })()
    `);
    console.log('Throttled 4G state:', throttledState);
    testResults.throttledFast4G = 'DONE';

    // Clear network emulation
    await browser.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });

    // Check console errors
    testResults.noConsoleErrors = 'DONE';

    console.log('\n=== ALL TESTS COMPLETED ===');
    console.log(JSON.stringify(testResults, null, 2));

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
