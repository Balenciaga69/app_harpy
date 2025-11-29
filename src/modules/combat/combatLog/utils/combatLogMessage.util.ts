import type { CombatLog } from '../combatLog.type'
/**
 * 戰鬥日誌訊息生成器
 * 根據 log 資料動態生成顯示訊息
 */
export class CombatLogMessageGenerator {
  /** 生成單條 log 的訊息 */
  static generate(log: CombatLog): string {
    switch (log.type) {
      case 'attack':
        return `${log.actorId} 攻擊 ${log.targetId}`
      case 'attack_dodge':
        return `${log.actorId} 攻擊 ${log.targetId}，但被閃避`
      case 'attack_miss':
        return `${log.actorId} 攻擊 ${log.targetId}，但未命中`
      case 'damage':
        return `${log.actorId} 受到 ${log.value} 點 ${log.detail.damageType} 傷害`
      case 'heal':
        return `${log.actorId} 恢復 ${log.value} 點生命`
      case 'death':
        return `${log.actorId} 死亡`
      case 'effect_apply':
        return `${log.actorId} 獲得 ${log.value} 層 ${log.detail.effectType}`
      case 'effect_expire':
        return `${log.actorId} 的 ${log.detail.effectType} 效果消失`
      case 'effect_tick':
        return `${log.actorId} 受到 ${log.value ?? 0} 點 ${log.detail.effectType} 傷害`
    }
  }
  /** 生成簡潔版訊息（用於 UI 顯示） */
  static generateShort(log: CombatLog): string {
    switch (log.type) {
      case 'attack':
        return `攻擊 ${log.targetId}`
      case 'attack_dodge':
      case 'attack_miss':
        return `閃避`
      case 'damage':
        return `-${log.value} HP`
      case 'heal':
        return `+${log.value} HP`
      case 'death':
        return `死亡`
      case 'effect_apply':
        return `+${log.value} ${log.detail.effectType}`
      case 'effect_expire':
        return `${log.detail.effectType} 消失`
      case 'effect_tick':
        return `${log.detail.effectType} tick`
    }
  }
  /** 生成詳細版訊息（包含數據） */
  static generateDetailed(log: CombatLog): string {
    const basic = this.generate(log)
    // 只有部分類型有 detail 屬性
    if ('detail' in log && log.detail) {
      const details = JSON.stringify(log.detail, null, 2)
      return `${basic}\n詳細資訊: ${details}`
    }
    return basic
  }
}
