import { Injectable } from '@nestjs/common'
import { CreateRunRecordParams, RunRecord, RunStatus } from '../model/run-record'
import { IRunRepository } from './run-repository'

@Injectable()
export class InMemoryRunRepository implements IRunRepository {
  private runs = new Map<string, RunRecord>()
  private userRuns = new Map<string, Set<string>>()

  async createRunRecord(params: CreateRunRecordParams): Promise<RunRecord> {
    const record: RunRecord = {
      runId: params.runId,
      userId: params.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: RunStatus.Active,
    }

    this.runs.set(record.runId, record)

    const userRunIds = this.userRuns.get(params.userId) ?? new Set()
    userRunIds.add(record.runId)
    this.userRuns.set(params.userId, userRunIds)

    return Promise.resolve(record)
  }

  async getRunIfOwner(runId: string, userId: string): Promise<RunRecord | null> {
    const record = this.runs.get(runId)
    if (!record) return null
    if (record.userId !== userId) return null
    return Promise.resolve(record)
  }

  async getRunsByUserId(userId: string): Promise<RunRecord[]> {
    const runIds = this.userRuns.get(userId) ?? new Set()
    const runs = Array.from(runIds)
      .map((id) => this.runs.get(id))
      .filter((record): record is RunRecord => record !== undefined)
    return Promise.resolve(runs)
  }

  async getActiveRunByUserId(userId: string): Promise<RunRecord | null> {
    const runs = await this.getRunsByUserId(userId)
    return runs.find((r) => r.status === RunStatus.Active) ?? null
  }

  async updateRunStatus(runId: string, status: string): Promise<void> {
    const record = this.runs.get(runId)
    if (record) {
      const newRecord: RunRecord = {
        ...record,
        status: status as RunStatus,
        updatedAt: Date.now(),
      }
      this.runs.set(runId, newRecord)
    }
    return Promise.resolve()
  }

  async deleteRunRecord(runId: string): Promise<void> {
    const record = this.runs.get(runId)
    if (record) {
      this.runs.delete(runId)
      const userRunIds = this.userRuns.get(record.userId)
      if (userRunIds) {
        userRunIds.delete(runId)
      }
    }
    return Promise.resolve()
  }
}
