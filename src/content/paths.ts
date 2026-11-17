/**
 * Every collection lives under src/content/: a folder per collection, or a file
 * for a single document. The content loaders and the CMS both build paths with
 * this.
 */
export const contentPath = (path: string) => `src/content/${path}`
