import { ProfessionTemplate } from '../../../../domain/profession/ProfessionTemplate'
import { IProfessionStore } from './IProfessionStore'

/** 職業配置存儲：管理職業樣板 */
export class ProfessionStore implements IProfessionStore {
  private professions: Map<string, ProfessionTemplate> = new Map()

  /** 根據 ID 查詢職業樣板 */
  getProfession(id: string): ProfessionTemplate | undefined {
    return this.professions.get(id)
  }

  /** 檢查職業樣板是否存在 */
  hasProfession(id: string): boolean {
    return this.professions.has(id)
  }

  /** 取得所有職業樣板 */
  getAllProfessions(): ProfessionTemplate[] {
    return Array.from(this.professions.values())
  }

  /** 批量存儲職業樣板 */
  setMany(professions: ProfessionTemplate[]): void {
    for (const profession of professions) {
      this.professions.set(profession.id, profession)
    }
  }
}
