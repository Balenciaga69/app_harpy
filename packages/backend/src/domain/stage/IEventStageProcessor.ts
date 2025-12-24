import { IRunContext } from '../../application/context/interface/IRunContext'

export interface IEventStageProcessor {
  canTrigger: (ctx: IRunContext) => boolean
  process: (ctx: IRunContext) => void
}
