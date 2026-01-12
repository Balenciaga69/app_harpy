export interface RunRecord {
  readonly runId: string
  readonly userId: string
  readonly createdAt: number
  readonly updatedAt: number
  readonly status: RunStatus
}
export enum RunStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
}
export interface CreateRunRecordParams {
  runId: string
  userId: string
}
