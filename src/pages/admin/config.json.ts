import { cmsConfig } from '@/lib/cms-config'

export function GET() {
  return Response.json(cmsConfig())
}
