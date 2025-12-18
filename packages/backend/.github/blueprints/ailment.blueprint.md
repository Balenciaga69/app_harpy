# 異常狀態設計概述

## 語意級

### 異常狀態設計階層

異常狀態系統分為靜態定義與動態實例兩個層次：

#### AilmentTemplate（異常狀態模板）

由設計師預先定義，遊戲啟動時全量載入：

- 基本欄位：
  - ID、名稱、類型（如 Chill、Burn、Poison 等）
  - 視覺表現參數（圖示、顏色、動畫）
- 疊加與層數規則：
  - 是否可疊加
  - 最大/最小疊層限制
- 狀態管理規則：
  - 是否可被清除
  - 持續時間或觸發次數限制
- 行為規則參數：
  - 由 effectModule 決定的行為類型與參數（如每 tick 扣血百分比、減速等級）

#### AilmentInstance（異常狀態實例）

動態生成於戰鬥運行時，儲存在角色/敵人的戰鬥 Context 中：

- 關鍵欄位：
  - ailmentTemplateId：指向模板定義
  - currentStack：當前疊層數
  - source：狀態來源（詞綴、技能、事件等）
  - metadata：額外運行時資料（如剩餘時間、觸發次數）
- 生命週期：
  - 狀態賦予時創建實例
  - 每 Tick 執行 effectModule 定義的行為
  - 清除條件觸發時銷毀實例

### 狀態實例設計

## 架構級

### 狀態處理流程

- 每 Tick 步驟：
  - 觸發狀態效果
  - 清除過期/可移除狀態
  - 聚合所有異常狀態對 stat 的影響

### 為何不採用類別處理器

- 類別處理器缺點：
  - 需遍歷所有處理器，效率低
  - 新增狀態需改核心代碼，維護成本高

## 代碼級

### AilmentTemplate 靜態定義

異常狀態模板以資料驅動方式定義，格式範例（JSON）：

```json
{
  "id": "chill",
  "name": "冰緩",
  "type": "debuff",
  "stackable": true,
  "maxStack": 20,
  "removable": true,
  "effectModule": "slow_effect",
  "params": {
    "slowPercentage": 0.1,
    "perStack": true
  }
}
```

### EffectModule 行為規則

行為規則由 effectModule 決定，每個 Tick 觸發一次：

- effectModule 類型範例：
  - `slow_effect`：每層減速固定百分比
  - `damage_effect`：每層造成持續傷害
  - `attribute_modifier`：每層修改屬性
- 參數傳遞：通過 params 欄位傳遞行為所需參數，無需硬編碼
- 執行流程：
  1. 狀態系統每 Tick 遍歷所有 AilmentInstance
  2. 查詢對應的 effectModule
  3. 調用 effectModule 執行函式，傳入 params 與 currentStack
  4. effectModule 計算並應用效果

### Affix 附加異常狀態

詞綴通過 APPLY_STATUS action 附加異常狀態：

- 行為執行：
  - 監聽器捕獲事件（如 ON_HIT）
  - 執行 action: "APPLY_STATUS"，指定目標 ailmentTemplateId 與疊層數
  - 調用 Status System 的 ApplyStatusEffect
- Affix 運作流程（以冰緩為例）：
  - 事件觸發：攻擊命中敵人時觸發 ON_HIT
  - 詞綴行為：監聽器捕獲事件，執行 APPLY_STATUS action
  - 狀態應用：Status System 創建或更新 AilmentInstance，增加對應疊層
