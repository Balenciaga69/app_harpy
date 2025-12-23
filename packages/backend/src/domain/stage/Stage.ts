import { I18nField } from '../../shared/models/I18nField'
import { EnemyInstance } from '../entity/Enemy'
import { IRunContext } from '../../application/context/interface/IRunContext'
export type StageType = 'NORMAL' | 'ELITE' | 'BOSS' | 'EVENT'
export interface EnemyStageInstance {
  id: string
  type: 'ELITE' | 'BOSS' | 'NORMAL'
  enemy: EnemyInstance
}
export interface EventStageInstance {
  id: string
  type: 'EVENT'
  name: I18nField
  desc: I18nField
  processor: IEventStageProcessor
  accepted: boolean // 玩家確認還是離開
}
export interface IEventStageProcessor {
  canTrigger: (ctx: IRunContext) => boolean
  process: (ctx: IRunContext) => void
}
