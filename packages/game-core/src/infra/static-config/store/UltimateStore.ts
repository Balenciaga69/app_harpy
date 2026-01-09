import { IUltimateStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { UltimateTemplate } from '../../../domain/ultimate/Ultimate'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'

export class UltimateStore implements IUltimateStore {
  private ultimates: Map<string, UltimateTemplate> = new Map()

  getUltimate(id: string): UltimateTemplate {
    const ultimate = this.ultimates.get(id)
    if (!ultimate) {
      throw new ConfigNotFoundError('UltimateTemplate', id)
    }
    return ultimate
  }

  getUltimates(ids: string[]): UltimateTemplate[] {
    return ids.map((id) => this.getUltimate(id))
  }

  hasUltimate(id: string): boolean {
    return this.ultimates.has(id)
  }

  setMany(ultimates: UltimateTemplate[]): void {
    for (const ultimate of ultimates) {
      this.ultimates.set(ultimate.id, ultimate)
    }
  }
}
