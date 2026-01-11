import { Injectable, Inject } from '@nestjs/common'
import type { IUserRepository } from '../../auth/app/IUserRepository'
import type { IRunRepository } from '../app/IRunRepository'
@Injectable()
export class UserMigrationService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRunRepository') private readonly runRepository: IRunRepository
  ) {}
  async migrateAnonRunsToAuthenticatedUser(
    anonymousUserId: string,
    authenticatedUserId: string
  ): Promise<{ migratedRunCount: number }> {
    const anonRuns = await this.runRepository.getRunsByUserId(anonymousUserId)
    let migratedCount = 0
    for (const run of anonRuns) {
      try {
        await this.runRepository.deleteRunRecord(run.runId)
        await this.runRepository.createRunRecord({
          runId: run.runId,
          userId: authenticatedUserId,
        })
        migratedCount++
      } catch {
        continue
      }
    }
    return { migratedRunCount: migratedCount }
  }
  async cleanupAnonUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user || !user.isAnonymous) {
      return
    }
    const runs = await this.runRepository.getRunsByUserId(userId)
    for (const run of runs) {
      await this.runRepository.deleteRunRecord(run.runId)
    }
  }
}
