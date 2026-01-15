import { CreateRunRecordParams, RunRecord } from '../model/run-record'
export interface IRunRepository {
  createRunRecord(params: CreateRunRecordParams): Promise<RunRecord>
  getRunIfOwner(runId: string, userId: string): Promise<RunRecord | null>
  getRunsByUserId(userId: string): Promise<RunRecord[]>
  getActiveRunByUserId(userId: string): Promise<RunRecord | null>
  updateRunStatus(runId: string, status: string): Promise<void>
  deleteRunRecord(runId: string): Promise<void>
}
