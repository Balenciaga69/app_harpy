import { Request } from 'express'
export function getRunIdFromRequest(request: Request): string | undefined {
  if (request.body && typeof request.body === 'object' && 'runId' in request.body) {
    const val = (request.body as Record<string, unknown>).runId
    if (typeof val === 'string') return val
  }
  if (request.query && typeof request.query === 'object' && 'runId' in request.query) {
    const val = (request.query as Record<string, unknown>).runId
    if (typeof val === 'string') return val
  }
  return undefined
}
