import { UltimateTemplate } from '../../../domain/ultimate/UltimateTemplate'
import { IUltimateStore } from './IConfigStores'

export class UltimateStore implements IUltimateStore {
  private ultimates: Map<string, UltimateTemplate> = new Map()

  getUltimate(id: string): UltimateTemplate | undefined {
    return this.ultimates.get(id)
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
