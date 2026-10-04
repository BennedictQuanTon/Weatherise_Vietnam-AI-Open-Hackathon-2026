"""Generate the trailer voiceover with Kokoro and write per-line timings.

Run with a Python env that has `kokoro` installed (model: hexgrad/Kokoro-82M):
    python apps/web/video/trailer/voiceover.py
Outputs (in build/): vo_raw.wav (24 kHz mono) and timeline.json (start/end per line).
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

HERE = Path(__file__).parent
OUT = HERE / "build"
SR = 24000


def trim(a: np.ndarray, thresh: float = 0.01) -> np.ndarray:
    idx = np.where(np.abs(a) > thresh)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 600] if len(idx) else a


def main() -> None:
    OUT.mkdir(exist_ok=True)
    script = json.loads((HERE / "script.json").read_text())
    pipe = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M", device="cpu")
    voice = sum(w * pipe.load_voice(name) for name, w in script["voice"]["blend"].items())

    t = script["start"]
    track = [np.zeros(int(t * SR), dtype=np.float32)]
    timeline = []
    for line in script["lines"]:
        audio = np.concatenate([np.asarray(r.audio, dtype=np.float32) for r in pipe(line["text"], voice=voice, speed=line["speed"])])
        audio = trim(audio)
        dur = len(audio) / SR
        timeline.append({"id": line["id"], "text": line["text"], "start": round(t, 3), "end": round(t + dur, 3)})
        track += [audio, np.zeros(int(line["pause"] * SR), dtype=np.float32)]
        t += dur + line["pause"]
        print(f'{line["id"]:3s} {timeline[-1]["start"]:6.2f}–{timeline[-1]["end"]:6.2f}  {line["text"]}')

    vo = np.concatenate(track)
    sf.write(OUT / "vo_raw.wav", vo, SR)
    (OUT / "timeline.json").write_text(json.dumps({"duration": round(t, 3), "lines": timeline}, indent=2))
    print(f"total {t:.2f}s")


if __name__ == "__main__":
    main()
