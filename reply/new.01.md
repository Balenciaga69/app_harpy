# 架構分析：屬性計算系統重構建議

> **架構師分析報告**  
> **日期**: 2025/12/07  
> **版本**: v0.4.1  
> **分析範圍**: AttributeCalculator 重構與 Domain 層邊界釐清

---

## 問題 Q1：AttributeCalculator 應該放在哪裡？

### 當前架構分析

**現狀**:

```
src/logic/combat/domain/attribute/
├─ AttributeManager.ts         (實例狀態容器)
├─ AttributeCalculator.ts      (計算邏輯)
└─ models/
```

**問題點**:

1. `AttributeCalculator` 與 `AttributeManager` 緊耦合（構造器注入）
2. 計算邏輯 (How) 與狀態管理 (What) 混在 domain/attribute 內
3. 戰鬥外（角色面板）與戰鬥內（Combat Engine）都需要計算屬性，但目前只能透過 Combat Engine 內的 Character 類別取得

### 我的建議：**部分同意 AI 的說法，但不完全採納**

#### 同意的部分

1. **domain/item 應該瘦身** ✅
   - `AffixRoller`（RNG 生成邏輯）確實不該在 domain
   - `ItemDefinitionRegistry` 確實是基礎設施細節
   - 但 `EffectFactory` 的定位需要重新討論（見後文）

2. **logic/ 資料夾命名確實太模糊** ✅
   - 但不是廢除，而是**重新命名與分層**

#### 不同意的部分

1. **不應該建立 systems/ 資料夾** ❌
   - 理由：你的專案不是微服務架構，不需要 DDD 風格的 "跨領域服務層"
   - 過度抽象會增加認知負擔與跳轉次數

2. **AttributeCalculationSystem 不應該是靜態方法單例** ❌
   - 理由：計算邏輯依賴 AttributeManager 的實例狀態
   - 靜態方法無法處理「每個角色有自己的 baseValue + modifiers」的情境

---

## 問題 Q2：如何開放接口讓 Combat 與角色面板調用？

### 架構建議：提取計算邏輯，保留實例化設計

#### 方案一：保持現狀，增加獨立計算函數（推薦）

**理由**:

- 戰鬥內：每個 Character 實例持有自己的 AttributeManager + AttributeCalculator
- 戰鬥外：角色面板需要**純計算**（不需要持久化狀態）

**架構調整**:

```
src/logic/combat/domain/attribute/
├─ AttributeManager.ts          (實例狀態容器，戰鬥內使用)
├─ AttributeCalculator.ts       (實例計算器，依賴 Manager)
├─ attribute-calculation.ts     (純函數計算邏輯，NEW)
└─ models/
```

**新增檔案**: `attribute-calculation.ts`

```typescript
/**
 * 純函數計算最終屬性值（不依賴 Manager 實例）
 * 用於角色面板、預覽系統等不需要持久化狀態的場景
 */
export function calculateFinalAttribute(
  baseValue: number,
  modifiers: AttributeModifier[]
): number {
  const sorted = sortModifiersByPriority(modifiers)
  const additive = calculateAdditiveSum(filterByMode(sorted, 'add'))
  const multiplier = calculateMultiplierProduct(filterByMode(sorted, 'multiply'))
  return (baseValue + additive) * multiplier
}

// 內部輔助函數
function sortModifiersByPriority(...) { ... }
function filterByMode(...) { ... }
function calculateAdditiveSum(...) { ... }
function calculateMultiplierProduct(...) { ... }
```

**調用方式**:

```typescript
// 戰鬥內（有狀態）
class Character {
  private attributeCalculator: AttributeCalculator
  getAttribute(type: AttributeType): number {
    return this.attributeCalculator.calculateAttribute(type)
  }
}

// 角色面板（無狀態）
import { calculateFinalAttribute } from '@/logic/combat/domain/attribute'

function getCharacterPanelAttributes(
  baseAttrs: BaseAttributeValues,
  equipmentModifiers: AttributeModifier[],
  relicModifiers: AttributeModifier[]
): PanelAttributeView {
  const allModifiers = [...equipmentModifiers, ...relicModifiers]

  return {
    attackDamage: calculateFinalAttribute(
      baseAttrs.attackDamage,
      allModifiers.filter((m) => m.type === 'attackDamage')
    ),
    // ... 其他屬性
  }
}
```

---

#### 方案二：引入獨立的計算服務（不推薦，過度設計）

```
src/services/
├─ AttributeCalculationService.ts  (單例服務)
└─ CharacterPanelService.ts
```

**為何不推薦**:

1. 增加一層間接層（Service → Calculator → Manager）
2. 你的需求不需要依賴注入容器或服務註冊機制
3. 靜態方法無法優雅處理實例狀態（除非每次都傳入完整數據）

---

## 問題 Q3：Domain vs Logic vs Systems 的邊界在哪？

### 我的分層哲學（基於你的專案規模）

#### Domain（領域層）

- **目的**: 定義**核心業務概念**（What）
- **內容**:
  - ✅ 介面與類型定義
  - ✅ 值對象與實體（有狀態的業務對象）
  - ✅ 領域規則的**輕量計算邏輯**（例如：屬性計算公式）
- **範例**:
  - `ICharacter`, `IEffect`, `AttributeType`
  - `AttributeManager`（狀態容器）
  - `AttributeCalculator`（計算邏輯，因為它是屬性領域的核心規則）

#### Logic（邏輯層）- 重新命名為 Combat（推薦）

- **目的**: 實現**特定業務流程**（How）
- **內容**:
  - 戰鬥引擎的流程編排
  - 傷害管線（DamageChain）
  - Tick 驅動系統
- **範例**:
  - `CombatEngine`, `TickerDriver`, `DamageChain`

**建議重構**:

```
src/logic/combat/ → src/combat/
```

理由：`logic/combat` 的 `logic` 前綴是多餘的，直接用 `combat` 更清晰。

---

### 關於 AI 建議的「廢除 logic/ 改用 systems/」

#### 我的立場：**反對**

**理由**:

1. **Systems 是 DDD 的跨領域服務概念**
   - 適用於複雜微服務架構（訂單系統、支付系統、庫存系統）
   - 你的專案是單體前端遊戲，不需要跨 Bounded Context 的服務層

2. **你的 logic/combat 不是 "System"，而是 "Engine"**
   - Combat Engine 是一個**獨立的子模組**，有明確的輸入輸出
   - 它不是跨多個領域的協調器，而是**戰鬥領域的完整實現**

3. **過度抽象會稀釋語意**
   - `AttributeCalculationSystem` 聽起來像是跨多個模組共用的計算服務
   - 但實際上它只是 `AttributeCalculator` 的無狀態版本

---

### 關於 domain/item 的問題

#### 當前錯誤設計

```
domain/item/
├─ affixes/
│  ├─ AffixRoller.ts          ❌ 錯誤（生成邏輯）
│  └─ affix-definition.ts     ✅ 正確（定義）
├─ factories/
│  ├─ EffectFactory.ts        ⚠️ 爭議（見下文）
│  └─ CombatItemFactory.ts    ✅ 正確（投影轉換）
├─ registries/
│  └─ ItemDefinitionRegistry.ts  ❌ 錯誤（基礎設施）
```

#### 我的建議重構

**方案 A：最小改動方案（推薦）**

```
src/
├─ domain/
│  ├─ item/                    (純定義)
│  │  ├─ equipment-slot.ts
│  │  ├─ affixes/
│  │  │  ├─ affix-definition.ts
│  │  │  └─ affix-instance.ts
│  │  ├─ definitions/
│  │  └─ projections/
│  └─ attribute/               (純定義 + 計算邏輯)
│     ├─ attribute-type.ts
│     ├─ attribute-values.ts
│     ├─ AttributeManager.ts
│     ├─ AttributeCalculator.ts
│     └─ attribute-calculation.ts  (NEW: 純函數版本)
│
├─ combat/                     (原 logic/combat)
│  ├─ domain/                  (戰鬥領域實體)
│  │  ├─ character/
│  │  ├─ effect/
│  │  └─ item/
│  ├─ infra/                   (基礎設施)
│  │  ├─ registries/           (NEW: 搬移註冊表)
│  │  │  ├─ ItemDefinitionRegistry.ts
│  │  │  └─ AffixDefinitionRegistry.ts
│  │  └─ event-bus/
│  └─ ...
│
└─ generators/                 (NEW: 生成器模組)
   ├─ item-generator/
   │  ├─ AffixRoller.ts        (搬移自 domain/item)
   │  ├─ EffectFactory.ts      (搬移自 domain/item)
   │  └─ ItemGenerator.ts
   └─ enemy-generator/
```

**核心原則**:

- **domain/**: 只有定義與核心領域邏輯（包括狀態管理與計算規則）
- **combat/**: 戰鬥引擎的完整實現（包括基礎設施）
- **generators/**: 所有生成邏輯（依賴 domain 定義）

---

## TradeOff 分析

### 方案對比表

| 方案                                     | 優點                                                      | 缺點                                                                        | 適用場景         |
| ---------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------- |
| **方案一：保持 Calculator + 新增純函數** | 1. 最小改動<br>2. 保留實例化設計<br>3. 新增無狀態計算支援 | 需要維護兩套 API（實例 vs 純函數）                                          | 當前專案（推薦） |
| **方案二：全改為靜態方法**               | API 統一                                                  | 1. 無法處理實例狀態<br>2. 需要大量重構 Character<br>3. 每次計算都傳完整數據 | 純函數式架構     |
| **方案三：引入 Service 層**              | 符合 DDD 規範                                             | 1. 過度設計<br>2. 增加跳轉層級<br>3. 學習曲線陡峭                           | 大型企業級專案   |

---

## 我的最終建議

### 短期重構（1-2 天）

#### 1. domain/item 瘦身

```
移動：
src/domain/item/affixes/AffixRoller.ts
  → src/generators/item-generator/AffixRoller.ts

移動：
src/domain/item/factories/EffectFactory.ts
  → src/generators/item-generator/EffectFactory.ts

移動：
src/domain/item/registries/
  → src/combat/infra/registries/
```

#### 2. 新增純函數計算支援

```
新增：
src/domain/attribute/attribute-calculation.ts
  - 導出 calculateFinalAttribute()
  - 提取 AttributeCalculator 的計算邏輯
```

#### 3. 重新命名資料夾

```
src/logic/combat/ → src/combat/
```

---

### 中期重構（未來 1-2 週）

#### 4. 分離角色面板模組

```
新增：
src/character-panel/
├─ CharacterPanelView.ts       (使用 attribute-calculation 純函數)
├─ EquipmentPreview.ts
└─ models/
```

#### 5. 建立統一的生成器模組

```
src/generators/
├─ item-generator/
│  ├─ AffixRoller.ts
│  ├─ EffectFactory.ts
│  └─ ItemGenerator.ts         (統一入口)
├─ enemy-generator/
│  └─ EnemyGenerator.ts
└─ difficulty-scaler/
   └─ DifficultyScaler.ts
```

---

## 回答 Q3 的核心觀點

### AI 的建議是基於 DDD 企業級架構，但你的專案不需要

**你需要的是**:

- 清晰的模組邊界（domain / combat / generators）
- 簡單的依賴方向（單向流動，避免循環依賴）
- 實用主義的分層（夠用就好，不過度抽象）

**你不需要的是**:

- DDD 風格的 Application Service 層
- 靜態方法單例服務
- 過度泛化的 "System" 概念

---

## 答案摘要

### Q1: 要搬到 logic/CharacterModifierSystem 嗎？

**不**。保持在 `domain/attribute/`，但：

1. 新增 `attribute-calculation.ts`（純函數版本）
2. 保留 `AttributeCalculator`（實例版本）
3. 將 `logic/` 重新命名為 `combat/`

---

### Q2: 如何開放接口？

**雙軌制**:

1. 戰鬥內 → `Character.getAttribute()` → `AttributeCalculator.calculateAttribute()`（有狀態）
2. 角色面板 → `import { calculateFinalAttribute }` → 純函數計算（無狀態）

---

### Q3: AI 的說法對嗎？

**部分正確**:

- ✅ domain/item 應該瘦身
- ✅ logic/ 命名太模糊

**部分錯誤**:

- ❌ 不需要 systems/ 資料夾
- ❌ AttributeCalculator 不該是靜態方法
- ❌ 註冊表可以留在 combat/infra（不一定要抽到根層級的 infrastructure/）

---

## 最後的哲學

**架構設計的目的是減少認知負擔，而非炫耀設計模式。**

你的專案規模（約 10-15 個模組）適合：

- **扁平化模組**（避免超過 3 層嵌套）
- **領域驅動命名**（用業務語言，不用技術術語）
- **實用主義分層**（只在真正需要時才抽象）

不適合：

- DDD 的六邊形架構（過度設計）
- 微服務風格的 Service 層（無必要）
- 過度泛化的 System / Manager / Handler（語意模糊）

---

**建議優先級**:

1. 🔥 **立即執行**: domain/item 瘦身（移動 AffixRoller, EffectFactory）
2. 🔥 **立即執行**: 新增 attribute-calculation.ts 純函數
3. ⚡ **本週內**: 重新命名 logic/combat → combat
4. 📅 **下週**: 實作角色面板時驗證純函數 API 是否足夠

---

**最終目錄結構預覽**:

```
src/
├─ domain/
│  ├─ attribute/                    (定義 + 狀態管理 + 計算邏輯)
│  ├─ item/                         (純定義)
│  └─ character/                    (純定義)
│
├─ combat/                          (原 logic/combat)
│  ├─ domain/                       (戰鬥實體)
│  ├─ infra/                        (基礎設施 + 註冊表)
│  ├─ coordination/
│  └─ combat-engine/
│
├─ generators/                      (所有生成邏輯)
│  ├─ item-generator/
│  └─ enemy-generator/
│
├─ character-panel/                 (未來新增)
│  └─ CharacterPanelView.ts         (使用純函數計算)
│
└─ combat-impl/                     (效果實作)
   └─ effects/
```

---

**問我問題前，先問自己**:

1. 這個抽象層是為了解決**真實的重複代碼**，還是為了**理論上的可能性**？
2. 三個月後，我能在 5 秒內找到這個文件嗎？
3. 新人能理解這個資料夾的用途嗎？

**如果答案有任何猶豫，就不要過度設計。**
