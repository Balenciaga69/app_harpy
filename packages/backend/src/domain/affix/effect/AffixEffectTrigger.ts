/** 攻擊階段觸發事件 */
type AttackTrigger = 'ON_BEFORE_DAMAGE'

/** 戰鬥週期觸發事件 */
type CombatTrigger = 'ON_COMBAT_START'

/** 裝備操作觸發事件 */
type NormalTrigger = 'ON_EQUIP' | 'ON_UNEQUIP'

/** 詞綴效果的觸發時機，決定效果何時激活 */
export type AffixEffectTrigger = AttackTrigger | CombatTrigger | NormalTrigger
