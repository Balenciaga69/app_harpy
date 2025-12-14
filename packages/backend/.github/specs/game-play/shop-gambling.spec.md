# ShopGambling 模組

## 簡介

- 負責商店內的賭博系統，包括：
  - 老虎機遊戲模式，支援多轉軸和支付線。
  - 固定賠率遊戲模式，提供不同風險等級。
  - 下注驗證和賠付計算。
- 支援基於種子的確定性隨機數，確保可重現性。
- 最後更新時間：2025-12-14。

## 輸入與輸出

### 主要輸入

- IBetRequest：下注請求，包含金額、遊戲模式和元數據。
- IPlayerAssets：玩家資產，包含可用金幣和總資產。
- IGamblingConfig：賭博配置，定義遊戲參數和賭場優勢。

### 主要輸出

- IGamblingResult：賭博結果，包含遊戲結果、賠付金額和交易資訊。
- IBetValidationResult：下注驗證結果，包含有效性和錯誤訊息。

## 元件盤點

- GamblingOrchestrator：核心編排器，統籌下注流程。
- SlotEngine：老虎機引擎，處理轉軸旋轉和支付線評估。
- FixedOddsEngine：固定賠率引擎，處理風險等級和機率判定。
- RNGService：隨機數服務，提供確定性隨機生成。
- PayoutCalculator：賠付計算器，計算賭場優勢和最終賠付。
- BetValidator：下注驗證器，檢查金額和資產限制。
- 常數與配置：GamblingConfig 等，定義預設遊戲參數。

## 模組依賴誰?或被誰依賴?

- ShopGambling 模組依賴 nanoid 和 chance 庫，用於 ID 生成和隨機數。
- ShopGambling 模組被 game-play/shop 模組依賴，用於商店賭博功能。
