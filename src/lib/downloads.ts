import { existsSync } from 'node:fs'
import { publicDir } from 'astro:config/server'

/**
 * A download's link, once the file is confirmed in Astro's public directory.
 * This runs while pages render, on every build: the content cache only
 * re-parses an entry when its own file changes, so a check in the schema would
 * miss a PDF deleted without editing its entry. The folder is checked by the
 * schema (src/content.config.ts), which depends on the entry alone.
 */
export function downloadLink(path: string, owner: string): string {
  if (!existsSync(new URL(`.${path}`, publicDir))) {
    throw new Error(`${owner}: missing file ${path} (not in the public directory)`)
  }
  return path
}
