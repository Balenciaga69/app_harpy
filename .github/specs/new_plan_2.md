# 角色與大招領域架構規劃報告（修訂版）

## 一、現狀分析與討論結果

### 關鍵共識

> **核心理念**：一場戰鬥本質上就是「屬性、技能、效果」互相運算的過程

基於這個理念，我們重新審視哪些東西需要獨立到 domain 層，哪些應該保持現狀。

### 現有架構問題

#### 1. 角色（Character）

目前 `Character` 類別位於 `logic/combat/domain/character/`，同時承載：

- 戰鬥運算需要的狀態管理（HP、能量、冷卻）
- 基礎屬性定義（BaseAttributeValues）
- 效果/裝備/遺物的持有與管理
- 大招的持有與執行

**真正的問題**：

- 角色模板（職業、基礎數值）與戰鬥實例混在一起
- `CharacterBuilder` 直接建構戰鬥用角色，未來 `CharacterManager` 需要管理角色模板
- 缺乏可序列化的純資料角色定義

#### 2. 大招（Ultimate）

目前每個大招都是完整的類別實作（如 `SimpleDamageUltimate`、`BloodPactUltimate`）。

**討論結果**：

- 大招不需要複雜的定義層
- 參考 LOL 召喚師技能：技能池固定、玩家選擇、直接註冊
- 不需要 `strategyId`、`parameters`、`tags` 等過度設計
- 保持 `IUltimateAbility` 介面的簡潔性

#### 3. 效果（Effect）

目前 `IEffect` 介面位於 `logic/combat/domain/effect/`，實作分散在 `combat-impl/effects/`。

**討論結果**：

- Effect **不需要**獨立到 `domain/` 層
- Effect 是戰鬥運算的核心，與 `ICombatContext` 強耦合
- `domain/item/EffectFactory` 目前未被使用（裝備效果由 `EquipmentManager` 直接管理）
- 效果系統應該保持在 `logic/combat/domain/effect/`

#### 4. 屬性（Attribute）

目前屬性系統位於 `logic/combat/domain/attribute/`，包含：

- `AttributeType`：屬性類型定義
- `BaseAttributeValues`：基礎屬性數值介面
- `AttributeManager`：屬性管理器
- `AttributeCalculator`：屬性計算器

**真正的問題**：

- 屬性類型定義與戰鬥引擎耦合
- 屬性常數（`AttributeDefaults`、`AttributeLimits`）位於 `infra/config/`
- 未來其他模組（如 Inventory、CharacterManager、UI）也需要這些定義

#### 5. 裝備槽位（EquipmentSlot）

目前 `EquipmentSlot` 分散在兩個地方：

- `logic/combat/domain/item/models/equipment-slot.ts`
- `domain/item/definitions/equipment-definition.ts`

**討論結果**：

- 裝備槽位是物品領域的概念，不屬於戰鬥引擎
- 應該統一在 `domain/item/` 管理
- Combat 模組引用即可

---

## 二、最終決策

### 需要獨立到 domain/ 的內容

| 項目               | 位置                | 理由                                |
| ------------------ | ------------------- | ----------------------------------- |
| **屬性類型與常數** | `domain/attribute/` | 最基礎的共用詞彙，所有模組依賴      |
| **角色定義**       | `domain/character/` | CharacterManager、UI、Combat 都需要 |
| **裝備槽位定義**   | `domain/item/`      | 物品領域概念，已有 item 模組        |

### 保持在 logic/combat/ 的內容

| 項目             | 位置                             | 理由                              |
| ---------------- | -------------------------------- | --------------------------------- |
| **大招實作**     | `logic/combat/domain/ultimate/`  | 與戰鬥邏輯強耦合，無需過度抽象    |
| **效果系統**     | `logic/combat/domain/effect/`    | 戰鬥運算核心，依賴 ICombatContext |
| **屬性計算器**   | `logic/combat/domain/attribute/` | 僅戰鬥使用                        |
| **角色戰鬥實例** | `logic/combat/domain/character/` | 戰鬥運行時狀態                    |

### 廢棄的設計

| 廢棄內容                            | 原因                                           |
| ----------------------------------- | ---------------------------------------------- |
| `IUltimateDefinition`               | 過度設計，大招不需要定義層                     |
| `strategyId`、`parameters`          | 無實際用途，增加複雜度                         |
| `domain/item/EffectFactory`         | 目前無人使用，裝備效果由 EquipmentManager 管理 |
| `ICharacterDefinition.tags`         | 想不到實際用途                                 |
| `IClassDefinition.equipmentPoolIds` | 太笨重，改用過濾邏輯                           |

---

## 三、簡化後的架構

### 模組結構

```
src/
├── domain/                         # 共享領域層（純資料，跨語言友好）
│   ├── attribute/                  # 屬性定義（新增）
│   │   ├── attribute-type.ts       # AttributeType
│   │   ├── attribute-values.ts     # BaseAttributeValues
│   │   └── attribute-constants.ts  # Defaults & Limits
│   ├── character/                  # 角色定義（新增）
│   │   ├── definitions/
│   │   │   ├── character-definition.ts
│   │   │   └── class-definition.ts
│   │   └── registries/
│   │       └── CharacterDefinitionRegistry.ts
│   └── item/                       # 物品定義（已存在）
│       ├── equipment-slot.ts       # 統一槽位定義（遷移）
│       └── ...（其他已存在內容）
└── logic/
    └── combat/
        └── domain/                 # 戰鬥領域（運行時狀態）
            ├── character/          # 戰鬥角色實例（保持）
            ├── effect/             # 效果系統（保持）
            ├── ultimate/           # 大招管理器（保持）
            ├── attribute/          # 屬性計算器（保持，但引用 domain/attribute）
            └── item/               # 裝備管理器（保持，但引用 domain/item）
```

---

## 四、角色系統設計

### 角色定義（domain/character）

純資料結構，描述「什麼是這個角色」。

```typescript
ICharacterDefinition {
  id: string                      // 唯一識別碼
  name: string                    // 角色名稱
  classId: string                 // 對應職業 ID
  baseAttributes: BaseAttributeValues  // 基礎屬性
}
```

```typescript
IClassDefinition {
  id: string                      // 職業 ID（如 'warrior', 'mage'）
  name: string                    // 職業名稱
  attributeModifiers: {           // 職業屬性修正
    [key in AttributeType]?: number
  }
}
```

**關於裝備池問題的解決方案**：

不在 `IClassDefinition` 儲存 `equipmentPoolIds`（會有成百上千個 ID），改用過濾邏輯：

```typescript
// ItemGenerator 根據職業標籤過濾
interface IItemDefinition {
  id: string
  classRestrictions?: string[] // ['warrior', 'tank'] 或 undefined（通用）
  // ...
}

// 生成時過濾
function generateEquipment(classId: string, difficulty: number) {
  const availableItems = ItemRegistry.getAll().filter(
    (item) => !item.classRestrictions || item.classRestrictions.includes(classId)
  )
  // 根據難度係數與權重抽取
}
```

### 角色註冊表

```typescript
CharacterDefinitionRegistry {
  register(definition: ICharacterDefinition): void
  get(id: string): ICharacterDefinition
  getByClass(classId: string): ICharacterDefinition[]
}
```

---

## 五、大招系統設計

### 設計原則（參考 LOL 召喚師技能）

LOL 的召喚師技能特點：

1. **固定技能池**：閃現、點燃、治療、傳送等（約 10-15 個）
2. **玩家選擇**：每場比賽前選擇 2 個
3. **無需定義層**：每個技能是獨立實作
4. **註冊機制**：遊戲啟動時註冊所有可用技能

### 應用到本專案

```typescript
// 保持現有介面的簡潔性
interface IUltimateAbility {
  readonly id: string
  readonly name: string
  execute(casterId: string, context: ICombatContext): void
}
```

```typescript
// 大招池管理（類似召喚師技能池）
class UltimatePool {
  private ultimates = new Map<string, () => IUltimateAbility>()

  // 註冊大招建構函數
  register(id: string, factory: () => IUltimateAbility): void {
    this.ultimates.set(id, factory)
  }

  // 根據 ID 建立實例
  create(id: string): IUltimateAbility | undefined {
    const factory = this.ultimates.get(id)
    return factory ? factory() : undefined
  }

  // 取得所有可用大招 ID
  getAllIds(): string[] {
    return Array.from(this.ultimates.keys())
  }
}
```

### 使用流程

```typescript
// 1. 遊戲啟動時註冊所有大招
ultimatePool.register('simple-damage', () => new SimpleDamageUltimate('Power Strike', 3))
ultimatePool.register('blood-pact', () => new BloodPactUltimate())
ultimatePool.register('thunder-strike', () => new ThunderStrikeUltimate())

// 2. 角色選擇大招（CharacterManager）
const selectedUltimateId = 'blood-pact'
characterData.ultimateId = selectedUltimateId

// 3. 進入戰鬥時建立實例（CombatEngine）
const ultimate = ultimatePool.create(characterData.ultimateId)
character.setUltimate(ultimate, context)
```

**優點**：

- 無需複雜的定義層
- 每個大招保持完整實作（可以很複雜）
- 註冊機制簡單清晰
- 符合「戰鬥 = 屬性 + 技能 + 效果」的理念

---

## 六、屬性系統獨立

### 遷移內容

從 `logic/combat/domain/attribute/models/` 遷移到 `domain/attribute/`：

| 原路徑                                | 新路徑                                    | 內容                     |
| ------------------------------------- | ----------------------------------------- | ------------------------ |
| `attribute-type.ts`                   | `domain/attribute/attribute-type.ts`      | AttributeType 類型定義   |
| `base-attribute-values.ts`            | `domain/attribute/attribute-values.ts`    | BaseAttributeValues 介面 |
| `infra/config/attribute-constants.ts` | `domain/attribute/attribute-constants.ts` | Defaults & Limits        |

### 保留在 Combat

- `AttributeManager`：戰鬥時的屬性管理
- `AttributeCalculator`：戰鬥時的屬性計算
- `AttributeModifier`：戰鬥時的修正器
- `attribute-core.ts`：計算相關的類型定義

### 依賴關係

```
domain/attribute（純資料定義）
    ↓
logic/combat/domain/attribute（運算邏輯）
    ↓
logic/combat/domain/character（使用）
```

---

## 七、裝備槽位統一

### 問題

目前 `EquipmentSlot` 定義分散在兩處：

- `logic/combat/domain/item/models/equipment-slot.ts`
- `domain/item/definitions/equipment-definition.ts`

### 解決方案

統一遷移到 `domain/item/equipment-slot.ts`，Combat 模組引用即可。

```typescript
// domain/item/equipment-slot.ts
export type EquipmentSlot = 'weapon' | 'helmet' | 'armor' | 'necklace' | 'boots'
```

```typescript
// logic/combat/domain/item/EquipmentManager.ts
import type { EquipmentSlot } from '@/domain/item'
```

---

## 八、EffectFactory 處理

### 現狀

`domain/item/EffectFactory` 目前未被使用，裝備效果由 `EquipmentManager` 直接管理：

```typescript
// EquipmentManager.equip()
for (const effect of equipment.effects) {
  this.owner.addEffect(effect, context)
}
```

### 決策

**保留 EffectFactory，但明確定位**：

- 用途：未來 `ItemGenerator` 生成裝備時，根據詞綴實例建立效果
- 不參與戰鬥流程：裝備進入戰鬥時效果已經生成好了
- 工廠職責：`IAffixInstance → IEffect`

### 使用場景

```typescript
// ItemGenerator 生成裝備時
const affixInstances = affixRoller.roll(definition, rng)
const effects = effectFactory.createFromAffixes(affixInstances)
const equipment = new CombatEquipment({
  slot: definition.slot,
  effects: effects, // 效果已經建立好
  affixInstances: affixInstances,
})
```

---

## 九、註冊表規模問題

### 你的疑慮

> 「這些物品都會被 XXXXDefinitionRegistry 管理，裡面有成千上萬種東西要被管理？」

### 答覆

**不會有成千上萬個定義**，因為：

#### 1. 定義 ≠ 實例

- **定義**（Definition）：模板，數量有限（如 50-200 個裝備模板）
- **實例**（Instance）：運行時生成，詞綴隨機（無限種組合）

```
50 個裝備定義 × 每個可以有 3-5 個隨機詞綴
→ 理論上百萬種組合
→ 但註冊表只儲存 50 個定義
```

#### 2. 各註冊表的規模預估

| 註冊表                      | 預估數量 | 說明                     |
| --------------------------- | -------- | ------------------------ |
| ItemDefinitionRegistry      | 50-200   | 裝備/遺物模板            |
| AffixDefinitionRegistry     | 50-100   | 詞綴模板                 |
| CharacterDefinitionRegistry | 10-30    | 可選角色                 |
| ClassDefinitionRegistry     | 5-10     | 職業類型                 |
| UltimatePool                | 10-20    | 大招池（類似召喚師技能） |

#### 3. 效能考量

- 註冊表使用 `Map` 結構，O(1) 查詢
- 200 個定義對現代 JS 引擎毫無壓力
- 定義是靜態資料，可序列化為 JSON，啟動時載入

#### 4. 分類與篩選

```typescript
// 不需要在定義中儲存所有關聯 ID
// 使用查詢時過濾
ItemRegistry.getAll()
  .filter((item) => item.rarity === 'legendary')
  .filter((item) => !item.classRestrictions || item.classRestrictions.includes('warrior'))
  .filter((item) => item.tier <= currentDifficulty)
```

---

## 十、跨語言移植考量

### 可直接移植

- 所有 `domain/` 下的介面與類型定義（純資料結構）
- 註冊表的資料結構（Map/Dictionary）
- 過濾邏輯（LINQ/Stream/Filter）

### 需要適配

- 大招的類別實作（語法不同，但邏輯相同）
- 效果系統（掛鉤機制各語言實作不同）

### 建議

- 定義層使用純 JSON 可描述的結構
- 複雜邏輯封裝在類別中，介面保持簡單
- 避免在定義層使用 TypeScript 特有語法（如泛型、工具類型）

---

## 十一、最終總結

| 項目           | 是否獨立到 domain | 決策                                   |
| -------------- | ----------------- | -------------------------------------- |
| 屬性類型與常數 | ✅ 是             | 遷移到 `domain/attribute/`             |
| 角色定義       | ✅ 是             | 建立 `domain/character/definitions/`   |
| 裝備槽位       | ✅ 是             | 統一到 `domain/item/equipment-slot.ts` |
| 大招定義       | ❌ 否             | 保持簡單，使用註冊池模式               |
| 效果系統       | ❌ 否             | 保留在 `logic/combat/domain/effect/`   |
| EffectFactory  | ⚠️ 保留但明確定位 | 用於裝備生成，不參與戰鬥流程           |

### 廢棄的過度設計

- `IUltimateDefinition`、`strategyId`、`parameters`
- `ICharacterDefinition.tags`
- `IClassDefinition.equipmentPoolIds`（改用過濾）

### 核心理念

> 一場戰鬥本質上就是「屬性、技能、效果」互相運算的過程

基於此理念：

- **屬性**：底層共享契約，獨立到 domain
- **技能（大招）**：戰鬥邏輯，保持實作彈性
- **效果**：戰鬥核心，與 Context 強耦合

這份規劃在「定義分離」與「實作簡潔」之間取得平衡，避免過度設計。

---

## 十二、動工優先序

### 階段一：屬性獨立（優先）

1. 建立 `domain/attribute/` 目錄
2. 遷移 `AttributeType`、`BaseAttributeValues`、`createDefaultAttributes`
3. 遷移 `AttributeDefaults`、`AttributeLimits` 常數
4. 更新 Combat 模組的引用路徑
5. 更新所有 import 路徑

### 階段二：裝備槽位統一

1. 將 `EquipmentSlot` 統一到 `domain/item/equipment-slot.ts`
2. 移除 `logic/combat/domain/item/models/equipment-slot.ts`
3. 更新所有引用

### 階段三：角色定義層

1. 建立 `domain/character/definitions/`
2. 定義 `ICharacterDefinition`、`IClassDefinition`
3. 建立 `CharacterDefinitionRegistry`、`ClassDefinitionRegistry`
4. 遷移 `characterTemplates.ts` 為定義資料
5. 實作過濾邏輯（取代 equipmentPoolIds）

### 階段四：大招註冊池

1. 建立 `UltimatePool` 類別
2. 註冊現有大招（SimpleDamageUltimate、BloodPactUltimate 等）
3. 整合到 CharacterBuilder

### 階段五：EffectFactory 明確定位

1. 在 `domain/item/EffectFactory.ts` 加上註解說明用途
2. 確認不參與戰鬥流程
3. 未來整合到 ItemGenerator

---

## 十三、實作檢查清單

- [ ] 屬性獨立
  - [ ] 建立 `domain/attribute/attribute-type.ts`
  - [ ] 建立 `domain/attribute/attribute-values.ts`
  - [ ] 建立 `domain/attribute/attribute-constants.ts`
  - [ ] 更新所有 import 路徑
  - [ ] 刪除舊檔案

- [ ] 裝備槽位統一
  - [ ] 統一到 `domain/item/equipment-slot.ts`
  - [ ] 更新所有引用
  - [ ] 刪除重複定義

- [ ] 角色定義
  - [ ] 定義 `ICharacterDefinition`
  - [ ] 定義 `IClassDefinition`
  - [ ] 實作 `CharacterDefinitionRegistry`
  - [ ] 實作 `ClassDefinitionRegistry`
  - [ ] 遷移模板資料

- [ ] 大招池
  - [ ] 實作 `UltimatePool`
  - [ ] 註冊現有大招
  - [ ] 整合到角色系統

- [ ] 文件更新
  - [ ] 更新 README
  - [ ] 更新相關規格書
