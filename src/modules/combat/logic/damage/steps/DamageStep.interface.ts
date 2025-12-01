import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models/damage.event.model'
/**
 * DamageStep ä»‹é¢
 *
 * å®šç¾©?·å®³è¨ˆç?æµç?ä¸­æ??‹æ­¥é©Ÿç?çµ±ä?ä»‹é¢
 */
export interface IDamageStep {
  /**
   * ?·è?æ­¤æ­¥é©Ÿç??è¼¯
   * @returns ?¯å¦?‰è©²ç¹¼ç??·è?å¾Œç?æ­¥é? (false = ?å?çµ‚æ­¢æµç?)
   */
  execute(event: DamageEvent, context: CombatContext): boolean
}
