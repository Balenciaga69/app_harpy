# 商店模組規格

## 簡介

商店模組專注於交易與商品管理，提供購買出售功能，並負責商品刷新與生成。模組與 ItemGenerator 緊密整合，生成裝備遺物實例。排除賭博邏輯（由 ShopGambling 處理）以維持單一職責。最後更新時間：2025/12/10。

## 輸入與輸出

### 主要輸入

- 玩家金幣數量（檢查購買力）
- 當前難度係數（影響商品生成強度）
- 玩家庫存清單（用於出售與空間檢查）
- 章節層數（決定刷新規則與價格調整）

### 主要輸出

- 商品清單（裝備遺物實例與價格）
- 交易結果（狀態更新，包括金幣與庫存變更）
- 領域錯誤（例如金幣不足或庫存滿載）

## 元件盤點

### ShopManager

核心控制器，處理購買出售請求、觸發商品刷新。調用 ItemGenerator 生成商品，並整合事件總線通知庫存更新。提供 refresh、purchase、sell 方法，管理當前商品清單與章節狀態。

### PricingEngine

定價計算器，根據物品稀有度、難度係數與章節層數設定價格。買入價格公式為：基礎值 × 基礎倍率 × (1 + 難度倍率 × 難度) × (1 + 通膨倍率 × 章節)。賣出價格為買入價格 × 折扣率（預設 0.5）。支援稀有度對照表：普通 50、魔法 150、稀有 400、傳說 1000。

### ShopError

錯誤管理系統，定義專屬領域錯誤類別。包含 InsufficientFundsError（金幣不足）、InventoryFullError（庫存滿載）、ItemNotFoundError（物品未找到）、InvalidItemError（無效物品）、PricingError（定價錯誤）。所有錯誤繼承自 ShopError 基類。

### IShopItem

商店商品資料結構，包含商品 ID、物品實例（裝備或遺物）、購買價格、商品類型。用於商品清單展示與交易處理。

### IShopConfig

商店配置介面，定義刷新商品數量範圍、出售折扣率、基礎價格倍率、難度價格倍率、章節通膨倍率等參數。用於初始化 ShopManager 與 PricingEngine。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- ItemGenerator：生成商品實例（裝備遺物），商店依賴其隨機生成邏輯
- DifficultyScaler：提供難度係數以調整商品強度（透過 IDifficultyAdapter）
- Inventory：查詢更新玩家庫存與金幣（透過 IInventoryAdapter）
- EventBus：發佈商店事件（ShopRefreshed、ItemPurchased、ItemSold）

### 被依賴的模組

- RunOrchestrator：商店作為 Run 流程節點，每戰勝利後刷新
- UI 層：顯示商店介面與交易操作
- PersistentStorage：儲存商品清單與狀態（目前前端實現）

## 交易流程細節

### 購買流程

- 驗證商品存在於商品清單
- 檢查玩家金幣是否足夠（拋出 InsufficientFundsError）
- 扣除金幣並加入庫存
- 從商品清單移除已購買商品
- 發佈 ItemPurchased 事件

### 出售流程

- 驗證物品存在於庫存（拋出 ItemNotFoundError）
- 計算出售價格（基於稀有度、難度、章節）
- 從庫存移除物品並增加金幣
- 發佈 ItemSold 事件

### 刷新流程

- 獲取當前難度係數
- 隨機生成商品數量（minItemsPerRefresh 到 maxItemsPerRefresh）
- 調用 ItemGenerator 生成裝備或遺物（70% 裝備，30% 遺物）
- 使用 PricingEngine 計算每件商品價格
- 更新商品清單並發佈 ShopRefreshed 事件

## 事件機制

### ShopRefreshed

商品刷新事件，攜帶新商品清單、難度係數、章節層數。供 UI 更新顯示與其他模組監聽。

### ItemPurchased

購買成功事件，攜帶購買的物品實例與花費金幣。通知庫存與 UI 更新。

### ItemSold

出售成功事件，攜帶物品 ID 與獲得金幣。通知庫存與 UI 更新。

## 適配器介面

### IInventoryAdapter

庫存適配器，提供 getPlayerGold、updatePlayerGold、addItemToInventory、removeItemFromInventory、hasItem 方法。解耦商店與庫存實現，支援依賴注入與測試替換。

### IDifficultyAdapter

難度適配器，提供 getCurrentDifficulty 方法。解耦商店與難度系統，支援依賴注入與測試替換。

## 未來擴充

- 支援商品過期機制或動態庫存
- 整合裝備遺物池選擇邏輯（目前為硬編碼定義 ID）
- 支援特殊商品類型（消耗品或事件卡）
