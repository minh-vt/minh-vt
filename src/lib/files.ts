import { statSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

// Anchored to the project root: server code is bundled, so import.meta.url moves.
const publicDir = resolve(process.cwd(), 'public')
if (statSync(publicDir, { throwIfNoEntry: false })?.isDirectory() !== true) {
  throw new Error(`Cannot find public/ from ${process.cwd()}`)
}

/**
 * Referenced files are checked on every build, not only when the content
 * cache is cold, so deleting an asset without editing its entry still fails.
 */
export function publicFile(src: string, owner: string): string {
  const file = resolve(publicDir, `.${src}`)
  const missing =
    !isAbsolute(src) ||
    relative(publicDir, file).startsWith('..') ||
    statSync(file, { throwIfNoEntry: false })?.isFile() !== true
  if (missing) throw new Error(`${owner}: missing public file "${src}"`)
  return src
}
