// Renders the Weatherise trailer: frames from trailer.html, Kokoro voice + generated score, EN subtitles.
//
//   1. python video/trailer/voiceover.py        (Kokoro env)  → build/vo_raw.wav, build/timeline.json
//   2. node video/trailer/capture-ui.mjs        (app on :3000) → ui/*.jpg
//   3. node video/trailer/render.mjs [--fps 60] [--preview] [--subs]
//
// Output: public/videos/weatherise-trailer.mp4 + .srt + .vtt + .jpg poster, and the site cuts -web.mp4 / -mobile.mp4.
// --subs burns the captions into the frames instead → public/videos/weatherise-trailer-captioned.mp4 (for muted autoplay on social).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const BUILD = join(HERE, "build");
const OUT = join(HERE, "..", "..", "public", "videos");
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PY = process.env.PYTHON || "/opt/miniconda3/bin/python";
const args = process.argv.slice(2);
const FPS = Number(args[args.indexOf("--fps") + 1]) || 60;
const PREVIEW = args.includes("--preview");
const SUBS = args.includes("--subs");
const NAME = SUBS ? "weatherise-trailer-captioned" : "weatherise-trailer";
const FRAMES = join(tmpdir(), "weatherise-trailer-frames");

const ff = (a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" });
function h264() {
  const list = execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" });
  if (/\blibx264\b/.test(list)) return ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-tune", "animation"];
  if (/\bh264_videotoolbox\b/.test(list)) return ["-c:v", "h264_videotoolbox", "-b:v", PREVIEW ? "6M" : "14M", "-profile:v", "high"];
  return ["-c:v", "libopenh264", "-b:v", "12M"];
}
const srtTime = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

const tl = JSON.parse(readFileSync(join(BUILD, "timeline.json"), "utf8"));
writeFileSync(join(BUILD, "timeline.js"), `window.TIMELINE=${JSON.stringify(tl)};\n`);
mkdirSync(OUT, { recursive: true });
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });

// Frames
const t0 = Date.now();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(HERE, "trailer.html")).href + (SUBS ? "?subs=1" : ""), { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
const { duration, cues } = await page.evaluate(() => ({ duration: window.TRAILER.duration, cues: window.TRAILER.cues }));
writeFileSync(join(BUILD, "cues.json"), JSON.stringify(cues));
const total = Math.round(duration * FPS);
for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.TRAILER.render(t), f / FPS);
  await page.screenshot({ path: join(FRAMES, `${String(f).padStart(5, "0")}.jpg`), type: "jpeg", quality: PREVIEW ? 80 : 94 });
  if (f % (FPS * 5) === 0) process.stdout.write(`\r  frames ${f}/${total}`);
}
await browser.close();
console.log(`\r  frames ${total}/${total} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);

// Audio
execFileSync(PY, [join(HERE, "audio.py")], { stdio: "inherit" });

// Subtitles (EN)
const srt = tl.lines.map((l, i) => `${i + 1}\n${srtTime(l.start)} --> ${srtTime(l.end + 0.25)}\n${l.text.replace("A.I.", "AI")}\n`).join("\n");
const srtPath = join(OUT, "weatherise-trailer.srt");
writeFileSync(srtPath, srt);

// Encode: video + mixed audio, loudness-normalized to −14 LUFS, subtitle track embedded (mov_text)
const mp4 = join(OUT, `${NAME}.mp4`);
ff([
  "-framerate", String(FPS), "-i", join(FRAMES, "%05d.jpg"),
  "-i", join(BUILD, "mix.wav"),
  // The captioned cut already shows them in frame, so it skips the soft subtitle track.
  ...(SUBS ? [] : ["-i", srtPath]),
  "-map", "0:v", "-map", "1:a", ...(SUBS ? [] : ["-map", "2:s"]),
  ...h264(), "-pix_fmt", "yuv420p",
  "-af", "loudnorm=I=-14:TP=-1.0:LRA=11",
  "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
  ...(SUBS ? [] : ["-c:s", "mov_text", "-metadata:s:s:0", "language=eng"]),
  "-t", duration.toFixed(3), "-movflags", "+faststart", mp4,
]);
const poster = join(FRAMES, `${String(Math.round((tl.lines.find((l) => l.id === "r2").end + 2.2) * FPS)).padStart(5, "0")}.jpg`);
if (existsSync(poster) && !SUBS) ff(["-i", poster, "-q:v", "3", join(OUT, "weatherise-trailer.jpg")]);

// Site cuts from the master: -web (1600 px, desktop & iPad) and -mobile (720p, Main profile, phones), plus WebVTT captions.
if (!SUBS) {
  const cut = (width, kbps, profile, aKbps, name) => {
    const enc = /\bh264_videotoolbox\b/.test(execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" }))
      ? ["-c:v", "h264_videotoolbox", "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.35)}k`, "-profile:v", profile]
      : ["-c:v", "libx264", "-preset", "slow", "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.35)}k`, "-bufsize", `${kbps * 2}k`, "-profile:v", profile];
    ff(["-i", mp4, "-map", "0:v", "-map", "0:a", "-vf", `scale=${width}:-2,fps=30`, ...enc, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", `${aKbps}k`, "-ac", "2", "-movflags", "+faststart", join(OUT, `${name}.mp4`)]);
  };
  cut(1600, 3000, "high", 160, "weatherise-trailer-web");
  cut(1280, 1600, "main", 128, "weatherise-trailer-mobile");
  const vtt = srt.trim().split(/\n\s*\n/).map((b) => {
    const [, time, ...text] = b.split("\n");
    return `${time.replaceAll(",", ".")} line:85%\n${text.join("\n")}`;
  });
  writeFileSync(join(OUT, "weatherise-trailer.vtt"), `WEBVTT\n\n${vtt.join("\n\n")}\n`);
}
console.log(`done → ${mp4} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
