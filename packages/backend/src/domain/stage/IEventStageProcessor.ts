import { IRunContext } from '../../application/core-infrastructure/context/interface/IRunContext'

export interface IEventStageProcessor {
  canTrigger: (ctx: IRunContext) => boolean
  process: (ctx: IRunContext) => void
}
// FIXME: IRunContext 是 application layer!!!, 這裡是 domain layer
