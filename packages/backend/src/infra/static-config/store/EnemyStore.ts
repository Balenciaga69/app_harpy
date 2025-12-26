import { IEnemyStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { EnemyTemplate, EnemySpawnInfo } from '../../../domain/entity/Enemy'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'

/** 敵人配置存儲：管理敵人樣板與生成資訊 */
export class EnemyStore implements IEnemyStore {
  private enemies: Map<string, EnemyTemplate> = new Map()
  private enemySpawnInfos: Map<string, EnemySpawnInfo> = new Map()
  /** 根據 ID 查詢敵人樣板 */
  getEnemy(id: string): EnemyTemplate | undefined {
    return this.enemies.get(id)
  }
  /** 檢查敵人樣板是否存在 */
  hasEnemy(id: string): boolean {
    return this.enemies.has(id)
  }
  /** 根據 ID 查詢敵人生成資訊 */
  getEnemySpawnInfo(id: string): EnemySpawnInfo | undefined {
    return this.enemySpawnInfos.get(id)
  }
  /** 檢查敵人生成資訊是否存在 */
  hasEnemySpawnInfo(id: string): boolean {
    return this.enemySpawnInfos.has(id)
  }
  /** 查詢特定章節的所有敵人生成資訊 */
  getEnemySpawnInfosByChapter(chapter: ChapterLevel): EnemySpawnInfo[] {
    return Array.from(this.enemySpawnInfos.values()).filter((info) => info.chapters.includes(chapter))
  }
  /** 取得所有敵人生成資訊 */
  getAllEnemySpawnInfos(): EnemySpawnInfo[] {
    return Array.from(this.enemySpawnInfos.values())
  }
  /** 批量存儲敵人樣板 */
  setMany(enemies: EnemyTemplate[]): void {
    for (const enemy of enemies) {
      this.enemies.set(enemy.id, enemy)
    }
  }
  /** 批量存儲敵人生成資訊 */
  setEnemySpawnInfos(infos: EnemySpawnInfo[]): void {
    for (const info of infos) {
      this.enemySpawnInfos.set(info.templateId, info)
    }
  }
}
