# Item 模組規格書

## 一、目標功能與範圍

### 核心目標

提供裝備與遺物的核心定義層，支援詞綴系統，並透過視角投影模式讓不同模組只取用各自需要的資料。

### 會實現的功能

- 物品定義介面（`IItemDefinition`、`IEquipmentDefinition`、`IRelicDefinition`）
- 詞綴定義與實例介面（`IAffixDefinition`、`IAffixInstance`）
- 詞綴生成器（`AffixRoller`）
- 視角投影介面（`ICombatItemView`、`IInventoryItemView`、`IUIItemView`）
- 視角投影工廠（`CombatItemFactory`、`EffectFactory`）
- 定義註冊表（`ItemDefinitionRegistry`、`AffixDefinitionRegistry`）
- 專屬錯誤類別（`ItemError`）

### 不會實現的功能

- 物品生成邏輯（由 `ItemGenerator` 模組負責）
- 庫存管理（由 `Inventory` 模組負責）
- 戰鬥效果實作（由 `Combat` 模組負責）
- UI 渲染（由前端模組負責）

---

## 二、架構與元件關係

### 模組位置

`src/domain/item/`

### 目錄結構

```
src/domain/item/
├── index.ts                          # 模組總入口
├── definitions/
│   ├── index.ts
│   ├── item-definition.ts            # IItemDefinition 基礎介面
│   ├── equipment-definition.ts       # IEquipmentDefinition 裝備介面
│   └── relic-definition.ts           # IRelicDefinition 遺物介面
├── affixes/
│   ├── index.ts
│   ├── affix-definition.ts           # IAffixDefinition 詞綴定義
│   ├── affix-instance.ts             # IAffixInstance 詞綴實例
│   └── AffixRoller.ts                # 詞綴生成器
├── projections/
│   ├── index.ts
│   ├── combat-item-view.ts           # ICombatItemView 戰鬥視角
│   ├── inventory-item-view.ts        # IInventoryItemView 庫存視角
│   └── ui-item-view.ts               # IUIItemView UI 視角
├── factories/
│   ├── index.ts
│   ├── CombatItemFactory.ts          # 戰鬥物品工廠
│   └── EffectFactory.ts              # 效果工廠（泛型設計）
├── registries/
│   ├── index.ts
│   ├── ItemDefinitionRegistry.ts     # 物品定義註冊表
│   └── AffixDefinitionRegistry.ts    # 詞綴定義註冊表
└── errors/
    ├── index.ts
    └── item-error.ts                 # 專屬錯誤類別
```

---

## 三、核心介面定義

### IItemDefinition（物品基礎定義）

```typescript
interface IItemDefinition {
  readonly id: string
  readonly effectTemplateIds: readonly string[]
  readonly affixPoolIds: readonly string[]
  readonly minAffixes: number
  readonly maxAffixes: number
}
```

### IEquipmentDefinition（裝備定義）

```typescript
interface IEquipmentDefinition extends IItemDefinition {
  readonly slot: EquipmentSlot
  readonly baseStats: Readonly<Record<string, number>>
  readonly rarity: EquipmentRarity
}
```

### IRelicDefinition（遺物定義）

```typescript
interface IRelicDefinition extends IItemDefinition {
  readonly stackable: boolean
  readonly maxStack: number
}
```

### IAffixDefinition（詞綴定義）

```typescript
interface IAffixDefinition {
  readonly id: string
  readonly effectTemplateId: string
  readonly minValue: number
  readonly maxValue: number
  readonly weight: number
  readonly tier?: AffixTier // 可選，用於分層生成
}
```

### IAffixInstance（詞綴實例）

```typescript
interface IAffixInstance {
  readonly definitionId: string
  readonly rolledValue: number
}
```

---

## 四、視角投影介面

### ICombatItemView（戰鬥視角）

僅包含 Combat Engine 需要的欄位：

```typescript
interface ICombatItemView {
  readonly id: string
  readonly effectTemplateIds: readonly string[]
  readonly affixInstances: readonly IAffixInstance[]
}
```

### IInventoryItemView（庫存視角）

僅包含 Inventory 模組需要的欄位：

```typescript
interface IInventoryItemView {
  readonly id: string
  readonly definitionId: string
  readonly affixInstances: readonly IAffixInstance[]
  readonly slot?: EquipmentSlot
  readonly stackCount?: number
}
```

### IUIItemView（UI 視角）

僅包含 UI 渲染需要的欄位：

```typescript
interface IUIItemView {
  readonly id: string
  readonly displayName: string
  readonly description: string
  readonly iconPath: string
  readonly rarity: EquipmentRarity
  readonly slot?: EquipmentSlot
  readonly price: number
  readonly affixDescriptions: readonly string[]
}
```

---

## 五、核心類別

### AffixRoller（詞綴生成器）

```typescript
class AffixRoller {
  constructor(rng: IRng, definitions: IAffixDefinition[])
  roll(affixPoolIds: readonly string[], count: number): IAffixInstance[]
  rollSingle(definitionId: string): IAffixInstance | null
}
```

**設計特點：**

- 接受 `IRng` 介面，支援可重現的隨機數
- 使用權重加權隨機選取
- 不重複選取（同一次 roll 內）

### EffectFactory（效果工廠）

```typescript
class EffectFactory<TEffect> {
  register(templateId: string, builder: EffectBuilder<TEffect>): void
  createFromAffix(templateId: string, affixInstance: IAffixInstance): TEffect | null
  createFromCombatItem(itemView: ICombatItemView): TEffect[]
}
```

**設計特點：**

- 泛型設計，可適配不同的效果介面實作
- 註冊機制，允許外部註冊效果建構邏輯
- 支援從詞綴實例生成效果

### ItemDefinitionRegistry / AffixDefinitionRegistry

```typescript
class ItemDefinitionRegistry {
  register(definition: IItemDefinition): void
  registerMany(definitions: IItemDefinition[]): void
  get(id: string): IItemDefinition | undefined
  getAll(): IItemDefinition[]
  has(id: string): boolean
  clear(): void
}
```

**設計特點：**

- 類似資料庫的靜態註冊表
- 防止重複註冊
- 使用 `ItemError` 處理錯誤

---

## 六、錯誤處理

### ItemError 類別

```typescript
class ItemError extends Error {
  readonly code: ItemErrorCode
  readonly context?: Record<string, unknown>

  static duplicateDefinition(type: string, id: string): ItemError
  static definitionNotFound(type: string, id: string): ItemError
  static invalidAffixPool(poolIds: string[]): ItemError
  static invalidValueRange(min: number, max: number): ItemError
  static effectBuilderNotFound(templateId: string): ItemError
}
```

**錯誤類型：**

- `DUPLICATE_DEFINITION`：重複定義
- `DEFINITION_NOT_FOUND`：定義未找到
- `INVALID_AFFIX_POOL`：無效詞綴池
- `INVALID_VALUE_RANGE`：無效數值範圍
- `EFFECT_BUILDER_NOT_FOUND`：效果建構器未找到

---

## 七、資料流程

### 裝備生成流程

```
1. ItemGenerator 選擇 IEquipmentDefinition
2. AffixRoller 根據 affixPoolIds 生成 IAffixInstance[]
3. 建立 InventoryItem（儲存 definitionId + affixInstances）
4. Inventory 模組持有 InventoryItem
```

### 進入戰鬥流程

```
1. 從 Inventory 取得 InventoryItem
2. CombatItemFactory 轉換為 ICombatItemView
3. EffectFactory 根據詞綴實例生成 IEffect[]
4. 建立 ICombatEquipment / ICombatRelic
5. Combat Engine 接收並進行戰鬥計算
```

### 顯示 UI 流程

```
1. 從 Inventory 取得 InventoryItem
2. UIItemViewFactory 轉換為 IUIItemView
3. UI 模組只接收 IUIItemView 進行渲染
```

---

## 八、設計原則

- **單一真相原則**：每個物品只有一份核心定義
- **視角投影模式**：不同模組維護自己需要的視角
- **工廠模式**：負責將靜態定義轉換為運行時物件
- **跨語言友好**：純資料結構，可序列化為 JSON
- **低耦合**：不依賴 Combat Engine、Inventory 或任何框架

---

## 九、與其他模組的關係

| 模組          | 依賴方向             | 說明                                    |
| ------------- | -------------------- | --------------------------------------- |
| Combat Engine | Item → Combat        | 使用 `ICombatItemView` 與 `IEffect`     |
| Inventory     | Item → Inventory     | 使用 `IInventoryItemView`               |
| ItemGenerator | Item → ItemGenerator | 使用 `IItemDefinition` 與 `AffixRoller` |
| UI            | Item → UI            | 使用 `IUIItemView`                      |

---

## 十、待辦事項

### 已完成

- [x] 建立 item 模組目錄結構
- [x] 定義 `IItemDefinition` 介面
- [x] 定義 `IEquipmentDefinition` / `IRelicDefinition` 介面
- [x] 定義 `IAffixDefinition` / `IAffixInstance` 介面
- [x] 實作 `AffixRoller` 類別
- [x] 定義視角投影介面
- [x] 實作 `CombatItemFactory` / `EffectFactory`
- [x] 實作註冊表類別
- [x] 建立 `ItemError` 錯誤類別
- [x] 整合 Combat Engine（移除舊 Equipment/Relic 抽象類別）

### 進行中

- [ ] 建立範例裝備與遺物定義資料

### 待實作

- [ ] 實作 `UIItemViewFactory`
- [ ] 建立 `Inventory` 模組整合
- [ ] 建立 `ItemGenerator` 模組
- [ ] 單元測試（未來統一實作）
