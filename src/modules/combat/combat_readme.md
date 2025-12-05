以下是將原始內容轉換為 heading + bullet point 的 Markdown 結構，內容未做更動：

---

# 一、主要用途總結

這套引擎的終極目標是：

- 給定兩隊角色（帶屬性、裝備、聖遺物、效果、終極技能），在完全可重現的隨機種子下，模擬整場戰鬥直到一方全滅或超時，並輸出詳細的戰鬥日誌、快照、統計數據。

# 二、核心元件與職責（按層次拆解）

## 戰鬥入口

- `CombatEngine`：戰鬥的 Facade，負責初始化所有系統、啟動 ticker、收集結果

## 時間系統

- `TickerDriver`：核心遊戲迴圈（while 迴圈），每 tick 發送 tick:start → tick:end

## 戰鬥上下文

- `CombatContext`：基礎設施容器，持有 EventBus、RNG、ResourceRegistry
- `BattleState`：領域狀態管理，持有 entities 集合與 tick 計數器
- 職責分離：CombatContext 組合 BattleState，將狀態操作委派給 BattleState

## 事件系統

- `EventBus` (基於 mitt)：全域事件中心，所有模組之間解耦的唯一通訊方式

## 隨機數

- `CombatRandomGenerator` (seedrandom)：可重現隨機，關鍵中的關鍵

## 資源註冊中心

- `IResourceRegistry` + `InMemoryResourceRegistry`：讓 Effect、Equipment、Ultimate 等可以跨角色被正確引用與銷毀

## Tick 階段系統

- `TickActionSystem` + 多個 `ITickPhase`：每 tick 按順序執行：效果處理 → 能量恢復 → 攻擊執行

## 攻擊執行

- `AttackExecutionPhase` → `AttackExecutor`：判斷是否可以攻擊 → 選目標 → 普通攻擊或放大招

## 目標選擇策略

- `ITargetSelector` (FirstAlive / LowestHealth)：可插拔的選靶邏輯

## 傷害管線

- `DamageChain` + n 個 `IDamageStep`：經典 Chain of Responsibility：命中 → 暴擊 → 減傷 → 應用…

## 能量系統

- `EnergyManager`：攻擊獲取能量 + 每秒回能

## 冷卻管理

- `CooldownManager`：攻擊節奏控制（帶隨機偏移）

## 角色核心

- `Character`：屬性、效果、裝備、聖遺物、大招的 Owner
- `CharacterBuilder`：簡化角色建構流程，支援模板與屬性覆寫

## 屬性系統

- `AttributeManager` + `AttributeCalculator`：Base + Modifier（加/乘）+ 優先級排序

## 效果系統

- `EffectManager` + `IEffect`：onApply / onTick / onRemove 生命週期

## 裝備/聖遺物

- `EquipmentManager`、`RelicManager`：自動添加/移除效果

## 大招系統

- `UltimateManager` + `IUltimateAbility`：能量滿時自動觸發

## 日誌與快照

- `EventLogger`、`SnapshotCollector`：完整戰鬥重播所需資料

## 結果構建

- `ResultBuilder` + 多個 Analyzer：輸出勝負、生還者、統計等結構化結果

# 三、使用的主要設計模式與軟體實踐

## Facade

- `CombatEngine` 提供最簡潔的 `.start()` 介面

## Chain of Responsibility

- `DamageChain` + 7 個 DamageStep（命中 → 暴擊 → 防禦…）

## Strategy

- `ITargetSelector`（先活著的、最低血量、可自行實作）

## Observer / Pub-Sub

- `EventBus`（整個系統幾乎所有通訊都走事件）

## Template Method

- 各 Phase 的 `execute()` 順序固定，但內容可插拔

## Dependency Injection

- 大量透過 constructor 注入 context、selector、registry

## Factory

- `DamageFactory` 產生不同類型的 DamageEvent

## Builder

- `ResultBuilder` 把原始資料組裝成最終 CombatResult
- `CharacterBuilder` 簡化角色建構流程，支援模板與屬性覆寫

## Composition

- `CombatContext` 組合 `BattleState`，職責分離：基礎設施 vs 領域狀態

## Command（部分）

- 每個 `ITickPhase`、`IDamageStep` 都可以視為一個命令

## Entity-Component（弱化版）

- Character 持有 Attribute/Effect/Equipment 等多個 manager

## Immutable Snapshot

- `CharacterSnapshot` / `CombatSnapshot` 用於重播

## Seedable RNG

- 整個戰鬥完全可重現（極重要）

## Resource Registry

- 解決 Effect/Equipment 被多個角色引用時的生命週期問題

# 四、系統執行流程簡圖（每 tick）

```
tick:start
└─→ EffectTickPhase          → 所有效果 onTick
└─→ EnergyRegenPhase         → 每100tick回能
└─→ AttackExecutionPhase
     ├─→ 每個活著角色檢查冷卻
     ├─→ 可攻擊 → 選目標
     ├─→ 能量滿 → 放 Ultimate（或默認3倍傷害）
     └─→ 普通攻擊 → DamageChain 完整流程
          ├─ BeforeDamage
          ├─ HitCheck
          ├─ Critical
          ├─ DamageModify
          ├─ DefenseCalculation
          ├─ BeforeApply
          ├─ ApplyDamage → HP變動、死亡判斷
          └─ AfterApply
tick:end

```
