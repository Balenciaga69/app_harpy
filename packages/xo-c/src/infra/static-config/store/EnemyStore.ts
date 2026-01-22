import { IEnemyStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
export class EnemyStore implements IEnemyStore {
  private enemies: Map<string, EnemyTemplate> = new Map()
  private enemySpawnInfos: Map<string, EnemySpawnInfo> = new Map()
  getEnemy(id: string): EnemyTemplate {
    const enemy = this.enemies.get(id)
    if (!enemy) {
      throw new ConfigNotFoundError('EnemyTemplate', id)
    }
    return enemy
  }
  hasEnemy(id: string): boolean {
    return this.enemies.has(id)
  }
  getEnemySpawnInfo(id: string): EnemySpawnInfo {
    const info = this.enemySpawnInfos.get(id)
    if (!info) {
      throw new ConfigNotFoundError('EnemySpawnInfo', id)
    }
    return info
  }
  hasEnemySpawnInfo(id: string): boolean {
    return this.enemySpawnInfos.has(id)
  }
  getEnemySpawnInfosByChapter(chapter: ChapterLevel): EnemySpawnInfo[] {
    return [...this.enemySpawnInfos.values()].filter((info) => info.chapters.includes(chapter))
  }
  getAllEnemySpawnInfos(): EnemySpawnInfo[] {
    return [...this.enemySpawnInfos.values()]
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
