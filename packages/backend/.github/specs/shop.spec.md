# Shop 模組

## 簡介

Shop 模組負責商店系統，包括物品刷新、購買、出售和動態定價。支援難度和章節影響的價格調整，提供事件驅動的商店操作。最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- 章節號：影響物品價格和可用性。
- 物品ID：指定購買或出售的物品。

### 主要輸出

- IRefreshResult：刷新後的物品列表和相關資訊。
- IPurchaseResult：購買操作的結果和花費金幣。
- ISellResult：出售操作的結果和獲得金幣。

## 元件盤點

- ShopManager：商店管理器，處理刷新、購買和出售邏輯。
- PricingEngine：定價引擎，根據稀有度、難度和章節計算價格。
- 介面層：IShopManager、IShopConfig等，定義商店操作契約。
- 適配器介面：IInventoryAdapter、IDifficultyAdapter等，抽象外部依賴。
- 錯誤處理：ShopError等，自訂錯誤類別。
- 事件系統：ShopEvents，定義商店相關事件。

## 模組依賴誰?或被誰依賴?

Shop 模組依賴 item-generator 模組的物品生成，inventory 模組的管理，以及 difficulty-scaler 模組的難度資訊。Shop 模組被 UI 模組依賴，用於顯示商店介面，以及 gameplay 模組依賴，用於遊戲進程中的商店互動。
