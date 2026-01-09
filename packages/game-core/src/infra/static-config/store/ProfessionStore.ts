import { IProfessionStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { ProfessionTemplate } from '../../../domain/profession/Profession'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'
export class ProfessionStore implements IProfessionStore {
  private professions: Map<string, ProfessionTemplate> = new Map()
  getProfession(id: string): ProfessionTemplate {
    const profession = this.professions.get(id)
    if (!profession) {
      throw new ConfigNotFoundError('ProfessionTemplate', id)
    }
    return profession
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
