---
title: ShopGambling（賭博）模組規格
updated: 2025-12-14
---

## 簡介

描述 ShopGambling（賭博系統）的規格，核心為拉霸/下注等賭博機制的模擬器與風險控制。模組負責處理押注、隨機結果生成（seed 支援）、賠率計算、結果結算、以及與商店（Shop）和玩家資產（Inventory）之間的整合契約。目標是讓賭博成為遊戲的核心賭注體驗，同時保有可測試性與公平度控制。

## 輸入與輸出

- 輸入
  - GamblingConfig
    - gameMode: 'slot' | 'fixedOdds' | 'custom'
    - minBetPercent: number（相對玩家總資產的最小下注百分比）
    - payoutTable: PayoutEntry[]（依遊戲模式不同）
    - houseEdgeTarget?: number（用以調控期望值）
  - betRequest
    - playerId
    - betAmount（以貨幣表示，或 % 表示需經計算轉換）
    - betMeta?（例如：slot 的線數、固定賠率的選項）
  - seed?（選用）

- 輸出
  - GamblingResult
    - outcome（結構化結果，例：slot symbols, winLines, multiplier）
    - payoutAmount
    - updatedPlayerAssets（或 TransactionResult）
    - events emitted: shop.gambling.betPlaced, shop.gambling.result, shop.gambling.payout

## 合約（Contract）

- 所有隨機性應可由 seed 控制並保存到 RunState，如需 Replay 或測試能重現。
- 下注必須先驗證玩家資產；失敗則回傳明確錯誤（InsufficientFunds）且不改變狀態。
- 結算必須輸出 TransactionResult（成功/失敗、變動前後餘額、交易 ID）。
- 期望值遵循 houseEdgeTarget，若實際長期期望偏離過大需啟動風險調整（見風險控制）。

## 元件盤點（按功能元件）

- RNG Service（domain/infra）
  - 功能：封裝隨機數生成，支援外部傳入 seed，提供 deterministic RNG。

- SlotEngine（domain）
  - 功能：模擬拉霸機（symbols、reels、paylines、wilds、scatter 等），評估贏線並計算倍數。
  - 輸入：betMeta（線數/注數）、seed、payoutTable
  - 輸出：GamblingResult（含細節）

- FixedOddsEngine（domain）
  - 功能：處理固定賠率（例如下注某一區間或事件發生與否），計算勝/負機率與賠率。

- BetValidator（app）
  - 功能：驗證 betAmount、最小/最大下注限制、玩家資產。

- PayoutCalculator（domain）
  - 功能：根據引擎輸出與規則計算最終 payout（含稅或 house cut），並保留可追蹤的計算證明。

- RiskManager（app/domain）
  - 功能：即時監控 long-run EV（期望值）、玩家連勝/連輸行為、賭注分布，並在必要時調整 houseEdge、限制下注或替換 RNG 演算法（風險緩解策略）。

- TransactionAdapter（infra）
  - 功能：與 Inventory/Wallet 整合，執行金錢扣款與派發、返回 TransactionResult

- GamblingOrchestrator（app）
  - 功能：高階 API：placeBet(player, betRequest) -> returns GamblingResult；負責事件發送與審計日誌。

## 子功能 (Subfeatures) 建議

- slot/core：SlotEngine、symbols、paylines、payout table
- odds/core：FixedOddsEngine、賠率表管理
- risk/monitor：RiskManager、EV 計算器、風險政策
- infra/tx：TransactionAdapter、RNG Service

每個 subfeature 建議再拆成 app/domain/infra/interfaces 層以遵守單向依賴規則。

## 模組依賴誰？或被誰依賴？

- 依賴
  - Inventory / Wallet（執行金錢變動）
  - Run（控制最低注額隨章節上升）
  - DifficultyScaler（可選，用於調整最低注額或風險偏好）
  - EventBus（發送 betPlaced/result/payout 事件）

- 被誰依賴
  - Shop（UI/商店邏輯調用赌博 API）
  - Analytics / Telemetry（收集賭博行為數據）

## 核心流程（簡述）

1. Player 在 Shop UI 發出 betRequest（含 betAmount 與 betMeta）
2. BetValidator 驗證下注，TransactionAdapter 鎖定賭金（暫扣）
3. GamblingOrchestrator 呼叫相對應的 Engine（SlotEngine 或 FixedOddsEngine），傳入 RNG(seed) 與 betMeta
4. Engine 回傳 outcome，PayoutCalculator 計算 payoutAmount
5. TransactionAdapter 發放 payout（或退回賭金），並回傳 TransactionResult
6. Orchestrator 發出 shop.gambling.result 與 shop.gambling.payout 事件

## 賭博模擬細節（Slot 舉例）

- Symbols & Reels
  - 可配置 reel 帶，每個 reel 為 symbols[]（符號權重可調）
  - spin 結果由 RNG 決定每條 reel 的符號索引

- Paylines 與 Win 評估
  - 支援多條 payline 與 scatter/wild 规则
  - 每條 win 由 payoutTable 對照 symbols pattern 計算倍數

- Payout 與 House Edge
  - payout = betAmount \* multiplier
  - long-run EV 需滿足：EV = (平均 payout) / betAmount <= 1 - houseEdgeTarget

## 風險控制與公平性

- House Edge 調控
  - RiskManager 定期（或在高波動時）計算實際 EV，若偏離目標則微調符號權重或 payoutTable

- 負責任的限制
  - 單注上限、單玩家日上限、連勝/連輸偵測（異常行為標記）

- 可審計性
  - 所有隨機性 seed、RNG 狀態、結果與交易都需可導出以便外部稽核與 Replay

## 邊界情況與注意點

- Replay 與 determinism：所有隨機結果必須能從 seed 與輸入重現。
- 性能：大量玩家同時拉霸時，Engine 應保持低延遲（單次操作 < 100 ms 為目標）
- 法律/合規：遊戲內賭博僅為遊戲幣，若有實際金錢需求需額外考量法規（本 spec 假設遊戲內貨幣）。

## 測試建議

- 單元測試
  - RNG Service 在相同 seed 下輸出一致序列
  - SlotEngine 在固定 seed 與配置下輸出可預期 outcome
  - PayoutCalculator 在多種情況下計算正確

- 迴圈/統計測試
  - 大量模擬（例如 1e5 spins）以估算實際 EV 並與 houseEdgeTarget 比對

- 整合測試
  - placeBet -> locked funds -> result -> payout 整體交易一致性（含失敗回滾）

## 開發者的碎碎念

- 賭博系統要讓玩家覺得刺激但不可破壞遊戲經濟，houseEdgeTarget 是核心工具。
- 隨機種子與可審計性對測試和信任非常重要，務必從一開始就保留所有結果所需的最小 state。
- RiskManager 是持續運營的關鍵：初期可以做被動監控，後續再做自動校正。
