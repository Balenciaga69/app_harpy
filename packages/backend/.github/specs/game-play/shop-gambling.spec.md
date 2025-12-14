---
title: ShopGambling（賭博）模組規格
updated: 2025-12-14
---

## 簡介

描述 ShopGambling（賭博系統）的規格，核心為拉霸/下注等賭博機制的模擬器與風險控制。模組負責處理押注、隨機結果生成（seed 支援）、賠率計算、結果結算、以及與商店（Shop）和玩家資產（Inventory）之間的整合契約。目標是讓賭博成為遊戲的核心賭注體驗，同時保有可測試性與公平度控制。

**最後更新時間：** 2025-01-16

**實作狀態：** ✅ 已完成核心功能（interfaces/domain/app 層），infra 層待整合 Inventory

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

### ✅ Interfaces 層（已完成）

- **IGamblingConfig**: 賭博配置介面，定義遊戲模式、賭場優勢、各遊戲配置
  - 檔案：`interfaces/IGamblingConfig.ts`
  - 匯出常數：`GameMode` (SLOT / FIXED_ODDS / CUSTOM)
- **IBetRequest / IGamblingResult**: 下注請求與結果介面
  - 檔案：`interfaces/IBetRequest.ts`, `interfaces/IGamblingResult.ts`
  - 支援 slot 與 fixed odds 的專屬元數據
- **IRNGService**: 隨機數生成服務介面
  - 檔案：`interfaces/IRNGService.ts`
  - 方法：integer, float, pick, weighted
- **ISlotEngine / IFixedOddsEngine**: 遊戲引擎介面
  - 檔案：`interfaces/ISlotEngine.ts`, `interfaces/IFixedOddsEngine.ts`
  - 定義遊戲結果產生邏輯
- **IBetValidator**: 下注驗證器介面
  - 檔案：`interfaces/IBetValidator.ts`
  - 返回 `IBetValidationResult`（isValid, error, warnings）
- **IPayoutCalculator**: 賠付計算器介面
  - 檔案：`interfaces/IPayoutCalculator.ts`
  - 處理 house edge 扣除
- **IGamblingOrchestrator**: 賭博編排器介面
  - 檔案：`interfaces/IGamblingOrchestrator.ts`
  - 高階 API：`placeBet()`, `getDefaultConfig()`

### ✅ Domain 層（已完成）

- **RNGService**: Chance.js 包裝器
  - 檔案：`domain/RNGService.ts`
  - 實作：封裝 Chance.js，提供 deterministic RNG
  - 方法：integer, float, pick, weighted
- **SlotEngine**: 老虎機引擎實作
  - 檔案：`domain/SlotEngine.ts`
  - 實作：3 轉軸，6 種符號（7/BAR/CHERRY/LEMON/ORANGE/PLUM），加權隨機
  - 支付線：5 條（橫 3 + 斜 2）
  - 賠付條件：8 種（三個 7、三個 BAR、兩個 CHERRY 等）
- **FixedOddsEngine**: 固定賠率引擎實作
  - 檔案：`domain/FixedOddsEngine.ts`
  - 實作：3 種風險等級
    - 高風險：18% 機率贏得 5x
    - 中風險：30% 機率贏得 3x
    - 低風險：60% 機率贏得 1.5x
- **PayoutCalculator**: 賠付計算器實作
  - 檔案：`domain/PayoutCalculator.ts`
  - 計算公式：`basePayout × (1 - houseEdge)`
- **GamblingConfig**: 預設配置常數
  - 檔案：`domain/GamblingConfig.ts`
  - 匯出：`DEFAULT_SLOT_CONFIG`, `DEFAULT_FIXED_ODDS_CONFIG`

### ✅ App 層（已完成）

- **BetValidator**: 下注驗證器實作
  - 檔案：`app/BetValidator.ts`
  - 功能：驗證下注金額、玩家資產、最小/最大百分比限制（預設 0.1%~10%）
  - 警告：下注超過總資產 5% 時提醒
- **GamblingOrchestrator**: 賭博編排器實作
  - 檔案：`app/GamblingOrchestrator.ts`
  - 功能：統籌驗證、引擎、計算、交易流程
  - API：`placeBet(betRequest, playerAssets, config?)` → `IGamblingResult`

### ⏳ Infra 層（待實作）

- **TransactionAdapter**: 交易適配器
  - 計畫檔案：`infra/TransactionAdapter.ts`
  - 功能：與 Inventory/Wallet 整合，執行金錢扣款與派發
  - 狀態：目前 GamblingOrchestrator 使用模擬交易

### ❌ RiskManager（未實作）

- **功能**：即時監控 long-run EV、玩家連勝/連輸行為、賭注分布
- **狀態**：規格中提到但未實作，可作為未來擴展功能

## 檔案結構（已實作）

```
src/game-play/shop-gambling/
├── interfaces/              # 介面層（10 檔案）
│   ├── IGamblingConfig.ts   # 配置介面 + GameMode 常數
│   ├── IBetRequest.ts       # 下注請求 + slot/fixed odds 元數據
│   ├── IGamblingResult.ts   # 賭博結果 + 交易資訊
│   ├── IRNGService.ts       # RNG 服務介面
│   ├── ISlotEngine.ts       # 老虎機引擎介面 + 符號權重/支付線/賠付條件配置
│   ├── IFixedOddsEngine.ts  # 固定賠率引擎介面 + RiskLevel 常數
│   ├── IBetValidator.ts     # 下注驗證器介面 + 驗證結果
│   ├── IPayoutCalculator.ts # 賠付計算器介面 + 賠付計算結果
│   ├── IGamblingOrchestrator.ts # 編排器介面
│   └── index.ts             # 匯出所有介面
│
├── domain/                  # 領域層（6 檔案）
│   ├── RNGService.ts        # Chance.js 包裝器
│   ├── GamblingConfig.ts    # 預設配置常數
│   ├── SlotEngine.ts        # 老虎機引擎實作
│   ├── FixedOddsEngine.ts   # 固定賠率引擎實作
│   ├── PayoutCalculator.ts  # 賠付計算器實作
│   └── index.ts             # 匯出所有領域元件
│
├── app/                     # 應用層（3 檔案）
│   ├── BetValidator.ts      # 下注驗證器實作
│   ├── GamblingOrchestrator.ts # 編排器實作
│   └── index.ts             # 匯出所有應用元件
│
├── index.ts                 # 模組主入口
└── README.md                # 使用文件
```

**依賴架構：**

- interfaces ← domain ← app
- Domain 依賴 interfaces（IRNGService, IGamblingConfig）
- App 依賴 interfaces + domain（編排器整合所有元件）

**注意事項：**

- ShopGambling 與 PreCombat 存在命名衝突（`IBetRequest`, `IBetValidationResult`）
- 因此不在 `game-play/index.ts` 中 re-export，需直接從模組導入

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

## 使用範例

### 老虎機下注

```typescript
import { GamblingOrchestrator, GameMode } from '@/game-play/shop-gambling'

const orchestrator = new GamblingOrchestrator()

const betRequest = {
  betAmount: 100,
  gameMode: GameMode.SLOT,
  slotMeta: {},
  seed: 'slot-seed-123',
}

const playerAssets = {
  availableGold: 1000,
  totalAssets: 1500,
}

const result = await orchestrator.placeBet(betRequest, playerAssets)
// result.outcome: { reelSymbols: ['7', '7', '7'], winLines: [...] }
// result.payoutAmount: 450 (假設三個 7 賠付 5x × 0.95 house edge)
// result.netProfit: 350
```

### 固定賠率下注

```typescript
const betRequest = {
  betAmount: 200,
  gameMode: GameMode.FIXED_ODDS,
  fixedOddsMeta: { selectedRiskLevel: 'high' },
  seed: 'fixed-odds-seed-456',
}

const result = await orchestrator.placeBet(betRequest, playerAssets)
// result.outcome: { isWin: true, multiplier: 5 }
// result.payoutAmount: 950 (200 × 5 × 0.95)
// result.netProfit: 750
```

---

## 測試建議

### 單元測試

- **RNGService**: 驗證相同種子產生相同隨機序列
- **SlotEngine**: 驗證轉軸生成、支付線評估、賠付計算
- **FixedOddsEngine**: 驗證風險等級機率、賠率計算
- **PayoutCalculator**: 驗證賭場優勢扣除邏輯
- **BetValidator**: 驗證金額驗證規則、警告觸發

### 統計測試

- **大量模擬**：執行 1e5 次 spins 估算實際 EV 並與 houseEdgeTarget 比對
- **符號分布**：驗證加權隨機符號分布符合設定權重
- **風險等級機率**：驗證固定賠率三種風險等級的勝率接近設定值

### 整合測試

- **GamblingOrchestrator**: 驗證完整下注流程（驗證 → 執行 → 計算 → 交易）
- **確定性回放**: 使用相同種子驗證結果一致性
- **邊界條件**: 最小/最大下注金額、零金幣、超額下注
- **交易一致性**: placeBet → locked funds → result → payout（含失敗回滾）

### 壓力測試

- **大量下注**: 驗證效能與記憶體穩定性
- **極端配置**: 高符號數量、多條支付線、複雜賠付條件

## 開發者的碎碎念

- 賭博系統要讓玩家覺得刺激但不可破壞遊戲經濟，houseEdgeTarget 是核心工具。
- 隨機種子與可審計性對測試和信任非常重要，務必從一開始就保留所有結果所需的最小 state。
- RiskManager 是持續運營的關鍵：初期可以做被動監控，後續再做自動校正。
