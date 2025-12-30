/**
 * 統一的遊戲錯誤代碼表
 *
 * 用途：集中管理所有 Result.fail() 的錯誤類型與對應的中文敘述
 * 設計：每個錯誤代碼對應唯一的中文敘述，方便未來統一改英文
 * 注意：新增錯誤時務必同步更新此表與對應的 type union
 */
// ===== Domain 層錯誤 =====
export enum DomainErrorCode {
  // Character (角色)
  負重超載 = '負重超載',
  堆疊已滿 = '堆疊已滿',
  聖物不存在 = '聖物不存在',
  擴展容量無效 = '擴展容量無效',
  // Stash (倉庫)
  倉庫已滿 = '倉庫已滿',
  物品不存在 = '物品不存在',
  容量設定無效 = '容量設定無效',
  // Shop (商店)
  商店格子已滿 = '商店格子已滿',
  商店物品不存在 = '商店物品不存在',
}
// ===== Application 層錯誤 =====
export enum ApplicationErrorCode {
  // Enemy (敵人生成)
  無可用敵人 = '無可用敵人',
  關卡資訊無效 = '關卡資訊無效',
  // Item (物品生成)
  物品模板不存在 = '物品模板不存在',
  章節不允許此物品 = '章節不允許此物品',
  職業不允許此物品 = '職業不允許此物品',
  物品受事件限制 = '物品受事件限制',
  物品受敵人限制 = '物品受敵人限制',
  物品類型未支援 = '物品類型未支援',
  // Equipment (裝備管理)
  裝備聖物不存在 = '裝備聖物不存在',
  // Run Initialization (遊戲初始化)
  職業不存在 = '職業不存在',
  起始聖物無效 = '起始聖物無效',
  版本衝突 = '版本衝突',
}
// ===== 錯誤敘述對應表 =====
export const ErrorMessages: Record<DomainErrorCode | ApplicationErrorCode, string> = {
  // Domain - Character
  [DomainErrorCode.負重超載]: '負重已滿，無法裝備此聖物',
  [DomainErrorCode.堆疊已滿]: '此聖物已達最大堆疊數量',
  [DomainErrorCode.聖物不存在]: '找不到指定的聖物',
  [DomainErrorCode.擴展容量無效]: '負重擴展數值無效',
  // Domain - Stash
  [DomainErrorCode.倉庫已滿]: '倉庫已滿',
  [DomainErrorCode.物品不存在]: '倉庫中找不到此物品',
  [DomainErrorCode.容量設定無效]: '倉庫容量設定無效',
  // Domain - Shop
  [DomainErrorCode.商店格子已滿]: '商店格子已滿',
  [DomainErrorCode.商店物品不存在]: '商店中找不到此物品',
  // Application - Enemy
  [ApplicationErrorCode.無可用敵人]: '當前關卡無可用敵人',
  [ApplicationErrorCode.關卡資訊無效]: '關卡資訊無效或不完整',
  // Application - Item
  [ApplicationErrorCode.物品模板不存在]: '物品模板不存在',
  [ApplicationErrorCode.章節不允許此物品]: '當前章節不允許此物品',
  [ApplicationErrorCode.職業不允許此物品]: '當前職業不允許此物品',
  [ApplicationErrorCode.物品受事件限制]: '此物品受事件限制，無法生成',
  [ApplicationErrorCode.物品受敵人限制]: '此物品受敵人限制，無法生成',
  [ApplicationErrorCode.物品類型未支援]: '物品類型暫未支援',
  // Application - Equipment
  [ApplicationErrorCode.裝備聖物不存在]: '找不到指定的聖物',
  // Application - Run
  [ApplicationErrorCode.職業不存在]: '職業不存在',
  [ApplicationErrorCode.起始聖物無效]: '起始聖物無效',
  [ApplicationErrorCode.版本衝突]: '資料衝突，請重試',
}
/**
 * 取得錯誤的中文敘述
 */
export function getErrorMessage(code: DomainErrorCode | ApplicationErrorCode): string {
  return ErrorMessages[code] || '未知的錯誤'
}
