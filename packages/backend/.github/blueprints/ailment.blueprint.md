## 異常狀態設計概述

- 異常狀態應視為一種數據模板
- 分為靜態模板與狀態實例

### 靜態模板設計

- 定義狀態的基本屬性：
  - 狀態名稱
  - 狀態 ID
  - 狀態類型
  - 是否可疊加
  - 最大/最小疊層
  - 持續時間類型
  - 基礎持續時間
  - 是否可被清除
  - 行為規則
- 靜態模板通常以 JSON 或配置檔形式儲存
- 每個狀態（如 Chill）都需有完整的靜態定義

### 狀態實例設計

- 狀態實例包含：
  - 套用目標（entity/生物）
  - 當前疊層（currentStack）
  - 當前持續時間（currentDuration）
  - 狀態來源（source）
- 狀態實例於角色的戰鬥 Context 中儲存
- 當狀態被賦予角色時，會創建對應實例

### 狀態處理流程

- 在戰鬥系統的特定 Tick 階段處理所有狀態
  - 例如：DeBuff 傷害計算、Buff 狀態檢查
- 每 Tick 處理步驟：
  - 遍歷所有 Entity 的狀態實例
  - 觸發狀態效果
  - 更新持續時間與層數
  - 清除過期或可移除狀態
  - 聚合所有異常狀態對 stat 的影響

## Affix 附加狀態設計

### Affix 靜態模板

- 定義詞綴的基本屬性：
  - 監聽事件類型（eventType，如 ON_HIT）
  - 執行行為（effectModule, action，如 APPLY_STATUS）
- 詞綴模板需明確指定觸發時機與效果

### Affix 運作流程（以其他遊戲的冰緩為案例）

1. 戰鬥前事務階段
   - 角色管理系統檢查角色所有裝備/遺物上的詞綴實例
2. 註冊監聽器
   - 對帶有 eventType: "ON_HIT" 的詞綴，在事件管理器中註冊監聽器
3. 事件觸發
   - 當攻擊事件（AttackEvent）命中敵人（HitCheck 成功）時，事件管理器觸發 ON_HIT 事件
4. 執行詞綴行為
   - 註冊的監聽器捕獲 ON_HIT 事件
   - 執行詞綴模板中 action: "APPLY_STATUS"
   - 呼叫 Status System 的 ApplyStatusEffect
5. 狀態實例創建/更新
   - 在敵方 Context 中創建或更新 Chill 狀態實例
