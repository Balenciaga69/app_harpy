# Combat 模組依賴流向與架構說明

## 模組結構總覽

```
combat/
├── shared/           # 共享工具與介面
├── event/            # 事件系統
├── context/          # 全域上下文
├── character/        # 角色系統
├── effect/           # 效果系統
├── damage/           # 傷害計算
├── ability/          # 能力系統
├── tick/             # 時間驅動（包含 Driver 與 Processor）
├── snapshot/         # 快照收集
├── logger/           # 日誌記錄
└── combat-engine/    # 戰鬥引擎（頂層協調者）
```

---

## 依賴層級與流向

### 第 0 層：基礎層（無依賴）

**shared/**

- **職責**：提供跨模組共享的工具與基礎介面
- **內容**：
  - `IEntity`：實體介面（角色、道具等的基礎抽象）
  - `CombatRandomGenerator`：可重現的隨機數生成器
  - `isCharacter()`：類型守衛工具
- **依賴**：無
- **被依賴**：所有模組

---

### 第 1 層：核心服務層

**event/**

- **職責**：提供事件發布/訂閱機制
- **內容**：
  - `EventBus`：事件總線
  - `CombatEventMap`：事件類型映射表
- **依賴**：`character`（僅類型）
- **被依賴**：`context`, `logger`, `ability`, `combat-engine`

---

### 第 2 層：上下文層

**context/**

- **職責**：管理戰鬥全域狀態與資源
- **內容**：
  - `CombatContext`：戰鬥上下文容器
- **提供資源**：
  - `eventBus`：事件總線實例
  - `rng`：隨機數生成器
  - `entities`：實體管理（角色列表、團隊分組）
  - `currentTick`：當前時間單位
- **依賴**：`event`, `shared`
- **被依賴**：幾乎所有業務邏輯模組

---

### 第 3 層：數據模型層

**character/**

- **職責**：定義角色數據結構與屬性管理
- **內容**：
  - `ICharacter`：角色介面
  - `Character`：角色實現
  - `AttributeContainer`：屬性容器
  - `AttributeCalculator`：屬性計算器
- **依賴**：`shared`, `effect`, `context`
- **被依賴**：`damage`, `ability`, `tick`, `effect`, `combat-engine`

**effect/**

- **職責**：定義與管理戰鬥效果（Buff/Debuff）
- **內容**：
  - `IEffect`：效果介面
  - `EffectManager`：效果管理器
  - `StackableEffect`：可堆疊效果基類
  - 實現：`PoisonEffect`, `ChillEffect`, `ChargeEffect`, `HolyFireEffect` 等
- **依賴**：`character`, `context`, `damage`（僅 Hook 介面）
- **被依賴**：`character`, `ability`

---

### 第 4 層：業務邏輯層

**damage/**

- **職責**：處理傷害計算流程
- **內容**：
  - `DamageChain`：傷害計算協調器
  - `DamageEvent`：傷害事件模型
  - Steps：8 個獨立步驟（命中判定、暴擊、防禦計算等）
  - `ICombatHook`：戰鬥鉤子介面（供 Effect 使用）
- **流程**：`BeforeDamage → HitCheck → Critical → DamageModify → DefenseCalculation → BeforeApply → ApplyDamage → AfterApply`
- **依賴**：`context`, `character`, `shared`
- **被依賴**：`ability`, `effect`

**tick/**

- **職責**：驅動時間流逝與系統更新
- **內容**：
  - `TickerDriver`：時間驅動器（控制啟動/停止/最大 Tick）
  - `TickerProcessor`：Tick 處理器（監聽 tick:start 事件，更新角色效果）
- **流程**：`tick:start → TickerProcessor 處理效果更新 → tick:end`
- **依賴**：`context`, `shared`
- **被依賴**：`combat-engine`

**snapshot/**

- **職責**：實時收集戰鬥狀態快照
- **內容**：
  - `SnapshotCollector`：快照收集器（監聽 tick:start 事件，定期捕捉戰鬥狀態）
- **流程**：`監聽 tick:start → 檢查採集間隔 → 從 Context 讀取實體狀態 → 生成快照`
- **依賴**：`context`, `character`, `shared`
- **被依賴**：`combat-engine`

**logger/**

- **職責**：記錄戰鬥事件日誌
- **內容**：
  - `EventLogger`：事件日誌記錄器
  - `CombatLogEntry`：日誌條目模型
- **依賴**：`event`
- **被依賴**：`combat-engine`

---

### 第 5 層：協調層

**ability/**

- **職責**：協調角色攻擊行為
- **內容**：
  - `AbilitySystem`：能力系統（監聽 tick:start，觸發攻擊）
  - Strategies：目標選擇策略（`FirstAliveSelector`, `LowestHealthSelector`）
  - Factories：`DamageFactory`（創建傷害事件）
  - Registries：`ElementEffectRegistry`（元素效果配置）
  - Models：`AttackType`（攻擊類型定義）
- **流程**：`檢查冷卻 → 選擇目標 → 創建傷害事件 → 執行傷害鏈 → 施加元素效果 → 更新冷卻`
- **依賴**：`context`, `character`, `damage`, `effect`, `shared`
- **被依賴**：`combat-engine`

---

### 第 6 層：頂層引擎

**combat-engine/**

- **職責**：戰鬥系統的頂層協調者
- **內容**：
  - `CombatEngine`：戰鬥引擎（初始化、啟動、清理）
  - `ResultBuilder`：結果構建器（組裝戰鬥結果，內部使用）
  - Models：
    - `CombatConfig`：戰鬥配置
    - `CombatResult`：戰鬥結果
    - `CombatSnapshot`：戰鬥快照
    - `CombatStatistics`：戰鬥統計
    - `CombatOutcome`：戰鬥結果類型
- **流程**：
  1. 初始化：創建 `CombatContext` → 初始化子系統（`TickerDriver`, `TickerProcessor`, `AbilitySystem`, `EventLogger`, `SnapshotCollector`）
  2. 設置：添加角色到 Context → 配置結束條件
  3. 執行：啟動 Ticker → 戰鬥循環運行 → SnapshotCollector 實時收集快照
  4. 結果：使用 `ResultBuilder` 構建完整結果（從 SnapshotCollector 獲取快照）
  5. 清理：釋放資源
- **依賴**：`context`, `tick`, `ability`, `logger`, `snapshot`, `character`, `damage`（僅類型）
- **被依賴**：無（入口點）

---

## 數據流向示意圖

```
                     ┌─────────────────┐
                     │  CombatEngine   │ (啟動、協調、彙總)
                     └────────┬────────┘
                              │
              ┌───────────────┼───────────────┬───────────────┐
              │               │               │               │
      ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌──────▼─────┐
      │TickerDriver  │ │AbilitySystem│ │EventLogger │ │SnapshotCol │
      └───────┬──────┘ └─────┬───────┘ └─────┬──────┘ └──────┬─────┘
              │               │                │               │
              │ tick:start    │                │               │
              ├───────────────►                │               │
              │               │                │               │
              │         ┌─────▼─────────┐      │         監聽tick:start
              │         │ 選擇目標       │      │               │
              │         │ (Strategy)     │      │               │
              │         └─────┬─────────┘      │               │
              │               │                │               │
              │         ┌─────▼─────────┐      │               │
              │         │ DamageFactory  │      │               │
              │         └─────┬─────────┘      │               │
              │               │                │               │
              │         ┌─────▼─────────┐      │               │
              │         │  DamageChain   │      │               │
              │         │  (8 Steps)     │      │               │
              │         └─────┬─────────┘      │               │
              │               │                │               │
              │         ┌─────▼─────────┐      │               │
              │         │ ElementEffect  │      │               │
              │         │   Registry     │      │               │
              │         └────────────────┘      │               │
              │                                 │               │
      ┌───────▼──────┐                  ┌──────▼──────┐ ┌──────▼─────┐
      │TickerProcessor│──event:damage──►│EventBus     │ │定期捕捉快照 │
      └───────┬──────┘                  └──────┬──────┘ └────────────┘
              │                                 │
        更新角色效果                      發布到 Logger
```

---

## 關鍵設計原則

### 1. 依賴方向：單向向上

- 下層模組不依賴上層模組
- 上層模組可依賴下層模組
- 避免循環依賴

### 2. Index.ts 使用規範

- **有 index.ts 的模組**：
  - `shared`：匯出工具與介面
  - `event`：匯出 EventBus 與事件映射
  - `context`：匯出 CombatContext
  - `character`：匯出角色相關所有內容
  - `effect`：匯出效果系統
  - `damage`：匯出傷害系統
  - `ability`：匯出 AbilitySystem
  - `tick`：匯出 TickerDriver 與 TickerProcessor
  - `snapshot`：匯出 SnapshotCollector
  - `logger`：匯出 EventLogger 與日誌模型
  - `combat-engine`：匯出 CombatEngine 與模型（**不暴露 builders**，內部使用）

- **子文件夾的 index.ts**：
  - `ability/strategies`：匯出所有策略
  - `ability/factories`：匯出工廠
  - `ability/registries`：匯出註冊表
  - `ability/models`：匯出攻擊類型
  - `damage/models`：匯出傷害事件模型
  - `damage/steps`：匯出所有步驟
  - `effect/models`：匯出效果模型
  - `effect/Implementation`：匯出所有效果實現
  - `character/interfaces`：匯出介面
  - `character/models`：匯出模型
  - `combat-engine/models`：匯出所有結果模型
  - `combat-engine/builders`：匯出構建器（僅供 combat-engine 內部使用）
  - `snapshot`：匯出 SnapshotCollector

### 3. Import 規範

- **模組間導入**：使用 `from '../模組名'`（通過 index.ts）
- **同模組導入**：可直接使用相對路徑或通過子文件夾 index
- **禁止**：跨越 index.ts 直接訪問內部文件（如 `from '../character/interfaces/character.interface'`）

### 4. 職責分離

- **Context**：僅存儲數據，不包含業務邏輯
- **System**：負責協調與流程控制
- **Model**：純數據結構
- **Util**：無狀態工具函數
- **Manager**：管理特定資源的生命週期

---

## 擴展指南

### 新增攻擊類型

1. 在 `ability/models/attack.type.model.ts` 添加類型
2. 在 `ability/factories/damage.factory.ts` 添加對應的 case
3. 無需修改其他模組

### 新增效果

1. 在 `effect/Implementation/` 建立新效果類別
2. 在 `effect/Implementation/index.ts` 匯出
3. 如需自動施加：在 `ability/registries/element.effect.registry.ts` 註冊

### 新增傷害計算步驟

1. 在 `damage/steps/` 建立新 Step 類別（實現 `IDamageStep`）
2. 在 `damage/steps/index.ts` 匯出
3. 在 `damage/damage.chain.ts` 的步驟陣列中添加

### 新增目標選擇策略

1. 在 `ability/strategies/` 建立新策略（實現 `ITargetSelector`）
2. 在 `ability/strategies/index.ts` 匯出
3. 在 `AbilitySystem` 構造函數或通過 `setTargetSelector()` 使用

---

## 模組通信方式

| 通信類型     | 實現方式                            | 範例                              |
| ------------ | ----------------------------------- | --------------------------------- |
| **直接調用** | 通過 Context 訪問其他服務           | `context.eventBus.emit()`         |
| **事件驅動** | EventBus 發布/訂閱                  | `AbilitySystem` 監聽 `tick:start` |
| **依賴注入** | 構造函數傳遞                        | `new AbilitySystem(context)`      |
| **策略模式** | 可插拔行為                          | `ITargetSelector`                 |
| **鉤子機制** | 效果通過 `ICombatHook` 介入傷害流程 | `ChargedCriticalEffect`           |

---

## 總結

Combat 系統採用**分層架構 + 事件驅動**設計：

- **分層**：清晰的依賴層級，避免循環依賴
- **事件驅動**：通過 EventBus 解耦模組間的強依賴
- **策略模式**：可插拔的行為（目標選擇、效果觸發）
- **組合優於繼承**：模型通過組合建構（如 `CombatResult` 組合多個子模型）
- **單一職責**：每個模組職責明確且單一

**核心流程**：

```
CombatEngine.start()
  → 初始化 CombatContext
  → 初始化子系統（TickerDriver、TickerProcessor、AbilitySystem、EventLogger、SnapshotCollector）
  → 設置角色與結束條件
  → TickerDriver.start()
    → 每個 Tick:
      ① EventBus 發布 'tick:start'
      ② AbilitySystem 監聽並執行攻擊邏輯
        → 選擇目標（Strategy）
        → 創建傷害事件（Factory）
        → 執行傷害鏈（DamageChain + 8 Steps）
        → 施加元素效果（Registry）
      ③ TickerProcessor 更新角色效果（onTick）
      ④ SnapshotCollector 定期捕捉快照（每 N Ticks）
      ⑤ EventBus 發布 'tick:end'
    → 檢查結束條件
  → ResultBuilder 構建結果
    → 從 SnapshotCollector 獲取快照
    → 從 EventLogger 獲取日誌
    → 分析戰鬥結果與統計
  → 返回 CombatResult
```
