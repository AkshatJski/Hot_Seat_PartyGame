/**
 * Rasterizes public/icon.svg into the PNG sizes a PWA install needs.
 *
 * Run: npm run icons
 * The SVG is the editable master; the PNGs are build output committed to the
 * repo so that no runtime dependency (or image toolchain) is needed to install
 * the app.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'icon.svg'), 'utf8')

/**
 * `maskable` is for Android adaptive icons: the OS crops to whatever shape it
 * likes, so the artwork has to survive losing the outer ~20% on every edge. Our
 * chevrons sit well inside the safe zone, so one extra inset is enough.
 */
const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-512-maskable.png', size: 512, scale: 0.72 },
  { file: 'apple-touch-icon.png', size: 180, radius: 0 },
]

for (const { file, size, scale = 1 } of targets) {
  const inner = Math.round(size * scale)
  const svgInner =
    scale === 1
      ? svg
      : svg
          .replace('width="512" height="512"', `width="${inner}" height="${inner}"`)
          .replace(
            'viewBox="0 0 512 512"',
            `viewBox="${Math.round((512 - inner) / 2)} ${Math.round((512 - inner) / 2)} ${inner} ${inner}"`,
          )
  const resvg = new Resvg(svgInner, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  })
  const png = resvg.render().asPng()
  writeFileSync(join(root, 'public', file), png)
  console.log(`  wrote public/${file}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} kB`)
}

console.log('icons done')