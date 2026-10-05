// Renders the landing-page feature reels to public/videos/<reel>.mp4 (+ <reel>-mobile.mp4 for phones, + .jpg poster).
//
//   node video/render.mjs                # all reels
//   node video/render.mjs ask rules      # selected reels
//
// Needs: Google Chrome (CHROME_PATH to override), ffmpeg on PATH, puppeteer-core (dev dependency).
// Frames come from video/reels.html at 30 fps, 1920×1248 (MacBook Pro screen ratio); sound effects are synthesized with ffmpeg
// and placed on each reel's cue list over a soft ambient pad.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "..", "public", "videos");
const FPS = 30;
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const REELS = process.argv.slice(2).length ? process.argv.slice(2) : ["ask", "consensus", "rules", "replan"];
const WORK = join(tmpdir(), "weatherise-reels");

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });

// Pick the best H.264 encoder this ffmpeg build has.
function h264Args() {
  const list = execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" });
  if (/\blibx264\b/.test(list)) return ["-c:v", "libx264", "-preset", "slow", "-crf", "23"];
  if (/\bh264_videotoolbox\b/.test(list)) return ["-c:v", "h264_videotoolbox", "-b:v", "4500k", "-profile:v", "high"];
  if (/\blibopenh264\b/.test(list)) return ["-c:v", "libopenh264", "-b:v", "4500k"];
  throw new Error("No H.264 encoder found in ffmpeg. Install ffmpeg with libx264.");
}

// ── Sound effects ────────────────────────────────────────────────────────
const SFX = {
  tick: "aevalsrc='0.5*sin(2*PI*2200*t)*exp(-90*t)':d=0.08",
  type: "anoisesrc=d=0.035:c=white:a=0.35,highpass=f=2500,afade=t=out:st=0:d=0.035",
  click: "aevalsrc='0.7*sin(2*PI*1400*t)*exp(-60*t)+0.3*sin(2*PI*700*t)*exp(-40*t)':d=0.12",
  pop: "aevalsrc='0.6*sin(2*PI*(380+1500*t)*t)*exp(-22*t)':d=0.18",
  whoosh: "anoisesrc=d=0.65:c=pink:a=0.6,highpass=f=250,lowpass=f=2600,afade=t=in:st=0:d=0.28,afade=t=out:st=0.3:d=0.35",
  alert: "aevalsrc='0.45*sin(2*PI*330*t)*exp(-5*t)+0.35*sin(2*PI*220*t)*exp(-5*t)':d=0.7",
  thud: "aevalsrc='0.8*sin(2*PI*(140-60*t)*t)*exp(-16*t)':d=0.28",
  chime: "aevalsrc='0.42*sin(2*PI*880*t)*exp(-3.5*t)+0.3*sin(2*PI*1318.5*t)*exp(-4.5*t)+0.18*sin(2*PI*1760*t)*exp(-6*t)':d=1.6",
  rain: "anoisesrc=d=2.6:c=pink:a=0.35,highpass=f=1200,lowpass=f=6000,afade=t=in:st=0:d=0.6,afade=t=out:st=1.6:d=1.0",
};

function makeSfx(dir) {
  for (const [name, src] of Object.entries(SFX)) {
    ff(["-f", "lavfi", "-i", src, "-ar", "44100", "-ac", "2", join(dir, `${name}.wav`)]);
  }
}

function makePad(path, duration) {
  const chord = "0.05*(sin(2*PI*130.81*t)+0.8*sin(2*PI*196*t)+0.6*sin(2*PI*261.63*t)+0.45*sin(2*PI*329.63*t))*(0.65+0.35*sin(2*PI*0.2*t))";
  ff(["-f", "lavfi", "-i", `aevalsrc='${chord}':d=${duration}`, "-af", `lowpass=f=1800,afade=t=in:st=0:d=1.2,afade=t=out:st=${duration - 1.6}:d=1.6`, "-ar", "44100", "-ac", "2", path]);
}

function mixAudio(dir, reel, cues, duration, out) {
  const pad = join(dir, `${reel}-pad.wav`);
  makePad(pad, duration);
  const inputs = ["-i", pad];
  const parts = [];
  cues.forEach((c, i) => {
    inputs.push("-i", join(dir, `${c.s}.wav`));
    const ms = Math.round(c.t * 1000);
    parts.push(`[${i + 1}:a]adelay=${ms}|${ms},volume=${c.v}[c${i}]`);
  });
  const labels = ["[0:a]", ...cues.map((_, i) => `[c${i}]`)].join("");
  const graph = `${parts.join(";")};${labels}amix=inputs=${cues.length + 1}:normalize=0:duration=first,alimiter=limit=0.9[aout]`;
  ff([...inputs, "-filter_complex", graph, "-map", "[aout]", "-t", String(duration), out]);
}

// ── Frames ───────────────────────────────────────────────────────────────
async function renderFrames(browser, reel, dir) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1248, deviceScaleFactor: 1 });
  await page.goto(`${pathToFileURL(join(ROOT, "reels.html")).href}?reel=${reel}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const { duration, cues } = await page.evaluate(() => ({ duration: window.REEL.duration, cues: window.REEL.cues }));
  const frames = Math.round(duration * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.REEL.render(t), f / FPS);
    await page.screenshot({ path: join(dir, `${String(f).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
  }
  await page.close();
  return { duration, cues, frames };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  rmSync(WORK, { recursive: true, force: true });
  const sfxDir = join(WORK, "sfx");
  mkdirSync(sfxDir, { recursive: true });
  makeSfx(sfxDir);

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--allow-file-access-from-files"] });
  for (const reel of REELS) {
    const t0 = Date.now();
    const frameDir = join(WORK, reel);
    mkdirSync(frameDir, { recursive: true });
    const { duration, cues, frames } = await renderFrames(browser, reel, frameDir);
    const audio = join(WORK, `${reel}.wav`);
    mixAudio(sfxDir, reel, cues, duration, audio);
    const mp4 = join(OUT, `${reel}.mp4`);
    ff([
      "-framerate", String(FPS), "-i", join(frameDir, "%05d.jpg"), "-i", audio,
      // JPEG frames are full range; phones need standard limited-range yuv420p (see video/trailer/render.mjs).
      ...h264Args(), "-vf", "scale=1600:-2:in_range=pc:out_range=tv,format=yuv420p", "-color_range", "tv", "-colorspace", "smpte170m",
      "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-shortest", mp4,
    ]);
    // Poster: the settled final state, shown before playback and when motion is reduced.
    // 960 px cut for phones (Main profile plays on every device)
    const fast = /\bh264_videotoolbox\b/.test(execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" }))
      ? ["-c:v", "h264_videotoolbox", "-b:v", "1200k", "-maxrate", "1600k"]
      : ["-c:v", "libx264", "-preset", "slow", "-crf", "26"];
    ff(["-i", mp4, "-vf", "scale=960:-2,format=yuv420p", ...fast, "-profile:v", "main", "-color_range", "tv", "-colorspace", "smpte170m", "-c:a", "aac", "-b:a", "112k", "-movflags", "+faststart", join(OUT, `${reel}-mobile.mp4`)]);
    const poster = join(frameDir, `${String(frames - Math.round(FPS * 0.6)).padStart(5, "0")}.jpg`);
    if (existsSync(poster)) ff(["-i", poster, "-vf", "scale=1600:-2", "-q:v", "4", join(OUT, `${reel}.jpg`)]);
    console.log(`${reel}: ${frames} frames, ${duration}s, ${cues.length} sound cues → ${mp4} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
