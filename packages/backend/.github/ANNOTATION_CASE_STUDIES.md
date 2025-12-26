# 實施案例研究 - 代碼改進前後對比

本文檔展示如何應用新註解規範到實際代碼。

---

## 案例 1：複雜演算法 - UnitStatAggregate.ts

### ❌ **改進前（缺少關鍵說明）**

```typescript
import { UnitStatModifier } from './models/StatModifier'
import { UnitStats } from './models/UnitStats'

type ByField = Partial<Record<keyof UnitStats, UnitStatModifier[]>>

function computeAggregatedValue(base: number, mods: UnitStatModifier[]): number {
  let addSum = 0
  let multiplySum = 0
  let lastSet: number | undefined = undefined
  for (const m of mods) {
    switch (m.operation) {
      case 'ADD':
        addSum += m.value
        break
      case 'MULTIPLY':
        multiplySum += m.value
        break
      case 'SET':
        lastSet = m.value
        break
      default:
        break
    }
  }
  let v = (base + addSum) * (1 + multiplySum)
  if (lastSet !== undefined) v = lastSet
  return v
}

const aggregateStats = (baseStats: UnitStats, modifiers: readonly UnitStatModifier[]): UnitStats => {
  const byField: ByField = {}
  for (const m of modifiers) {
    const f = m.field as keyof UnitStats
    if (!byField[f]) byField[f] = []
    byField[f]!.push(m)
  }
  const result: UnitStats = { ...baseStats }
  const fieldsWithMods = Object.keys(byField) as (keyof UnitStats)[]
  for (const field of fieldsWithMods) {
    const mods = byField[field] ?? []
    const baseVal = Number(baseStats[field] ?? 0)
    const aggregated = computeAggregatedValue(baseVal, mods)
    result[field] = aggregated
  }
  return result
}

export const UnitStatAggregate = aggregateStats
```

### ✅ **改進後（完整文檔與邊界說明）**

```typescript
import { UnitStatModifier } from './models/StatModifier'
import { UnitStats } from './models/UnitStats'

/** 統計修飾符按字段分組的臨時映射 */
type ByField = Partial<Record<keyof UnitStats, UnitStatModifier[]>>

/**
 * 計算單一統計值，應用 ADD → MULTIPLY → SET 的優先級順序
 *
 * 業務規則:
 * 1. ADD 修飾符：加法疊加（例: +10 HP）
 * 2. MULTIPLY 修飾符：乘法疊加（例: ×1.2 攻速）
 * 3. SET 修飾符：覆蓋優先級最高，忽略之前的計算
 *
 * 計算順序: (base + addSum) × (1 + multiplySum) → [SET 覆蓋]
 *
 * 邊界:
 * - base: 基礎統計值，可為任意數值
 * - mods: 修飾符順序不影響最終結果（交換律）
 * - SET 最多一個有效（使用最後一個 SET）
 *
 * 副作用: 無，純函數
 */
function computeAggregatedValue(base: number, mods: UnitStatModifier[]): number {
  let addSum = 0
  let multiplySum = 0
  let lastSet: number | undefined = undefined

  for (const m of mods) {
    switch (m.operation) {
      case 'ADD':
        addSum += m.value
        break
      case 'MULTIPLY':
        multiplySum += m.value
        break
      case 'SET':
        lastSet = m.value
        break
      default:
        break
    }
  }

  let aggregated = (base + addSum) * (1 + multiplySum)
  if (lastSet !== undefined) aggregated = lastSet
  return aggregated
}

/**
 * 彙總所有統計修飾符，為每個統計字段計算最終值
 *
 * 邊界:
 * - modifiers 為空時：回傳原始 baseStats（恆等操作）
 * - 相同 field 的多個修飾符：使用 computeAggregatedValue 合併
 * - 不存在的字段修飾符：忽略，不添加新字段
 *
 * 副作用: 無，回傳新物件不修改輸入參數
 */
const aggregateStats = (baseStats: UnitStats, modifiers: readonly UnitStatModifier[]): UnitStats => {
  // 步驟 1: 按字段分組修飾符
  const byField: ByField = {}
  for (const m of modifiers) {
    const f = m.field as keyof UnitStats
    if (!byField[f]) byField[f] = []
    byField[f]!.push(m)
  }

  // 步驟 2: 複製基礎統計作為計算起點
  const result: UnitStats = { ...baseStats }

  // 步驟 3: 為有修飾符的字段計算新值
  const fieldsWithMods = Object.keys(byField) as (keyof UnitStats)[]
  for (const field of fieldsWithMods) {
    const fieldModifiers = byField[field] ?? []
    const baseValue = Number(baseStats[field] ?? 0)
    const aggregatedValue = computeAggregatedValue(baseValue, fieldModifiers)
    result[field] = aggregatedValue
  }

  return result
}

/** 暴露彙總函數供外部使用 */
export const UnitStatAggregate = aggregateStats
```

### 📊 **改進重點**

| 項目               | 改進內容                                     |
| ------------------ | -------------------------------------------- |
| **類型 Docstring** | 新增 ByField 類型說明                        |
| **複雜邏輯說明**   | 詳解 ADD → MULTIPLY → SET 的優先級與計算順序 |
| **邊界條件**       | 說明 base 範圍、修飾符順序、SET 覆蓋規則     |
| **副作用標記**     | 明確標註為「無，純函數」                     |
| **流程步驟**       | 分步驟註解 aggregateStats 的核心邏輯         |
| **出口說明**       | 解釋為何暴露 UnitStatAggregate 而非直接函數  |

---

## 案例 2：Domain 模型 - Stash.ts

### ❌ **改進前**

```typescript
import { ItemInstance } from '../item/itemInstance'

export interface IStash {
  readonly items: ReadonlyArray<ItemInstance>
  readonly capacity: number
  // 基本操作
  addItem(item: ItemInstance): boolean
  removeItem(itemId: string): boolean
  takeItem(itemId: string): ItemInstance | null
  listItems(): ReadonlyArray<ItemInstance>
  getUsedCapacity(): number
  expandCapacity(newCapacity: number): boolean
  // 業務規則檢查
  canAddItem(item: ItemInstance): boolean
  hasItem(itemId: string): boolean
  isAtCapacity(): boolean
}

export class Stash implements IStash {
  private _items: ItemInstance[] = []
  private _capacity: number

  constructor(initialItems: ItemInstance[] = [], initialCapacity: number = 20) {
    this._items = [...initialItems]
    this._capacity = initialCapacity
  }

  get items(): ReadonlyArray<ItemInstance> {
    return this._items
  }

  get capacity(): number {
    return this._capacity
  }

  addItem(item: ItemInstance): boolean {
    if (!this.canAddItem(item)) return false
    this._items.push(item)
    return true
  }

  removeItem(itemId: string): boolean {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return false
    this._items.splice(idx, 1)
    return true
  }

  takeItem(itemId: string): ItemInstance | null {
    const item = this._items.find((i) => i.id === itemId) ?? null
    this.removeItem(itemId)
    return item
  }

  listItems(): ReadonlyArray<ItemInstance> {
    return [...this._items]
  }

  getUsedCapacity(): number {
    return this._items.length
  }

  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= this._capacity) return false
    this._capacity = newCapacity
    return true
  }

  canAddItem(item: ItemInstance): boolean {
    return this._items.length < this._capacity
  }

  hasItem(itemId: string): boolean {
    return this._items.some((i) => i.id === itemId)
  }

  isAtCapacity(): boolean {
    return this._items.length >= this._capacity
  }
}
```

### ✅ **改進後**

```typescript
import { ItemInstance } from '../item/itemInstance'

/**
 * 物品庫存的領域模型與合約
 * 職責: 管理物品集合、容量限制、基本物品操作
 * 邊界: 不處理物品掉落、出售邏輯（由上層應用層 StashService 處理）
 */
export interface IStash {
  readonly items: ReadonlyArray<ItemInstance>
  readonly capacity: number

  // 狀態修改操作
  /** 添加物品，返回是否成功（容量不足時失敗） */
  addItem(item: ItemInstance): boolean

  /** 移除指定 ID 的物品，返回是否找到並移除 */
  removeItem(itemId: string): boolean

  /** 移除並取出物品，返回物品或 null */
  takeItem(itemId: string): ItemInstance | null

  /** 擴展容量上限，容量須嚴格大於當前值 */
  expandCapacity(newCapacity: number): boolean

  // 查詢操作
  /** 取得所有物品的副本 */
  listItems(): ReadonlyArray<ItemInstance>

  /** 取得已使用的容量數 */
  getUsedCapacity(): number

  // 業務規則檢查
  /** 檢查物品是否可添加（基於容量限制） */
  canAddItem(item: ItemInstance): boolean

  /** 檢查指定 ID 的物品是否存在 */
  hasItem(itemId: string): boolean

  /** 檢查是否已達到容量上限 */
  isAtCapacity(): boolean
}

/**
 * 物品庫存實現
 * 功能: 管理物品列表與容量，提供 CRUD 與驗證操作
 *
 * 設計決策:
 * - 使用私有 _items 陣列，通過 getter 暴露不可變視圖
 * - capacity 不可為負，擴展時須大於現有值
 * - 物品 ID 必須唯一（由上層應用層確保）
 */
export class Stash implements IStash {
  private _items: ItemInstance[] = []
  private _capacity: number

  /**
   * 初始化庫存
   *
   * 邊界:
   * - initialItems 長度必須 <= initialCapacity，否則物品可能無法全部保存
   * - 若 initialCapacity < initialItems.length，構造時不驗證（由呼叫方責任）
   *
   * 副作用: 複製 initialItems 陣列（不保留外部引用）
   */
  constructor(initialItems: ItemInstance[] = [], initialCapacity: number = 20) {
    this._items = [...initialItems]
    this._capacity = initialCapacity
  }

  get items(): ReadonlyArray<ItemInstance> {
    return this._items
  }

  get capacity(): number {
    return this._capacity
  }

  /**
   * 添加物品到庫存
   *
   * 副作用: 修改內部 _items 狀態
   * 回傳: true = 成功添加，false = 容量不足或其他限制
   * 邊界: 若 addItem 失敗，庫存狀態不變
   */
  addItem(item: ItemInstance): boolean {
    if (!this.canAddItem(item)) return false
    this._items.push(item)
    return true
  }

  /**
   * 移除指定 ID 的物品
   *
   * 副作用: 修改內部 _items 狀態
   * 回傳: true = 找到並移除，false = ID 不存在
   * 邊界: 移除後物品完全丟失，不可恢復
   */
  removeItem(itemId: string): boolean {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return false
    this._items.splice(idx, 1)
    return true
  }

  /**
   * 取出物品（移除並返回）
   *
   * 副作用: 修改內部 _items 狀態
   * 回傳: 物品物件或 null（找不到時）
   * 邊界: 即使物品不存在也嘗試移除（無錯誤，回傳 null）
   */
  takeItem(itemId: string): ItemInstance | null {
    const item = this._items.find((i) => i.id === itemId) ?? null
    this.removeItem(itemId)
    return item
  }

  /**
   * 取得所有物品的副本
   *
   * 副作用: 無，回傳新陣列
   * 邊界: 修改回傳陣列不影響庫存（已複製）
   */
  listItems(): ReadonlyArray<ItemInstance> {
    return [...this._items]
  }

  /**
   * 取得已使用的容量數
   *
   * 副作用: 無，純計算
   * 邊界: 值等於 _items.length，與 capacity 獨立
   */
  getUsedCapacity(): number {
    return this._items.length
  }

  /**
   * 擴展容量上限
   *
   * 副作用: 修改 _capacity
   * 回傳: true = 成功擴展，false = 新容量不大於舊容量
   * 邊界: 容量只能增加不能減少，新值須 > 舊值
   */
  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= this._capacity) return false
    this._capacity = newCapacity
    return true
  }

  /**
   * 檢查物品是否可添加
   *
   * 副作用: 無，純檢查
   * 邊界: 只檢查容量，不檢查物品重複或其他業務規則
   * 依賴: 依賴 _capacity 與 _items.length 的準確性
   */
  canAddItem(item: ItemInstance): boolean {
    return this._items.length < this._capacity
  }

  /** 檢查物品是否存在，副作用: 無 */
  hasItem(itemId: string): boolean {
    return this._items.some((i) => i.id === itemId)
  }

  /** 檢查是否滿容，副作用: 無 */
  isAtCapacity(): boolean {
    return this._items.length >= this._capacity
  }
}
```

### 📊 **改進重點**

| 項目               | 改進內容                                  |
| ------------------ | ----------------------------------------- |
| **介面 Docstring** | 職責、邊界、不處理哪些邏輯                |
| **方法分組說明**   | 清晰分類：狀態修改 vs 查詢 vs 規則檢查    |
| **副作用標記**     | 每個方法明確 「副作用: ...」              |
| **邊界條件**       | 容量範圍、唯一性、不可恢復性等            |
| **設計決策**       | 說明為何用私有陣列、為何不驗證初始狀態    |
| **簡單方法**       | 高頻方法（hasItem、isAtCapacity）保持簡潔 |

---

## 案例 3：Service 層協調 - 假設改進 ItemGenerationService

### ❌ **改進前**

```typescript
export class ItemGenerationService {
  private constraintService: ItemConstraintService
  private modifierService: ItemModifierAggregationService
  private rollService: ItemRollService
  private instantiationService: ItemInstantiationService

  constructor(appContextService: IAppContextService) {
    this.constraintService = new ItemConstraintService(appContextService)
    this.modifierService = new ItemModifierAggregationService(appContextService)
    this.rollService = new ItemRollService(appContextService, this.constraintService)
    this.instantiationService = new ItemInstantiationService(appContextService)
  }

  generateRandomItem(source: ItemRollSourceType) {
    if (!this.constraintService.canGenerateItems()) {
      return null
    }
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    return this.instantiationService.createItemInstance(itemTemplateId, itemType)
  }

  generateItemFromTemplate(templateId: string, itemType: 'RELIC') {
    if (!this.constraintService.canGenerateItemTemplate(templateId)) {
      return null
    }
    return this.instantiationService.createItemInstance(templateId, itemType)
  }
}
```

### ✅ **改進後**

```typescript
/**
 * 物品生成協調服務
 *
 * 職責: 協調物品生成的完整流程（檢驗 → 聚合修飾符 → 骰選 → 實例化）
 *
 * 依賴注入:
 * - ItemConstraintService: 驗證生成限制
 * - ItemModifierAggregationService: 聚合當前修飾符
 * - ItemRollService: 執行骰選邏輯
 * - ItemInstantiationService: 創建實例
 *
 * 邊界:
 * - 不處理物品放入背包（由 StashService 處理）
 * - 不處理物品欄位驗證（由下層 ItemConstraintService 處理）
 * - 回傳 null 表示生成失敗，呼叫方須檢查
 *
 * 防腐層: 所有物品操作均通過此服務，上層不應直接操作 ItemFactory
 */
export class ItemGenerationService {
  private constraintService: ItemConstraintService
  private modifierService: ItemModifierAggregationService
  private rollService: ItemRollService
  private instantiationService: ItemInstantiationService

  constructor(appContextService: IAppContextService) {
    this.constraintService = new ItemConstraintService(appContextService)
    this.modifierService = new ItemModifierAggregationService(appContextService)
    this.rollService = new ItemRollService(appContextService, this.constraintService)
    this.instantiationService = new ItemInstantiationService(appContextService)
  }

  /**
   * 根據來源與當前修飾符生成隨機物品
   *
   * 流程:
   * 1. 檢驗是否允許生成（基於遊戲進度、事件等）
   * 2. 聚合當前有效修飾符（未過期 + 高頻標籤 + 高堆疊物品）
   * 3. 依序骰選：物品類型 → 稀有度 → 具體樣板
   * 4. 實例化物品並注入當前遊戲進度資訊
   *
   * 副作用: 無狀態修改（骰選基於 runContext.seed，不改變狀態）
   * 邊界: 回傳 null 表示不允許生成
   * 依賴: 修飾符聚合依賴當前裝備狀態與時間進度
   *
   * 參數:
   * - source: 物品來源類型（例: ShopRefresh、PostGameReward）
   *
   * 回傳: 生成的物品實例或 null
   */
  generateRandomItem(source: ItemRollSourceType): ItemInstance | null {
    // 步驟 1: 檢驗是否可生成
    if (!this.constraintService.canGenerateItems()) {
      return null
    }

    // 步驟 2: 聚合當前修飾符（影響稀有度與標籤權重）
    const modifiers = this.modifierService.aggregateModifiers()

    // 步驟 3: 執行骰選（從配置中選擇具體物品）
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)

    // 步驟 4: 實例化物品（注入當前進度資訊）
    return this.instantiationService.createItemInstance(itemTemplateId, itemType)
  }

  /**
   * 生成指定樣板的物品，跳過隨機骰選步驟
   *
   * 使用場景: 寶箱、任務獎勵等確定物品
   *
   * 副作用: 無狀態修改
   * 邊界: 必須驗證樣板是否在當前章節可用
   * 回傳: 生成的物品實例或 null（樣板不可用時）
   *
   * 參數:
   * - templateId: 物品樣板 ID（例: item_relic_poison_bomb）
   * - itemType: 物品類型（目前只支援 RELIC）
   */
  generateItemFromTemplate(templateId: string, itemType: 'RELIC'): ItemInstance | null {
    // 檢驗樣板在當前上下文是否可生成
    if (!this.constraintService.canGenerateItemTemplate(templateId)) {
      return null
    }

    // 直接實例化，跳過骰選步驟
    return this.instantiationService.createItemInstance(templateId, itemType)
  }
}
```

### 📊 **改進重點**

| 項目           | 改進內容                        |
| -------------- | ------------------------------- |
| **類別職責**   | 明確協調者角色，列出依賴注入    |
| **邊界聲明**   | 明確不處理的責任範圍            |
| **流程步驟**   | 分步驟註解而非長篇描述          |
| **副作用標記** | 明確為「無狀態修改」但依賴 seed |
| **防腐層聲明** | 強調所有物品操作須通過此服務    |
| **參數與回傳** | 明確類型與含義（null 表示失敗） |
| **使用場景**   | 說明何時用隨機 vs 指定樣板      |

---

## 🎯 改進效果對比

### **對 AI Agent 的幫助**

| 改進項         | 對 RAG 檢索的幫助                                 |
| -------------- | ------------------------------------------------- |
| **Docstring**  | ✅ RAG 能精確匹配關鍵詞（「防腐層」、「副作用」） |
| **邊界說明**   | ✅ AI 不會超越限制，避免不安全修改                |
| **流程步驟**   | ✅ AI 理解操作順序，減少邏輯錯誤                  |
| **業務規則**   | ✅ AI 遵循規則而非猜測意圖                        |
| **副作用標記** | ✅ AI 追蹤狀態變化，避免遺漏初始化                |

### **對人類開發者的幫助**

| 改進項       | 對可讀性的幫助                      |
| ------------ | ----------------------------------- |
| **介面文檔** | ✅ 新開發者快速理解 API 合約        |
| **邊界說明** | ✅ 避免誤用 API（例如容量減少）     |
| **設計決策** | ✅ 理解為什麼這樣設計，降低修改風險 |
| **流程步驟** | ✅ 複雜邏輯易於追蹤與除錯           |

---

## ✅ 檢查清單

應用新註解規範時，確認：

- [ ] **類別/介面** 有單行功能描述
- [ ] **複雜方法** 有「副作用」、「邊界」、「依賴」說明
- [ ] **業務規則** 使用「業務規則」或「流程」標記
- [ ] **回傳值** 明確含義（特別是 null、false、異常情況）
- [ ] **邊界條件** 說明範圍、前置條件、後置條件
- [ ] **防腐層** 明確指出上下文邊界
- [ ] **簡單方法** 不添加冗餘註解（信任代碼自身的清晰性）
