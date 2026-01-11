import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

import type { IRunRepository } from '../app/run-repository'
import type { CreateRunRecordParams, RunRecord } from '../domain/run-record'
import { RunStatus } from '../domain/run-record'
@Injectable()
export class RedisRunRepository implements IRunRepository {
  constructor(private readonly redis: Redis) {}
  async createRunRecord(params: CreateRunRecordParams): Promise<RunRecord> {
    const record: RunRecord = {
      runId: params.runId,
      userId: params.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: RunStatus.Active,
    }
    await this.redis.set(`run:${params.runId}`, JSON.stringify(record))
    await this.redis.sadd(`user:${params.userId}:runs`, params.runId)
    await this.redis.setex(`user:${params.userId}:active-run`, 86400 * 10, params.runId)
    return record
  }
  async getRunIfOwner(runId: string, userId: string): Promise<RunRecord | null> {
    const data = await this.redis.get(`run:${runId}`)
    if (!data) return null
    const record = JSON.parse(data) as RunRecord
    return record.userId === userId ? record : null
  }
  async getRunsByUserId(userId: string): Promise<RunRecord[]> {
    const runIds = await this.redis.smembers(`user:${userId}:runs`)
    const records: RunRecord[] = []
    for (const runId of runIds) {
      const data = await this.redis.get(`run:${runId}`)
      if (data) {
        records.push(JSON.parse(data) as RunRecord)
      }
    }
    return records
  }
  async getActiveRunByUserId(userId: string): Promise<RunRecord | null> {
    const runId = await this.redis.get(`user:${userId}:active-run`)
    if (!runId) return null
    return this.getRunIfOwner(runId, userId)
  }
  async updateRunStatus(runId: string, status: string): Promise<void> {
    const data = await this.redis.get(`run:${runId}`)
    if (!data) return
    const record = JSON.parse(data) as RunRecord
    const updatedRecord: RunRecord = {
      ...record,
      status: status as RunStatus,
      updatedAt: Date.now(),
    }
    await this.redis.set(`run:${runId}`, JSON.stringify(updatedRecord))
  }
  async deleteRunRecord(runId: string): Promise<void> {
    const data = await this.redis.get(`run:${runId}`)
    if (!data) return
    const record = JSON.parse(data) as RunRecord
    await Promise.all([
      this.redis.del(`run:${runId}`),
      this.redis.srem(`user:${record.userId}:runs`, runId),
      this.redis.del(`user:${record.userId}:active-run`),
    ])
  }
}
