# Combat 模組規格書 v0.4

## 一、目標功能與範圍

### 核心目標

給定兩隊角色（含屬性、裝備、遺物、效果、大招），在可重現的隨機種子下，模擬整場戰鬥直到一方全滅或超時，輸出日誌、快照、統計數據。

### 會實現的功能

- Tick-based 自動戰鬥迴圈
- 完整傷害計算流程（命中、暴擊、減傷、應用）
- 效果系統（Buff/Debuff 生命週期管理）
- 能量與冷卻系統
- 大招觸發機制
- 裝備與遺物效果注入
- 戰鬥日誌與快照輸出
- 可重現隨機數（seedrandom）

### 不會實現的功能

- 戰鬥 UI 渲染（由 Replay 模組負責）
- 關卡流程管理（由 Run 模組負責）
- 角色/裝備生成（由 Creature/Equipment 模組負責）
- 存讀檔（由 PersistentStorage 模組負責）

---

## 二、架構與元件關係

### 入口層

- `CombatEngine`：Facade，唯一對外介面，呼叫 `.start()` 執行戰鬥

### 時間層

- `TickerDriver`：while 迴圈驅動，每 tick 發送 `tick:start` → `tick:end`

### 上下文層

- `CombatContext`：基礎設施容器（EventBus、RNG、ResourceRegistry）
- `BattleState`：領域狀態（entities 集合、tick 計數器）

### 階段系統

- `TickActionSystem`：每 tick 依序執行多個 Phase
- `EffectTickPhase`：效果 onTick
- `EnergyRegenPhase`：能量回復
- `AttackExecutionPhase`：攻擊判定與執行

### 傷害管線

- `DamageChain`：責任鏈，8 個步驟依序執行
- 流程：BeforeDamage → HitCheck → Critical → DamageModify → Defense → BeforeApply → Apply → AfterApply

### 領域模型

- `Character`：角色核心，持有屬性、效果、裝備、大招
- `AttributeManager`：屬性基礎值與修飾器
- `EffectManager`：效果生命週期管理
- `EquipmentManager` / `RelicManager`：裝備與遺物
- `UltimateManager`：大招觸發

### 輔助系統

- `EventBus`：事件通訊中心
- `ResourceRegistry`：跨角色資源生命週期
- `EventLogger`：日誌記錄
- `SnapshotCollector`：快照收集

---

## 三、對外暴露的主要功能

### CombatEngine API

```
CombatEngine(config: CombatConfig)
  .start(): CombatResult
```

### CombatConfig 輸入

- `playerTeam: ICharacter[]` — 玩家隊伍
- `enemyTeam: ICharacter[]` — 敵方隊伍
- `seed: string` — 隨機種子
- `maxTicks?: number` — 最大 tick 數
- `snapshotInterval?: number` — 快照間隔

### CombatResult 輸出

- `outcome: 'victory' | 'defeat' | 'timeout'` — 戰鬥結果
- `survivors: CharacterSnapshot[]` — 生還者快照
- `logs: CombatLogEntry[]` — 完整日誌
- `snapshots: CombatSnapshot[]` — 定時快照
- `statistics: CombatStatistics` — 統計數據
- `duration: number` — 戰鬥 tick 數

### 事件（EventBus）

- `tick:start` / `tick:end` — tick 生命週期
- `entity:damage` / `entity:death` — 傷害與死亡
- `entity:effect-applied` / `entity:effect-removed` — 效果變化
- `combat:miss` / `entity:critical` — 命中與暴擊
- `ultimate:activated` — 大招觸發

---

## 四、設計原則摘要

- **Facade**：CombatEngine 單一入口
- **Chain of Responsibility**：DamageChain 傷害管線
- **Strategy**：ITargetSelector 目標選擇
- **Observer**：EventBus 事件驅動
- **Railway-Oriented**：Result<T,F> 避免迴圈內拋例外
- **Seedable RNG**：100% 可重現戰鬥
