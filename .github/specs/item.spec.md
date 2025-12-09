# Item 模組規格說明

## 簡介

Item 模組負責定義和管理遊戲中的物品系統，包括裝備、遺物、詞綴和相關的視角投影。模組提供統一的物品資料結構、工廠模式生成和多層次視角支援，確保物品系統的靈活性和可擴充性。最後更新時間：2025/12/09。

## 輸入與輸出

### 輸入

- 物品定義數據（IItemDefinition, IEquipmentDefinition, IRelicDefinition）：包含物品 ID、效果模板和詞綴池
- 詞綴定義數據（IAffixDefinition）：包含詞綴 ID、數值範圍和生成權重
- 生成參數（隨機種子、難度等）：用於物品實例生成
- 查詢參數（ID 或類型）：用於從註冊表查詢定義

### 輸出

- 物品定義實例：查詢到的物品或詞綴定義數據
- 物品實例（IEquipmentInstance, IRelicInstance）：生成的具體物品物件
- 詞綴實例（IAffixInstance）：生成的詞綴物件
- 視角投影（ICombatItemView, IInventoryItemView, IUIItemView）：針對不同場景的物品表示
- 錯誤資訊（ItemError）：註冊或生成失敗時的錯誤訊息

## 元件盤點

### 定義元件

- IItemDefinition：物品核心定義介面，作為裝備和遺物的基礎，提供效果模板和詞綴池。
- IEquipmentDefinition：裝備定義介面，包含槽位、基礎屬性和稀有度。
- IRelicDefinition：遺物定義介面，支援堆疊機制。
- IAffixDefinition：詞綴定義介面，定義數值範圍、權重和分類標籤。
- EquipmentSlot：裝備槽位類型定義。
- EquipmentRarity：裝備稀有度類型定義。

### 實例元件

- IEquipmentInstance：裝備實例介面，包含唯一 ID、定義 ID 和詞綴列表。
- IRelicInstance：遺物實例介面，包含唯一 ID、定義 ID 和堆疊數量。
- IAffixInstance：詞綴實例介面，包含定義 ID 和滾動值。

### 工廠元件

- CombatItemFactory：戰鬥物品工廠，負責生成戰鬥相關的物品實例。
- EffectFactory：效果工廠，負責從物品定義生成對應的效果。

### 投影元件

- ICombatItemView：戰鬥視角的物品投影，包含戰鬥所需資訊。
- IInventoryItemView：倉庫視角的物品投影，包含倉庫管理資訊。
- IUIItemView：UI 視角的物品投影，包含介面顯示資訊。

### 註冊表元件

- ItemDefinitionRegistry：物品定義註冊表，提供物品定義的註冊和查詢。
- AffixDefinitionRegistry：詞綴定義註冊表，提供詞綴定義的註冊和查詢。

### 工具元件

- AffixRoller：詞綴滾動器，負責根據定義生成隨機詞綴實例。

### 錯誤處理元件

- ItemError：物品領域的專屬錯誤類別，提供註冊重複、定義不存在等錯誤訊息。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- 無直接依賴：作為基礎定義模組，不依賴其他模組

### 被依賴的模組

- logic/item-generator：物品生成器，依賴物品定義進行隨機生成
- logic/combat：戰鬥系統，依賴物品實例和視角進行戰鬥計算
- logic/inventory：倉庫系統，依賴物品定義和投影進行物品管理
- UI 層：物品顯示，依賴視角投影進行介面渲染
- logic/attribute-system：屬性系統，依賴物品效果進行屬性修改
