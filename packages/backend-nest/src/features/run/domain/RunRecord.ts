export interface RunRecord {
  readonly runId: string
  readonly userId: string
  readonly createdAt: number
  readonly updatedAt: number
  readonly status: RunStatus
}
export enum RunStatus {
  Active = 'ACTIVE',
  Ended = 'ENDED',
  Abandoned = 'ABANDONED',
}
export interface CreateRunRecordParams {
  runId: string
  userId: string
}
