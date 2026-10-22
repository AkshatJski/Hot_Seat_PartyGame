import type { Mood } from '../data/commentary'

/**
 * HOST FACE
 *
 * A hand-drawn 24px face, one per mood. This replaces the emoji that used to sit
 * in the host's speech bubble.
 *
 * Why draw it instead of using an emoji: an emoji renders in whatever style the
 * OS ships, so the same app looks like five different apps on five phones — and
 * next to a rounded display face it reads as a borrowed sticker rather than part
 * of the design. Six paths and seven fills costs no requests, no bytes worth
 * counting, and it belongs to the game.
 *
 * Every shape is deliberately simple: a round head, two dot eyes, one mouth
 * curve. Anything more detailed turns to mush at 24px.
 */
const FACE: Record<Mood, { fill: string; mouth: string; lid?: boolean }> = {
  // Grinning. The one that shows up when something good happens.
  hype: { fill: '#FFC93C', mouth: 'M7.2 14.6c1.3 2.4 4.3 2.4 5.6 0' },
  // Half-lidded and unimpressed.
  judgy: { fill: '#A78BFA', mouth: 'M7.6 16.3c1.3-1.1 3.6-1.1 4.8 0', lid: true },
  // Wide-eyed, mouth open.
  spicy: { fill: '#FF7A59', mouth: 'M10.6 15.2a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7' },
  // Unravelling.
  chaos: { fill: '#3ECF8E', mouth: 'M7 16c1-1.7 2.1 1.7 3.1 0s2.1 1.7 3.1 0' },
  // Wincing on someone's behalf.
  sympathy: { fill: '#4DB8F5', mouth: 'M7.2 16.2c1.1.9 2.2-.9 3.3 0s2.2-.9 3.3 0' },
  // Absolutely nothing behind the eyes.
  deadpan: { fill: '#E8DCC8', mouth: 'M7.6 16.2h4.8' },
  // Side-eye.
  suspicious: { fill: '#FF5C7A', mouth: 'M7.4 16.4c1.5.6 3.4.6 4.9-.5' },
}

export function HostFace({ mood, size = 26 }: { mood: Mood; size?: number }) {
  const face = FACE[mood]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
      style={{ filter: 'drop-shadow(0 2px 0 rgb(0 0 0 / 0.10))' }}
    >
      <circle cx="12" cy="12" r="11" fill={face.fill} />
      {face.lid ? (
        <>
          <rect x="6.6" y="10.1" width="3.2" height="1.3" rx="0.65" fill="#2B2118" />
          <rect x="14.2" y="10.1" width="3.2" height="1.3" rx="0.65" fill="#2B2118" />
        </>
      ) : (
        <>
          <circle cx="8.4" cy="10.6" r="1.15" fill="#2B2118" />
          <circle cx="15.6" cy="10.6" r="1.15" fill="#2B2118" />
        </>
      )}
      <path
        d={face.mouth}
        fill="none"
        stroke="#2B2118"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
