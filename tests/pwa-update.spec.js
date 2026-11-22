import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

test('a deployed service worker update prompts and preserves local drafts after activation', async ({
  page,
  context,
}) => {
  let release = 1;
  const root = resolve('projects/pwa/dist');
  const types = {
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
  };
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + '/')) {
      response.writeHead(403).end();
      return;
    }
    try {
      let body = await readFile(path);
      if (pathname === '/sw.js')
        body = Buffer.concat([body, Buffer.from(`\n// deployment ${release}\n`)]);
      response.writeHead(200, {
        'Content-Type': types[extname(path)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    await page.goto(origin);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.getByLabel('Your username').fill('alex');
    await page.getByLabel('Community name').fill('Mountain community');
    await page.getByRole('button', { name: 'Create my workspace' }).click();
    const composer = page.getByLabel('Message to assistant');
    await composer.fill('Keep this unfinished field note across the update.');
    await expect(page.getByText('Draft saved on this device.', { exact: false })).toBeVisible();
    release = 2;
    // Returning to the app must check for new releases, without a navigation.
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    const update = page.getByRole('button', { name: 'Update app', exact: true });
    await expect(update).toBeVisible();
    await expect(composer).toHaveValue('Keep this unfinished field note across the update.');
    await Promise.all([page.waitForEvent('load'), update.click()]);
    await expect(page.getByLabel('Message to assistant')).toHaveValue(
      'Keep this unfinished field note across the update.',
    );
    await expect(page.getByRole('button', { name: 'Update app', exact: true })).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(
          async () => (await navigator.serviceWorker.getRegistration()).waiting === null,
        ),
      )
      .toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByLabel('Message to assistant')).toHaveValue(
      'Keep this unfinished field note across the update.',
    );
  } finally {
    await page.goto('about:blank');
    await new Promise((done) => server.close(done));
  }
});
