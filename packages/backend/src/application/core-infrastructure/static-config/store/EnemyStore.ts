import { EnemySpawnInfo, EnemyTemplate } from '../../../../domain/entity/Enemy'
import { IEnemyStore } from './IConfigStores'
import { ChapterLevel } from '../../../../shared/models/TemplateWeightInfo'

export class EnemyStore implements IEnemyStore {
  private enemies: Map<string, EnemyTemplate> = new Map()
  private enemySpawnInfos: Map<string, EnemySpawnInfo> = new Map()

  getEnemy(id: string): EnemyTemplate | undefined {
    return this.enemies.get(id)
  }

  hasEnemy(id: string): boolean {
    return this.enemies.has(id)
  }

  getEnemySpawnInfo(id: string): EnemySpawnInfo | undefined {
    return this.enemySpawnInfos.get(id)
  }

  hasEnemySpawnInfo(id: string): boolean {
    return this.enemySpawnInfos.has(id)
  }

  getEnemySpawnInfosByChapter(chapter: ChapterLevel): EnemySpawnInfo[] {
    return Array.from(this.enemySpawnInfos.values()).filter((info) => info.chapters.includes(chapter))
  }

  getAllEnemySpawnInfos(): EnemySpawnInfo[] {
    return Array.from(this.enemySpawnInfos.values())
  }

  setMany(enemies: EnemyTemplate[]): void {
    for (const enemy of enemies) {
      this.enemies.set(enemy.id, enemy)
    }
  }

  setEnemySpawnInfos(infos: EnemySpawnInfo[]): void {
    for (const info of infos) {
      this.enemySpawnInfos.set(info.templateId, info)
    }
  }
}
