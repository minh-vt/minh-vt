/**
 * Every collection lives in src/content/<name>/ (or <name>.json for a single
 * file). The content loaders and the CMS both build paths with this.
 */
export const contentFolder = (name: string) => `src/content/${name}`

/**
 * Where uploaded files live. Each group is a folder under src/assets/, and
 * content stores the public path `/<group>/<file>`, which is what the CMS
 * writes. The build resolves that path (src/lib/assets.ts), the contract
 * checks its prefix (model.ts) and the CMS uploads into the same folder
 * (src/admin/), all from this one list.
 */
export const assetGroups = ['media', 'logos', 'certs', 'certs/previews'] as const
export type AssetGroup = (typeof assetGroups)[number]

/** Repository folder of a group, as the CMS addresses it (from the repo root). */
export const assetFolder = (group: AssetGroup) => `/src/assets/${group}`

/** Public path prefix of a group, as content stores it. */
export const assetPath = (group: AssetGroup) => `/${group}`
