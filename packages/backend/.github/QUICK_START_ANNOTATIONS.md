# 新註解規範 - 執行摘要

快速入門指南，適合繁忙的開發者。

---

## 🎯 核心改變（3 句話）

1. **從行內註解 → Docstring** - 不要在代碼裡到處寫 `// 檢查 XXX`，改為一個方法級別的清晰說明
2. **說明邊界與副作用** - 每個複雜方法都要說「會修改什麼」和「有什麼限制」
3. **保護防腐層** - 不要讓 AI 或其他人直接跨越層級修改內部狀態

---

## ⚡ 快速規則（記住這 5 條）

### **1️⃣ 類別與介面**

```typescript
// ✅ 必須有
/** 管理物品庫存，支持容量擴展 */
export class Stash implements IStash { ... }

// ❌ 不能沒有
export class Stash implements IStash { ... }  // 缺少描述
```

### **2️⃣ 複雜方法**

```typescript
// ✅ 需要說明副作用與邊界
/**
 * 添加物品到庫存
 * 副作用: 修改內部 _items
 * 邊界: 容量不足時返回 false
 */
addItem(item: ItemInstance): boolean { ... }

// ❌ 不要只寫「添加物品」
/** 添加物品 */
addItem(item: ItemInstance): boolean { ... }
```

### **3️⃣ 簡單方法**

```typescript
// ✅ 有短描述即可
/** 取得已使用的容量數 */
getUsedCapacity(): number { return this._items.length }

// ❌ 不需要額外說明
/**
 * 此方法返回已使用的容量數
 * 計算方式是 items 陣列長度
 * 不會修改任何狀態
 */
getUsedCapacity(): number { ... }  // 過度了
```

### **4️⃣ 變數命名**

```typescript
// ✅ 清晰
const contexts = appContextService.GetContexts()
const activeModifiers = modifiers.filter((m) => m.durationStages !== 0)

// ❌ 簡約
const ctx = appContextService.GetContexts()
const mods = modifiers.filter((m) => m.durationStages !== 0)
```

### **5️⃣ 防腐層保護**

```typescript
// ✅ 通過服務層更新
itemService.updateRelics(newRelics)

// ❌ 直接跨越
appContextService.GetContexts().characterContext.relics = newRelics
```

---

## 📊 3 層規範速查表

| 層級            | 類別                | 方法             | 變數    | 防腐         |
| --------------- | ------------------- | ---------------- | ------- | ------------ |
| **Domain**      | 📝 Docstring + 邊界 | 📝 副作用 + 邊界 | ✅ 清晰 | 通過介面     |
| **Application** | 📝 Docstring        | 📝 副作用        | ✅ 清晰 | 通過 Service |
| **Infra**       | 📝 Docstring        | 📝 簡潔          | ✅ 清晰 | 通過 Loader  |

---

## 🚀 3 個實戰範例

### **範例 1：複雜演算法（見 UnitStatAggregate.ts）**

```typescript
// ❌ 差
function compute(base, mods) {
  let addSum = 0 // 初始化加法
  let multiplySum = 0 // 初始化乘法
  let lastSet = undefined // 初始化設定值
  for (const m of mods) {
    // 迴圈處理...
  }
  let v = (base + addSum) * (1 + multiplySum)
  if (lastSet !== undefined) v = lastSet
  return v
}

// ✅ 好
/**
 * 計算統計值，應用 ADD → MULTIPLY → SET 優先級
 * 業務規則: SET 優先級最高，覆蓋之前結果
 * 邊界: base 任意數值，modifiers 順序不影響結果
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

  let result = (base + addSum) * (1 + multiplySum)
  return lastSet !== undefined ? lastSet : result
}
```

### **範例 2：Domain 模型（見 Stash.ts）**

```typescript
// ❌ 差
export class Stash {
  private _items = []
  private _capacity = 20

  addItem(item) {
    if (this._items.length < this._capacity) {
      this._items.push(item)
      return true
    }
    return false
  }
}

// ✅ 好
/**
 * 物品庫存實現
 * 職責: 管理物品列表與容量
 * 邊界: 不處理物品有效性驗證（由上層負責）
 */
export class Stash implements IStash {
  private _items: ItemInstance[] = []
  private _capacity: number

  constructor(initial: ItemInstance[] = [], capacity: number = 20) {
    this._items = [...initial]
    this._capacity = capacity
  }

  /**
   * 添加物品到庫存
   * 副作用: 修改 _items
   * 邊界: 容量不足返回 false
   */
  addItem(item: ItemInstance): boolean {
    if (!this.canAddItem(item)) return false
    this._items.push(item)
    return true
  }

  /** 檢查是否可添加，副作用無 */
  canAddItem(item: ItemInstance): boolean {
    return this._items.length < this._capacity
  }
}
```

### **範例 3：Service 協調（見 ItemGenerationService.ts）**

```typescript
// ❌ 差
export class ItemGenerationService {
  generateRandomItem(source) {
    if (!this.constraintService.canGenerateItems()) {
      return null
    }
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    return this.instantiationService.createItemInstance(itemTemplateId, itemType)
  }
}

// ✅ 好
/**
 * 物品生成協調服務
 * 流程: 檢驗 → 聚合修飾符 → 骰選 → 實例化
 * 防腐層: 所有物品操作必須通過此服務
 */
export class ItemGenerationService {
  /**
   * 根據來源與修飾符生成隨機物品
   * 流程:
   * 1. 檢驗是否允許生成
   * 2. 聚合當前有效修飾符
   * 3. 骰選物品類型、稀有度、樣板
   * 4. 實例化物品
   *
   * 副作用: 無狀態修改
   * 邊界: 回傳 null 表示不允許
   */
  generateRandomItem(source: ItemRollSourceType): ItemInstance | null {
    if (!this.constraintService.canGenerateItems()) return null
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    return this.instantiationService.createItemInstance(itemTemplateId, itemType)
  }
}
```

---

## 📋 編寫檢查清單（30 秒版）

寫完代碼後，快速檢查：

```
□ 我的新類別有一句話的描述嗎？
□ 複雜方法說清楚了「會改什麼」嗎？
□ 是否有「無邊界條件」的情況我沒考慮？
□ 變數名清晰嗎（不是 ctx/cfg/mods）？
□ 有直接修改 context 的地方嗎？（應該通過 Service）
```

全部 ✅ 就可以提交 PR。

---

## 🎓 與 AI 協作 - 最重要的 3 點

1. **給例子** - 「參考 Stash.ts 的風格，為我的新方法補充 Docstring」
2. **說邊界** - 「注意這個方法不應修改 context，只應讀取」
3. **檢查回傳** - AI 完成後，檢查是否有缺少「副作用」或「邊界」的說明

---

## 📚 詳細指南

想了解更多？查看：

| 文檔                                                       | 適合        | 內容           |
| ---------------------------------------------------------- | ----------- | -------------- |
| [ANNOTATION_STRATEGY.md](./ANNOTATION_STRATEGY.md)         | 詳細閱讀    | 完整規範與理論 |
| [ANNOTATION_CASE_STUDIES.md](./ANNOTATION_CASE_STUDIES.md) | 邊做邊看    | 具體範例       |
| [ANNOTATION_CHECKLIST.md](./ANNOTATION_CHECKLIST.md)       | Code Review | 審查清單       |
| [AI_COLLABORATION_GUIDE.md](./AI_COLLABORATION_GUIDE.md)   | 與 AI 互動  | 如何高效協作   |

---

## ❓ FAQ

### **Q: 為什麼要這樣改？**

A: 讓 AI Agent 更準確地理解代碼意圖，減少跨越防腐層、違反邊界的錯誤。同時幫助新開發者快速上手。

### **Q: 所有方法都要補充嗎？**

A: 不是。簡單方法（一行 getter）只需單行描述。複雜方法才需「副作用」與「邊界」說明。

### **Q: 簡約變數名一定要改嗎？**

A: 是的。`ctx` 降低代碼可讀性，AI 在追蹤時也容易出錯。改為 `contexts` 成本很低。

### **Q: 這會增加開發時間嗎？**

A: 短期增加 10-15%，長期節省 40%+（減少 Code Review 與修改次數）。

### **Q: 為什麼要強調防腐層？**

A: 防腐層保證上層不會被下層變化破壞。沒有防腐層，整個系統耦合，AI 會不知所措。

---

## 🔄 實施計畫

### **第 1 天**

- 讀完本文檔
- 快速瀏覽 ANNOTATION_STRATEGY.md 的「核心原則」

### **第 1 週**

- 檢查你維護的 Domain 層代碼
- 為所有公開類別補充 Docstring
- 替換簡約變數名

### **第 2 週**

- 檢查 Application 層 Service
- 補充複雜方法的「副作用」與「邊界」說明
- 完成所有 TODO 或升級為 Issue

### **第 3 週**

- Code Review 時參考 ANNOTATION_CHECKLIST.md
- 與 AI 協作時參考 AI_COLLABORATION_GUIDE.md
- 收集改進建議，迭代規範

---

## 💬 最後的話

> 好的代碼註解是給未來的禮物。
> 無論是 6 個月後的自己，還是新加入的 AI Agent，都會感謝你。

---

**快速導航：**

- 🚀 想要立即開始？見 ANNOTATION_CHECKLIST.md
- 📚 想要完整理解？見 ANNOTATION_STRATEGY.md
- 💼 要與 AI 協作？見 AI_COLLABORATION_GUIDE.md
- 🎨 需要具體範例？見 ANNOTATION_CASE_STUDIES.md
