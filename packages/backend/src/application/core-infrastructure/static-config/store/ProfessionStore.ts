import { ProfessionTemplate } from '../../../../domain/profession/ProfessionTemplate'
import { IProfessionStore } from './IProfessionStore'

export class ProfessionStore implements IProfessionStore {
  private professions: Map<string, ProfessionTemplate> = new Map()

  getProfession(id: string): ProfessionTemplate | undefined {
    return this.professions.get(id)
  }

  hasProfession(id: string): boolean {
    return this.professions.has(id)
  }

  getAllProfessions(): ProfessionTemplate[] {
    return Array.from(this.professions.values())
  }

  setMany(professions: ProfessionTemplate[]): void {
    for (const profession of professions) {
      this.professions.set(profession.id, profession)
    }
  }
}
