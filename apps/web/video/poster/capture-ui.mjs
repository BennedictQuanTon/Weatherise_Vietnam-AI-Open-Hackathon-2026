// Captures the answer screen shown on the MacBook on the back of the posters.
//   node video/poster/capture-ui.mjs      (needs the web app on :3000)
// Output: public/landing/devices/mac-construction.jpg (3360 × 2182, the MacBook screen ratio).
// The callout pins in poster-back.html are placed by hand against this image (x / y in % of the screen); re-check them after a recapture.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.APP_URL || "http://localhost:3000";
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const W = 1680;
const H = Math.round((W * 1964) / 3024);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
await page.goto(`${BASE}/app?q=construction`, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.evaluate(() => localStorage.setItem("theme", "light"));
await page.reload({ waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 4000));
await page.addStyleTag({ content: "::-webkit-scrollbar{display:none} *{scrollbar-width:none}" });

await page.screenshot({ path: join(HERE, "..", "..", "public", "landing", "devices", "mac-construction.jpg"), type: "jpeg", quality: 90 });
await browser.close();
console.log("captured → public/landing/devices/mac-construction.jpg");
