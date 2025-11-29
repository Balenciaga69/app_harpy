import { create } from 'zustand'
import type { CombatLog } from './combatLog.type'
import { SnapshotHelper } from './utils/snapshot.util'
import { useCharacterStore } from '../character/character.store'
/**
 * 移除 snapshot 的日誌型別（用於 addLog 參數）
 */
type CombatLogInput = {
  [K in CombatLog['type']]: Omit<Extract<CombatLog, { type: K }>, 'snapshot'>
}[CombatLog['type']]
interface CombatLogStore {
  logs: CombatLog[]
  addLog: (log: CombatLogInput) => void
  getLogs: () => CombatLog[]
  getLogsByTick: (tick: number) => CombatLog[]
  getLogsByType: (type: CombatLog['type']) => CombatLog[]
  getLogsByActor: (actorId: string) => CombatLog[]
  clear: () => void
}
/**
 * 判斷該類型的 log 是否需要記錄快照
 */
const needsSnapshot = (logType: CombatLog['type']): boolean => {
  return ['damage', 'heal', 'death', 'effect_apply'].includes(logType)
}
export const useCombatLogStore = create<CombatLogStore>((set, get) => ({
  logs: [],
  /**
   * 添加戰鬥日誌 - 自動處理快照邏輯
   */
  addLog: (log: CombatLogInput) => {
    const { getCharacter } = useCharacterStore.getState()
    let snapshot = undefined
    // 根據 log type 決定是否需要快照
    if (needsSnapshot(log.type) && log.actorId) {
      const character = getCharacter(log.actorId)
      if (character) {
        snapshot = SnapshotHelper.createSingleSnapshot(log.actorId, character)
      }
    }
    const completeLog: CombatLog = { ...log, snapshot } as CombatLog
    set((state) => ({
      logs: [...state.logs, completeLog],
    }))
  },
  getLogs: () => get().logs,
  getLogsByTick: (tick: number) => {
    return get().logs.filter((log) => log.tick === tick)
  },
  getLogsByType: (type: CombatLog['type']) => {
    return get().logs.filter((log) => log.type === type)
  },
  getLogsByActor: (actorId: string) => {
    return get().logs.filter((log) => log.actorId === actorId)
  },
  clear: () => {
    set({ logs: [] })
  },
}))
