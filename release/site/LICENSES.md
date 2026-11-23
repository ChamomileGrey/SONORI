# Third-party instrument samples and impulse response

SONORI 1.8 ships a compact, self-hosted instrument pack under `dist/samples/`.
These files are short excerpts, resampled to 32 kHz and encoded as MP3, derived
from the sources below. The original recordings remain under their upstream
licenses. This pack is redistributed so the public site can play without
hotlinking a third-party CDN.

Commercial use of the redistributed excerpts is allowed by each upstream
license. Attribution is required where a license is CC BY.

The single-file `release/SONORI.html` does **not** embed these samples
(it must stay under 500 KB and keeps `connect-src 'none'`). If the pack
cannot be loaded, playback falls back to the previous oscillator voices.

Total pack size is documented by `checks/samples-check.mjs` (target ≤ 5 MiB).

## Piano — Salamander Grand Piano V3

- Source: Alexander Holm, Salamander Grand Piano V3 (Yamaha C5, two AKG C414)
- Upstream: https://archive.org/details/SalamanderGrandPianoV3
  and http://freepats.zenvoid.org/Piano/
- License: Creative Commons Attribution 3.0 Unported (CC BY 3.0)
  https://creativecommons.org/licenses/by/3.0/
- Pack files: `dist/samples/piano/*.mp3` (notes C2, F♯2, C3, F♯3, C4, F♯4, C5, F♯5, C6, velocity layer v8)
- Required credit: Piano samples from Salamander Grand Piano V3 by Alexander Holm, licensed CC BY 3.0.

## Guitar — Spanish classical guitar (FreePats)

- Source: recorded by roberto@zenvoid.org for the FreePats project (2008; bank version 2019-06-18)
- Upstream: http://freepats.zenvoid.org/Guitar/acoustic-guitar.html
- License: Creative Commons CC0 1.0 Universal
  https://creativecommons.org/publicdomain/zero/1.0/
- Pack files: `dist/samples/guitar/*.mp3` (E2, A2, E3, A3, E4, A4, E5)

## Bass — Finger Bass YR (FreePats)

- Source: Andrea Biasior (Yamaha RBX), with small edits by roberto@zenvoid.org for FreePats (2019-09-30)
- Upstream: https://freepats.zenvoid.org/ElectricGuitar/clean-electric-bass.html
  and https://github.com/freepats/electric-bass-YR
- License: Creative Commons CC0 1.0 Universal
  https://creativecommons.org/publicdomain/zero/1.0/
- Pack files: `dist/samples/bass/*.mp3` (E1, A1, C2, D♯2)

## Strings — VS Chamber Orchestra: Community Edition (VSCO 2 CE)

- Source: Versilian Studios LLC; recorded by Sam Gossner & Simon Dalzell; sample cutting by Elan Hickler / Soundemote
- Upstream: https://github.com/sgossner/VSCO-2-CE and https://versilian-studios.com/vsco-community/
- License: Creative Commons CC0 1.0 Universal
  https://creativecommons.org/publicdomain/zero/1.0/
- Pack files: `dist/samples/strings/*.mp3` (violin section G2, C4, G4; cello section C3, G3; sustain/vibrato)

## Drums and percussion — Versilian Community Sample Library (VCSL)

- Source: Versilian Studios LLC, Versilian Community Sample Library
- Upstream: https://github.com/sgossner/VCSL and https://versilian-studios.com/vcsl/
- License: Creative Commons CC0 1.0 Universal
  https://creativecommons.org/publicdomain/zero/1.0/
- Pack files: `dist/samples/drums/*.mp3`
  - kick: Bass Drum 1, `BDrumNew_hit_v5_rr1_Sum.wav`
  - snare: Snare Drum, Modern 1, `Snare2_HitSN_v6_rr1_Mid.wav`
  - hat: Hi-Hat Cymbal, `HiHat_HitC_v3_rr1_Mid.wav`
  - open hat: Hi-Hat Cymbal, `HiHat_HitO_rr1_Mid.wav`
  - clap: Claps, `Clap_rr1.wav`
  - shaker: Shaker, Small, `Mid_ShakerDouble_Down_rr1.wav`

## Impulse response — OpenAIR, Dixon Studio Theatre

- Source: Open Acoustic Impulse Response library (OpenAIR), Audio Lab, University of York
- Recording: Dixon Studio Theatre, University of York, B-format file `r1_rir_bformat.wav`
  (Soundfield SPS422B, 96 kHz, 3 s, source–receiver 6.4 m)
- Upstream: https://webfiles.york.ac.uk/OPENAIR/IRs/dixon-studio-theatre-university-york/
  and https://www.openair.hosted.york.ac.uk/
  Project: https://www.york.ac.uk/physics-engineering-technology/research/communication-technologies/projects/open-acoustic-impulse-response-library/
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
  https://creativecommons.org/licenses/by/4.0/
- Derivation: decoded to stereo as L = W + Y, R = W − Y, resampled to 32 kHz, faded to 2.2 s
- Pack file: `dist/samples/ir/dixon-studio.mp3`
- Required credit: Recorded impulse response from OpenAIR, the Open Acoustic Impulse Response library, Audio Lab, University of York (Dixon Studio Theatre), licensed CC BY 4.0.

## Encoder

The shipped files were trimmed, peak-normalized, resampled to 32 kHz, and
encoded as MP3 with `ffmpeg`/`libmp3lame` so Safari, Chrome, and Firefox can
decode them in Web Audio. Ogg Vorbis was not used because Safari does not
decode it.
