import { Request } from 'express'
export function getRunIdFromRequest(request: Request): string | undefined {
  if (request.body && typeof request.body === 'object' && 'runId' in request.body) {
    const value = (request.body as Record<string, unknown>).runId
    if (typeof value === 'string') return value
  }
  if (request.query && typeof request.query === 'object' && 'runId' in request.query) {
    const value = (request.query as Record<string, unknown>).runId
    if (typeof value === 'string') return value
  }
  return undefined
}
