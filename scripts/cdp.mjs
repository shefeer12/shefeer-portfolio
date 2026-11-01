import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';

export async function launchChrome(url = 'about:blank', options = {}) {
  const port = options.port || 9222;
  const userDataDir = options.userDataDir || `${process.env.TEMP || 'C:\\Temp'}\\chrome-test-profile-${Date.now()}`;
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    url
  ], { stdio: 'ignore' });

  // Wait for Chrome to be ready
  let endpoint = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        const data = await res.json();
        endpoint = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!endpoint) {
    chromeProc.kill();
    throw new Error('Failed to connect to Chrome CDP');
  }

  // Get active page target
  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await listRes.json();
  const pageTarget = pages.find(p => p.type === 'page') || pages[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) => {
    const id = idCounter++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  return {
    send,
    eval: async (expression) => {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text || 'Eval exception');
      }
      return res.result?.value;
    },
    navigate: async (targetUrl) => {
      await send('Page.navigate', { url: targetUrl });
      await new Promise(r => setTimeout(r, 1200));
    },
    setViewport: async (width, height, isMobile = false) => {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: isMobile
      });
    },
    screenshot: async (filepath) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    },
    close: async () => {
      try { ws.close(); } catch {}
      try { chromeProc.kill(); } catch {}
    }
  };
}
