import type { IShopItem } from './IShopItem'

/**
 * 刷新結果
 */
export interface IRefreshResult {
  /** 新生成的商品清單 */
  items: IShopItem[]
  /** 刷新時的難度係數 */
  difficulty: number
  /** 刷新時的章節層數 */
  chapter: number
}
