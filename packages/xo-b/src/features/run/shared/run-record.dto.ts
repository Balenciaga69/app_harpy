import { Type } from 'class-transformer'
import { RunRecord, RunStatus } from '../model/run-record'
export class RunRecordDto implements RunRecord {
  runId!: string
  userId!: string
  @Type(() => Number)
  createdAt!: number
  @Type(() => Number)
  updatedAt!: number
  status!: RunStatus
}
