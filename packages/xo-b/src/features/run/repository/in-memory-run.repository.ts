/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any */
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { CreateRunRecordParams, RunRecord, RunStatus } from '../model/run-record'
import { RunRecordDto } from '../shared/run-record.dto'
import { IRunRepository } from './run-repository'
@Injectable()
export class InMemoryRunRepository implements IRunRepository {
  private cache: any
  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.cache = cache
  }
  private getRunKey(runId: string): string {
    return `run:${runId}`
  }
  private getUserRunsKey(userId: string): string {
    return `user:${userId}:runs`
  }
  private getActiveRunKey(userId: string): string {
    return `user:${userId}:active-run`
  }
  async createRunRecord(params: CreateRunRecordParams): Promise<RunRecord> {
    const record: RunRecord = {
      runId: params.runId,
      userId: params.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: RunStatus.Active,
    }
    const ttl = 86400 * 10 * 1000 // 10 days in ms
    await this.cache.set(this.getRunKey(record.runId), record, ttl)
    const existingRuns = (await this.cache.get(this.getUserRunsKey(params.userId))) as string[] | undefined
    const runIds = existingRuns ? [...new Set([...existingRuns, params.runId])] : [params.runId]
    await this.cache.set(this.getUserRunsKey(params.userId), runIds, ttl)
    await this.cache.set(this.getActiveRunKey(params.userId), params.runId, ttl)
    return record
  }
  async getRunIfOwner(runId: string, userId: string): Promise<RunRecord | null> {
    const data = (await this.cache.get(this.getRunKey(runId))) as Record<string, unknown> | undefined
    if (!data) return null
    const record = plainToInstance(RunRecordDto, data) as RunRecord
    return record.userId === userId ? record : null
  }
  async getRunsByUserId(userId: string): Promise<RunRecord[]> {
    const runIds = (await this.cache.get(this.getUserRunsKey(userId))) as string[] | undefined
    if (!runIds || runIds.length === 0) return []
    const records: RunRecord[] = []
    for (const runId of runIds) {
      const data = (await this.cache.get(this.getRunKey(runId))) as Record<string, unknown> | undefined
      if (data) {
        records.push(plainToInstance(RunRecordDto, data) as RunRecord)
      }
    }
    return records
  }
  async getActiveRunByUserId(userId: string): Promise<RunRecord | null> {
    const runId = (await this.cache.get(this.getActiveRunKey(userId))) as string | undefined
    if (!runId) return null
    return this.getRunIfOwner(runId, userId)
  }
  async updateRunStatus(runId: string, status: string): Promise<void> {
    const data = (await this.cache.get(this.getRunKey(runId))) as Record<string, unknown> | undefined
    if (!data) return
    const record = plainToInstance(RunRecordDto, data) as RunRecord
    const updatedRecord: RunRecord = {
      ...record,
      status: status as RunStatus,
      updatedAt: Date.now(),
    }
    const ttl = 86400 * 10 * 1000
    await this.cache.set(this.getRunKey(runId), updatedRecord, ttl)
  }
  async deleteRunRecord(runId: string): Promise<void> {
    const data = (await this.cache.get(this.getRunKey(runId))) as Record<string, unknown> | undefined
    if (!data) return
    const record = plainToInstance(RunRecordDto, data) as RunRecord
    await Promise.all([
      this.cache.del(this.getRunKey(runId)),
      this.deleteRunFromUserList(record.userId, runId),
      this.cache.del(this.getActiveRunKey(record.userId)),
    ])
  }
  private async deleteRunFromUserList(userId: string, runId: string): Promise<void> {
    const runIds = (await this.cache.get(this.getUserRunsKey(userId))) as string[] | undefined
    if (!runIds) return
    const updated = runIds.filter((id) => id !== runId)
    if (updated.length > 0) {
      await this.cache.set(this.getUserRunsKey(userId), updated)
    } else {
      await this.cache.del(this.getUserRunsKey(userId))
    }
  }
}
