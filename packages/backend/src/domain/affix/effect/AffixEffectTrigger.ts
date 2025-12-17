type AttackTrigger = 'ON_BEFORE_DAMAGE'
type CombatTrigger = 'ON_COMBAT_START'
type NormalTrigger = 'ON_EQUIP' | 'ON_UNEQUIP'
export type AffixEffectTrigger = AttackTrigger | CombatTrigger | NormalTrigger
