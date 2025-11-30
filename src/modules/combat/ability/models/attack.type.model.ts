/**
 * 攻擊類型常量
 * TODO: 這一塊爭議很大，可能需要重新設計(遊戲機致問題)
 */
export const AttackType = {
  /** 近戰物理攻擊 */
  MeleePhysical: 'melee-physical',
  /** 遠程物理攻擊 */
  RangedPhysical: 'ranged-physical',
  /** 火焰法術 */
  FireSpell: 'fire-spell',
  /** 冰霜法術 */
  IceSpell: 'ice-spell',
  /** 閃電法術 */
  LightningSpell: 'lightning-spell',
  /** 毒素法術 */
  PoisonSpell: 'poison-spell',
} as const
export type AttackTypeValue = (typeof AttackType)[keyof typeof AttackType]
