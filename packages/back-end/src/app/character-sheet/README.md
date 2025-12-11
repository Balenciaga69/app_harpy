# Character-Sheet 模組

角色屬性面板計算器 - 用於戰鬥外的靜態屬性計算。

## 功能

- 計算角色穿戴裝備與遺物後的最終屬性
- 複用戰鬥系統的屬性計算邏輯（AttributeManager + AttributeCalculator）
- 支援複雜的遺物計算（如基於 HP 的護甲轉換）
- 純函數設計，無副作用

## 使用方式

```typescript
import { CharacterSheetCalculator } from '@/logic/character-sheet'

const calculator = new CharacterSheetCalculator()
const sheet = calculator.calculate({
  baseAttributes: {
    /* 角色基礎屬性 */
  },
  equipments: [
    /* 裝備實例列表 */
  ],
  relics: [
    /* 遺物實例列表 */
  ],
})

// 使用計算結果
console.log(sheet.attributes.attackDamage) // 最終攻擊力
console.log(sheet.equipmentModifierCount) // 裝備提供的修飾器數量
```

## 擴展新內容

### 新增詞綴屬性映射

在 `processors/affix-registry.ts` 中添加：

```typescript
{
  affixId: 'affix_new_stat',
  attributeType: 'newAttribute',
  mode: 'add',
}
```

### 新增遺物屬性映射

在 `processors/relic-registry.ts` 中添加：

```typescript
{
  relicId: 'new_relic',
  calculator: (baseAttributes, stackCount) => {
    // 自定義計算邏輯
    return [{ /* AttributeModifier */ }]
  },
}
```

## 架構說明

詳見 `.github/specs/character-sheet.spec.md`
