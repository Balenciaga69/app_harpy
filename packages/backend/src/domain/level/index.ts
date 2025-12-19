import { I18nField } from '../../shared/models/I18nField'
import { EnemyInstance } from '../entity/Enemy'
import { IRunContext } from '../run/IRunContext'

export type LevelType = 'NORMAL' | 'ELITE' | 'BOSS' | 'EVENT'

export interface EnemyLevelInstance {
  id: string
  type: 'ELITE' | 'BOSS' | 'NORMAL'
  enemy: EnemyInstance
}

export interface EventLevelInstance {
  id: string
  type: 'EVENT'
  name: I18nField
  desc: I18nField
  processor: IEventLevelProcessor
  accepted: boolean // 玩家確認還是離開
}

export interface IEventLevelProcessor {
  canTrigger: (ctx: IRunContext) => boolean
  process: (ctx: IRunContext) => void
}
