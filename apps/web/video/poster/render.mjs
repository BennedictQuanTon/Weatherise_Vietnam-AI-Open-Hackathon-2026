// Renders the Weatherise posters to public/posters/.
//   node video/poster/render.mjs
// Vertical: 1200×1800 css @3× → 3600×5400 PNG (2:3, prints 12×18 in at 300 dpi).
// Horizontal: 1920×1080 css @2× → 3840×2160 PNG (4K 16:9).
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "public", "posters");
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--allow-file-access-from-files"] });
const page = await browser.newPage();
for (const [layout, w, h, dpr, name] of [
  ["v", 1200, 1800, 3, "weatherise-poster-vertical"],
  ["h", 1920, 1080, 2, "weatherise-poster-horizontal"],
]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await page.goto(`${pathToFileURL(join(HERE, "poster.html")).href}?layout=${layout}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$("#poster");
  await el.screenshot({ path: join(OUT, `${name}.png`) });
  await el.screenshot({ path: join(OUT, `${name}.jpg`), type: "jpeg", quality: 92 });
  console.log(`${name}: ${w * dpr}×${h * dpr}`);
}
await browser.close();
