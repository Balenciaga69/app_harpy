# Post-Combat（戰後流程）

## 語意級

### 戰敗流程

- 無重生代幣：
  - 進入結算並結束本次 RUN
- 有重生代幣：
  - 消耗一個，返回頁面
  - 提醒商店已更新，且有一項 0 元物品協助繼續戰鬥

### 戰勝流程

- 生成兩個獎勵組合包，請從中二選一
- 每個組合包裡面都會生成兩個 reward item（內容持續設計中）

## 架構級

### Post-Combat Pipeline（戰後管道系統）

#### 系統概述

Post-Combat Pipeline 是一個責任鏈模式（Chain of Responsibility）實現的處理管道，用於管理戰鬥後的一系列處理步驟。

- 設計目的：
  - 提供統一的戰後流程處理框架
  - 支援預設 Processor 與動態可插入/可拔除的 Processor
  - 確保事件邏輯、獎勵生成、狀態清理等步驟有序執行
  - 易於擴展，新增邏輯無需修改核心代碼

#### Processor（處理器）

##### 職責與接口

- 職責：每個 Processor 負責單一責任，執行具體的戰後處理邏輯
- 接口簽名：
  ```
  interface PostCombatProcessor {
    name: string  // 唯一標識
    priority: number  // 執行優先級（越小越先執行）
    canExecute(context: PostCombatContext): boolean  // 判斷是否可執行
    execute(context: PostCombatContext): Promise<void>  // 執行邏輯
  }
  ```

##### 預設 Processor 列表

1. StateCleanupProcessor（狀態清理處理器）
   - 優先級：10
   - 職責：清除所有戰鬥相關的臨時狀態（如負重 Relic、臨時 Buff）
   - 應用場景：事件 3（特訓與負重遺物）戰後清理

2. EventRewardProcessor（事件獎勵處理器）
   - 優先級：20
   - 職責：應用事件觸發的獎勵邏輯
   - 應用場景：事件 3 戰後自動裝備加成 Relic

3. StandardRewardProcessor（標準獎勵處理器）
   - 優先級：30
   - 職責：生成標準戰鬥獎勵（金幣、經驗、物品等）
   - 應用場景：每場戰鬥後的基礎獎勵

4. InventoryManagementProcessor（倉庫管理處理器）
   - 優先級：40
   - 職責：處理倉庫滿載邏輯或物品獲得邏輯
   - 應用場景：獎勵物品放入倉庫前的檢查

5. ShopRefreshProcessor（商店刷新處理器）
   - 優先級：50
   - 職責：刷新商店內容
   - 應用場景：每次戰後自動更新商店

#### Pipeline 管理

##### 核心操作

- 註冊 Processor：

  ```
  pipeline.register(processor: PostCombatProcessor): void
  ```

  - 將 Processor 加入管道
  - 根據 priority 自動排序

- 移除 Processor：

  ```
  pipeline.unregister(processorName: string): void
  ```

  - 根據名稱移除特定 Processor
  - 應用場景：臨時禁用某些邏輯

- 執行 Pipeline：

  ```
  pipeline.execute(context: PostCombatContext): Promise<void>
  ```

  - 按 priority 順序執行所有可執行的 Processor
  - 若某個 Processor 失敗，支援失敗策略（繼續執行或中斷）

##### 執行流程

1. 初始化 PostCombatContext（包含戰鬥結果、玩家狀態等）
2. 遍歷所有註冊的 Processor，按 priority 排序
3. 對每個 Processor 調用 `canExecute()` 進行條件判斷
4. 若可執行，調用 `execute()` 執行邏輯
5. 所有 Processor 執行完成後，返回最終的 PostCombatContext

#### 動態插入/拔除示例

##### 場景 1：臨時禁用標準獎勵

```
// 特殊事件期間，禁用標準獎勵生成
pipeline.unregister('StandardRewardProcessor')

// 戰後處理
pipeline.execute(context)

// 事件結束後，恢復
pipeline.register(new StandardRewardProcessor())
```

##### 場景 2：插入自定義 Processor

```
// 遊戲更新引入新的獎勵邏輯
class CustomAffixRewardProcessor implements PostCombatProcessor {
  name = 'CustomAffixRewardProcessor'
  priority = 25  // 在標準獎勵之前執行

  canExecute(context) { return true }
  execute(context) { /* 自定義邏輯 */ }
}

pipeline.register(new CustomAffixRewardProcessor())
```

#### 設計原則

- 單一責任原則：每個 Processor 只負責一個具體邏輯
- 優先級排序：通過 priority 控制執行順序，避免代碼硬編碼順序
- 條件判斷：每個 Processor 獨立判斷是否應執行，增加靈活性
- 可擴展性：支援運行時動態註冊/移除，易於新增功能或進行 A/B 測試
