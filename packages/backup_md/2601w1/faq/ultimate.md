# ultimate（大絕招）通用問答

## ultimate 是什麼

- ultimate（大絕招）是戰鬥中能量條滿時可釋放的強力技能
- 每個角色只能有一個 ultimate
- ultimate 會取代該次普通攻擊
- ultimate 來自模板設計，非隨機生成

## ultimate 有哪些特性

- ultimate 可裝備插件（affix），改變技能效果
- 插件通常來自事件或任務
- ultimate 來自特定遺物，使用時遺物會被消耗
- 替換 ultimate 時，插件會自動清空

## ultimate 如何取得

- 商店或任務獎勵提供遺物
- 玩家裝備時可選擇替換原有 ultimate

# ultimate 給設計師

## 如何設計 ultimate

- ultimate 需有明確的技能模板（UltimateTemplate）
- 插件設計為可擴充 ultimate 效果
- 插件可設計為事件或任務獎勵
- ultimate 取得方式可設計為商店、任務、特殊事件

## ultimate 設計範例

- 火球：造成傷害，牌型有 K 可再次施放
  - 插件：有 Q 也能再次施放
  - 插件：施放後往牌堆添加 K
- 詛咒：數回合內敵人特定牌型受傷害
  - 插件：延長回合數
- 下毒：對敵人牌堆附加神經毒素
  - 插件：毒素計數器加倍

# ultimate 給工程師

## 技術細節

- UltimateTemplate（大絕招模板）由 Store 載入，定義技能靜態屬性、效果、難度係數加成等欄位
- UltimateRecord（大絕招紀錄）代表已獲得大絕招的持久化資料，包含 templateId、插件（affix）列表等
- UltimateAggregate（大絕招聚合根）由 Template + Record 組合而成，包含所有運行時行為
  - addPluginAffix()：裝備插件詞綴
  - removePluginAffix()：移除插件詞綴
  - getEffectActions()：取得技能效果邏輯
  - 根據難度係數與插件動態計算最終效果
- UltimateAggregate 不被存入 DB，需要時由 Template + Record 動態組裝
- 插件為 affix effect，與 ultimate 關聯，影響技能行為
- ultimate 取得時需處理遺物消耗與 ultimate 替換
- 替換 ultimate 時需清空所有插件槽
