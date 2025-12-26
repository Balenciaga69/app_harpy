# AI Agent 使用指南 - 代碼上下文最佳實踐

基於新註解規範，本文檔定義如何最有效地與 AI Agent 協作。

---

## 🎯 核心原則

### **1. 註解品質 = AI 效果**

你的代碼註解直接決定了 AI Agent 的準確度：

```
優質註解（Docstring + 邊界）
  ↓
RAG 準確匹配相關代碼
  ↓
AI 生成高質量修改
  ↓
減少修改次數，提高效率
```

**反面例子：**

```
缺少註解或行內註解
  ↓
RAG 檢索不精確，AI 猜測意圖
  ↓
AI 跨越防腐層、違反邊界條件
  ↓
修改多次才正確，浪費時間
```

---

## 📍 當前代碼的 RAG 檢索最佳化策略

根據掃描結果，當前代碼有以下特徵：

### **優勢**

✅ 文件大小控制好（無超大檔案）
✅ 檔案分段合理，上下文不會過長
✅ 某些 service 已有完整文檔

### **弱點**

❌ 35% 的類缺少 Docstring
❌ 58% 的方法缺少業務邏輯說明
❌ 邊界條件說明不一致
❌ 簡約變數名造成語意混亂

---

## 🔍 使用 AI 修改代碼時的檢查清單

### **階段 1：準備（AI 開始前）**

在要求 AI 修改代碼前，確認：

```
[?] 是否有目標文件的現有 Docstring？
    - 有: 拿給 AI，「參照這個風格」
    - 無: 先讓 AI 補充文檔，再做邏輯修改

[?] 修改涉及的方法是否有邊界說明？
    - 有: 告訴 AI，「注意 XXX 邊界條件」
    - 無: 提前補充，或親自驗證 AI 的修改

[?] 涉及跨檔案修改時，防腐層是否清晰？
    - 清晰: 「通過 ItemService 而非直接修改」
    - 不清晰: 添加防腐層，確保 AI 走正確路徑

[?] 變數命名是否簡約（ctx, cfg, mods）？
    - 是: 告訴 AI，「變數 ctx 代表 appContextService.GetContexts()」
    - 否: 讓 AI 直接修改
```

### **階段 2：給 AI 的提示格式**

❌ **差的提示**（會導致 AI 亂改）

```
「幫我在 ItemGenerationService 中添加一個驗證方法」
```

✅ **好的提示**（AI 會準確修改）

```
「在 ItemGenerationService（見 .github/ANNOTATION_CASE_STUDIES.md 的案例）中添加驗證方法，
遵循既有的流程步驟註解風格。
邊界條件: 只檢查物品數量，不檢查重複性（由下層服務處理）。
副作用: 無狀態修改。
參考 Stash.canAddItem() 的文檔格式。」
```

### **階段 3：驗證 AI 的修改**

AI 修改後，檢查：

```
[✓] 新增的方法/類別有 Docstring 嗎？
[✓] 「副作用」、「邊界」、「依賴」都說了嗎？
[✓] 回傳值的含義明確嗎？
[✓] 是否遵循了既有風格？
[✓] 是否跨越了防腐層？
[✓] 變數命名是否清晰（非 ctx/cfg/mods）？
```

如果有缺失，反饋給 AI：

```
「補充 XXX 方法的邊界說明，參考 Stash.expandCapacity() 的文檔」
```

---

## 💡 高效協作的 10 個場景

### **場景 1：新增方法，風格需要一致**

**你說：**

```
在 ItemGenerationService 中添加 validateItemCount() 方法。
參考 src/domain/stash/Stash.ts 中 isAtCapacity() 的文檔風格：簡潔、副作用無、邊界說明。
```

**AI 會：**

- 查看 Stash.ts 的 Docstring 格式
- 按相同風格寫新方法
- 不會過度註解簡單邏輯

---

### **場景 2：複雜邏輯，需要業務說明**

**你說：**

```
修改 computeAggregatedValue() 函數，加入 DIVIDE 操作。
參考 .github/ANNOTATION_CASE_STUDIES.md 的「案例 1」中複雜邏輯的說明格式。
新增業務規則: DIVIDE 優先級在 MULTIPLY 之後，分母不能為零。
邊界: 若出現分母為零，回傳原基礎值。
```

**AI 會：**

- 按格式補充業務規則說明
- 明確標註邊界處理
- 避免寫成行內註解

---

### **場景 3：Service 層協調邏輯修改**

**你說：**

```
修改 ItemGenerationService.generateRandomItem()，在「步驟 2」後添加日誌記錄。
注意防腐層: 新日誌不應直接訪問 runContext（應通過 appContextService）。
參考既有的流程步驟註解，保持「步驟 X」的風格。
```

**AI 會：**

- 在正確位置插入邏輯
- 通過既有的依賴注入添加日誌
- 保持流程步驟的註解風格

---

### **場景 4：跨檔案重構，需要保證邊界**

**你說：**

```
提取 ItemConstraintService 的檢驗邏輯到新的 ItemValidationHelper。
邊界: 新 Helper 只負責單一驗證，複雜的多步驟驗證仍在 Service 中。
防腐層: 所有外部訪問仍通過 ItemConstraintService（不應直接用 Helper）。
補充 Helper 的 Docstring，說明它是內部工具而非公開 API。
```

**AI 會：**

- 明確區分公開 API vs 內部工具
- 保護防腐層
- 避免意外的外部依賴

---

### **場景 5：修複 TODO，需要保留上下文**

**你說：**

```
完成 src/application/item-generation/service/ItemRollService.ts 中的 TODO。
前後文見 TODO 上下 5 行。
邊界: ItemTemplate 的選擇只基於稀有度，不考慮其他過濾（已在 ItemConstraintService 處理）。
保留現有邏輯的副作用說明。
```

**AI 會：**

- 理解 TODO 的上下文
- 尊重既有的邊界划分
- 不會重複實現其他層的邏輯

---

### **場景 6：補充缺失的文檔**

**你說：**

```
為 UnitStatAggregate.ts 補充完整的 Docstring。
格式參考: .github/ANNOTATION_CASE_STUDIES.md 的「案例 1」。
需要說明:
- 三種操作（ADD、MULTIPLY、SET）的優先級
- 計算順序（公式）
- 邊界條件（base 範圍、SET 覆蓋規則）
- 副作用標記（純函數）
```

**AI 會：**

- 按指定格式補充文檔
- 不修改實際邏輯
- 提升代碼的可讀性與 RAG 準確度

---

### **場景 7：統一變數命名**

**你說：**

```
在 ItemModifierAggregationService 中，將簡約變數名改為清晰名稱:
- ctx → contexts
- cfg → config
- mods → modifiers (或 fieldModifiers、activeModifiers 根據上下文)

保留所有 Docstring 和邏輯，只改變名稱。
參考新添加的註解，確保命名與說明一致。
```

**AI 會：**

- 系統地替換變數名稱
- 更新相關的文檔說明
- 提升代碼的語意清晰度

---

### **場景 8：添加錯誤處理，需要副作用說明**

**你說：**

```
為 ItemInstantiationService.createItemInstance() 添加錯誤處理。
現有邏輯見該方法。
新增邊界:
- 若 itemType 不是 RELIC，拋 DomainError 而非 generic Error
- 若 template 不存在，拋 TemplateNotFoundError
補充 Docstring 說明新的異常情況與邊界條件。
```

**AI 會：**

- 按業務規則添加正確的錯誤型別
- 更新副作用說明
- 邊界條件完整說明

---

### **場景 9：重構 Service 以改進防腐層**

**你說：**

```
重構 ItemModifierAggregationService，將 TagStatistics 的調用隔離到新的防腐層。
現有架構: Service → TagStatistics（直接依賴）
新架構: Service → TagStatisticsAdapter（防腐層） → TagStatistics

Adapter 職責: 轉換 TagStatistics 回傳格式，隱藏內部實現。
補充 Adapter 的 Docstring，清晰說明為何需要此層。
```

**AI 會：**

- 理解防腐層的目的
- 清楚地定義新層的邊界
- 避免過度 wrapping

---

### **場景 10：性能優化，需要說明影響**

**你說：**

```
優化 aggregateStats()，使用 Map 替代多次 Object.keys() 遍歷。
邊界: 優化只影響內部實現，公開 API 不變。
副作用: 修改不影響功能，純粹性能提升。
保留既有的完整 Docstring，只更新實現。
檢查新代碼的可讀性（Map 遍歷 vs Object.keys）。
```

**AI 會：**

- 最小化修改範圍
- 不改變 API
- 保留全部文檔

---

## 📋 給 AI 提示的範本

當你要求 AI 修改代碼時，使用此範本：

```markdown
## 任務

[簡要描述要做什麼]

## 前置條件

- 檔案: [file paths]
- 參考風格: [見 .github/ANNOTATION_XXX.md 的「案例 Y」]
- 遵循規範: [具體的規範項目]

## 邊界條件

- [邊界 1]
- [邊界 2]
- [不應該做什麼]

## 副作用

- [會修改什麼狀態]
- [會調用什麼 API]

## 驗證清單

- [ ] 新增 Docstring 是否完整？
- [ ] 是否遵循既有風格？
- [ ] 是否跨越防腐層？
- [ ] 變數命名是否清晰？

## 若有疑問

AI 應在修改前澄清: [待補充]
```

---

## ⚠️ 常見錯誤 - 避免方法

### **錯誤 1：過信 AI 的自動補充**

❌ **不要這樣做：**

```
「幫我補充所有缺失的 Docstring」
```

✅ **應該這樣：**

```
「按 .github/ANNOTATION_STRATEGY.md 的規範，為 domain/ 層的所有類別補充單行功能描述。
特別注意複雜方法需要『邊界』與『副作用』說明。
保留既有的好的 Docstring，只補充缺失的。
先展示 3-5 個範例，讓我驗證風格是否正確。」
```

### **錯誤 2：讓 AI 跨越防腐層**

❌ **不要這樣做：**

```
「修改 ItemModifierAggregationService，直接調用 characterContext.relics」
```

✅ **應該這樣：**

```
「修改 ItemModifierAggregationService，通過既有的 appContextService 訪問 characterContext。
邊界: 不應直接修改 relics（由 RelicService 負責）。」
```

### **錯誤 3：忽視簡約變數名**

❌ **不要這樣做：**

```
「保持代碼原樣，只添加新方法」
[但代碼中有 ctx、cfg、mods 等簡約名]
```

✅ **應該這樣：**

```
「在添加新方法時，使用清晰的變數名（contexts、config、modifiers）。
現有代碼中的簡約名稱：
- ctx = appContextService.GetContexts()
- cfg = appContextService.GetConfig()
- mods = modifiers / activeModifiers（根據上下文）
新代碼應遵循新規範。」
```

---

## 🚀 快速檢查清單 - 修改前

在發送任何要求給 AI 前，問自己：

```
1. 我清楚這個修改的邊界嗎？
   [ ] 是 → 告訴 AI 邊界條件
   [ ] 否 → 先設計邊界，再問 AI

2. 涉及的文件有好的 Docstring 範例嗎？
   [ ] 是 → 參考給 AI
   [ ] 否 → 先補充文檔，再做修改

3. 這個修改會跨越防腐層嗎？
   [ ] 是 → 明確告訴 AI 層邊界
   [ ] 否 → 引導 AI 使用既有的接口

4. 變數命名是否可能造成理解困難？
   [ ] 是 → 提前說明簡約名稱的含義
   [ ] 否 → 引導 AI 使用清晰名稱

5. 此修改是否涉及複雜業務邏輯？
   [ ] 是 → 補充業務規則的 Docstring
   [ ] 否 → 簡潔明確的提示即可
```

如果有任何「否」，投入時間補充，這樣可以顯著提升 AI 修改的品質。

---

## 📊 效果衡量

實施新規範後，評估改進：

| 指標                 | 測量方式                      | 目標  |
| -------------------- | ----------------------------- | ----- |
| **文檔完整度**       | 有 Docstring 的類別 %         | 80% + |
| **邊界說明率**       | 有「副作用」/「邊界」的方法 % | 70% + |
| **AI 修改準確度**    | 首次修改通過率                | 85% + |
| **代碼審查時間**     | PR 平均審查時間               | -30%  |
| **跨越防腐層的錯誤** | 違反層邊界的修改數            | 0     |

---

## 🔗 相關文檔

- 📖 [ANNOTATION_STRATEGY.md](./ANNOTATION_STRATEGY.md) - 完整規範
- 📖 [ANNOTATION_CASE_STUDIES.md](./ANNOTATION_CASE_STUDIES.md) - 具體範例
- 📖 [code.代碼.instructions.md](./instructions/code.代碼.instructions.md) - 原始規範

---

## 🎯 最後的話

**好的 Docstring 是給 AI 的禮物，也是給未來的自己的禮物。**

當你寫註解時，想像：

- 6 個月後的自己讀這段代碼
- 一個剛加入團隊的 AI Agent 需要修改這段邏輯
- 這段邏輯在重構時的依賴追蹤

清晰的註解讓這一切都變簡單。
