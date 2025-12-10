## Item 模組重構破壞性變更報告

更新時間：2025-12-10

執行狀態：已完成 Item 模組內的一次性切斷

## 已完成的變更（Item 模組內）

### 1. IItemDefinition 介面變更

- **檔案**：`src/domain/item/definitions/item-definition.ts`
- **變更**：移除 `effectTemplateIds: readonly string[]` 屬性
- **影響**：Effect 來源單一化至 AffixDefinition.effectTemplateId

### 2. ICombatItemView 介面變更

- **檔案**：`src/domain/item/projections/combat-item-view.ts`
- **變更**：移除 `effectTemplateIds: readonly string[]` 屬性
- **影響**：Combat Engine 不再直接接收 effectTemplateIds

### 3. CombatItemFactory 工廠變更

- **檔案**：`src/domain/item/factories/CombatItemFactory.ts`
- **變更**：移除複製 `definition.effectTemplateIds` 的邏輯
- **影響**：產生的 ICombatItemView 僅包含 id 與 affixInstances

### 4. EffectFactory 工廠變更

- **檔案**：`src/domain/item/factories/EffectFactory.ts`
- **變更**：
  - 新增建構子參數 `affixRegistry: AffixDefinitionRegistry`
  - 修改 `createFromCombatItem` 方法，改用 `affixRegistry.get(definitionId)` 取得 effectTemplateId
- **影響**：Effect 建立流程完全依賴 AffixDefinition

## 型別錯誤清單（共 20 個錯誤）

### 類別 A：effectTemplateIds 屬性不存在（10 個錯誤）

#### A1. Equipment Templates

- **檔案**：`src/definition-config/equipment/equipment-templates.ts`
- **錯誤數量**：9 個
- **錯誤位置**：第 8, 17, 27, 36, 46, 56, 65, 75, 85 行
- **錯誤訊息**：`'effectTemplateIds' does not exist in type 'IEquipmentDefinition'`
- **修復策略**：
  - 短期：移除所有 `effectTemplateIds` 宣告
  - 長期：將這些效果定義遷移至對應的 Affix Definition 中

#### A2. Relic Templates

- **檔案**：`src/definition-config/relic/relic-templates.ts`
- **錯誤數量**：1 個
- **錯誤位置**：第 11 行
- **錯誤訊息**：`'effectTemplateIds' does not exist in type 'IRelicDefinition'`
- **特別注意**：此處包含特殊效果 `'effect_titans_heart_hp_to_armor'`
- **修復策略**：需建立對應的 Affix Definition 承載此效果

### 類別 B：IAffixInstance 屬性不匹配（8 個錯誤）

#### B1. Usage Example

- **檔案**：`src/logic/character-sheet/examples/usage-example.ts`
- **錯誤數量**：5 個
- **錯誤位置**：第 34, 35, 43, 44, 49 行
- **問題**：使用舊的 `affixId` 與 `value` 屬性，應改為 `definitionId` 與 `rolledValue`
- **修復策略**：重構範例程式碼以符合新的 IAffixInstance 介面

#### B2. Equipment Processor

- **檔案**：`src/logic/character-sheet/processors/EquipmentProcessor.ts`
- **錯誤數量**：3 個
- **錯誤位置**：第 20, 25（兩次）行
- **問題**：存取不存在的 `affixId` 與 `value` 屬性
- **修復策略**：更新為 `definitionId` 與 `rolledValue`

### 類別 C：Generator 產生的型別不匹配（2 個錯誤）

#### C1. Equipment Generator

- **檔案**：`src/logic/item-generator/generators/EquipmentGenerator.ts`
- **錯誤位置**：第 60 行
- **問題**：產生的物件使用 `{ affixId, value }` 而非 `{ definitionId, rolledValue }`
- **修復策略**：更新 Generator 產生正確的 IAffixInstance 結構

#### C2. Relic Generator

- **檔案**：`src/logic/item-generator/generators/RelicGenerator.ts`
- **錯誤位置**：第 34 行
- **問題**：產生的 IRelicInstance 缺少 `rarity` 與 `affixes` 屬性
- **修復策略**：補足缺失的必要屬性

## 搜尋關鍵字（供後續修復使用）

建議使用以下 grep pattern 尋找所有相關程式碼：

- `effectTemplateIds`
- `.effectTemplateIds`
- `affixId`（應改為 `definitionId`）
- `affix.value`（應改為 `affix.rolledValue`）
- `EffectFactory`
- `AffixDefinitionRegistry`

## 修復優先順序建議

### 第一階段：修復定義檔（10 個錯誤）

1. 移除所有 Equipment/Relic Templates 中的 `effectTemplateIds` 宣告
2. 為需要特殊效果的項目（如 `effect_titans_heart_hp_to_armor`）建立對應的 Affix Definition

### 第二階段：修復範例與處理器（8 個錯誤）

1. 更新 `usage-example.ts` 使用正確的 IAffixInstance 結構
2. 更新 `EquipmentProcessor.ts` 存取正確的屬性名稱

### 第三階段：修復 Generator（2 個錯誤）

1. 更新 `EquipmentGenerator.ts` 產生正確的 IAffixInstance
2. 更新 `RelicGenerator.ts` 產生完整的 IRelicInstance

## 依賴注入變更

### EffectFactory 使用方式變更

**舊的方式**：

```typescript
const factory = new EffectFactory<IEffect>()
```

**新的方式**：

```typescript
const affixRegistry = new AffixDefinitionRegistry()
// ... 註冊 affix definitions ...
const factory = new EffectFactory<IEffect>(affixRegistry)
```

**影響範圍**：所有實例化 EffectFactory 的地方需要更新

## 資料遷移指引

### Equipment/Relic Definition 遷移流程

對於原本有 `effectTemplateIds` 的定義：

1. **情況 A：通用效果（可對應至既有 Affix）**
   - 直接移除 `effectTemplateIds`
   - 確保對應的 Affix Definition 已正確設定 `effectTemplateId`

2. **情況 B：特殊效果（需建立新 Affix）**
   - 建立新的 Affix Definition，設定對應的 `effectTemplateId`
   - 將此 Affix 加入物品的 `affixPoolIds`
   - 移除 `effectTemplateIds`

### 範例：`effect_zeus_charge_interaction`

**原始定義**（`equipment-templates.ts` 第 46 行）：

```typescript
{
  id: 'equipment_zeus_thunderbolt',
  effectTemplateIds: ['effect_zeus_charge_interaction'],
  affixPoolIds: [...],
  // ...
}
```

**遷移後**：

```typescript
// 1. 建立 Affix Definition
{
  id: 'affix_zeus_charge_interaction',
  effectTemplateId: 'effect_zeus_charge_interaction',
  minValue: 1,
  maxValue: 1,
  weight: 100,
  tags: ['legendary', 'mechanic'],
}

// 2. 更新 Equipment Definition
{
  id: 'equipment_zeus_thunderbolt',
  affixPoolIds: [..., 'affix_zeus_charge_interaction'],
  // effectTemplateIds 已移除
}
```

## 測試建議

完成修復後，建議執行以下測試：

1. `npm run check` - 確認所有型別錯誤已解決
2. `npm run test` - 執行單元測試
3. 手動測試 ItemGenerator 是否能正確產生帶有 Effect 的物品
4. 手動測試 Combat Engine 是否能從 ICombatItemView 正確提取 Effect

## 後續工作

1. 更新相關的 spec.md 文件
2. 確認 Combat Engine 相關模組對 ICombatItemView 的使用是否需要調整
3. 評估是否需要增加 migration script 協助資料轉換

---

（END）
