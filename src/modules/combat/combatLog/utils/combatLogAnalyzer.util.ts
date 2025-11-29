import { useCombatLogStore } from '../combatLog.store'
import type { CombatLog } from '../combatLog.type'
/**
 * 戰鬥日誌分析工具
 * 提供各種過濾和分析方法來處理戰鬥日誌
 */
export class CombatLogAnalyzer {
  private logs: CombatLog[]
  constructor() {
    this.logs = useCombatLogStore.getState().getLogs()
  }
  /** 取得所有攻擊事件 */
  getAttackEvents(): CombatLog[] {
    return this.logs.filter((log) => log.type === 'attack' || log.type === 'attack_dodge')
  }
  /** 取得所有傷害事件 */
  getDamageEvents(): CombatLog[] {
    return this.logs.filter((log) => log.type === 'damage')
  }
  /** 取得所有效果應用事件 */
  getEffectEvents(): CombatLog[] {
    return this.logs.filter((log) => log.type === 'effect_apply')
  }
  /** 取得死亡事件 */
  getDeathEvents(): CombatLog[] {
    return this.logs.filter((log) => log.type === 'death')
  }
  /** 計算某角色造成的總傷害 */
  getTotalDamageDealt(actorId: string): number {
    return this.logs
      .filter((log) => log.type === 'damage' && log.actorId === actorId)
      .reduce((sum, log) => sum + (log.value ?? 0), 0)
  }
  /** 計算某角色的攻擊次數 */
  getAttackCount(actorId: string): number {
    return this.logs.filter((log) => log.type === 'attack' && log.actorId === actorId).length
  }
  /** 計算某角色的閃避次數 */
  getDodgeCount(targetId: string): number {
    return this.logs.filter((log) => log.type === 'attack_dodge' && log.targetId === targetId).length
  }
  /** 取得按 tick 分組的日誌 */
  getLogsByTickRange(startTick: number, endTick: number): CombatLog[] {
    return this.logs.filter((log) => log.tick >= startTick && log.tick <= endTick)
  }
  /** 生成簡單的戰鬥摘要 */
  generateSummary(): string {
    throw new Error('Not implemented yet')
  }
  /** 輸出完整日誌（格式化） */
  printAllLogs(): void {
    throw new Error('Not implemented yet')
  }
}
