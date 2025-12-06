# Combat 模組規格書 v0.6

## 一、目標功能與範圍

### 核心目標

給定兩隊角色（含屬性、裝備、遺物、效果、大招），在可重現的隨機種子下，模擬整場戰鬥直到一方全滅或超時，輸出日誌、快照、統計數據。

### 會實現的功能

- Tick-based 自動戰鬥迴圈
- 完整傷害計算流程（命中、暴擊、減傷、應用）
- 效果系統（Buff/Debuff 生命週期管理）
- 效果鉤子系統（生命週期鉤子 + 角色狀態鉤子）
- 能量與冷卻系統
- 大招觸發機制
- 裝備與遺物效果注入（統一以效果導入，不區分部位）
- 戰鬥日誌與快照輸出
- 可重現隨機數（seedrandom）
- **復活系統**（死亡檢查 → 復活判定 → 血量恢復 → 選擇性清除效果）
- **賽前變數注入**（開局對雙方注入 1~n 個效果）

### 不會實現的功能

- 戰鬥 UI 渲染（由 Replay 模組負責）
- 關卡流程管理（由 Run 模組負責）
- 角色/裝備生成（由 Creature/Equipment 模組負責）
- 存讀檔（由 PersistentStorage 模組負責）
- 裝備部位限制邏輯（由外部模組負責，戰鬥引擎只處理效果）

---

## 二、架構與元件關係

### 入口層

- `CombatEngine`：Facade，唯一對外介面，呼叫 `.start()` 執行戰鬥
- 支援 `preMatchEffects` 賽前變數注入

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
- `DeathCheckPhase`：死亡檢查與復活判定（新增）

### 復活系統

- 觸發時機：角色血量歸零時
- 復活率：3%～50%（由 `resurrectionChance` 屬性決定）
- 復活血量：10%～100% maxHp（由 `resurrectionHpPercent` 屬性決定）
- 復活後僅清除 `cleanseOnRevive: true` 的效果（裝備效果不清除）
- 觸發效果的 `onRevive` 鉤子
- 事件：`entity:resurrection` 復活成功

### 效果鉤子系統

分離為多個介面，設計師可選擇性實作：

- `IEffectLifeHook`：效果生命週期（onApply / onRemove / onTick）
- `ICharacterStateHook`：角色狀態變化（onRevive / onHpZero）
- `IThresholdHook`：血量閾值觸發（onTick 內自行檢查，每場戰鬥僅觸發一次）

效果必填屬性：

- `cleanseOnRevive: boolean`：復活時是否清除此效果

### 賽前變數系統

- 由 `CombatConfig.preMatchEffects` 傳入效果陣列
- 戰鬥開始時（tick 0）對雙方所有角色注入效果
- 可用於開局 Chill、復活率提升、充能效率修改等

### 傷害管線

- `DamageChain`：責任鏈，8 個步驟依序執行
- 流程：BeforeDamage → HitCheck → Critical → DamageModify → Defense → BeforeApply → Apply → AfterApply
- Apply 階段觸發死亡檢查 → 復活判定

### 領域模型

- `Character`：角色核心，持有屬性、效果、裝備、大招
- `AttributeManager`：屬性基礎值與修飾器（含復活相關屬性）
- `EffectManager`：效果生命週期管理（含選擇性清除方法）
- `EquipmentManager`：統一管理所有裝備部位
- `RelicManager`：遺物管理
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
- `preMatchEffects?: IEffect[]` — 賽前變數效果（開局注入雙方）

### CombatResult 輸出

- `outcome: 'victory' | 'defeat' | 'timeout'` — 戰鬥結果
- `survivors: CharacterSnapshot[]` — 生還者快照
- `logs: CombatLogEntry[]` — 完整日誌
- `snapshots: CombatSnapshot[]` — 定時快照
- `statistics: CombatStatistics` — 統計數據
- `duration: number` — 戰鬥 tick 數

### 事件（EventBus）

- `tick:start` / `tick:end` — tick 生命週期
- `combat:start` — 戰鬥開始（賽前效果注入後）
- `entity:damage` / `entity:death` — 傷害與死亡
- `entity:hp-zero` — 血量歸零（不等於死亡，可能復活）
- `entity:resurrection` — 復活成功
- `entity:effect-applied` / `entity:effect-removed` — 效果變化
- `combat:miss` / `entity:critical` — 命中與暴擊
- `ultimate:activated` — 大招觸發

### 新增屬性類型

- `resurrectionChance` — 復活率（0.03～0.50）
- `resurrectionHpPercent` — 復活後血量百分比（0.10～1.00）

---

## 四、設計原則摘要

- **Facade**：CombatEngine 單一入口
- **Chain of Responsibility**：DamageChain 傷害管線
- **Strategy**：ITargetSelector 目標選擇
- **Observer**：EventBus 事件驅動
- **Railway-Oriented**：Result<T,F> 避免迴圈內拋例外
- **Seedable RNG**：100% 可重現戰鬥

---

## 五、裝備系統補充說明

- 裝備部位（weapon、helmet、armor、necklace、shoes 等）僅作為外部限制
- 戰鬥引擎不區分部位，統一透過 `Equipment.getEffects()` 注入效果
- 每個部位只能裝備一件，由 `EquipmentManager` 透過 slot 機制管理
- 新增部位只需擴充 `EquipmentSlot` 類型，無需修改引擎核心
