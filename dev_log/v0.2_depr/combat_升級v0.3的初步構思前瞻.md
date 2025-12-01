# 🔄 遊戲設計與架構變更盤點報告 (2025-11-30) - v0.3

> **變更核心**：從「複雜數值模擬 (POE-like)」轉向「節奏驅動自動戰鬥 (Auto-Battler)」。  
> **目標**：降低理解門檻，強化戰鬥反饋，簡化開發維護。

---

## 🎮 第一部分：遊戲設計層面變更 (Game Design)

### 1. ➕ 新增 (Add)

- **能量系統 (Energy System)**
  - **機制**：新增 `currentEnergy` / `maxEnergy`。
  - **來源**：攻擊回復、受擊回復、時間自然回復。
  - **用途**：驅動大招釋放。
- **大招機制 (Ultimate Skill)**
  - **機制**：無視冷卻時間 (Cooldown)，能量滿即釋放。
  - **體驗**：創造戰鬥的高潮點與翻盤點。
- **純粹傷害 (Pure Damage)**
  - **機制**：統一的傷害單位，不再區分物理/魔法/元素。
  - **體驗**：直觀的數值比拼。
- **真實傷害 (True Damage)**
  - **機制**：無視任何減免（護甲、抗性、護盾等）的傷害類型。
  - **用途**：用於特定技能或異常狀態（如毒傷）。

### 2. ➖ 移除 (Delete)

- **元素傷害體系 (Elemental Damage System)**
  - **移除內容**：物理、火、冰、雷、毒、混沌等傷害類型的區分。
  - **移除內容**：抗性 (Resistance)、抗性穿透 (Penetration)、屬性轉換 (Conversion)。
  - **影響**：之前的設計能做「火轉冰流派」、「抗性特化坦克」，現在不能了。
- **複雜防禦公式 (Complex Defense Formulas)**
  - **移除內容**：POE 式的護甲減傷公式（可能涉及複雜的閾值計算）。
  - **影響**：之前的設計能做「極限堆甲流」，現在防禦收益會更線性或遵循簡單遞減。
- **攻擊類型 (AttackType)**
  - **移除內容**：不再區分 Melee, Ranged, Spell 等類型，統一為攻擊。
  - **影響**：簡化傷害工廠與計算邏輯。

### 3. 🔄 修改 (Update)

- **異常狀態觸發機制 (Status Effect Trigger)**
  - **舊**：綁定傷害類型（火傷 -> 燃燒，冰傷 -> 冰緩）。
  - **新**：綁定來源標籤（武器特效 -> 中毒，技能特效 -> 燃燒）。
  - **影響**：解除了屬性與狀態的強綁定，設計更自由（如：造成純粹傷害但附加燃燒）。
- **冷卻時間定義 (Cooldown Definition)**
  - **舊**：可能混雜了施法速度、攻擊速度等多種概念。
  - **新**：統一為 `Attack Cooldown` (Tick)，即兩次普攻間的等待時間。

---

## 🏗️ 第二部分：技術架構層面變更 (Technical Architecture)

### 1. 數據模型 (Models)

#### `DamageEvent` (重構核心)

- **改動**：
  - 移除 `ElementalDamages` 介面。
  - 將 `damages` 屬性改為 `amount: number`。
  - 新增 `isUltimate: boolean` 標記。
  - 新增 `isTrueDamage: boolean` 標記。
  - 移除 `tags` 屬性（暫時移除，待未來有需求再加）。
  - 移除 `evaded` 屬性，統一使用 `isHit`（false 代表未擊中/被閃避）。
- **影響**：所有引用 `event.damages.fire` 之類的地方都會報錯，需統一修正。

#### `ICharacter` / `AttributeCore`

- **改動**：
  - 新增屬性：`energy`, `maxEnergy`, `energyRegen`。
  - 移除屬性：`fireResistance`, `iceResistance` 等所有抗性相關屬性。
  - 移除屬性：`fireDamage`, `iceDamage` 等所有元素增傷屬性。

### 2. 業務邏輯 (Logic)

#### `AbilitySystem` (攻擊發起者)

- **改動**：
  - **移除 `AttackType`**：不再需要傳遞攻擊類型。
  - **新增分支邏輯**：在 `processTick` 中，先檢查 `energy >= maxEnergy`。
    - 是 -> 觸發大招 (Ultimate)，清空能量。
    - 否 -> 走原有的 Cooldown 檢查 -> 觸發普攻 (Normal Attack)，增加能量。
- **影響**：需要實作 `Ultimate` 的觸發流程（可能需要新的 Factory 方法）。

#### `DamageChain` (傷害計算者)

- **改動**：
  - **簡化 `DefenseCalculationStep`**：移除抗性計算，改為單一的 `Armor` 減傷公式。
  - **簡化 `CriticalStep`**：不再需要對不同元素分別計算暴擊倍率。
  - **移除 `ElementEffectRegistry`**：不再需要掃描傷害類型來觸發效果。
  - **新增 `TrueDamage` 處理**：若 `isTrueDamage` 為 true，跳過防禦計算步驟。
- **影響**：計算流程變快，代碼量減少約 40%。

#### `EffectManager` / `Effects`

- **改動**：
  - **重構異常狀態**：`HolyFireEffect`, `PoisonEffect` 等不再依賴元素傷害觸發。
  - **新增能量相關 Effect**：如 `EnergyRegenEffect` (回能光環)。

### 3. 遷移路徑建議 (Migration Path)

1.  **Step 1: 模型瘦身**
    - 修改 `AttributeCore`，刪除抗性，加入能量。
    - 修改 `DamageEvent`，簡化傷害結構，移除 `tags`, `evaded`，加入 `isTrueDamage`。
    - 移除 `AttackType` enum。
2.  **Step 2: 修正編譯錯誤**
    - 全域搜尋並修復所有引用了舊屬性（如 `damages.fire`）的地方。
3.  **Step 3: 改造 AbilitySystem**
    - 實作能量累積與大招觸發邏輯。
4.  **Step 4: 重寫防禦公式**
    - 在 `DefenseCalculationStep` 實作新的簡單減傷公式。

---

## 📊 總結：變更影響矩陣

| 模組          | 修改幅度 | 風險等級 | 備註                                      |
| :------------ | :------: | :------: | :---------------------------------------- |
| **Character** |    中    |    低    | 主要是屬性定義的增刪                      |
| **Ability**   |    高    |    中    | 需新增大招邏輯與能量循環，移除 AttackType |
| **Damage**    |    高    |    低    | 雖然改動大，但是是「變簡單」，邏輯更單純  |
| **Effect**    |    中    |    低    | 解耦元素綁定，改為標籤觸發                |
| **Context**   |    低    |    低    | 基本無影響                                |
| **UI (未來)** |    高    |    -     | 需新增能量條顯示                          |

**一句話總結**：這次改動在架構上是**「減負」**，在遊戲性上是**「聚焦」**。雖然涉及核心模組修改，但方向明確且邏輯簡化，技術風險完全可控。
