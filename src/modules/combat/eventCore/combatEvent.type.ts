/* eslint-disable @typescript-eslint/no-explicit-any */
export type CombatEventType = 'attack' | 'damage' | 'death' | 'miss' | 'applyEffect'
export type CombatEventRecord = Record<CombatEventType, any>
