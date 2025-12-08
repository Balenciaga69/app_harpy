# Combat 模組架構重構計劃

> **建立日期**: 2025/12/08  
> **狀態**: 進行中  
> **優先級**: P0 - 核心架構改進

## 一、重構目標

### 核心問題

- Equipment/Relic 在 Combat 中僅作為 Effect 容器，語義不清
- 屬性計算邏輯耦合於 Combat 模組，戰鬥外無法復用
- Effect 系統依賴過重的 ICombatContext，戰鬥外使用困難
- 存在冗餘的屬性類型定義檔案

### 解決方向

- 移除 EquipmentManager/RelicManager，改為直接注入 Effects
- 抽取屬性計算系統到共享層（shared/attribute-system）
- 重新設計 Effect 依賴注入機制，支援戰鬥內外使用
- 統一屬性類型定義，移除重複檔案

---

## 二、架構調整概覽

### 調整前

```
Combat 模組
  ├─ domain/attribute
  │   ├─ AttributeManager （戰鬥專屬）
  │   ├─ AttributeCalculator （戰鬥專屬）
  │   └─ models/
  │       ├─ attribute-core.ts （重複定義）
  │       ├─ attribute-type.ts （重複定義）
  │       └─ base-attribute-values.ts （重複定義）
  ├─ domain/character
  │   ├─ Character.ts
  │   ├─ EquipmentManager.ts
  │   └─ RelicManager.ts
  └─ domain/effect
      ├─ EffectManager.ts （依賴 ICombatContext）
      └─ models/effect.ts
```

### 調整後

```
shared/
  └─ attribute-system/ ✨ 新增
      ├─ AttributeManager.ts （共享）
      ├─ AttributeCalculator.ts （共享）
      └─ models/
          ├─ attribute-modifier.ts
          └─ attribute-calculator.ts

Combat 模組
  ├─ domain/attribute
  │   └─ index.ts （僅作為相容層，重新導出 shared）
  ├─ domain/character
  │   ├─ Character.ts （接受 effects[] 而非 equipment）
  │   ├─ EquipmentManager.ts ❌ 刪除
  │   └─ RelicManager.ts ❌ 刪除
  └─ domain/effect
      ├─ EffectManager.ts （依賴精簡後的服務介面）
      └─ models/effect.ts
```

---

## 三、實施步驟

### ✅ 階段 1：移除冗餘屬性定義（已完成）

#### 完成項目

- 刪除 combat/domain/attribute/models/attribute-core.ts
- 刪除 combat/domain/attribute/models/attribute-type.ts
- 刪除 combat/domain/attribute/models/base-attribute-values.ts
- 更新所有檔案改為直接從 @/domain/attribute import

#### 影響範圍

- Character.ts
- CharacterBuilder.ts
- attribute-owner.ts

---

### ✅ 階段 2：建立 shared/attribute-system（已完成）

#### 完成項目

- 建立 shared/attribute-system/ 目錄結構
- 移動 AttributeManager 到共享層
- 移動 AttributeCalculator 到共享層
- 移動 attribute-modifier 定義到共享層
- 更新 combat/domain/attribute/index.ts 作為相容層
- 刪除舊的 Combat 屬性檔案
- 建立 attribute-system.spec.md 規格書

#### 影響範圍

- 所有使用屬性系統的檔案（透過相容層無需修改）

---

### 🔄 階段 3：設計優雅的 Effect 服務層（進行中）

#### 問題分析

當前 Effect 介面依賴完整的 ICombatContext：

```typescript
interface IEffectLifeHook {
  onApply?(characterId: string, context: ICombatContext): void
  onTick?(characterId: string, context: ICombatContext): void
}
```

ICombatContext 包含戰鬥專屬的內容：

- EventBus（戰鬥外不需要）
- getCurrentTick()（戰鬥外無意義）
- RNG（戰鬥外可能不需要）
- registry（戰鬥外可能不需要）

#### 解決方案：服務定位器 + 分層依賴

##### 核心設計

```typescript
// 最小角色 API（戰鬥內外通用）
interface ICharacterFacade {
  readonly id: string
  getAttribute(type: AttributeType): number
  addAttributeModifier(modifier: AttributeModifier): void
  removeAttributeModifier(id: string): void
}

// 基礎服務介面（戰鬥內外通用）
interface IEffectServices {
  getCharacter(id: string): ICharacterFacade
}

// 戰鬥專屬擴展（僅戰鬥內使用）
interface ICombatEffectServices extends IEffectServices {
  emitEvent(eventName: string, payload: unknown): void
  getCurrentTick(): number
  random(): number
}
```

##### Effect 介面調整

```typescript
// 戰鬥內外通用的生命週期
interface IEffectLifeHook {
  onApply?(characterId: string, services: IEffectServices): void
  onRemove?(characterId: string, services: IEffectServices): void
}

// 戰鬥專屬的 Hook（需要完整服務）
interface ICombatEffectHook {
  onTick?(characterId: string, services: ICombatEffectServices): void
}
```

##### 實現範例

```typescript
// 戰鬥內實現
class CombatEffectServices implements ICombatEffectServices {
  constructor(private context: ICombatContext) {}

  getCharacter(id: string): ICharacterFacade {
    return this.context.registry.getCharacter(id) // 返回符合介面的物件
  }

  emitEvent(name: string, payload: unknown): void {
    this.context.eventBus.emit(name, payload)
  }

  getCurrentTick(): number {
    return this.context.getCurrentTick()
  }

  random(): number {
    return this.context.rng.next()
  }
}

// 戰鬥外實現
class StaticEffectServices implements IEffectServices {
  constructor(private characterFacade: ICharacterFacade) {}

  getCharacter(id: string): ICharacterFacade {
    return this.characterFacade // 直接返回靜態角色
  }
}
```

#### 待辦任務

- [ ] 定義 ICharacterFacade 介面
- [ ] 定義 IEffectServices 與 ICombatEffectServices
- [ ] 重構 IEffect 介面使用新的服務層
- [ ] 實現 CombatEffectServices 適配器
- [ ] 實現 StaticEffectServices（戰鬥外）
- [ ] 更新所有 Effect 實現類別（50+ 個檔案）

---

### ⏸️ 階段 4：移除 EquipmentManager 與 RelicManager（待開始）

#### 目標

簡化 Character 結構，改為直接接受 effects[] 陣列。

#### 調整內容

##### Character 建構子調整

```typescript
// 調整前
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: 'player' | 'enemy'
  ultimate?: IUltimateAbility
}

constructor(config: CharacterConfig, context?: ICombatContext) {
  this.equipmentManager = new EquipmentManager(this)
  this.relicManager = new RelicManager(this)
  // 需要手動裝備...
}

// 調整後
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: 'player' | 'enemy'
  effects: IEffect[]  // ✨ 直接傳入
  ultimate?: IUltimateAbility
}

constructor(config: CharacterConfig, services: IEffectServices) {
  // 直接注入所有 Effect
  for (const effect of config.effects) {
    this.effectManager.addEffect(effect, services)
  }
}
```

##### CombatEngine 輸入調整

```typescript
// 調整前
const player = new Character({ ... }, context)
player.equipItem(equipment, context)
player.addRelic(relic, context)

// 調整後
const effects = [
  ...EffectFactory.fromEquipment(equipment),
  ...EffectFactory.fromRelic(relic)
]
const player = new Character({ ..., effects }, services)
```

#### 待辦任務

- [ ] 修改 CharacterConfig 介面
- [ ] 更新 Character 建構子邏輯
- [ ] 刪除 EquipmentManager.ts
- [ ] 刪除 RelicManager.ts
- [ ] 更新 CombatEngine 建立 Character 的邏輯
- [ ] 更新所有範例與測試

---

### ⏸️ 階段 5：實現 CharacterModifierSystem（待開始）

#### 目標

提供戰鬥外計算角色最終屬性的功能，用於顯示角色面板。

#### 架構設計

```typescript
// 新增模組：src/logic/character-modifier/
export class CharacterModifierSystem {
  calculateFinalAttributes(
    character: ICharacterDefinition,
    equipment: ICombatItemView[],
    relics: ICombatItemView[]
  ): BaseAttributeValues {
    // 1. 建立屬性管理器
    const manager = new AttributeManager(character.baseAttributes)
    const calculator = new AttributeCalculator(manager)

    // 2. 建立靜態服務
    const facade: ICharacterFacade = {
      id: character.id,
      getAttribute: (type) => calculator.calculateAttribute(type),
      addAttributeModifier: (mod) => manager.addModifier(mod),
      removeAttributeModifier: (id) => manager.removeModifier(id),
    }
    const services = new StaticEffectServices(facade)

    // 3. 注入裝備與遺物效果
    const effectManager = new EffectManager(character.id)
    for (const item of [...equipment, ...relics]) {
      for (const effect of item.effects) {
        effectManager.addEffect(effect, services)
      }
    }

    // 4. 計算所有屬性
    return {
      maxHp: calculator.calculateAttribute('maxHp'),
      currentHp: calculator.calculateAttribute('currentHp'),
      // ... 其他屬性
    }
  }
}
```

#### 待辦任務

- [ ] 建立 character-modifier 模組目錄
- [ ] 實現 CharacterModifierSystem 類別
- [ ] 整合到 Run 模組
- [ ] 建立單元測試
- [ ] 建立 character-modifier.spec.md

---

### ⏸️ 階段 6：更新規格書與文檔（待開始）

#### 待辦任務

- [ ] 更新 combat.spec.md（移除裝備管理器相關內容）
- [ ] 更新 item.spec.md（調整裝備使用流程）
- [ ] 更新 run.spec.md（加入 CharacterModifierSystem）
- [ ] 建立遷移指南（供其他開發者參考）

---

## 四、風險評估與緩解

### 風險 1：大量 Effect 實現需要更新

**影響等級**: 🟡 中

**緩解措施**:

- 階段性更新，優先更新核心 Effect
- 提供範例與轉換腳本
- 保留向後相容期（deprecation warning）

### 風險 2：戰鬥內外屬性計算結果不一致

**影響等級**: 🔴 高

**緩解措施**:

- 使用相同的 AttributeManager 與 AttributeCalculator
- 建立完整的單元測試驗證一致性
- 建立整合測試比對戰鬥前後屬性

### 風險 3：Effect 服務層設計複雜度

**影響等級**: 🟡 中

**緩解措施**:

- 採用服務定位器模式降低複雜度
- 提供清晰的介面文檔與範例
- 分階段實現，先完成基礎功能

---

## 五、時間估算

| 階段                            | 預估時間 | 狀態      |
| ------------------------------- | -------- | --------- |
| 階段 1：移除冗餘定義            | 0.5 天   | ✅ 完成   |
| 階段 2：shared/attribute-system | 1 天     | ✅ 完成   |
| 階段 3：Effect 服務層           | 2-3 天   | 🔄 進行中 |
| 階段 4：移除裝備管理器          | 1-2 天   | ⏸️ 待開始 |
| 階段 5：CharacterModifierSystem | 2-3 天   | ⏸️ 待開始 |
| 階段 6：文檔更新                | 1 天     | ⏸️ 待開始 |

**總計**: 7.5-10.5 工作天

---

## 六、驗收標準

### 功能驗收

- ✅ 戰鬥內外使用相同的屬性計算邏輯
- ⏳ Effect 可在戰鬥外使用（角色面板）
- ⏳ Character 不再持有 EquipmentManager/RelicManager
- ⏳ 無重複的屬性類型定義檔案

### 品質驗收

- ⏳ 所有現有測試通過
- ⏳ 新增單元測試覆蓋率 > 80%
- ⏳ 無 TypeScript 編譯錯誤
- ⏳ 規格書更新完整

### 架構驗收

- ✅ shared/attribute-system 無外部依賴（除 domain/attribute）
- ⏳ Effect 介面清晰分離戰鬥內外關注點
- ⏳ 代碼符合 SOLID 原則
- ⏳ 易於跨語言移植

---

## 七、後續規劃

### 短期（完成重構後）

- 實現戰鬥外角色面板 UI
- 建立完整的屬性計算測試套件
- 優化 Effect 註冊與查詢性能

### 中期（1-2 個月）

- 實現 ItemGenerator 整合 EffectFactory
- 建立 CharacterManager 模組
- 實現裝備與遺物的 UI 預覽功能

### 長期（3-6 個月）

- 將屬性系統移植到其他語言（C#/Python）
- 建立完整的遊戲資料編輯器
- 實現多語言的屬性計算一致性測試

---

## 八、參考資料

### 相關規格書

- attribute-system.spec.md（新增）
- combat.spec.md
- item.spec.md
- character.spec.md

### 設計模式參考

- Facade Pattern（CombatEngine）
- Service Locator Pattern（IEffectServices）
- Strategy Pattern（AttributeCalculator）
- Dependency Injection（服務注入）

---

**最後更新**: 2025/12/08  
**維護者**: AI Assistant  
**審核者**: 待定
