import type { IEventBus } from '@/core/shared/event-bus'
import type { RunEventMap } from '../../models'

/** Type alias for Run Event Bus */
export type IRunEventBus = IEventBus<RunEventMap>
