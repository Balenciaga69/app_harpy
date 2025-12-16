## 異常狀態設計概述

- 異常狀態為資料模板，分為：
  - 靜態模板（定義基本屬性與行為）
  - 狀態實例（記錄當前狀態於角色上的具體數值）

### 靜態模板設計

- 屬性：
  - 名稱、ID、類型
  - 是否可疊加，最大/最小疊層
  - 持續時間類型、基礎持續時間
  - 是否可被清除
  - 行為規則（效果模組）
- 通用資料結構（如 JSON），供所有遊戲內容引用
- 遊戲啟動或戰鬥加載時載入，內容靜態不變
- 每個狀態（如 Chill）需有完整靜態定義

### 狀態實例設計

- 屬性：
  - 套用目標（entity/生物）
  - 當前疊層（currentStack）
  - 當前持續時間（currentDuration）
  - 狀態來源（source）
- 儲存於角色戰鬥 Context
- 狀態賦予時創建對應實例

### 狀態處理流程

- 戰鬥系統特定 Tick 階段統一處理
  - 例：DeBuff 傷害、Buff 狀態檢查
- 每 Tick 步驟：
  - 遍歷所有 Entity 狀態實例
  - 觸發狀態效果
  - 更新持續時間與層數
  - 清除過期/可移除狀態
  - 聚合所有異常狀態對 stat 的影響

### 為何不採用類別處理器

- 多數狀態（如 Bleeding、Poison、Holy Fire）有共同行為，若各自建處理器會重複邏輯
- 若用類別處理器，需遍歷所有處理器，效率低
- 新增狀態需改核心代碼，維護成本高
- 靜態模板應包含行為/效果區塊，統一由通用效果計算函數處理

## Affix 附加狀態設計

### AffixTemplate (靜態模板)

- 屬性：
  - 監聽事件類型（eventType，如 ON_HIT）
  - 執行行為（effectModule/action，如 APPLY_STATUS）
- 明確指定觸發時機與效果

### Affix 運作流程（以冰緩為例）

- 戰鬥前：角色管理系統檢查所有裝備/遺物上的 AffixInstance
- 註冊監聽器：對 eventType: "ON_HIT" 的 AffixInstance 註冊事件
- 事件觸發：攻擊事件命中敵人時，事件管理器觸發 ON_HIT
- 執行詞綴行為：監聽器捕獲事件，執行 action: "APPLY_STATUS"，呼叫 Status System 的 ApplyStatusEffect
- 狀態實例創建/更新：於敵方 Context 創建或更新 Chill 狀態實例
