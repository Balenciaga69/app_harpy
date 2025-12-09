# ItemGenerator 模組規格書

## 目標功能與範圍

### 會實現的功能
- 根據難度係數與職業，獨立生成裝備和遺物實例（帶有隨機屬性）
- 支援職業專屬裝備池篩選（透過職業定義的 equipmentPoolIds）
- 支援稀有度權重計算（基於難度係數調整詞綴數量）
- 支援 Affix 模板庫（含 tags 分類：attack/defense/mechanic/legendary）
- 支援槽位規則過濾（武器排除防禦、頭盔/盔甲排除攻擊）
- 確保生成結果可重現（使用 seedrandom）
- 提供生成 API 供其他模組調用（generateEquipment、generateRelic）

### 不會實現的功能
- 物品定義管理（由 domain/item 負責）
- 庫存管理（由 Inventory 模組負責）
- 戰鬥效果實作（由 Combat 模組負責）
- UI 渲染（由 UI 模組負責）
- 物品掉落計算（由 Loot 模組負責）
- 存讀檔（由 PersistentStorage 模組負責）
- Legendary 裝備生成（固定物品直接從註冊表取用，不經 ItemGenerator）

---

## 架構與元件關係

### 模組定位
位於後端純運算模組層（logic/item-generator），提供獨立的物品生成邏輯，無外部依賴，可被多個模組重用。

### 依賴方向
- 僅依賴 DifficultyScaler（獲取難度係數）、domain/item（物品與詞綴定義）、domain/character（職業定義）
- 被 Inventory 使用（生成新物品）
- 被 CombatEngine 使用（敵人裝備生成）
- 被 Run 模組使用（掉落生成）

### 檔案結構
- ItemGenerator.ts：核心生成類別
- strategies/affix-filter.ts：過濾策略介面
- strategies/SlotBasedFilter.ts：槽位過濾策略實作
- strategies/index.ts：策略導出
- index.ts：統一導出

---

## 核心元件

### ItemGenerator
負責物品生成的 Facade 類別。接受難度係數、裝備定義 ID、隨機種子作為輸入，輸出生成的裝備或遺物實例。

核心方法：
- `generateEquipment(definitionId, difficulty, seed)`: 生成裝備實例
- `generateRelic(definitionId)`: 生成遺物實例（無隨機）

內部邏輯：
1. 查詢定義（ItemDefinitionRegistry）
2. 初始化 RNG（seedrandom）
3. 計算詞綴數量（基於難度與稀有度）
4. 篩選可用詞綴池（策略模式過濾）
5. Roll 詞綴實例（AffixRoller）
6. 組裝實例（返回 IEquipmentInstance）

### IAffixFilter（策略模式）
詞綴過濾策略介面。定義 `filter(affixes, slot)` 方法，根據槽位過濾可用詞綴。

### SlotBasedFilter
基於槽位的過濾策略實作。規則：
- 武器：排除 'defense' tag
- 頭盔/盔甲：排除 'attack' tag
- 其他槽位：不過濾

### AffixRoller（domain/item）
詞綴擲骰工具，ItemGenerator 依賴它進行權重選取與數值擲骰。

---

## 對外暴露的主要功能

### 類別導出
- ItemGenerator：物品生成器
- SlotBasedFilter：槽位過濾策略

### 介面導出
- IAffixFilter：過濾策略介面
- IItemGeneratorConfig：生成器配置
- IEquipmentInstance：裝備實例
- IRelicInstance：遺物實例

### 方法導出
- `generateEquipment(definitionId: string, difficulty: number, seed: string): IEquipmentInstance`
- `generateRelic(definitionId: string): IRelicInstance`

---

## 設計原則
- 單一職責：僅負責生成邏輯
- 策略模式：支援不同過濾規則
- 工廠模式：組裝實例
- 無副作用：相同輸入永遠相同輸出
- 跨語言可移植：純 TypeScript 邏輯
- 易於測試：支援 mock 策略與註冊表

---

## 使用範例

### 生成 Rare 裝備
```typescript
const generator = new ItemGenerator()
const equipment = generator.generateEquipment('steel_sword', 15, 'seed123')
// 輸出：{ id: 'xxx', definitionId: 'steel_sword', rarity: 'rare', affixes: [...] }
```

### 生成 Legendary 裝備
```typescript
// Legendary 固定物品不經 ItemGenerator，直接從註冊表取用
const zeusHelm = ItemDefinitionRegistry.getById('zeus_helm')
```

### 生成 Relic
```typescript
const generator = new ItemGenerator()
const relic = generator.generateRelic('titans_heart')
// 輸出：{ id: 'xxx', definitionId: 'titans_heart', stackCount: 1 }
```

---

## 開發狀態（2025/12/09）
- ✅ 已完成：domain 層添加 tags、職業裝備池、詞綴範例、裝備定義
- ✅ 已完成：ItemGenerator MVP（支援規則過濾）
- ✅ 已完成：範例物品（宙斯頭、泰坦之心）
- ⏳ 待實作：單元測試
- ⏳ 待實作：稀有度權重公式（目前簡化版）
- ⏳ 待實作：與 Run 模組整合
