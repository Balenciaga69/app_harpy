import { I18nField } from '../../shared/models/I18nField'
import { IRunContext } from '../run/RunContext'

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
