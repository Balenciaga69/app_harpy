import { IClassDefinition } from '@/features/character/interfaces/definitions/IClassDefinition'
/**
 * 戰士職業定義範例
 */
export const WARRIOR_CLASS: IClassDefinition = {
  id: 'warrior',
  name: '戰士',
  attributeModifiers: {
    maxHp: 50, // +50 基礎血量
    armor: 10, // +10 護甲
    attackDamage: 5, // +5 攻擊力
  },
  equipmentPoolIds: [
    'iron_sword',
    'steel_sword',
    'iron_helmet',
    'steel_helmet',
    'iron_armor',
    'steel_armor',
    'leather_boots',
    'warrior_gloves',
    'zeus_helm', // 傳說頭盔
  ],
}
