# 物品生成系統代碼結構

## 系統概述

- 負責根據不同來源（商店刷新、戰鬥獎勵）生成隨機物品
- 目前專注於遺物（Relic）類型的物品生成
- 採用模組化設計，各服務職責分離
- 使用策略模式實現修飾符靈活配置
- Context 驅動，所有生成邏輯依賴遊戲狀態
- 類型安全，使用 TypeScript 確保編譯時檢查
- 統一錯誤處理，使用 Result 類型

## 核心流程

- **來源分類**: 確定生成來源（商店/獎勵）
- **修飾符聚合**: 根據來源選擇並合併修飾符
- **權重骰選**: 依次骰選物品類型、稀有度、具體樣板
- **約束檢查**: 驗證物品是否符合當前遊戲狀態
- **實例生成**: 創建完整的物品聚合對象

## 核心服務架構

### 服務層次結構

```
ItemGenerationService (門面服務)
├── ItemModifierAggregationService (修飾符聚合)
│   └── ItemRollModifierStrategyFactory (策略工廠)
│       └── 各項策略實現類
├── ItemRollService (骰選服務)
├── ItemConstraintService (約束檢查)
└── ItemAggregateService (聚合組裝)
    └── AffixAggregateService (詞綴聚合)
```

### 服務職責分工

#### ItemGenerationService（物品生成服務）

- 統一入口，協調各子服務完成物品生成
- 提供商店物品生成、獎勵物品生成、指定樣板生成等方法

#### ItemModifierAggregationService（修飾符聚合服務）

- 根據來源類型聚合修飾符，處理修飾符合併邏輯
- 支持商店修飾符和獎勵修飾符的聚合

#### ItemRollService（物品骰選服務）

- 執行權重骰選邏輯，應用修飾符調整權重
- 實現稀有度骰選和樣板骰選

#### ItemConstraintService（物品約束服務）

- 檢查物品生成約束條件，篩選可用樣板
- 驗證章節、職業、事件等限制條件

#### ItemAggregateService（物品聚合服務）

- 從模板和記錄創建完整的聚合對象
- 支持單個和批量聚合對象創建

## 修飾符策略系統

### 策略架構

- 定義策略接口 `IItemRollModifierStrategy`
- 通過策略工廠 `ItemRollModifierStrategyFactory` 創建具體策略
- 支持商店和獎勵的不同策略組合

### 商店策略

- **MostFrequentTagModifierStrategy**: 統計已裝備物品TAG頻率，增加最常見TAG權重
- **HighStackRelicModifierStrategy**: 特定物品堆疊數超過閾值時增加其權重（未完整實現）

### 獎勵策略

- **MostFrequentTagRewardModifierStrategy**: 適用於高親合度和金幣獎勵
- **RarityPreferenceRewardModifierStrategy**: 調整稀有度權重分布，適用於高稀有度和Boss獎勵
- **ReverseFrequentTagRewardModifierStrategy**: 將最常見TAG權重設為0，避免重複獲得

### 共享工具函數

- `countEquippedTagOccurrences`: 統計已裝備物品的TAG出現頻率

## 代碼文件組織

### 策略相關文件

- `ItemRollModifierStrategy.ts`: 策略接口定義和具體策略實現
- `ItemRollModifierStrategyFactory.ts`: 策略工廠，負責創建策略實例

### 服務文件

- `ItemModifierAggregationService.ts`: 修飾符聚合服務
- `ItemRollService.ts`: 物品骰選服務
- `ItemConstraintService.ts`: 物品約束服務
- `ItemGenerationService.ts`: 物品生成服務
- `ItemAggregateService.ts`: 物品聚合服務

## 依賴關係

### 服務間依賴

- `ItemGenerationService` 依賴所有其他服務
- `ItemModifierAggregationService` 依賴策略工廠
- `ItemRollService` 依賴約束服務
- `ItemAggregateService` 依賴詞綴聚合服務

### 外部依賴

- 配置存儲訪問器 `IConfigStoreAccessor`
- 上下文快照訪問器 `IContextSnapshotAccessor`
- 權重骰選工具 `WeightRoller`
- 錯誤處理類型 `Result<T>`

### 領域依賴

- Item 領域: 模板、記錄、聚合等核心概念
- PostCombat 領域: 戰鬥獎勵類型
- ItemRoll 領域: 修飾符和配置相關類型

## 設計原則遵循

### SOLID 原則

- **單一職責原則**: 每個服務只負責一個明確的職責
- **開放封閉原則**: 新增策略無需修改現有代碼
- **依賴倒置原則**: 高層模塊依賴抽象接口

### 其他原則

- **組合優於繼承**: 使用策略模式而非繼承
- **顯式依賴原則**: 所有依賴通過構造函數注入
- **錯誤處理統一**: 使用 Result 類型統一錯誤處理

---

_本文檔提供物品生成系統的代碼結構高層次概述。詳細業務邏輯請參考 [`item.new.md`](item.new.md)。_
