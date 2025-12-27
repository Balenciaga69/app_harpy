import { I18nField } from '../../shared/models/I18nField'
import { EnemyAggregate } from '../entity/Enemy'
import { IEventStageProcessor } from './IEventStageProcessor'
/** 敵人階段實例，代表遭遇特定敵人的階段 */
export interface EnemyStageInstance {
  id: string
  type: 'ELITE' | 'BOSS' | 'NORMAL'
  enemy: EnemyAggregate
}
/** 事件階段實例，代表發生特定事件的階段 */
export interface EventStageInstance {
  id: string
  type: 'EVENT'
  name: I18nField
  desc: I18nField
  processor: IEventStageProcessor
  accepted: boolean // 玩家確認還是離開
}
