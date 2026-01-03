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
  角色_負重超載 = '負重超載',
  角色_堆疊已滿 = '堆疊已滿',
  角色_聖物不存在 = '聖物不存在',
  角色_擴展容量無效 = '擴展容量無效',
  角色_金錢不足 = '金錢不足',
  // Stash (倉庫)
  倉庫_倉庫已滿 = '倉庫已滿',
  倉庫_物品不存在 = '物品不存在',
  倉庫_容量設定無效 = '容量設定無效',
  // Shop (商店)
  商店_商店格子已滿 = '商店格子已滿',
  商店_商店物品不存在 = '商店物品不存在',
  // Run (遊戲進程)
  Run_狀態不符 = 'Run 狀態不符',
  Run_非法狀態轉換 = '非法的狀態轉換',
  Run_重試次數不足 = '重試次數不足',
  Run_無法前進到相同或較早關卡 = '無法前進到相同或較早關卡',
  Run_敵人已遭遇過 = '敵人已遭遇過',
  // PostCombat (戰鬥後)
  PostCombat_上下文不存在 = '戰鬥後上下文不存在',
  PostCombat_非勝利狀態 = '非勝利狀態，無法進行此操作',
  PostCombat_獎勵數量不符 = '選擇的獎勵與可選擇數量不符',
  PostCombat_無效獎勵索引 = '存在無效的獎勵索引',
  PostCombat_重複獎勵索引 = '存在重複的獎勵索引',
  PostCombat_派發金幣失敗 = '派發金幣失敗',
  PostCombat_派發物品失敗 = '派發物品失敗',
}
// ===== Application 層錯誤 =====
export enum ApplicationErrorCode {
  敵人_無可用敵人 = '無可用敵人',
  敵人_關卡資訊無效 = '關卡資訊無效',
  關卡_章節信息不存在 = '關卡_章節信息不存在',
  關卡_節點不存在 = '關卡_節點不存在',
  關卡_未知類型 = '關卡_未知類型',
  物品_物品模板不存在 = '物品模板不存在',
  物品_章節不允許此物品 = '章節不允許此物品',
  物品_職業不允許此物品 = '職業不允許此物品',
  物品_物品受事件限制 = '物品受事件限制',
  物品_物品受敵人限制 = '物品受敵人限制',
  物品_物品類型未支援 = '物品類型未支援',
  裝備_裝備聖物不存在 = '裝備聖物不存在',
  初始化_職業不存在 = '職業不存在',
  初始化_起始聖物無效 = '起始聖物無效',
  初始化_版本衝突 = '版本衝突',
  商店_金錢不足 = '金錢不足',
  骰選_無可用選項 = '無可用選項',
  遊戲_獎勵類型不支援 = '獎勵類型不支援',
}
// ===== 錯誤敘述對應表 =====
export const ErrorMessages: Record<DomainErrorCode | ApplicationErrorCode, string> = {
  // Domain - Character
  [DomainErrorCode.角色_負重超載]: '負重已滿，無法裝備此聖物',
  [DomainErrorCode.角色_堆疊已滿]: '此聖物已達最大堆疊數量',
  [DomainErrorCode.角色_聖物不存在]: '找不到指定的聖物',
  [DomainErrorCode.角色_擴展容量無效]: '負重擴展數值無效',
  [DomainErrorCode.角色_金錢不足]: '金錢不足，無法完成交易',
  [DomainErrorCode.倉庫_倉庫已滿]: '倉庫已滿',
  [DomainErrorCode.倉庫_物品不存在]: '倉庫中找不到此物品',
  [DomainErrorCode.倉庫_容量設定無效]: '倉庫容量設定無效',
  [DomainErrorCode.商店_商店格子已滿]: '商店格子已滿',
  [DomainErrorCode.商店_商店物品不存在]: '商店中找不到此物品',
  [DomainErrorCode.Run_狀態不符]: '當前狀態不允許此操作',
  [DomainErrorCode.Run_非法狀態轉換]: '非法的狀態轉換',
  [DomainErrorCode.Run_重試次數不足]: '重試次數不足，無法繼續',
  [DomainErrorCode.Run_無法前進到相同或較早關卡]: '無法前進到相同或較早關卡',
  [DomainErrorCode.Run_敵人已遭遇過]: '此敵人已遭遇過',
  [DomainErrorCode.PostCombat_上下文不存在]: '戰鬥後上下文不存在',
  [DomainErrorCode.PostCombat_非勝利狀態]: '非勝利狀態，無法進行此操作',
  [DomainErrorCode.PostCombat_獎勵數量不符]: '選擇的獎勵與可選擇數量不符',
  [DomainErrorCode.PostCombat_無效獎勵索引]: '存在無效的獎勵索引',
  [DomainErrorCode.PostCombat_重複獎勵索引]: '存在重複的獎勵索引',
  [DomainErrorCode.PostCombat_派發金幣失敗]: '派發金幣失敗',
  [DomainErrorCode.PostCombat_派發物品失敗]: '派發物品失敗',
  [ApplicationErrorCode.敵人_無可用敵人]: '當前關卡無可用敵人',
  [ApplicationErrorCode.敵人_關卡資訊無效]: '關卡資訊無效或不完整',
  [ApplicationErrorCode.關卡_章節信息不存在]: '關卡所屬章節的信息不存在',
  [ApplicationErrorCode.關卡_節點不存在]: '指定的關卡節點不存在',
  [ApplicationErrorCode.關卡_未知類型]: '關卡類型無效或未知',
  [ApplicationErrorCode.物品_物品模板不存在]: '物品模板不存在',
  [ApplicationErrorCode.物品_章節不允許此物品]: '當前章節不允許此物品',
  [ApplicationErrorCode.物品_職業不允許此物品]: '當前職業不允許此物品',
  [ApplicationErrorCode.物品_物品受事件限制]: '此物品受事件限制，無法生成',
  [ApplicationErrorCode.物品_物品受敵人限制]: '此物品受敵人限制，無法生成',
  [ApplicationErrorCode.物品_物品類型未支援]: '物品類型暫未支援',
  [ApplicationErrorCode.裝備_裝備聖物不存在]: '找不到指定的聖物',
  [ApplicationErrorCode.初始化_職業不存在]: '職業不存在',
  [ApplicationErrorCode.初始化_起始聖物無效]: '起始聖物無效',
  [ApplicationErrorCode.初始化_版本衝突]: '資料衝突，請重試',
  [ApplicationErrorCode.骰選_無可用選項]: '無可用選項可供骰選',
  [ApplicationErrorCode.遊戲_獎勵類型不支援]: '不支援的獎勵類型',
}
/**
 * 取得錯誤的中文敘述
 */
export function getErrorMessage(code: DomainErrorCode | ApplicationErrorCode): string {
  return ErrorMessages[code] || '未知的錯誤'
}
