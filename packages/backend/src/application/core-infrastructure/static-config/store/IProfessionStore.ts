import { ProfessionTemplate } from '../../../../domain/profession/ProfessionTemplate'
export interface IProfessionStore {
  getProfession(id: string): ProfessionTemplate | undefined
  hasProfession(id: string): boolean
  getAllProfessions(): ProfessionTemplate[]
  setMany(professions: ProfessionTemplate[]): void
}
