// Makes the files the landing page plays, from the rendered masters in public/videos/.
//   node video/web-cuts.mjs            (after video/trailer/render.mjs and video/render.mjs)
//
// Each video becomes three files:
//   <name>-loop.webm  VP9, no audio track   ─┐ what autoplays (muted, inline, looping). A video with no audio track is
//   <name>-loop.mp4   H.264, no audio track ─┘ the case every browser autoplays most readily, iPhone and iPad included.
//   <name>-audio.m4a  AAC                     played in sync only after the visitor taps for sound.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_TAGS, cut } from "./web-video.mjs";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "videos");
const ff = (a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" });

const make = (master, name, width) => {
  const src = join(DIR, master);
  const vf = cut(width, ",fps=24");
  ff(["-i", src, "-map", "0:v", "-an", "-vf", vf, "-c:v", "h264_videotoolbox", "-b:v", "1100k", "-maxrate", "1500k", "-profile:v", "main", ...WEB_TAGS, join(DIR, `${name}-loop.mp4`)]);
  ff(["-i", src, "-map", "0:v", "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4",
    "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", join(DIR, `${name}-loop.webm`)]);
  ff(["-i", src, "-map", "0:a", "-vn", "-c:a", "aac", "-b:a", "128k", "-ac", "2", "-movflags", "+faststart", join(DIR, `${name}-audio.m4a`)]);
  console.log(`${name}: -loop.webm, -loop.mp4, -audio.m4a`);
};

make("weatherise-trailer.mp4", "weatherise-trailer", 1280);
for (const reel of ["ask", "consensus", "rules", "replan"]) make(`${reel}.mp4`, reel, 1280);
