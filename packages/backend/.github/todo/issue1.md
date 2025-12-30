Using "Codebase"

Searched text for `RelicFactory|ItemFactory|generateRelic|createRelic`, 18 results

Searched for `RelicFactory`, no results

Searched for files matching `**/RelicFactory.ts`, 2 matches

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/application/content-generation/factory/RelicFactory.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/application/content-generation/service/item/ItemAggregateService.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/application/content-generation/service/item/ItemGenerationService.ts)

Searched text for `ItemRollService|rollItem|ItemRoll`, 116 results

Searched text for `ItemConstraintService|ItemModifierAggregationService`, 16 results

Searched text for `POST_GAME_REWARD|PostGameReward|post.*combat|戰後|獎勵`, 67 results

Searched for files matching `**/ItemRollService.ts`, 2 matches

Searched for files matching `**/ItemConstraintService.ts`, 2 matches

Searched for files matching `**/ItemModifierAggregationService.ts`, 2 matches

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/application/content-generation/service/item/ItemRollService.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/application/content-generation/service/item/ItemConstraintService.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/application/content-generation/service/item/ItemModifierAggregationService.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/data/item/item-roll-config.data.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/domain/item/Item.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/domain/item/roll/ItemRollConfig.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/domain/item/roll/ItemRollModifier.ts)

Read [](file:///g%3A/Coding/app_harpy/packages/backend/src/domain/item/roll/ItemRollConstraint.ts)

# 物品生成工廠參訪記錄 🏭

## 參訪路線圖

讓我帶你走訪一個遺物從「概念」到「實體」的完整旅程：

### 🎯 **入口：ItemGenerationService**

`ItemGenerationService`

```typescript
// 兩個入口方法
generateRandomItem(source: ItemRollSourceType)  // 隨機生成
generateItemFromTemplate(templateId, itemType)   // 指定模板生成
```

**這裡是訂單接收處**：

- 客戶說：「我要一個賽後獎勵物品」(`POST_GAME_REWARD`)
- 或者：「我要生成特定模板的物品」

---

### 🎲 **車間1：ItemRollService（骰選車間）**

`ItemRollService`

```typescript
rollItem(source, modifiers) {
  // 步驟1: 讀取配置
  const staticRollConfig = itemStore.getItemRollConfig(source)

  // 步驟2: 骰選物品類型（目前只有 RELIC）
  const itemType = this.rollFromWeights(seed, staticRollConfig.itemTypeWeights)

  // 步驟3: 骰選稀有度（權重會被 modifiers 調整）
  const rarity = this.rollRarity(seed, staticRollConfig, modifiers)

  // 步驟4: 取得可用模板清單
  const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)

  // 步驟5: 骰選模板
  const itemTemplateId = this.rollTemplate(seed, availableTemplates)

  return { itemTemplateId, itemType, rarity }
}
```

**這裡是樂透機**：

- 從 `item-roll-config.data.ts` 讀取權重
- 賽後獎勵配置：`RARE: 16, EPIC: 4, LEGENDARY: 1`（沒有 COMMON）

---

### 🔒 **車間2：ItemConstraintService（品管檢查）**

[`ItemConstraintService`](g:\Coding\app_harpy\packages\backend\src\application\content-generation\service\item\ItemConstraintService.ts)

```typescript
canGenerateItemTemplate(templateId) {
  // 檢查1: 模板存在嗎？
  const template = itemStore.getRelic(templateId)

  // 檢查2: 章節限制
  if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter))
    return Fail

  // 檢查3: 職業限制
  if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId))
    return Fail

  // 檢查4: 事件/敵人限制
  if (constraint.eventIds?.length > 0 || constraint.enemyIds?.length > 0)
    return Fail

  return Success
}
```

**這裡是海關**：

- 「這個遺物目前章節能生成嗎？」
- 「這個職業能用嗎？」
- 「有特殊限制嗎？」

---

### 📊 **車間3：ItemModifierAggregationService（權重調整室）**

[`ItemModifierAggregationService`](g:\Coding\app_harpy\packages\backend\src\application\content-generation\service\item\ItemModifierAggregationService.ts)

```typescript
aggregateModifiers() {
  return [
    ...runCtx.rollModifiers.filter(mod => mod.durationStages !== 0),  // 未過期修飾符
    ...this.getHighFrequencyTagModifiers(),  // 高頻標籤修飾符
    ...this.getHighStackRelicModifiers(),    // 高堆疊遺物修飾符
  ]
}
```

**這裡是動態權重計算機**：

- 統計你裝備了哪些標籤的遺物
- 如果某標籤出現 ≥5 次 → 降低該標籤遺物權重（×0.5）
- 如果某遺物堆疊 ≥5 層且未達上限 → 降低該遺物權重（×0.2）

---

### 🏭 **車間4：ItemAggregateService（組裝車間）**

`ItemAggregateService`

```typescript
createRelicByTemplateUsingCurrentContext(templateId) {
  // 步驟1: 取得遺物模板
  const relicTemplate = this.resolveTemplate(templateId)

  // 步驟2: 取得當前上下文（難度、種子等）
  const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()

  // 步驟3: 生成詞綴聚合
  const affixAggregates = this.affixAggregateService.createManyByTemplateUsingCurrentContext(
    relicTemplate.affixIds
  )

  // 步驟4: 用 RelicRecordFactory 創建記錄
  const record = RelicRecordFactory.createOne(templateId, {
    affixRecords: affixAggregates.map(a => a.record),
    ...currentInfo
  })

  // 步驟5: 組裝成 RelicAggregate
  return new RelicAggregate(record, relicTemplate, affixAggregates)
}
```

**這裡是組裝線**：

- 拿到模板（blueprint）
- 生成記錄（instance data）
- 附加詞綴（affixes）
- 包裝成最終產品（`RelicAggregate`）

---

### 📦 **車間5：RelicRecordFactory（打包車間）**

`RelicRecordFactory`

```typescript
createRecord(templateId, params) {
  return {
    id: 'relic-record-' + nanoid(),  // 唯一ID
    templateId,
    affixRecords: params.affixRecords,
    atCreated: params.atCreated,
    itemType: 'RELIC',
  }
}
```

**這裡是貼標籤處**：

- 給每個遺物一個唯一身份證號
- 記錄出廠日期（`atCreated`）
- 記錄來源單位（`sourceUnitId`）

---

## 🔍 關於你的構想評估

### ✅ **已具備的能力**

1. **基礎骰選系統**：
   - ✅ 可配置權重（`ItemRollConfig`）
   - ✅ 支援修飾符調整（`ItemRollModifier`）
   - ✅ 稀有度骰選

2. **動態權重**：
   - ✅ 高頻標籤檢測（`HIGH_FREQUENCY_TAG_THRESHOLD = 5`）
   - ✅ 高堆疊遺物檢測（`HIGH_STACK_RELIC_THRESHOLD = 5`）

3. **限制系統**：
   - ✅ 章節限制
   - ✅ 職業限制
   - ✅ 事件/敵人限制

---

### ❌ **缺少的部分**

#### 1. **「親和度」計算系統**

你提到「高親和度 = 標籤匹配度高」，但目前只有：

```typescript
// 現有：降低高頻標籤權重（避免重複）
getHighFrequencyTagModifiers() // 出現 ≥5 次 → ×0.5
```

**需要新增**：

```typescript
export interface IItemAffinityService {
  /** 計算遺物與當前裝備的親和度評分 */
  calculateAffinity(templateId: string): number

  /** 根據親和度篩選模板 */
  filterByAffinity(templates: ItemTemplate[], affinityMode: 'HIGH' | 'LOW'): ItemTemplate[]
}

export class ItemAffinityService implements IItemAffinityService {
  calculateAffinity(templateId: string): number {
    const template = this.itemStore.getRelic(templateId)
    const equippedTags = this.getEquippedTags()

    // 計算標籤重疊率
    const matchingTags = template.tags.filter((tag) => equippedTags.includes(tag))

    return matchingTags.length / template.tags.length // 0 ~ 1
  }

  filterByAffinity(templates: ItemTemplate[], affinityMode: 'HIGH' | 'LOW'): ItemTemplate[] {
    const withScores = templates.map((t) => ({
      template: t,
      affinity: this.calculateAffinity(t.id),
    }))

    // 排序並取前/後 50%
    withScores.sort((a, b) => (affinityMode === 'HIGH' ? b.affinity - a.affinity : a.affinity - b.affinity))

    const cutoff = Math.ceil(withScores.length * 0.5)
    return withScores.slice(0, cutoff).map((x) => x.template)
  }
}
```

---

#### 2. **「稀有度權重調整」模式**

你提到「高稀有度權重遺物」，需要臨時修飾符：

```typescript
export class RewardGenerationService {
  generateRewardOptions(): { optionA: Reward; optionB: Reward } {
    // 選項A：低親和度 + 高稀有度權重
    const optionA_modifiers: ItemRollModifier[] = [
      { type: 'RARITY', rarity: 'EPIC', multiplier: 2.0, durationStages: 0 },
      { type: 'RARITY', rarity: 'LEGENDARY', multiplier: 3.0, durationStages: 0 },
    ]
    const optionA_relic = this.generateRelicWithAffinityAndModifiers('LOW', optionA_modifiers)

    // 選項B：高親和度遺物 + Gold
    const optionB_relic = this.generateRelicWithAffinityAndModifiers('HIGH', [])
    const optionB_gold = this.calculateGoldReward()

    return {
      optionA: { items: [optionA_relic] },
      optionB: { items: [optionB_relic], gold: optionB_gold },
    }
  }

  private generateRelicWithAffinityAndModifiers(
    affinityMode: 'HIGH' | 'LOW',
    extraModifiers: ItemRollModifier[]
  ): RelicAggregate {
    // 1. 聚合基礎修飾符
    const baseModifiers = this.modifierService.aggregateModifiers()
    const allModifiers = [...baseModifiers, ...extraModifiers]

    // 2. 骰選遺物
    const { itemTemplateId, itemType, rarity } = this.rollService.rollItem('POST_GAME_REWARD', allModifiers)

    // 3. 根據親和度篩選
    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)
    const filteredTemplates = this.affinityService.filterByAffinity(availableTemplates, affinityMode)

    // 4. 從篩選後的清單中骰選
    const finalTemplateId = this.rollFromTemplates(filteredTemplates)

    // 5. 生成遺物
    return this.itemAggregateService.createRelicByTemplateUsingCurrentContext(finalTemplateId)
  }
}
```

---

#### 3. **Gold 獎勵生成**

目前沒有 Gold 生成邏輯，需要：

```typescript
export class GoldRewardCalculator {
  calculateGoldReward(): number {
    const { difficulty, currentChapter } = this.contextSnapshot.getRunContext()

    // 基礎金幣 × 難度係數 × 章節係數
    const baseGold = 100
    const difficultyMultiplier = 1 + difficulty * 0.1 // 難度10 = ×2
    const chapterMultiplier = currentChapter * 0.5 // 第3章 = ×1.5

    return Math.floor(baseGold * difficultyMultiplier * chapterMultiplier)
  }
}
```

---

#### 4. **獎勵選項資料結構**

需要定義獎勵包裹：

```typescript
export interface RewardOption {
  readonly id: string
  readonly items: RelicAggregate[]
  readonly gold: number
}

export interface RewardChoice {
  readonly optionA: RewardOption
  readonly optionB: RewardOption
}
```

---

## 🎯 **初步建構清單**

### 必要項目（P0）

- [ ] **ItemAffinityService**：計算親和度
- [ ] **RewardGenerationService**：組合獎勵選項
- [ ] **GoldRewardCalculator**：計算金幣獎勵
- [ ] **RewardOption/RewardChoice** 資料結構

### 進階項目（P1）

- [ ] 獎勵選項持久化（存入 RunContext）
- [ ] 前端獎勵選擇 API
- [ ] 獎勵領取後的入庫邏輯
- [ ] 獎勵歷史記錄

### 優化項目（P2）

- [ ] 親和度權重可配置化
- [ ] 多種獎勵模式（三選一、隨機事件獎勵等）
- [ ] 獎勵預覽系統

---

## 🏁 **結論**

你的構想是**合理且可行**的，現有系統已具備 70% 的基礎能力：

✅ **已有**：骰選、限制檢查、動態權重  
❌ **需補**：親和度計算、獎勵組合邏輯、Gold 計算

建議先實作 **P0 項目**，用最小可行產品驗證玩法體驗，再逐步擴展！**需要新增**：

```typescript
export interface IItemAffinityService {
  /** 計算遺物與當前裝備的親和度評分 */
  calculateAffinity(templateId: string): number

  /** 根據親和度篩選模板 */
  filterByAffinity(templates: ItemTemplate[], affinityMode: 'HIGH' | 'LOW'): ItemTemplate[]
}

export class ItemAffinityService implements IItemAffinityService {
  calculateAffinity(templateId: string): number {
    const template = this.itemStore.getRelic(templateId)
    const equippedTags = this.getEquippedTags()

    // 計算標籤重疊率
    const matchingTags = template.tags.filter((tag) => equippedTags.includes(tag))

    return matchingTags.length / template.tags.length // 0 ~ 1
  }

  filterByAffinity(templates: ItemTemplate[], affinityMode: 'HIGH' | 'LOW'): ItemTemplate[] {
    const withScores = templates.map((t) => ({
      template: t,
      affinity: this.calculateAffinity(t.id),
    }))

    // 排序並取前/後 50%
    withScores.sort((a, b) => (affinityMode === 'HIGH' ? b.affinity - a.affinity : a.affinity - b.affinity))

    const cutoff = Math.ceil(withScores.length * 0.5)
    return withScores.slice(0, cutoff).map((x) => x.template)
  }
}
```

---

#### 2. **「稀有度權重調整」模式**

你提到「高稀有度權重遺物」，需要臨時修飾符：

```typescript
export class RewardGenerationService {
  generateRewardOptions(): { optionA: Reward; optionB: Reward } {
    // 選項A：低親和度 + 高稀有度權重
    const optionA_modifiers: ItemRollModifier[] = [
      { type: 'RARITY', rarity: 'EPIC', multiplier: 2.0, durationStages: 0 },
      { type: 'RARITY', rarity: 'LEGENDARY', multiplier: 3.0, durationStages: 0 },
    ]
    const optionA_relic = this.generateRelicWithAffinityAndModifiers('LOW', optionA_modifiers)

    // 選項B：高親和度遺物 + Gold
    const optionB_relic = this.generateRelicWithAffinityAndModifiers('HIGH', [])
    const optionB_gold = this.calculateGoldReward()

    return {
      optionA: { items: [optionA_relic] },
      optionB: { items: [optionB_relic], gold: optionB_gold },
    }
  }

  private generateRelicWithAffinityAndModifiers(
    affinityMode: 'HIGH' | 'LOW',
    extraModifiers: ItemRollModifier[]
  ): RelicAggregate {
    // 1. 聚合基礎修飾符
    const baseModifiers = this.modifierService.aggregateModifiers()
    const allModifiers = [...baseModifiers, ...extraModifiers]

    // 2. 骰選遺物
    const { itemTemplateId, itemType, rarity } = this.rollService.rollItem('POST_GAME_REWARD', allModifiers)

    // 3. 根據親和度篩選
    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)
    const filteredTemplates = this.affinityService.filterByAffinity(availableTemplates, affinityMode)

    // 4. 從篩選後的清單中骰選
    const finalTemplateId = this.rollFromTemplates(filteredTemplates)

    // 5. 生成遺物
    return this.itemAggregateService.createRelicByTemplateUsingCurrentContext(finalTemplateId)
  }
}
```

---

#### 3. **Gold 獎勵生成**

目前沒有 Gold 生成邏輯，需要：

```typescript
export class GoldRewardCalculator {
  calculateGoldReward(): number {
    const { difficulty, currentChapter } = this.contextSnapshot.getRunContext()

    // 基礎金幣 × 難度係數 × 章節係數
    const baseGold = 100
    const difficultyMultiplier = 1 + difficulty * 0.1 // 難度10 = ×2
    const chapterMultiplier = currentChapter * 0.5 // 第3章 = ×1.5

    return Math.floor(baseGold * difficultyMultiplier * chapterMultiplier)
  }
}
```

---

#### 4. **獎勵選項資料結構**

需要定義獎勵包裹：

```typescript
export interface RewardOption {
  readonly id: string
  readonly items: RelicAggregate[]
  readonly gold: number
}

export interface RewardChoice {
  readonly optionA: RewardOption
  readonly optionB: RewardOption
}
```

---

## 🎯 **初步建構清單**

### 必要項目（P0）

- [ ] **ItemAffinityService**：計算親和度
- [ ] **RewardGenerationService**：組合獎勵選項
- [ ] **GoldRewardCalculator**：計算金幣獎勵
- [ ] **RewardOption/RewardChoice** 資料結構

### 進階項目（P1）

- [ ] 獎勵選項持久化（存入 RunContext）
- [ ] 前端獎勵選擇 API
- [ ] 獎勵領取後的入庫邏輯
- [ ] 獎勵歷史記錄

### 優化項目（P2）

- [ ] 親和度權重可配置化
- [ ] 多種獎勵模式（三選一、隨機事件獎勵等）
- [ ] 獎勵預覽系統

---

## 🏁 **結論**

你的構想是**合理且可行**的，現有系統已具備 70% 的基礎能力：

✅ **已有**：骰選、限制檢查、動態權重  
❌ **需補**：親和度計算、獎勵組合邏輯、Gold 計算

建議先實作 **P0 項目**，用最小可行產品驗證玩法體驗，再逐步擴展！
