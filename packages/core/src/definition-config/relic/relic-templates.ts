/**
 * Relic 定義範例（戰士專用）
 */
import type { IRelicDefinition } from '@/domain/item'
/**
 * 泰坦之心 Relic
 * 效果：每 10 HP +2 護甲（可疊加）
 */
export const TITANS_HEART: IRelicDefinition = {
  id: 'titans_heart',
  affixPoolIds: [], // Relic 無隨機詞綴
  minAffixes: 0,
  maxAffixes: 0,
  stackable: true, // 可疊加
  maxStack: 99, // 最大 99 個
  rarity: 'legendary', // 傳說級遺物
}
