import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * SOUND
 *
 * Four synthesised blips, no audio files. A party game with no sound reads as a
 * form; four audio files would read as a mobile game. An oscillator costs 0 KB,
 * ships no licences, and can be tuned in one line.
 *
 * Everything here is deliberately quiet (gain 0.03-0.06 against a 1.0 ceiling)
 * because the phone is sitting in the middle of a table, face up, at 1am. These
 * are meant to be *felt* more than heard.
 *
 * Mute lives in its own store, not in `gameStore`: it is a device preference, and
 * `gameStore`'s persistence deliberately drops everything that is not mid-game.
 * Putting it there would mean the toggle reset on every visit to the setup screen.
 */
export type SoundName = 'swipe' | 'skip' | 'flip' | 'point' | 'fudge'

interface Blip {
  /** Start frequency. */
  f: number
  /** Glide target. Omit for a flat tone. */
  to?: number
  /** Seconds. */
  d: number
  /** Seconds to wait before this blip starts. */
  at?: number
  type?: OscillatorType
  /** Peak gain. */
  g?: number
}

/**
 * The whole soundtrack.
 *
 * - `swipe`  — a card leaving to the right: short, rising, answered.
 * - `skip`   — swiping left: the same gesture, a duller, lower thud.
 * - `flip`   — the dare turning over: a soft two-stage rise.
 * - `point`  — a point scored: a rising major triad, the only "happy" sound.
 * - `fudge`  — a fudge or a call out: a squared-off descent. Punishment should
 *              sound like a buzzer, not like a loss.
 */
const BLIPS: Record<SoundName, Blip[]> = {
  swipe: [{ f: 430, to: 580, d: 0.09, type: 'triangle', g: 0.05 }],
  skip: [{ f: 260, to: 170, d: 0.12, type: 'triangle', g: 0.05 }],
  flip: [
    { f: 330, to: 440, d: 0.07, type: 'sine', g: 0.04 },
    { f: 440, to: 560, d: 0.09, at: 0.07, type: 'sine', g: 0.045 },
  ],
  point: [
    { f: 523, d: 0.07, type: 'sine', g: 0.05 },
    { f: 659, d: 0.07, at: 0.07, type: 'sine', g: 0.05 },
    { f: 784, d: 0.12, at: 0.14, type: 'sine', g: 0.05 },
  ],
  fudge: [{ f: 200, to: 120, d: 0.2, type: 'square', g: 0.035 }],
}

interface SoundStore {
  muted: boolean
  toggle: () => void
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set) => ({
      muted: false,
      toggle: () => set((s) => ({ muted: !s.muted })),
    }),
    { name: 'truth-or-swipe-sound' },
  ),
)

/**
 * Created lazily on the first sound, never at import time: a browser that has
 * not seen a gesture yet throws an autoplay warning for an eager context, and a
 * `useState`-less module-level context would also survive HMR in a broken state.
 *
 * Every sound we play follows a tap, so the context is always created inside a
 * user gesture and is allowed to start.
 */
let ctx: AudioContext | null = null

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  // Safari suspends the context until a gesture resumes it, and a phone that has
  // been backgrounded comes back suspended too.
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * Create (and resume) the audio context without making a sound.
 *
 * Called once from App on the first pointerdown. Without this the very first cue
 * of a session can be silent: `flip` fires from an effect on the frame after the
 * tap, and a context created there is born suspended by autoplay policy. Creating
 * it during the gesture itself is the only reliable way in Safari.
 */
export function unlockAudio() {
  audioContext()
}

/**
 * Play one cue. Safe to call anywhere: no-ops when muted, when the browser has
 * no WebAudio, or when the context cannot be created. Sound is a garnish here,
 * never a dependency — nothing in the game may fail because a tone did not play.
 */
export function play(name: SoundName) {
  if (useSoundStore.getState().muted) return
  const ac = audioContext()
  if (!ac) return
  const now = ac.currentTime

  for (const blip of BLIPS[name]) {
    const start = now + (blip.at ?? 0)
    const end = start + blip.d
    const osc = ac.createOscillator()
    const gain = ac.createGain()

    osc.type = blip.type ?? 'sine'
    osc.frequency.setValueAtTime(blip.f, start)
    if (blip.to !== undefined) {
      // Exponential ramps cannot touch zero, so glide between two real
      // frequencies rather than to silence.
      osc.frequency.exponentialRampToValueAtTime(blip.to, end)
    }

    // A 4ms attack avoids the click a hard start produces; the release is the
    // whole tail, which is what makes these read as blips instead of beeps.
    const peak = blip.g ?? 0.05
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(start)
    osc.stop(end + 0.02)
  }
}
