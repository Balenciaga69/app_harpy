# Replay 模組

## 簡介

Replay 模組負責重播戰鬥結果，提供播放控制功能如播放、暫停、停止、快進等，並通過事件系統通知狀態變化。最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- CombatResult：包含戰鬥快照和日誌資料，用於載入重播內容。

### 主要輸出

- ReplayEvent：事件通知，包括載入、播放、暫停等狀態變化。
- CombatSnapshot：特定tick的戰鬥狀態快照。
- CombatLogEntry[]：指定範圍或tick的戰鬥日誌條目。
- ReplayState：唯讀的重播狀態資訊。

## 元件盤點

- ReplayEngine：核心引擎，整合所有元件，處理用戶操作和事件發射。
- PlaybackStateMachine：狀態機，管理播放狀態轉換和tick進度。
- ReplayDataAdapter：資料適配器，載入和查詢快照及日誌資料。
- ReplayError：自訂錯誤類，提供結構化錯誤處理。
- TickScheduler：tick調度器，負責定時觸發tick更新（瀏覽器環境使用BrowserTickScheduler，測試環境使用TestTickScheduler）。
- ReplayEventBus：事件匯流排，實現事件發射和監聽機制。
- 介面層：定義ReplayConfig、ReplayState、ReplayEvent等契約，確保元件間一致性。

## 模組依賴誰?或被誰依賴?

Replay 模組依賴 combat 模組的 CombatResult、CombatSnapshot 和 CombatLogEntry 等資料結構，以及 shared 模組的事件匯流排介面。
Replay 模組被 UI 層或測試模組依賴，用於展示重播介面或驗證重播邏輯。
