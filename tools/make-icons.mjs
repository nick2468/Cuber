/**
 * Origin: Conquest tools/make-icons.mjs, adapted: reads the icon SVG rather than drawing the map.
 * Write the app icon out at the sizes iPadOS and the manifest want.
 *
 * Run it with: npm run icons
 *
 * The icon itself is `public/icon.svg`, drawn once at phase 5 and used by
 * `npx tauri icon` for the Windows icons too. This script only resizes it, so
 * there is one drawing of the cube and no second copy to keep in step.
 *
 * The output is committed, because an icon should not need a build step to
 * exist. This script only has to run when the drawing changes.
 */
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const OUT = join(ROOT, 'public')

/** The ground's corner radius in `icon.svg`, which the square variant removes. */
const ROUNDED_CORNER = 'rx="160"'

async function main() {
  const rounded = await readFile(join(OUT, 'icon.svg'), 'utf8')

  if (!rounded.includes(ROUNDED_CORNER)) {
    throw new Error(`public/icon.svg no longer has ${ROUNDED_CORNER} on its ground.`)
  }

  // iPadOS rounds the corners itself, so its icon is drawn square. A rounded
  // icon would come out with the corners clipped twice.
  const square = rounded.replace(ROUNDED_CORNER, 'rx="0"')

  const wanted = [
    { file: 'icon-192.png', size: 192, art: rounded },
    { file: 'icon-512.png', size: 512, art: rounded },
    { file: 'apple-touch-icon.png', size: 180, art: square },
    { file: 'favicon-32.png', size: 32, art: rounded },
  ]

  for (const { file, size, art } of wanted) {
    await sharp(Buffer.from(art)).resize(size, size).png().toFile(join(OUT, file))
    console.log(`wrote public/${file} at ${size}x${size}`)
  }
}

await main()
