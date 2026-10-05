# Weatherise · Marketing Kit

Trailer, posters, and feature reels for Weatherise, Top 10 Finalist at the Vietnam AI Open Hackathon 2026.
Every number in these assets matches the website, the README, and [docs/tech_stack_and_metrics_summary.md](../docs/tech_stack_and_metrics_summary.md).

```
marketing/
├── trailer/
│   ├── weatherise-trailer-1080p60.mp4            master · clean picture, soft English subtitles
│   ├── weatherise-trailer-captioned-1080p60.mp4  captions burned in · for muted autoplay
│   ├── weatherise-trailer-web.mp4                cut used on the website (desktop, iPad)
│   ├── weatherise-trailer-mobile.mp4             720p cut the website serves to phones
│   ├── weatherise-trailer.en.srt / .en.vtt       English subtitles
│   └── weatherise-trailer-thumbnail.jpg          cover frame
├── posters/
│   ├── weatherise-poster-vertical(-back).png / .jpg     3600 × 5400 · 2:3, front + back
│   └── weatherise-poster-horizontal(-back).png / .jpg   3840 × 2160 · 16:9, front + back
├── reels/
│   └── weatherise-reel-{ask,consensus,rules,replan}.mp4 / .jpg
└── sync.sh                                        copies fresh renders in here
```

> Only this README and `sync.sh` are committed. The asset folders are copies of what `apps/web/public/` holds (or heavy masters), so they are git-ignored; after cloning, run `bash marketing/sync.sh`, or render first (see [Regenerate](#regenerate)).

## Which File Where

| Asset | Spec | Use it for |
|---|---|---|
| **Trailer, master** | 1920 × 1080 · 60 fps · H.264 · AAC 256k · −14 LUFS · 60 s · ~75 MB | YouTube, pitch decks, demo-day screens. The English subtitle track can be switched on or off. |
| **Trailer, captioned** | Same as the master, with captions drawn in the trailer's own style | LinkedIn, Facebook, X: feeds autoplay without sound. |
| **Trailer, web** | 1600 × 900 · 30 fps · 3 Mbps · ~11 MB | Websites, email, Slack, anywhere file size matters. |
| **Trailer, mobile** | 1280 × 720 · 30 fps · H.264 Main · ~7 MB | Messaging apps (Zalo, Messenger, WhatsApp) and phones on mobile data; plays on every device. |
| **Subtitles** | `.srt` (17 cues) · `.vtt` (positioned at 85% height) | Upload the `.srt` to YouTube or LinkedIn; the `.vtt` is for HTML `<video>`. |
| **Poster, vertical** | 3600 × 5400 PNG (12 × 18 in at 300 dpi) · JPG for screens | Print, booth standee, Instagram portrait (crop to 4:5). Its two QR codes open the live demo and the GitHub repo. |
| **Poster, horizontal** | 3840 × 2160 PNG (4K) · JPG for screens | Slides, event screens, LinkedIn or X banner, README hero. Same QR codes, sized to scan from a 1080p screen. |
| **Feature reels** | 1600 × 1040 · 30 fps · ~11 s each, with sound | Product walkthroughs and social carousels, one feature per reel. |

The four reels:

- **ask**: ask a question in plain language.
- **consensus**: seven sources fused into one forecast, with 94% agreement.
- **rules**: every answer checked against real safety rules.
- **replan**: when Friday turns stormy, the plan moves indoors.

**Double-sided print:** every poster has a back (`-back`), the same size as its front. The front sells the product, with the stats and QR codes. The back is "Inside Weatherise": the real answer screen with callouts on seven features, the 4.8 s pipeline, how the team built it, the team and mentors, and the stack. Print front and back on the same sheet; flip on the long edge for the vertical poster and on the short edge for the horizontal.

## Trailer Script (60 s)

Problem → product → features → results → close, voiced by Kokoro-82M (deep American male: am_onyx 0.6 + am_michael 0.4) over an original synthesized score.

| Time | Voiceover |
|---|---|
| 0:01 | Every forecast is a promise. |
| 0:04 | In Da Nang, it breaks. |
| 0:07 | Last autumn, storms cancelled or postponed up to forty percent of tours. |
| 0:42 | Ninety-one percent of calls match the experts. |
| 0:45 | A decision in under five seconds. |
| 0:47 | Zero unsafe calls. |
| 0:49 | Top ten at the Vietnam AI Open Hackathon. |
| 0:55 | The best weather is the weather you planned for. |

The full cue list with exact timings is in `trailer/weatherise-trailer.en.srt`.

## Numbers and Sources

Use these exact figures in posts, captions, and slides.

### The Problem (sourced)

| Claim | Source |
|---|---|
| **15–40%** of tour bookings cancelled or postponed at Central Vietnam operators, Oct–Nov 2025 rains | VnExpress International, [Storms, floods disrupt tourism in central Vietnam](https://e.vnexpress.net/news/travel/storms-floods-disrupt-tourism-in-central-vietnam-4960387.html), Nov 6, 2025 |
| **9–13 km** grid spacing of global models (ECMWF IFS 9 km, NOAA GFS ~13 km) | [ECMWF Newsletter 176](https://www.ecmwf.int/en/newsletter/176/earth-system-science/ifs-upgrade-brings-many-improvements-and-unifies-medium) · [NOAA EMC GFS](https://www.emc.ncep.noaa.gov/emc/pages/numerical_forecast_systems/gfs.php) |
| **79%** of heat-stress work hours lost by 2030 fall on agriculture and construction | ILO, [Working on a warmer planet](https://www.ilo.org/publications/major-publications/working-warmer-planet-effect-heat-stress-productivity-and-decent-work), 2019 |
| **14.3%** hallucination rate of a leading reasoning model on summaries | Vectara, [HHEM 2.1 results](https://www.vectara.com/blog/deepseek-r1-hallucinates-more-than-deepseek-v3), Jan 2025 |
| **10.9 million** visitors to Da Nang in 2024 | VietnamPlus, [Da Nang looks to attract 11.9 million tourists in 2025](https://en.vietnamplus.vn/da-nang-looks-to-attract-119-million-tourists-in-2025-post307707.vnp) |

### Weatherise (hackathon targets)

These are **design targets projected from the architecture and test runs on 8× NVIDIA H200**, not independent benchmarks. When there is room, say "target" or "projected".

| Headline | Detail | Backing |
|---|---|---|
| **91%** decision accuracy | Go / no-go calls match domain experts · 120 scenarios across tourism, construction, and agriculture | Blind review by a site engineer, an agronomist, and a tour operator |
| **4.8 s** to a decision | Median full answer · verdict streams at 2.6 s · p95 9 s · 1,247 runs | Budget: parse 0.6 s · 7 APIs in parallel 1.2 s · arbiter 0.7 s · rules 0.05 s · streamed answer ~1.9 s |
| **−12%** forecast error | 24–72 h temperature MAE vs. the best single source; −22% vs. raw GFS · 180 days | Multi-source fusion with bias correction; see Hagedorn, Hamill & Whitaker, [*MWR* 136(7), 2008](https://journals.ametsoc.org/view/journals/mwre/136/7/2007mwr2410.1.xml) |
| **0** unsafe go-calls | 212 red-team prompts · 94% (199) blocked at input · the other 13 vetoed by the rule engine | The rule engine holds a veto the LLM cannot override, because guardrails alone are often bypassed: [arXiv 2504.11168](https://arxiv.org/abs/2504.11168) · [arXiv 2409.00137](https://arxiv.org/abs/2409.00137) |
| **100%** resilience | Every question answered with 2 of 7 weather sources switched off | Path B consensus degrades gracefully |
| **87.2%** context recovery | Missing details filled automatically via MCP & RAG (156 / 179) | `ContextGapReport` audit trail |
| **~12 min → ~5 s** | Checking four weather apps by hand vs. one Weatherise answer | Team estimate |

### Copy Lines

- **Tagline:** The best weather is the weather you planned for.
- **One-liner:** Weatherise turns forecasts from seven sources into clear go / no-go decisions for tourism, construction, and agriculture in Da Nang.
- **Hook:** Weather apps predict. Weatherise decides.
- **Credentials:** Top 10 Finalist · Vietnam AI Open Hackathon 2026 · Multi-agent AI on NVIDIA NIM · 8× H200
- **Feature keywords (as on the posters):** Plain-language Q&A · 7-source consensus · Safety-rule engine · Auto re-planning
- **Links:** live demo [weatherise-vietnam-ai-open-hackatho.vercel.app](https://weatherise-vietnam-ai-open-hackatho.vercel.app) · GitHub [BennedictQuanTon/Weatherise_Vietnam-AI-Open-Hackathon-2026](https://github.com/BennedictQuanTon/Weatherise_Vietnam-AI-Open-Hackathon-2026)
- **Seven sources:** Open-Meteo, OpenWeatherMap, WeatherAPI, Tomorrow.io, Visual Crossing, 7Timer, Stormglass

## Regenerate

From `apps/web/`, with the dev server running on :3000 for the UI captures:

```bash
# Trailer (≈ 3.5 min per 60 fps render)
<kokoro-venv>/bin/python video/trailer/voiceover.py   # voice + timeline (Kokoro-82M, offline)
node video/trailer/capture-ui.mjs                      # real app screenshots
node video/trailer/render.mjs --fps 60                 # master + web & mobile cuts + .srt/.vtt + thumbnail
node video/trailer/render.mjs --fps 60 --subs          # captioned cut

# Posters and reels (qr.py only when a link changes; needs: pip install segno)
python video/poster/qr.py
node video/poster/capture-ui.mjs                       # only when the answer screen changes; then re-check the pins in poster-back.html
node video/poster/render.mjs                           # front + back, vertical + horizontal
node video/render.mjs                                  # all four reels + mobile cuts (or: node video/render.mjs consensus)

# Copy everything here
bash ../../marketing/sync.sh
```

Needs Google Chrome, ffmpeg, and puppeteer-core (a dev dependency); the audio mix needs Python with numpy, scipy, and soundfile. To change a number, edit `video/trailer/script.json` and `trailer.html` (trailer), `video/poster/poster.html` (posters), and `components/landing/content.ts` (website) together.

## Credits and Licensing

- Voice: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache 2.0), generated locally.
- Music and sound effects: synthesized in code (`video/trailer/audio.py`); original, with no third-party samples.
- Organizer and partner logos (NVIDIA, Viettel, Sovico, DSAC, OpenACC) belong to their owners and are shown only to credit the hackathon.
