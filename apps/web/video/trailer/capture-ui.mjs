// Captures real app UI states (Retina) used by the trailer. Needs the web app on :3000.
//   node video/trailer/capture-ui.mjs
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "ui");
const BASE = process.env.APP_URL || "http://localhost:3000";
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROMPT =
  "We plan to pour the deck slab at Hoa Lien Overpass on Friday morning and run the tower crane all day. Is Friday safe? If not, when is the best pour window this week, and when must the crane stop?";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
const view = (w, h) => page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
const open = async (path) => {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await sleep(3500);
};
const shot = (name, opts = {}) => page.screenshot({ path: join(OUT, `${name}.jpg`), type: "jpeg", quality: 90, ...opts });

// 1) Home: typing the construction question, frame by frame (MacBook Pro 14" viewport)
await view(1512, 982);
await open("/app");
await shot("home");
const steps = 14;
for (let i = 1; i <= steps; i++) {
  const n = Math.round((PROMPT.length * i) / steps);
  await page.evaluate((v) => {
    const el = document.getElementById("home-question");
    const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, PROMPT.slice(0, n));
  await sleep(250);
  await shot(`type-${String(i).padStart(2, "0")}`);
}

// 2) Loading: pipeline steps ticking (captured mid-run)
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Send Question")?.click());
for (let i = 0; i < 4; i++) {
  await sleep(i === 0 ? 120 : 260);
  await shot(`loading-${i}`);
}
await sleep(1500);

// 3) Full-height answers (tall viewport: the report column fits without inner scrolling)
const tall = async (q, name, h, prep) => {
  await view(1512, h);
  await open(`/app?q=${q}`);
  if (prep) {
    await prep();
    await sleep(1800);
  }
  await shot(name);
};
await tall("construction", "construction", 3600);
await tall("tourism", "tourism-day2", 3900, () =>
  page.evaluate(() => document.querySelectorAll('[role="tab"]')[1]?.click()),
);
await tall("agriculture", "agriculture", 3600);

await browser.close();
console.log("captured →", OUT);
