import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'

import { CreateRunRecordParams as CreateRunRecordParameters, RunRecord, RunStatus } from '../model/run-record'
import { RunRecordDto } from '../shared/run-record.dto'
import { IRunRepository } from './run-repository'
@Injectable()
export class RedisRunRepository implements IRunRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  async createRunRecord(parameters: CreateRunRecordParameters): Promise<RunRecord> {
    const record: RunRecord = {
      runId: parameters.runId,
      userId: parameters.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: RunStatus.Active,
    }
    const ttl = 86_400 * 10 * 1000 // 10 days in ms
    await this.cache.set(`run:${parameters.runId}`, record, ttl)
    const existingRuns = await this.cache.get<string[]>(`user:${parameters.userId}:runs`)
    const runIds = existingRuns ? [...new Set([...existingRuns, parameters.runId])] : [parameters.runId]
    await this.cache.set(`user:${parameters.userId}:runs`, runIds, ttl)
    await this.cache.set(`user:${parameters.userId}:active-run`, parameters.runId, ttl)
    return record
  }
  async getRunIfOwner(runId: string, userId: string): Promise<RunRecord | null> {
    const data = await this.cache.get<Record<string, unknown>>(`run:${runId}`)
    if (!data) return null
    const record = plainToInstance(RunRecordDto, data)
    return record.userId === userId ? record : null
  }
  async getRunsByUserId(userId: string): Promise<RunRecord[]> {
    const runIds = await this.cache.get<string[]>(`user:${userId}:runs`)
    if (!runIds || runIds.length === 0) return []
    const records: RunRecord[] = []
    for (const runId of runIds) {
      const data = await this.cache.get<Record<string, unknown>>(`run:${runId}`)
      if (data) {
        records.push(plainToInstance(RunRecordDto, data))
      }
    }
    return records
  }
  async getActiveRunByUserId(userId: string): Promise<RunRecord | null> {
    const runId = await this.cache.get<string>(`user:${userId}:active-run`)
    if (!runId) return null
    return this.getRunIfOwner(runId, userId)
  }
  async updateRunStatus(runId: string, status: string): Promise<void> {
    const data = await this.cache.get<Record<string, unknown>>(`run:${runId}`)
    if (!data) return
    const record = plainToInstance(RunRecordDto, data)
    const updatedRecord: RunRecord = {
      ...record,
      status: status as RunStatus,
      updatedAt: Date.now(),
    }
    const ttl = 86_400 * 10 * 1000
    await this.cache.set(`run:${runId}`, updatedRecord, ttl)
  }
  async deleteRunRecord(runId: string): Promise<void> {
    const data = await this.cache.get<Record<string, unknown>>(`run:${runId}`)
    if (!data) return
    const record = plainToInstance(RunRecordDto, data)
    await Promise.all([
      this.cache.del(`run:${runId}`),
      this.deleteRunFromUserList(record.userId, runId),
      this.cache.del(`user:${record.userId}:active-run`),
    ])
  }
  private async deleteRunFromUserList(userId: string, runId: string): Promise<void> {
    const runIds = await this.cache.get<string[]>(`user:${userId}:runs`)
    if (!runIds) return
    const updated = runIds.filter((id) => id !== runId)
    await (updated.length > 0 ? this.cache.set(`user:${userId}:runs`, updated) : this.cache.del(`user:${userId}:runs`))
  }
}
