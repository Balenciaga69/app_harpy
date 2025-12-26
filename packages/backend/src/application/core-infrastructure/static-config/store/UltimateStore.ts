import { UltimateTemplate } from '../../../../domain/ultimate/UltimateTemplate'
import { IUltimateStore } from './IConfigStores'
/** 大絕招配置存儲：管理大絕招樣板 */
export class UltimateStore implements IUltimateStore {
  private ultimates: Map<string, UltimateTemplate> = new Map()
  /** 根據 ID 查詢大絕招樣板 */
  getUltimate(id: string): UltimateTemplate | undefined {
    return this.ultimates.get(id)
  }
  /** 檢查大絕招樣板是否存在 */
  hasUltimate(id: string): boolean {
    return this.ultimates.has(id)
  }
  /** 批量存儲大絕招樣板 */
  setMany(ultimates: UltimateTemplate[]): void {
    for (const ultimate of ultimates) {
      this.ultimates.set(ultimate.id, ultimate)
    }
  }
}
