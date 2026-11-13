import raw from '@/content/site.json'
import { schemas } from '@/content/model'

export const site = schemas.site.parse(raw)
