/**
 * Splices the README section that `astro build` generates (dist/README.md, from
 * src/pages/README.md.ts) into README.md, between the markers below. Anything
 * outside the markers is written by hand and kept. Run after a build.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const start = '<!-- site:start: generated from the site content, edit it in the CMS -->'
const end = '<!-- site:end -->'

const readme = readFileSync('README.md', 'utf8')
const generated = readFileSync('dist/README.md', 'utf8').trim()
const from = readme.indexOf(start)
const to = readme.indexOf(end)
if (from === -1 || to < from) {
  throw new Error(`README.md needs the markers:\n${start}\n${end}`)
}

const next = `${readme.slice(0, from + start.length)}\n${generated}\n${readme.slice(to)}`
if (next !== readme) writeFileSync('README.md', next)
// The workflow decides whether to commit from git; nothing to print.
