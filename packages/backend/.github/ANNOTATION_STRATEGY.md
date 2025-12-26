# 新註解規範實施指南

基於項目的 AI 優先設計目標，本文檔定義了新的註解與代碼組織策略。

---

## 📋 核心原則

### 1. **註解的真正目的**

- ✅ **加速 AI RAG 檢索** - 清晰的 Docstring 讓 Agent 快速定位相關代碼
- ✅ **人類可讀性輔助** - 幫助開發者理解意圖，而非陳述代碼做了什麼
- ❌ **不是代碼複述** - `i++` 不需要註解 `// increment i`

### 2. **缺失的註解最危險**

當 AI Agent 無法找到文檔時，會：

- 🚨 **自行假設** 邏輯意圖，導致下游錯誤
- 🚨 **跨越防腐層** 直接操作內部實現
- 🚨 **上下文斷裂** 頻繁跨文件檢索，產生幻覺

---

## 🎯 註解規範 - 分層指南

### **第 1 層：類別與介面（最高優先）**

必須有 **單行功能描述 Docstring**。

#### ✅ **好的範例**

```typescript
/** 管理物品庫存，支持容量擴展與物品操作 */
export class Stash implements IStash {
  private _items: ItemInstance[] = []
  private _capacity: number

  /** 檢查物品是否可添加，考慮容量與業務規則 */
  canAddItem(item: ItemInstance): boolean {
    // 副作用：無
    // 邊界：容量 >= 0
    return this._items.length < this._capacity
  }
}
```

#### ❌ **差的範例**

```typescript
// 沒有描述
export class Stash implements IStash {
  private _items: ItemInstance[] = []

  // 檢查能否加物品
  canAddItem(item: ItemInstance): boolean {
    return this._items.length < this._capacity
  }
}
```

**格式標準：** `/** [動詞] + [目的] + [約束/注意] */`

---

### **第 2 層：複雜方法與業務邏輯（高優先）**

需要 **說明副作用、邊界、依賴** 的方法：

#### ✅ **好的範例：有副作用的方法**

```typescript
/** 添加物品到庫存，自動截斷超出容量的部分 */
addItem(item: ItemInstance): boolean {
  // 副作用: 修改內部 _items 狀態
  // 邊界: item.id 必須唯一，否則返回 false
  // 依賴: 依賴 canAddItem() 進行驗證

  if (!this.canAddItem(item)) return false
  this._items.push(item)
  return true
}
```

#### ✅ **好的範例：複雜邏輯的業務說明**

```typescript
/**
 * 計算統計值，應用 ADD → MULTIPLY → SET 順序的修飾符
 * 業務規則: SET 操作優先級最高，覆蓋之前的計算結果
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
    }
  }

  let v = (base + addSum) * (1 + multiplySum)
  return lastSet !== undefined ? lastSet : v
}
```

#### ❌ **差的範例：過度詳細的行內註解**

```typescript
function computeAggregatedValue(base: number, mods: UnitStatModifier[]): number {
  let addSum = 0 // 初始化加法總和
  let multiplySum = 0 // 初始化乘法總和
  let lastSet: number | undefined = undefined // 最後設定的值

  for (const m of mods) {
    // 遍歷所有修飾符
    switch (
      m.operation // 檢查操作類型
    ) {
      case 'ADD': // 如果是加法
        addSum += m.value // 加上值
        break
      // ... 更多重複性註解
    }
  }
  // ...
}
```

**規則：** `[可選] 副作用: ... [可選] 邊界: ... [可選] 業務規則: ...`

---

### **第 3 層：簡單方法與屬性（按需）**

不需要額外註解的情況：

```typescript
// ✅ 簡單 getter/setter
get capacity(): number {
  return this._capacity
}

// ✅ 明確名稱的方法，邏輯簡單
removeItem(itemId: string): boolean {
  const idx = this._items.findIndex((i) => i.id === itemId)
  if (idx === -1) return false
  this._items.splice(idx, 1)
  return true
}

// ✅ 常數與列舉
const MAX_CAPACITY = 100
enum ItemRarity { COMMON, RARE, EPIC }
```

---

## 🔴 常見陷阱 - 為 AI 優化的反例

### **陷阱 1：命名過度簡約**

❌ 導致 AI 無法理解上下文

```typescript
const ctx = appContextService.GetContexts()
const cfg = appContextService.GetConfig()
const mods = modifiers.filter((m) => m.durationStages !== 0)
```

✅ 明確命名

```typescript
const contexts = appContextService.GetContexts()
const config = appContextService.GetConfig()
const activeModifiers = modifiers.filter((m) => m.durationStages !== 0)
```

### **陷阱 2：過度的內聚會斷裂上下文**

❌ 強行內聚，導致 AI 頻繁跳檔案

```typescript
// utils/helpers.ts - 一堆無關工具函數
const calculateDifficulty = () => { ... }
const generateRandomSeed = () => { ... }
const validateItem = () => { ... }
```

✅ 按業務邏輯分組

```typescript
// helpers/DifficultyHelper.ts
export const getDifficultyFactor = () => { ... }

// helpers/RandomHelper.ts
export const generateRandomSeed = () => { ... }

// services/ItemValidationService.ts - 配有完整上下文
```

### **陷阱 3：防腐層不完整**

❌ AI 會跨越防腐層直接操作

```typescript
// 某個 service 中
const characterContext = appContextService.GetContexts().characterContext
characterContext.relics = newRelics // ❌ 直接修改內部狀態
```

✅ 通過明確的介面更新

```typescript
// RelicService 提供防腐層
export class RelicManagementService {
  /** 更新角色的聖物列表，驗證容量與堆疊限制 */
  updateRelics(newRelics: RelicInstance[]): void {
    // 所有驗證邏輯集中在此
    if (!this.validateRelics(newRelics)) throw new RelicValidationError()
    this.contextService.updateRelics(newRelics)
  }
}
```

---

## 📊 按檔案類型的註解密度指南

### **Domain 層（最密集）**

```
類別/介面描述     : 100% 必須
方法描述          : 80%+ 應有
複雜邏輯說明      : 100% 必須
邊界條件說明      : 70%+ 應有
```

### **Application 層（中等密度）**

```
Service 類別      : 100% 必須
公開方法          : 90%+ 應有
複雜協調邏輯      : 100% 必須
副作用明確標記    : 100% 必須
```

### **Infra 層（低密度）**

```
Load/Store 類別   : 100% 必須
配置映射說明      : 60% 應有
技術細節          : 按需說明
```

---

## 🎓 為 AI 優化的最佳實踐

### **1. 一致的詞彙**

使用統一的業務術語讓 AI 更容易理解關聯：

```typescript
// ✅ 一致使用 "堆疊"、"等級"、"骰選"
/** 增加聖物堆疊計數 */
addStack(relic: RelicInstance): void

/** 從可用樣板中骰選聖物 */
rollRelic(constraints: ItemConstraintList): RelicInstance

/** 獲取聖物等級上限 */
getStackLimit(templateId: string): number
```

### **2. 明確的邊界與前置條件**

```typescript
/**
 * 計算難度因子，用於調整敵人統計與掉落物品
 * 邊界: chapter 1-5, stage 1-10 每章; stage 11+ 為無限模式
 * 依賴: DifficultyHelper 提供分段計算
 */
export function getDifficultyFactor(chapter: number, stage: number): number {
  if (chapter < 1 || chapter > 5) throw new Error('Chapter out of range')
  // ...
}
```

### **3. 明確的回傳值含義**

```typescript
/**
 * 檢查物品是否可生成
 * 回傳: true = 滿足所有限制條件，false = 至少一項限制不符
 * 限制: 章節限制、職業限制、事件特定限制
 */
canGenerateItems(): boolean
```

### **4. 提升可檢索性的描述**

```typescript
// ✅ 使用業界標準術語，AI 能匹配相關概念
/**
 * 防腐層 (Anti-Corruption Layer)：隔離上游 API 變化
 * 將 EnemyDTO 轉換為內部 EnemyTemplate 域模型
 */
export class EnemyConfigAdapter implements IEnemyConfigLoader {
  // ...
}

// ❌ 過於簡略
/**
 * Enemy 適配器
 */
export class EnemyConfigAdapter implements IEnemyConfigLoader {
  // ...
}
```

---

## 🛠️ 實施檢查清單

### **Phase 1：Domain 層（本週）**

- [ ] 所有類別/介面添加 Docstring
- [ ] 複雜函數補充業務邏輯說明
- [ ] 標記邊界條件與副作用
- [ ] 修改統計相關 Docstring（見 `UnitStatAggregate.ts` 範例）

### **Phase 2：Application 層（1-2週）**

- [ ] 所有 Service 類別補充 Docstring
- [ ] 公開方法補充複雜邏輯說明
- [ ] 標記所有副作用
- [ ] 完成所有 TODO 註解的實現或升級為 Issue

### **Phase 3：優化與維護（持續）**

- [ ] 統一簡略變數名稱 (ctx → context)
- [ ] 補充缺失的邊界條件說明
- [ ] 建立 PR checklist 確保新代碼遵循規範
- [ ] 定期更新 symbols.md 的描述

---

## 📚 參考範例檔案

查看這些文件作為參考實現：

| 文件                       | 特點         | 學習重點                    |
| -------------------------- | ------------ | --------------------------- |
| `Stash.ts`                 | 簡單但完整   | IStash 介面文檔；方法簡潔性 |
| `ItemFactory.ts`           | Factory 模式 | 工廠方法的參數文檔          |
| `ItemGenerationService.ts` | Service 協調 | 流程協調的 Docstring        |
| `UnitStatAggregate.ts`     | 複雜演算法   | 演算法邏輯的詳細說明        |

---

## 🤝 如何與 AI Agent 協作

### **當 AI 遇到缺失文檔時：**

1. **不要讓 AI 自行假設** - 補充註解而非讓 Agent 猜測
2. **用明確的防腐層** - 確保 Agent 走正確的修改路徑
3. **一致的命名** - 幫助 RAG 準確檢索相關代碼

### **當你要求 AI 修改代碼時：**

1. **優先提供現有的 Docstring** - 「見 XXX.ts 的 YYY 方法，風格一致」
2. **明確邊界與副作用** - 「注意此方法修改 runContext 狀態」
3. **參考防腐層** - 「通過 ItemService 更新而非直接操作」

---

## ✨ 最終目標

通過這套規範，使得代碼：

- ✅ **自文檔化** - 註解即規範，無須額外文檔
- ✅ **AI 友善** - Docstring 豐富，RAG 檢索準確
- ✅ **人類友善** - 意圖清晰，無須跨文件跳轉
- ✅ **長期可維護** - 新加入者能快速理解整體架構
