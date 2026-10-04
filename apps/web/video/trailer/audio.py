"""Score, sound design and final mix for the Weatherise trailer.

Synthesizes an original cinematic bed (no samples, no licensing) locked to the voiceover timeline:
  · Act 1 (problem): low drone + rain noise in D minor, unresolved.
  · "It decides": a rising swell into a bright D-major bloom.
  · Features: warm pad + soft plucked arpeggio (the "product" theme).
  · Proof: a steady pulse that lifts on each number.
  · End card: the theme resolves on a held major chord.
Voice is EQ'd, compressed, given a short room, and the music ducks under it (sidechain).
Run: python apps/web/video/trailer/audio.py   (numpy, scipy, soundfile)
Inputs: build/vo_raw.wav, build/timeline.json, build/cues.json  →  Output: build/mix.wav (48 kHz stereo)
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

HERE = Path(__file__).parent
B = HERE / "build"
SR = 48000
rng = np.random.default_rng(7)


def note(n: str) -> float:
    names = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
    name, octave = n[:-1], int(n[-1])
    return 440.0 * 2 ** ((names[name] + 12 * (octave + 1) - 69) / 12)


def env(n: int, a: float, r: float) -> np.ndarray:
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 2
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def lowpass(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def highpass(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bandpass(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def pad(freqs, dur, amp=0.12, bright=1800, detune=0.004):
    """Supersaw-ish pad: detuned saws per note, filtered, slow vibrato."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for d in (-detune, 0, detune):
            ph = 2 * np.pi * f * (1 + d) * t + 0.3 * np.sin(2 * np.pi * 0.17 * t)
            out += signal.sawtooth(ph) * 0.33
    out = lowpass(out / len(freqs), bright, 2)
    return out * amp


def pluck(f, dur=1.2, amp=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t))
    return x * np.exp(-t * 4.2) * amp


def sub_hit(dur=1.6, amp=0.5, f0=58):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.8 * np.exp(-t * 18))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2) * amp


def noise(n):
    return rng.standard_normal(n)


def place(track, x, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(track):
        return
    j = min(len(track), i + len(x))
    track[i:j] += x[: j - i] * gain


def reverb(x, seconds=2.4, mix=0.25, damp=5000):
    """Cheap convolution reverb: exponentially decaying filtered noise IR."""
    n = int(seconds * SR)
    ir = noise(n) * np.exp(-np.arange(n) / SR * (6.9 / seconds))
    ir = lowpass(ir, damp, 1)
    ir /= np.sqrt(np.sum(ir**2))
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


# ─── SFX (48 kHz mono) ─────────────────────────────────────────────────────
def sfx(name):
    if name == "drop":
        t = np.arange(int(0.5 * SR)) / SR
        return np.sin(2 * np.pi * (1300 - 900 * t / 0.5) * t) * np.exp(-t * 14) * 0.5
    if name == "crack":
        n = int(0.6 * SR); t = np.arange(n) / SR
        return (highpass(noise(n), 1500) * np.exp(-t * 16) * 0.5 + sub_hit(0.6, 0.45, 70)[:n])
    if name == "stamp":
        n = int(0.35 * SR); t = np.arange(n) / SR
        return lowpass(noise(n), 2400) * np.exp(-t * 26) * 0.6 + sub_hit(0.35, 0.35, 95)[:n]
    if name == "whoosh":
        n = int(0.9 * SR); t = np.arange(n) / SR
        e = np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 2
        return bandpass(noise(n), 300, 3200) * e * 0.28
    if name == "tick":
        t = np.arange(int(0.08 * SR)) / SR
        return np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 90) * 0.4
    if name == "type":
        n = int(0.035 * SR)
        return highpass(noise(n), 2500) * np.linspace(1, 0, n) * 0.35
    if name == "click":
        t = np.arange(int(0.12 * SR)) / SR
        return (np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 60) + 0.4 * np.sin(2 * np.pi * 700 * t) * np.exp(-t * 40)) * 0.55
    if name == "pop":
        t = np.arange(int(0.2 * SR)) / SR
        return np.sin(2 * np.pi * (420 + 1500 * t) * t) * np.exp(-t * 22) * 0.45
    if name == "alert":
        t = np.arange(int(0.8 * SR)) / SR
        return (np.sin(2 * np.pi * 330 * t) + 0.75 * np.sin(2 * np.pi * 220 * t)) * np.exp(-t * 5) * 0.32
    if name == "chime":
        t = np.arange(int(2.2 * SR)) / SR
        return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(note("D6"), 0.32, 2.6), (note("A6"), 0.22, 3.2), (note("F#6"), 0.18, 3.0), (note("D7"), 0.1, 4.5)])
    if name == "hit":
        n = int(1.4 * SR); t = np.arange(n) / SR
        return sub_hit(1.4, 0.55, 52) + lowpass(noise(n), 900) * np.exp(-t * 10) * 0.25
    raise KeyError(name)


def main():
    tl = json.loads((B / "timeline.json").read_text())
    cues = json.loads((B / "cues.json").read_text())
    L = {l["id"]: l for l in tl["lines"]}
    D = tl["duration"] + 0.2
    N = int(D * SR)
    music = np.zeros(N)

    # Act 1 — the problem: D-minor drone, low and uneasy (0 → r2)
    t_r2 = L["r2"]["start"]
    a1 = pad([note("D2"), note("A2"), note("F3")], t_r2 + 0.4, amp=0.10, bright=900)
    a1 *= env(len(a1), 2.5, 0.8)
    place(music, a1, 0)
    rain = lowpass(highpass(noise(int(t_r2 * SR)), 1800), 7000) * 0.035
    rain *= env(len(rain), 3.5, 1.5)
    place(music, rain, 0.8)

    # Swell into the reveal: rising filtered noise + rising chord
    rise_t0, rise_t1 = L["r1"]["start"], L["r2"]["end"] + 0.15
    n = int((rise_t1 - rise_t0) * SR)
    ramp = np.linspace(0, 1, n) ** 2.4
    rise = bandpass(noise(n), 400, 6000) * ramp * 0.12
    place(music, rise, rise_t0)
    place(music, sub_hit(2.4, 0.6, 46), rise_t1)

    # Product theme: D major pad + arpeggio (reveal → end)
    t_on = rise_t1
    chords = [["D3", "A3", "F#4", "A4"], ["B2", "F#3", "D4", "A4"], ["G2", "D3", "B3", "D4"], ["A2", "E3", "C#4", "E4"]]
    bar = 2.4
    t = t_on
    k = 0
    while t < L["n1"]["start"] - 0.2:
        c = chords[k % 4]
        p = pad([note(x) for x in c], bar + 0.6, amp=0.075, bright=2200)
        p *= env(len(p), 0.4, 0.6)
        place(music, p, t)
        for i, x in enumerate([c[0], c[2], c[3], c[2], c[1], c[3], c[2], c[3]]):
            place(music, pluck(note(x) * 2, 1.0, 0.055), t + i * bar / 8)
        t += bar
        k += 1

    # Proof: steady pulse, each number lands on a hit (handled by cues), pad lifts
    t0, t1 = L["n1"]["start"] - 0.2, L["e1"]["start"] - 0.25
    p = pad([note("D3"), note("A3"), note("D4"), note("F#4")], t1 - t0 + 0.6, amp=0.085, bright=3000)
    p *= env(len(p), 0.3, 0.6)
    place(music, p, t0)
    beat = 60 / 112
    tt = t0
    while tt < t1:
        place(music, sub_hit(0.35, 0.16, 60), tt)
        place(music, highpass(noise(int(0.05 * SR)), 6000) * np.linspace(1, 0, int(0.05 * SR)) * 0.05, tt + beat / 2)
        tt += beat

    # End card: resolve on a big D-major chord, long tail
    te = L["e1"]["start"] - 0.1
    endp = pad([note("D2"), note("A2"), note("D3"), note("F#3"), note("A3"), note("D4")], D - te, amp=0.11, bright=2600)
    endp *= env(len(endp), 0.08, 2.4)
    place(music, endp, te)
    place(music, sub_hit(3.0, 0.32, 44), te - 0.25)

    music = reverb(music, 3.2, 0.32, 4200)

    # SFX bus
    fx = np.zeros(N)
    for c in cues:
        place(fx, sfx(c["s"]), c["t"], c["v"])
    fx = reverb(fx, 1.6, 0.18, 6000)

    # Voice: resample 24k → 48k, HPF, presence lift, compression, short room
    vo, vsr = sf.read(B / "vo_raw.wav")
    vo = signal.resample_poly(vo, SR, vsr)
    vo = highpass(vo, 75, 2)
    b, a = signal.iirpeak(3000 / (SR / 2), 1.2)
    vo = vo + 0.18 * signal.lfilter(b, a, vo)   # presence
    b, a = signal.iirpeak(160 / (SR / 2), 1.0)
    vo = vo + 0.12 * signal.lfilter(b, a, vo)   # chest warmth
    # simple RMS compressor (4:1 above −20 dBFS)
    win = int(0.02 * SR)
    rms = np.sqrt(np.convolve(vo**2, np.ones(win) / win, "same") + 1e-9)
    db = 20 * np.log10(rms)
    gain_db = np.where(db > -20, -(db + 20) * 0.75, 0)
    vo = vo * 10 ** (gain_db / 20)
    vo = reverb(vo, 0.9, 0.08, 7000)
    vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]

    # Sidechain: duck music & fx under the voice (smooth envelope)
    venv = np.convolve(np.abs(vo), np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
    venv = venv / (venv.max() + 1e-9)
    duck = 1 - 0.62 * np.clip(venv * 4, 0, 1)
    duck = signal.filtfilt(*signal.butter(1, 4 / (SR / 2)), duck)
    music *= duck
    fx *= 1 - 0.35 * np.clip(venv * 4, 0, 1)

    # Normalize buses, then mix. Voice sits ~9 dB above music.
    def norm(x, peak):
        return x / (np.max(np.abs(x)) + 1e-9) * peak

    vo = norm(vo, 0.85)
    music = norm(music, 0.36)
    fx = norm(fx, 0.42)
    sf.write(B / "stem_voice.wav", vo.astype(np.float32), SR)
    sf.write(B / "stem_bed.wav", (music + fx).astype(np.float32), SR)

    # Stereo: voice centered, music widened with a short Haas offset, fx slightly wide
    d = int(0.011 * SR)
    mL = music
    mR = np.concatenate([np.zeros(d), music[:-d]])
    left = vo + mL * 0.95 + fx
    right = vo + mR * 0.95 + np.concatenate([np.zeros(d // 2), fx[: -(d // 2)]])
    st = np.stack([left, right], axis=1)
    st = np.tanh(st * 1.1) / np.tanh(1.1)  # soft limiter
    fade = int(1.2 * SR)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    sf.write(B / "mix.wav", st.astype(np.float32), SR)
    print(f"mix.wav {D:.2f}s · {len(cues)} cues")


if __name__ == "__main__":
    main()
