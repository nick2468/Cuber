/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Origin: London src/version.test.ts, identical but for the node types line.
 * One version number, in four places.
 *
 * `package.json` is the source: Vite reads it at build time and substitutes it
 * as `__APP_VERSION__`, which is what the header shows. `tauri.conf.json` is
 * what the installer writes into Apps and Features, and `Cargo.toml` is what
 * the executable carries. Phase 17 made the number visible, and a number the
 * app shows that disagrees with the one the installer wrote is worse than a
 * number nobody can see, so these tests hold the four together.
 *
 * They were needed: before phase 17 the three files said 0.0.0, 1.1.0 and
 * 1.1.0.
 */
const repo = new URL('../', import.meta.url)

function read(name: string): string {
  return readFileSync(new URL(name, repo), 'utf8')
}

describe('the version', () => {
  const declared = (JSON.parse(read('package.json')) as { version: string }).version

  it('is three numbers, so a bump can be read', () => {
    expect(declared).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('is the same in tauri.conf.json, which the installer reads', () => {
    const config = JSON.parse(read('src-tauri/tauri.conf.json')) as { version: string }
    expect(config.version).toBe(declared)
  })

  it('is the same in Cargo.toml, which the executable carries', () => {
    // The first version line in the file is the package's own.
    const found = read('src-tauri/Cargo.toml').match(/^version = "(.+)"$/m)
    expect(found?.[1]).toBe(declared)
  })

  it('is what the app shows', () => {
    expect(__APP_VERSION__).toBe(declared)
  })
})

describe('the name the installer writes', () => {
  // Origin: Tabiya src/ui/licences.test.ts, "the name the installer writes".
  // Tauri uses `bundle.publisher` twice: as the publisher Apps and Features
  // shows and the executable's company name, and as the name of the registry
  // key an upgrade reads the old install's folder from. So it is set once and
  // never changed: Tabiya changed it at 1.10.9 and broke every upgrade. It
  // names the LICENSE's holder, and this holds it there (set at 1.2.2, when
  // nobody but Nick had an install).
  const holder = read('LICENSE').match(/^Copyright \(c\) \d{4} (.+)$/m)?.[1]
  const bundle = (
    JSON.parse(read('src-tauri/tauri.conf.json')) as {
      bundle: { publisher: string; copyright: string }
    }
  ).bundle

  it('is the copyright holder in LICENSE', () => {
    expect(holder).toBe('Nicholas Walker')
    expect(bundle.publisher).toBe(holder)
    expect(bundle.copyright).toBe(`Copyright (c) 2026 ${holder}`)
  })
})
