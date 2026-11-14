import { cmsConfig } from '@/admin/config'

/** Static Sveltia configuration, derived from the content contract at build time. */
export function GET() {
  return Response.json(cmsConfig())
}
