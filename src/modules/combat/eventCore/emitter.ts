import mitt from 'mitt'
import type { CombatEventRecord } from './combatEvent.type'
export const eventEmitter = mitt<CombatEventRecord>()
