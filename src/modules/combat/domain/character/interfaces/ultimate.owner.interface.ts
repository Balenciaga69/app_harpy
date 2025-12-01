/** 大招擁有者介面 */
export interface IUltimateOwner {
  /** 獲取大招（如果有） */
  getUltimate(): unknown | undefined
  /** 設置大招 */
  setUltimate(ultimate: unknown): void
}
