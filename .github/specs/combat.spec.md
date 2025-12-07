# Combat 模組規格書 (更新版)

## 一、目標功能與範圍

### 核心目標

模擬兩隊角色（含屬性、裝備、遺物、效果、大招）在可重現的隨機種子下進行戰鬥，直到一方全滅或超時，並輸出戰鬥日誌、快照與統計數據。

### 會實現的功能

- Tick-based 自動戰鬥迴圈
- 完整傷害計算流程（命中、暴擊、減傷、應用）
- 效果系統（Buff/Debuff 生命週期管理）
- 效果鉤子系統（生命週期鉤子 + 狀態鉤子）
- 能量與冷卻系統
- 大招觸發機制
- 裝備與遺物效果統一注入（不區分部位）
- 戰鬥日誌與快照輸出
- 可重現隨機數（seedrandom）
- 復活系統（死亡檢查 → 復活判定 → 血量恢復 → 選擇性清除效果）
- 賽前變數注入（開局對雙方注入效果）

### 不會實現的功能

- 戰鬥 UI 渲染（由 Replay 模組負責）
- 關卡流程管理（由 Run 模組負責）
- 角色/裝備生成（由外部模組負責）
- 存讀檔（由 PersistentStorage 模組負責）
- 裝備部位限制邏輯（由外部模組負責）

---

## 二、架構與元件關係

### 入口層

- `CombatEngine`：唯一對外介面，呼叫 `.start()` 執行戰鬥
- 支援 `preMatchEffects` 賽前變數注入

### 時間層

- `TickerDriver`：while 迴圈驅動，每 tick 發送 `tick:start` → `tick:end`

### 上下文層

- `CombatContext`：基礎設施容器（EventBus、RNG、ResourceRegistry）
- `BattleState`：領域狀態（角色集合、tick 計數器）

### 階段系統

- `TickActionSystem`：每 tick 執行多個 Phase（可擴充）
- `EffectTickPhase`：處理效果 onTick
- `EnergyRegenPhase`：能量回復
- `AttackExecutionPhase`：執行攻擊與傷害計算

### 傷害管線

- `DamageChain`：責任鏈模式，包含以下步驟：
  1. `BeforeDamageStep` — 傷害起始，觸發 onBeforeDamage 鉤子
  2. `HitCheckStep` — 命中檢定
  3. `CriticalStep` — 暴擊判定
  4. `DamageModifyStep` — 傷害修正
  5. `DefenseCalculationStep` — 防禦計算
  6. `BeforeApplyStep` — 應用前確認
  7. `ApplyDamageStep` — 扣血、復活判定
  8. `AfterApplyStep` — 傷害後處理

- 提前終止：任一步驟回傳 `false` 則中斷管線

### 復活系統

- 處理類別：`ResurrectionHandler`（由 `ApplyDamageStep` 呼叫）
- 復活率：3%～50%（由 `resurrectionChance` 屬性決定）
- 復活血量：10%～100% maxHp（由 `resurrectionHpPercent` 屬性決定）
- 復活後清除 `cleanseOnRevive: true` 的效果
- 事件：`entity:resurrection` 復活成功

### 賽前變數系統

- 由 `CombatConfig.preMatchEffects` 傳入效果陣列
- 戰鬥開始時（tick 0）對雙方角色注入效果

### 輔助系統

- `EventBus`：事件通訊中心
- `ResourceRegistry`：跨角色資源管理
- `EventLogger`：日誌記錄
- `SnapshotCollector`：快照收集

---

## 三、對外暴露的主要功能

### CombatEngine API

```typescript
CombatEngine(config: CombatConfig)
  .start(): CombatResult
```

---

## 四、設計原則摘要

- Facade：CombatEngine 單一入口
- Chain of Responsibility：DamageChain 傷害管線
- Observer：EventBus 事件驅動
- Seedable RNG：100% 可重現戰鬥

### 元件用途概述

#### CombatEngine

- 作為戰鬥模組的入口，負責初始化戰鬥並執行主要邏輯。

#### TickerDriver

- 驅動戰鬥的時間進程，觸發每個 tick 的開始與結束事件。

#### CombatContext

- 提供戰鬥所需的基礎設施，包括事件總線（EventBus）、隨機數生成器（RNG）和資源管理。

#### BattleState

- 儲存戰鬥的當前狀態，例如角色集合和當前 tick 計數。

#### TickActionSystem

- 負責在每個 tick 中執行多個階段（Phase），例如效果處理、能量回復和攻擊執行。

#### EffectTickPhase

- 處理所有角色的效果（Buff/Debuff）在當前 tick 的影響。

#### EnergyRegenPhase

- 管理角色的能量回復邏輯。

#### AttackExecutionPhase

- 負責執行攻擊邏輯，包括目標選擇和傷害計算。

#### DamageChain

- 定義傷害計算的責任鏈，依序執行命中檢定、暴擊判定、防禦計算等步驟。

#### ResurrectionHandler

- 處理角色的復活邏輯，包括復活概率計算和效果清除。

#### EventBus

- 作為事件通訊中心，協調模組間的事件傳遞。

#### ResourceRegistry

- 管理戰鬥中共享的資源，例如效果或狀態的生命週期。

#### EventLogger

- 記錄戰鬥過程中的重要事件，生成日誌供後續分析。

#### SnapshotCollector

- 定期收集戰鬥快照，用於重播或狀態回溯。

### Domain 元件描述

#### Attribute 模組

- 用途：管理角色的屬性，處理屬性計算與增減。

#### Character 模組

- 用途：定義角色的核心邏輯，包含屬性、裝備與效果的管理。

#### Effect 模組

- 用途：管理角色的效果（Buff/Debuff），處理效果的應用與移除。

#### Item 模組

- 用途：管理角色的裝備與遺物，處理穿戴、卸下與效果注入。

#### Ultimate 模組

- 用途：管理角色的大招，處理充能與釋放邏輯。

---
