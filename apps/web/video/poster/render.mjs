// Renders the Weatherise posters (front + back, for double-sided print) to public/posters/.
//   node video/poster/render.mjs
// Vertical: 1200×1800 css @3× → 3600×5400 PNG (2:3, prints 12×18 in at 300 dpi).
// Horizontal: 1920×1080 css @2× → 3840×2160 PNG (4K 16:9).
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "public", "posters");
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(OUT, { recursive: true });

// Brand icons for the back, read from the landing page's stack list (a JSON array inside the TS file).
const iconsTs = readFileSync(join(HERE, "..", "..", "components", "landing", "stackIcons.ts"), "utf8");
const start = iconsTs.indexOf("= [", iconsTs.indexOf("STACK_ICONS")) + 2;
const STACK = JSON.parse(iconsTs.slice(start, iconsTs.indexOf("\n];", start) + 2));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.evaluateOnNewDocument((s) => { window.STACK = s; }, STACK);
for (const [file, layout, w, h, dpr, name] of [
  ["poster.html", "v", 1200, 1800, 3, "weatherise-poster-vertical"],
  ["poster.html", "h", 1920, 1080, 2, "weatherise-poster-horizontal"],
  ["poster-back.html", "v", 1200, 1800, 3, "weatherise-poster-vertical-back"],
  ["poster-back.html", "h", 1920, 1080, 2, "weatherise-poster-horizontal-back"],
]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await page.goto(`${pathToFileURL(join(HERE, file)).href}?layout=${layout}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.layoutLeaders?.());
  const el = await page.$("#poster");
  await el.screenshot({ path: join(OUT, `${name}.png`) });
  await el.screenshot({ path: join(OUT, `${name}.jpg`), type: "jpeg", quality: 92 });
  console.log(`${name}: ${w * dpr}×${h * dpr}`);
}
await browser.close();
