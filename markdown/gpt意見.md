# 架構分析：Character 屬性存取與層級職責劃分

## 問題 1: `character.anemic.ts` 直接開放 `attributes` 的 Trade-off

### 當前實作
```typescript
export class Character implements ICharacter {
  public readonly attributes: AttributeContainer
  
  // 外部可直接存取
  someSystem.doSomething(character.attributes)
}
```

---

### ❌ 違反的原則

#### 1. **封裝性 (Encapsulation)**
- 暴露內部實作細節
- 外部可繞過 Character 直接操作屬性容器

#### 2. **迪米特法則 (Law of Demeter)**
```typescript
// 違反：外部需要知道 Character 內部有 AttributeContainer
const strength = character.attributes.get('strength')

// 應該：Character 提供統一介面
const strength = character.getAttribute('strength')
```

#### 3. **單一真相來源 (Single Source of Truth)**
- 如果未來屬性計算邏輯改變，外部代碼也需修改
- 例如：改用 getter 快取計算結果

---

### ✅ Trade-off 分析表

| 層面 | 直接開放 `attributes` | 封裝後提供方法 |
|------|---------------------|----------------|
| **開發速度** | ✅ 快速，直接存取 | ❌ 需額外包裝方法 |
| **可維護性** | ❌ 修改影響範圍大 | ✅ 修改內聚於 Character |
| **可測試性** | ❌ 難以 Mock | ✅ 易於注入假資料 |
| **可讀性** | ⚠️ 需理解內部結構 | ✅ 語意清晰 |
| **擴展性** | ❌ 難以加入邏輯 | ✅ 可在方法中加驗證/快取 |
| **效能** | ✅ 零開銷 | ⚠️ 多一層呼叫（可忽略）|

---

### 🎯 建議方案：半封裝

#### 方案 A：完全封裝（最佳實踐）
````typescript
export class Character implements ICharacter {
  // 改為 private
  private readonly attributes: AttributeContainer
  
  /**
   * 獲取最終屬性值（含修飾符計算）
   */
  getAttribute(name: AttributeName): number {
    return this.attributes.getFinalValue(name)
  }
  
  /**
   * 獲取基礎屬性值（不含修飾符）
   */
  getBaseAttribute(name: AttributeName): number {
    return this.attributes.get(name)
  }
  
  /**
   * 新增屬性修飾符
   */
  addModifier(modifier: AttributeModifier): void {
    this.attributes.addModifier(modifier)
  }
  
  /**
   * 移除屬性修飾符
   */
  removeModifier(modifierId: string): void {
    this.attributes.removeModifier(modifierId)
  }
  
  /**
   * 僅供特殊系統使用（如序列化）
   * @internal
   */
  getAttributeContainer(): Readonly<AttributeContainer> {
    return this.attributes
  }
}
````

#### 方案 B：保持開放但加註解警告（次佳）
````typescript
export class Character implements ICharacter {
  /**
   * 屬性容器（僅供讀取，修改請使用 addModifier/removeModifier）
   * @readonly
   * @deprecated 建議使用 getAttribute() 替代直接存取
   */
  public readonly attributes: AttributeContainer
  
  getAttribute(name: AttributeName): number {
    return this.attributes.getFinalValue(name)
  }
  
  addModifier(modifier: AttributeModifier): void {
    this.attributes.addModifier(modifier)
  }
}
````

---

## 問題 2: `AttributeContainer` 調用計算層違反分層架構

### 當前問題
```typescript
export class AttributeContainer {
  private calculator: AttributeCalculator // ❌ 數據容器依賴邏輯層
  
  getFinalValue(name: AttributeName): number {
    return this.calculator.calculate(name) // ❌ 容器不應執行計算
  }
}
```

### 違反的層級原則
```
基礎設施 -> 數據容器 -> 邏輯運算 -> 流程運作
            ↑____________↓
            違反：數據層依賴邏輯層
```

---

### ✅ 重構方案：依賴反轉 (Dependency Inversion)

#### 方案 A：完全剝離計算（最符合初衷）
````typescript
/**
 * 純數據容器：僅負責儲存與讀取
 */
export class AttributeContainer {
  private baseAttributes: Map<AttributeName, number>
  private modifiers: Map<string, AttributeModifier>
  
  get(name: AttributeName): number {
    return this.baseAttributes.get(name) ?? 0
  }
  
  set(name: AttributeName, value: number): void {
    this.baseAttributes.set(name, value)
  }
  
  addModifier(modifier: AttributeModifier): void {
    this.modifiers.set(modifier.id, modifier)
  }
  
  removeModifier(id: string): void {
    this.modifiers.delete(id)
  }
  
  getAllModifiers(): AttributeModifier[] {
    return Array.from(this.modifiers.values())
  }
  
  // ❌ 移除 getFinalValue()
  // ❌ 移除 calculator
}
````

````typescript
import { AttributeCalculator } from './attribute.calculator'

/**
 * Character 負責協調容器與計算器
 */
export class Character implements ICharacter {
  private readonly attributes: AttributeContainer
  private readonly calculator: AttributeCalculator // ✅ 邏輯層在此注入
  
  constructor(config: CharacterConfig) {
    this.attributes = new AttributeContainer()
    this.calculator = new AttributeCalculator(this.attributes) // ✅ 依賴注入
    
    // 初始化基礎屬性
    this.attributes.set('strength', config.strength)
    this.attributes.set('dexterity', config.dexterity)
  }
  
  /**
   * 獲取最終屬性值（委派給計算器）
   */
  getAttribute(name: AttributeName): number {
    return this.calculator.calculate(name) // ✅ 計算邏輯在邏輯層
  }
  
  /**
   * 獲取基礎屬性值
   */
  getBaseAttribute(name: AttributeName): number {
    return this.attributes.get(name) // ✅ 純數據讀取
  }
  
  addModifier(modifier: AttributeModifier): void {
    this.attributes.addModifier(modifier)
  }
}
````

---

#### 方案 B：注入計算器（符合 DIP 但稍複雜）
````typescript
export interface IAttributeCalculator {
  calculate(attributeName: AttributeName): number
}
````

````typescript
/**
 * 容器可選擇性支援計算（透過依賴注入）
 */
export class AttributeContainer {
  private baseAttributes: Map<AttributeName, number>
  private modifiers: Map<string, AttributeModifier>
  private calculator?: IAttributeCalculator // ✅ 介面依賴，可選
  
  /**
   * 注入計算器（由上層決定是否需要）
   */
  setCalculator(calculator: IAttributeCalculator): void {
    this.calculator = calculator
  }
  
  /**
   * 獲取最終值（如果有計算器則計算，否則返回基礎值）
   */
  getFinalValue(name: AttributeName): number {
    if (this.calculator) {
      return this.calculator.calculate(name)
    }
    return this.get(name)
  }
  
  // ...existing code...
}
````

---

### 🎯 推薦架構：方案 A

#### 分層職責清晰化

```
┌─────────────────────────────────────┐
│ 流程運作層 (Character)               │ 協調容器與計算器
│ - getAttribute()                     │
│ - addModifier()                      │
└────────────┬────────────────────────┘
             │ 委派
             ↓
┌─────────────────────────────────────┐
│ 邏輯運算層 (AttributeCalculator)     │ 計算最終屬性值
│ - calculate()                        │
│ - applyModifiers()                   │
└────────────┬────────────────────────┘
             │ 讀取
             ↓
┌─────────────────────────────────────┐
│ 數據容器層 (AttributeContainer)      │ 純數據儲存
│ - get() / set()                      │
│ - addModifier() / removeModifier()   │
└─────────────────────────────────────┘
```

---

## 完整重構代碼

### 1. 數據容器層（純數據）
````typescript
import { AttributeModifier } from './models/attribute.modifier.model'
import { AttributeName } from './interfaces/character.interface'

/**
 * 屬性容器：純數據儲存，不包含計算邏輯
 */
export class AttributeContainer {
  private baseAttributes = new Map<AttributeName, number>()
  private modifiers = new Map<string, AttributeModifier>()
  
  get(name: AttributeName): number {
    return this.baseAttributes.get(name) ?? 0
  }
  
  set(name: AttributeName, value: number): void {
    this.baseAttributes.set(name, value)
  }
  
  addModifier(modifier: AttributeModifier): void {
    this.modifiers.set(modifier.id, modifier)
  }
  
  removeModifier(id: string): void {
    this.modifiers.delete(id)
  }
  
  getModifiers(): AttributeModifier[] {
    return Array.from(this.modifiers.values())
  }
  
  getModifiersFor(attributeName: AttributeName): AttributeModifier[] {
    return this.getModifiers().filter(m => m.attributeName === attributeName)
  }
}
````

### 2. 邏輯運算層（計算邏輯）
````typescript
import { AttributeContainer } from './attribute.container'
import { AttributeName } from './interfaces/character.interface'
import { AttributeModifier } from './models/attribute.modifier.model'

/**
 * 屬性計算器：負責計算最終屬性值
 */
export class AttributeCalculator {
  constructor(private container: AttributeContainer) {}
  
  /**
   * 計算最終屬性值（基礎值 + 修飾符）
   */
  calculate(name: AttributeName): number {
    const baseValue = this.container.get(name)
    const modifiers = this.container.getModifiersFor(name)
    
    return this.applyModifiers(baseValue, modifiers)
  }
  
  /**
   * 套用修飾符計算
   * 順序：flat -> increased -> more
   */
  private applyModifiers(baseValue: number, modifiers: AttributeModifier[]): number {
    let value = baseValue
    
    // 1. 加算修飾符
    const flatModifiers = modifiers.filter(m => m.type === 'flat')
    value += flatModifiers.reduce((sum, m) => sum + m.value, 0)
    
    // 2. 提高修飾符（加總後相乘）
    const increasedModifiers = modifiers.filter(m => m.type === 'increased')
    const totalIncrease = increasedModifiers.reduce((sum, m) => sum + m.value, 0)
    value *= (1 + totalIncrease)
    
    // 3. 更多修飾符（獨立相乘）
    const moreModifiers = modifiers.filter(m => m.type === 'more')
    for (const modifier of moreModifiers) {
      value *= (1 + modifier.value)
    }
    
    return value
  }
}
````

### 3. 流程運作層（協調）
````typescript
import { AttributeContainer } from './attribute.container'
import { AttributeCalculator } from './attribute.calculator'
import { ICharacter, AttributeName } from './interfaces/character.interface'
import { AttributeModifier } from './models/attribute.modifier.model'

/**
 * 角色：協調屬性容器與計算器
 */
export class Character implements ICharacter {
  // 私有化內部實作
  private readonly attributeContainer: AttributeContainer
  private readonly attributeCalculator: AttributeCalculator
  
  constructor(config: CharacterConfig) {
    this.attributeContainer = new AttributeContainer()
    this.attributeCalculator = new AttributeCalculator(this.attributeContainer)
    
    // 初始化基礎屬性
    this.initializeAttributes(config)
  }
  
  /**
   * 獲取最終屬性值（含修飾符）
   */
  getAttribute(name: AttributeName): number {
    return this.attributeCalculator.calculate(name)
  }
  
  /**
   * 獲取基礎屬性值（不含修飾符）
   */
  getBaseAttribute(name: AttributeName): number {
    return this.attributeContainer.get(name)
  }
  
  /**
   * 新增屬性修飾符
   */
  addModifier(modifier: AttributeModifier): void {
    this.attributeContainer.addModifier(modifier)
  }
  
  /**
   * 移除屬性修飾符
   */
  removeModifier(modifierId: string): void {
    this.attributeContainer.removeModifier(modifierId)
  }
  
  private initializeAttributes(config: CharacterConfig): void {
    this.attributeContainer.set('strength', config.strength ?? 0)
    this.attributeContainer.set('dexterity', config.dexterity ?? 0)
    this.attributeContainer.set('intelligence', config.intelligence ?? 0)
    // ...existing code...
  }
}
````

---

## 總結

### ✅ 改進後的優點

1. **分層清晰**
   - 數據層：純粹的讀寫（`AttributeContainer`）
   - 邏輯層：計算處理（`AttributeCalculator`）
   - 流程層：協調系統（`Character`）

2. **符合 SOLID**
   - **SRP**: 每個類職責單一
   - **OCP**: 新增修飾符類型無需修改容器
   - **DIP**: Character 依賴抽象介面，不依賴具體實作

3. **可測試性**
   - 可獨立測試計算邏輯
   - 可 Mock AttributeContainer

4. **可維護性**
   - 修改計算公式只需改 `AttributeCalculator`
   - 外部無法繞過 Character 直接操作

### 🎯 遷移步驟

1. 重構 `AttributeContainer`（移除 `calculator` 依賴）
2. 修改 `Character` 注入 `AttributeCalculator`
3. 將外部 `character.attributes.getFinalValue()` 改為 `character.getAttribute()`
4. 刪除不再使用的公開 `attributes` 屬性

需要我協助實作這些重構嗎？