import type { ICombatContext } from '../context/ICombatContext'
/**
 * 賽前效果應用器介面
 *
 * 負責在戰鬥開始前應用所有賽前效果
 */
export interface IPreMatchEffectApplicator {
  /**
   * 應用賽前效果到所有角色
   * @param context 戰鬥上下文
   */
  applyEffects(context: ICombatContext): void
}
