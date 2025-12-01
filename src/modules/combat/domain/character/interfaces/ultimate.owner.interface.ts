import type { IUltimateAbility } from '../../../coordination/models/ultimate.ability.interface'
/**
 * 大招擁有者介面
 *
 * 設計理念：
 * - 定義角色與大招之間的關聯契約
 * - 支援大招的動態替換 (類似裝備系統)
 * - 透過策略模式實現大招的多樣化
 *
 * 注意事項：
 * - 依賴 coordination 層的 IUltimateAbility 介面 (合理的單向依賴)
 * - 不會造成循環依賴 (domain → coordination 是正確的依賴方向)
 */
export interface IUltimateOwner {
  /** 獲取大招（如果有） */
  getUltimate(): IUltimateAbility | undefined
  /** 設置大招 */
  setUltimate(ultimate: IUltimateAbility): void
}
