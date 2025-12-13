import { IEventBus } from '@/features/shared'
import type { CombatEventMap } from './CombatEventMap'
export interface ICombatEventBus extends IEventBus<CombatEventMap> {}
