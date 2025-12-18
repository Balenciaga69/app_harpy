# Level（關卡）

## 語意級

### 關卡生成與流程

每章節（Chapter）的關卡結構與難度分佈：

#### 關卡分佈規則

- 每章節包含 10 關
- 第 5 關（菁英戰）：固定為 ELITE ENEMY
- 第 10 關（首領戰）：固定為 BOSS ENEMY
- 其餘關卡（1-4、6-9 關）：
  - 12% 機率生成事件節點（EVENT）
  - 88% 機率生成普通戰鬥節點（NORMAL ENEMY）

#### 關卡類型

- normal（普通戰）：普通敵人
- elite（菁英戰）：難度提升的精英敵人
- boss（首領戰）：章節 BOSS 級敵人
- event（事件）：非戰鬥節點，提供選擇事件

## 架構級

### 關卡生成系統架構

系統分為兩個階段：模板配置與實例生成。

#### 第一階段：章節開始時生成模板配置

流程生成器在章節開始時生成 10 個關卡模板（LevelTemplate）：

- 根據分佈規則配置每關的類型（NORMAL / ELITE / BOSS / EVENT）
- 第 5 關必定為 ELITE_TEMPLATE
- 第 10 關必定為 BOSS_TEMPLATE
- 其餘關卡根據機率分佈（12% EVENT，88% NORMAL）生成對應模板
- 整個模板配置完成後鎖定，供本章節使用

#### 第二階段：玩家進入關卡時生成實例

當玩家點開關卡時，根據模板生成對應實例（LevelInstance）：

- 讀取該關的 LevelTemplate
- 根據模板類型決定生成邏輯：
  - EnemyLevelInstance：戰鬥節點
    - 從敵人池選擇並生成敵人實例
    - 應用難度係數調整敵人屬性與詞綴
  - EventLevelInstance：事件節點
    - 從事件池選擇事件原型
    - 根據玩家狀態調整事件權重
    - 生成事件實例供玩家互動
- 實例包含完整的運行時資料，可被持久化或即時計算

### 戰鬥節點（Combat Node）

- 敵人篩選：
  - 依條件從敵人原型篩選敵人
- 難度參數：
  - 可附加難度參數（如技能、詞綴隨難度變化，而非僅數值提升）
- 數據預覽：
  - 戰鬥前可預覽敵人數據，戰鬥中亦可能有變化

### 敵人生成

- 敵人以模板（原型）定義
- 模板屬性：
  - ID
  - 出現章節範圍
  - Stat
  - Affixes
- 角色類型：
  - 可否作為 Combat/Boss/Elite 對手等
  - 一個敵人模板可以同時擔任 normal/elite/boss 角色，根據生成參數決定具體配置（如技能變化）
- Affixes 配置：
  - 擔任菁英、首領、普通戰鬥時 Affixes 的配置完全靜態，無需 roll 或權重計算，規則寫在模板中

### 事件生成

- 事件節點生成後，依不同權重選擇原型
- 權重調整：
  - 事件會根據玩家當前狀態調整權重（如金錢過多則給金錢消耗事件）
- 事件原型屬性：
  - id
  - 出現章節
  - 生成觸發條件
  - 類型（道德選擇、風險獎勵等）
  - 選項與文本

## 代碼級

### 章節生成器（ChapterGenerator）

負責在章節開始時生成 10 個關卡模板：

```
1. 初始化配置陣列（10 個位置）
2. 設定第 5 位為 ELITE_TEMPLATE
3. 設定第 10 位為 BOSS_TEMPLATE
4. 對於其餘位置（1-4, 6-9）：
   - 生成 0-100 的隨機數
   - 若 ≤ 12，設置為 EVENT_TEMPLATE
   - 否則設置為 NORMAL_TEMPLATE
5. 返回完成的模板陣列，由 Run Context 儲存
```

### 關卡實例生成器（LevelInstanceGenerator）

當玩家進入關卡時，根據 LevelTemplate 生成對應 Instance：

- 戰鬥類型生成邏輯：
  1. 檢索 LevelTemplate 中的敵人配置
  2. 從敵人池根據難度篩選敵人原型
  3. 創建 EnemyInstance，應用難度係數倍率至屬性與詞綴
  4. 返回完整的 EnemyLevelInstance

- 事件類型生成邏輯：
  1. 檢索 LevelTemplate 中的事件配置
  2. 從事件池選擇事件原型
  3. 根據玩家 Run Context（金幣、裝備狀態等）調整事件權重
  4. 選擇並生成 EventLevelInstance
  5. 返回事件及其選項供前端展示

### 事件（Event）

#### 結構與責任

- 事件為資料模板（Blueprint）+ 即時邏輯執行器
- 原型表：事件原型表定義文本、選項、每選項對應的 ResultAction 陣列
- 特性：事件不具 HP、不可被攻擊或賦予狀態，僅為流程控制節點
- 生命週期：僅存在於玩家選擇 Event 節點到做出決策的期間

#### 事件系統架構

##### 觸發條件器（Trigger Condition Checker）

- 職責：檢查事件是否可被觸發
- 執行時機：在事件實例化前
- 方法簽名：`canTrigger(runContext: RunContext, eventTemplate: EventTemplate): boolean`
- 常見條件：
  - 玩家金幣數量是否達到閾值
  - 玩家裝備狀態是否滿足條件
  - 玩家背包容量是否超過限制
  - 玩家已有特定狀態或 Affix

##### 行為執行器（Action Executor）

- 職責：執行事件選項對應的行為
- 執行時機：玩家做出選擇後
- 方法簽名：`execute(runContext: RunContext, option: EventOption): void`
- 操作類型：
  - 修改玩家金幣、屬性、狀態
  - 生成或消耗物品
  - 附魔終極技能
  - 移除或添加 Relic

#### 預定義事件集合

##### 事件 1：隨機終極技能附魔（Ultimate Random Enchant）

- 觸發條件：
  - 玩家裝備的 Ultimate 有未附魔的可用 Plugin Affix
- 行為執行：
  - 隨機從該 Ultimate 可用的 Plugin Affix 池中選擇一個
  - 直接附加至 UltimateInstance.attachedAffixes
  - 無需玩家互動，自動完成
- 技術需求：
  - RunContext 提供對玩家 Ultimate 的訪問
  - UltimateInstance 提供 `hasAvailableAffix()` 和 `getRandomAvailableAffix()` 方法

##### 事件 2：惡魔交換傳奇裝備（Demon Legendary Swap）

- 觸發條件：
  - 玩家已裝備 3 件以上傳奇稀有度（Legendary）裝備
- 行為執行：
  1. 前端呈現玩家已裝備的傳奇裝備列表
  2. 玩家選擇交出的裝備
  3. 根據該裝備的 Slot 生成一件新的隨機傳奇裝備
  4. 替換完成，更新 RunContext
- 技術需求：
  - Inventory 模組：篩選和移除傳奇裝備功能
  - ItemGenerator：支援按 Slot 和難度生成傳奇裝備
  - RunContext：提供玩家裝備狀態

##### 事件 3：特訓與負重遺物（Training with Burden Relic）

- 觸發條件：
  - 無限制（總是可觸發）
- 行為執行：
  1. 前端呈現玩家可選擇的屬性列表（攻擊力、護甲、生命值等）
  2. 玩家選擇一個屬性
  3. 在戰鬥前附加一個「負重」Relic，造成該屬性 -50% 減益
  4. 戰鬥完成後，自動移除負重 Relic
  5. 自動裝備一個對應屬性的加成 Relic（作為獎勵）
- 技術需求：
  - Post-Combat Pipeline：戰鬥後自動處理邏輯（見 Post-Combat 設計）
  - Relic 實例管理：動態添加和移除
  - RunContext：追蹤本次事件選擇的屬性

##### 事件 4：惡魔清空倉庫（Demon Clear Inventory）

- 觸發條件：
  - 倉庫物品數量超過容量限制的 50%（例：上限 50 個，超過 25 個時觸發）
- 行為執行：
  1. 計算倉庫內所有物品的總價值
  2. 清空倉庫
  3. 根據計算出的價值，生成等值的隨機裝備
  4. 自動放入倉庫
- 技術需求：
  - Inventory 模組：清空並計算價值功能
  - ItemGenerator：按價值生成隨機裝備
  - RunContext：提供玩家當前背包狀態

#### 設計原則

- 拒絕與接受：事件可被玩家拒絕或接受，僅接受時才執行行為
- 代碼無狀態、功能解耦：事件僅為流程控制節點，非持久遊戲物件
- 觸發器與執行器分離：分別負責事件可用性判斷與結果應用，便於擴展和測試
