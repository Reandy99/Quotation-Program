const puppeteer = require('puppeteer-core');

async function scrape(page, url) {
  await page.setViewport({ width: 1280, height: 720 });
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 8000));

  return await page.evaluate(() => {
    const title = document.title;
    const h1 = document.querySelector('h1')?.innerText?.trim() || null;

    const candidates = Array.from(document.querySelectorAll('article, [role="article"]'));
    const posts = [];
    for (const el of candidates.slice(0, 12)) {
      const t = (el.innerText || '').trim();
      if (!t) continue;
      posts.push(t.length > 700 ? t.slice(0, 700) + '…' : t);
    }

    const bodyText = (document.body?.innerText || '').trim();
    const sample = bodyText ? (bodyText.length > 1600 ? bodyText.slice(0, 1600) + '…' : bodyText) : null;

    return { title, h1, posts, sample, locationHref: location.href };
  });
}

async function main() {
  const urls = process.argv.slice(2);
  const targets = urls.length ? urls : ['https://www.threads.com/@threads'];

  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:18800' });
  const out = [];

  for (const url of targets) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    try {
      const data = await scrape(page, url);
      out.push({ ok: true, url, ...data });
    } catch (e) {
      out.push({ ok: false, url, error: String(e && e.message ? e.message : e) });
    } finally {
      try { await page.close(); } catch {}
    }
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.disconnect();
}

main().catch((err) => {
  console.error('ERR:', err);
  process.exit(1);
});
