# Application 層檔案合併建議

## 檢查完成

✅ 所有 36 個 TS 檔案的註解規範已修正完成

---

## 合併方案分析

### 🎯 原則

- **內聚度優先**：相關功能合併以減少跳檔案成本
- **檔案大小控制**：合併後不超過 500 行（目標 200-400 行）
- **API 穩定性**：保持公開介面不變
- **防腐層保護**：維持層級分離

---

## 📋 建議合併清單

### 1️⃣ **content-generation/factory 三工廠合併**

**狀態**: ✅ 強烈建議

#### 目前結構

```
factory/
  ├── AffixFactory.ts (38 行)
  ├── EnemyFactory.ts (72 行)
  └── UltimateFactory.ts (32 行)
```

#### 合併方案

- **合併為**: `InstanceFactory.ts` (140 行)
- **理由**:
  - 三個工廠都是簡單的實例化工廠模式
  - 同屬內容生成層的工廠層
  - 對外 API 無變化（export 各個工廠物件）
  - 減少檔案導入路徑複雜度

#### 合併後 export

```typescript
export const AffixFactory = { createMany, createOne }
export const EnemyFactory = () => { ... }
export const UltimateFactory = { create }
```

---

### 2️⃣ **item-generation/service 服務合併**

**狀態**: ⚠️ 部分建議（分兩步）

#### 當前結構

```
service/
  ├── ItemGenerationService.ts (35 行) - 協調器
  ├── ItemConstraintService.ts (48 行) - 驗證
  ├── ItemRollService.ts (30 行) - 骰選
  ├── ItemModifierAggregationService.ts (57 行) - 修飾符
  └── ItemInstantiationService.ts (31 行) - 實例化
```

#### 建議方案

**第一步**：合併底層服務 → `ItemRollAggregate.ts`

```typescript
// ItemRollAggregate.ts (80 行)
export class ItemConstraintService { ... }
export class ItemRollService { ... }
export class ItemModifierAggregationService { ... }
```

**為什麼**:

- ItemConstraintService、ItemRollService 聯繫密切（骰選流程）
- ItemModifierAggregationService 也屬於修飾符聚合，邏輯內聚
- 都是私有實作細節，只由 ItemGenerationService 調用
- 減少 3 個檔案 → 1 個

**第二步**：保持 ItemGenerationService 與 ItemInstantiationService 分離

```
service/
  ├── ItemGenerationService.ts (35 行) - 協調器（對外 API）
  ├── ItemInstantiationService.ts (31 行) - 實例化
  └── ItemRollAggregate.ts (80 行) - 內部服務聚合
```

**為什麼**:

- ItemInstantiationService 基於難度計算，是獨立的領域概念
- 未來可能被其他地方複用（例如戰鬥產生掉落物品）
- 保持單一職責明確

---

### 3️⃣ **item-generation/helper 合併**

**狀態**: ✅ 強烈建議

#### 當前結構

```
helper/
  └── itemRollHelpers.ts (40 行) - 3 個骰選函數
```

#### 合併方案

```
service/
  └── ItemRollService.ts 改為 ItemRollLogic.ts
      - 包含骰選服務類 + 骰選輔助函數
```

**為什麼**:

- itemRollHelpers 就是 3 個純函數，職責簡單
- 只被 ItemRollService 呼叫
- 合併後保持清晰：ItemRollLogic = 骰選服務 + 骰選邏輯

---

### 4️⃣ **core-infrastructure 靜態配置層**

**狀態**: ✅ 中度建議

#### 當前結構

```
static-config/
  ├── loader/ (5 個介面檔案)
  ├── assembler/ (2 個檔案)
  └── store/ (5 個實作 + 1 個介面檔案)
```

#### 合併方案

**方案 A**（推薦）：保持介面與實作分離，但組織更清楚

```
static-config/
  ├── IConfigStores.ts (現有)
  ├── ConfigStores.ts（新，合併 5 個 Store 實作）
  ├── IConfigLoaders.ts（新，合併 5 個 Loader 介面）
  ├── ConfigAssembler.ts（合併 GameConfigAssembler + IGameConfigAssembler）
  └── [保持 loader/ 的各實作檔案，因為它們來自外部，可能有不同來源]
```

**為什麼**:

- 所有 Store 實作都很簡單（基本的 Map 管理）
- 無需每個檔案一個，可以合併為一個 ConfigStores.ts
- Assembler 的實作與介面可以合併

**預期結果**:

```
靜態配置檔案: 7 個 → 4 個（節省 3 個檔案）
```

---

### 5️⃣ **context 上下文層**

**狀態**: ❌ 不建議合併

#### 理由

- 目前只有 6 個檔案，且各有明確的職責
- IAppContext.ts、ICharacterContext.ts、IRunContext.ts 是不同的上下文
- WithRunIdAndVersion.ts 是通用基底
- AppContextService.ts 是服務實作
- **內聚度已經很高**，合併反而降低可讀性

---

### 6️⃣ **run-lifecycle 層**

**狀態**: ❌ 不建議合併

#### 理由

- 目前只有 1 個主要服務 + 1 個 Error 類
- RunInitializationService.ts (132 行) 已控制在合理範圍內
- 職責單一且明確

---

### 7️⃣ **stage-progression 層**

**狀態**: ❌ 不建議合併

#### 理由

- 目前只有 1 個服務
- 代碼量小且職責清晰

---

### 8️⃣ **stash 層**

**狀態**: ❌ 不建議合併

#### 理由

- 目前只有 StashService.ts
- 未來可能擴展（倉庫擴容、物品排序等）

---

## 📊 合併預期效果

### 當前狀態

```
application/ 層的 TS 檔案: 36 個
```

### 合併後

```
application/ 層的 TS 檔案: 28 個 (減少 8 個)

變化明細:
- content-generation/factory: 3 → 1 (-2 個)
- item-generation/service: 5 → 3 (-2 個)
- item-generation/helper: 1 → 0 (合併入 service，-1 個)
- static-config: 8 → 5 (-3 個)
```

### 檔案大小預測

- AffixFactory + EnemyFactory + UltimateFactory → InstanceFactory.ts (~140 行) ✅
- ItemConstraintService + ItemRollService + ItemModifierAggregationService → ItemRollAggregate.ts (~85 行) ✅
- 所有 Store 實作 → ConfigStores.ts (~150 行) ✅

**全部都在 200-500 行的健康範圍內**

---

## 🎬 實施步驟

### 優先度 1（立即實施）

```
1. 合併 content-generation/factory → InstanceFactory.ts
   - 3 個檔案 → 1 個檔案
   - 0 風險（只是內部工廠）

2. 合併 item-generation 服務
   - 5 個檔案 → 3 個檔案
   - 零風險（API 無變化）
```

### 優先度 2（下個迭代）

```
3. 重構 static-config
   - 8 個檔案 → 5 個檔案
   - 低風險（都是配置層）
```

### 優先度 3（保持現狀）

```
其他層級暫不調整
```

---

## 📝 合併後檔案結構預覽

```
application/
├── content-generation/
│   ├── factory/
│   │   └── InstanceFactory.ts          ← 新
│   ├── helper/
│   │   └── TagStatistics.ts
│   └── service/
│       └── EnemyGenerationService.ts
├── item-generation/
│   ├── factory/
│   │   └── ItemFactory.ts
│   ├── helper/                         ← 刪除此目錄
│   └── service/
│       ├── ItemGenerationService.ts
│       ├── ItemInstantiationService.ts
│       └── ItemRollAggregate.ts        ← 新
├── core-infrastructure/
│   ├── context/
│   │   ├── interface/
│   │   │   ├── IAppContext.ts
│   │   │   ├── ICharacterContext.ts
│   │   │   ├── IRunContext.ts
│   │   │   ├── IStashContext.ts
│   │   │   └── WithRunIdAndVersion.ts
│   │   └── service/
│   │       └── AppContextService.ts
│   ├── repository/
│   │   └── IRepositories.ts
│   └── static-config/
│       ├── IConfigStores.ts            ← 保持
│       ├── ConfigStores.ts             ← 新（合併 5 個 Store）
│       ├── ConfigAssembler.ts          ← 新
│       ├── IConfigLoaders.ts           ← 新（合併 5 個 Loader 介面）
│       └── loader/                     ← 保持具體實作（來源可能不同）
├── run-lifecycle/
│   └── service/
│       └── RunInitializationService.ts
├── stage-progression/
│   └── service/
│       └── StageNodeGenerationService.ts
└── stash/
    └── service/
        └── StashService.ts
```

---

## ⚠️ 注意事項

1. **合併前執行測試** - 確保單位測試都通過
2. **更新 import 路徑** - 所有引用這些檔案的地方都要更新
3. **保持 git 歷史** - 使用 `git mv` 而非刪除重建
4. **逐步合併** - 不要一次全部做，按優先度執行

---

## 🏁 結論

**建議合併掉 8 個檔案**，減少檔案跳轉成本，同時保持代碼內聚度和可讀性。
核心原則是只合併**已經內聚、沒有其他地方使用、職責高度相關**的檔案。
