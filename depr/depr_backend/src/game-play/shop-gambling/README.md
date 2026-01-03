# Shop Gambling Module

## 簡介

Shop Gambling 模組提供商店內的賭博系統，包括老虎機（Slot Machine）與固定賠率（Fixed Odds）兩種遊戲模式。

**核心特性：**

- 基於種子的確定性隨機數生成（支援回放）
- 可配置的賭場優勢（House Edge）控制風險
- 下注金額驗證（最小/最大百分比限制）
- 三轉軸老虎機，5 條支付線
- 固定賠率三種風險等級（高/中/低）

**最後更新時間：** 2025-01-16

---

## 輸入與輸出

**輸入：**

- `IBetRequest`: 下注請求（金額、遊戲模式、元數據、種子）
- `IPlayerAssets`: 玩家資產（可用金幣、總資產）
- `IGamblingConfig`: 賭博配置（遊戲模式、老虎機/固定賠率配置、賭場優勢）

**輸出：**

- `IGamblingResult`: 賭博結果（遊戲結果、賠付金額、淨收益、交易資訊、種子、時間戳）
- `IBetValidationResult`: 下注驗證結果（是否有效、錯誤訊息、警告）

---

## 元件盤點

### Interfaces 層

- **IGamblingConfig**: 賭博配置介面，定義遊戲模式、賭場優勢、各遊戲配置
- **IBetRequest**: 下注請求介面，包含金額、模式、元數據、種子
- **IGamblingResult**: 賭博結果介面，包含遊戲結果、賠付、交易資訊
- **IRNGService**: 隨機數生成服務介面，支援整數、浮點數、加權選擇
- **ISlotEngine**: 老虎機引擎介面，處理轉軸旋轉與支付線評估
- **IFixedOddsEngine**: 固定賠率引擎介面，處理風險等級與機率判定
- **IBetValidator**: 下注驗證器介面，驗證金額是否符合規則
- **IPayoutCalculator**: 賠付計算器介面，計算基礎賠付與扣除賭場優勢
- **IGamblingOrchestrator**: 賭博編排器介面，高階 API 統籌各元件

**常數定義：**

- `GameMode`: 遊戲模式（SLOT / FIXED_ODDS / CUSTOM）
- `RiskLevel`: 風險等級（HIGH / MEDIUM / LOW）

### Domain 層

- **RNGService**: Chance.js 包裝器，提供種子確定性隨機數
  - 支援 integer、float、pick、weighted 方法
- **GamblingConfig**: 預設配置常數
  - `DEFAULT_SLOT_CONFIG`: 3 轉軸老虎機，6 種符號（7/BAR/CHERRY/LEMON/ORANGE/PLUM），5 條支付線，8 種賠付條件
  - `DEFAULT_FIXED_ODDS_CONFIG`: 3 種風險等級（高 18%→5x、中 30%→3x、低 60%→1.5x）
- **SlotEngine**: 老虎機引擎實作
  - 加權隨機選擇轉軸符號（權重：7→1, BAR→2, CHERRY→3, 其他→4）
  - 評估 5 條支付線（橫 3 + 斜 2）
  - 匹配賠付條件（三個 7、三個 BAR、兩個 CHERRY、一個 CHERRY）
- **FixedOddsEngine**: 固定賠率引擎實作
  - 高風險：18% 機率贏得 5x
  - 中風險：30% 機率贏得 3x
  - 低風險：60% 機率贏得 1.5x
- **PayoutCalculator**: 賠付計算器實作
  - 計算公式：`basePayout × (1 - houseEdge)`

### App 層

- **BetValidator**: 下注驗證器實作
  - 驗證金額是否為正數
  - 驗證玩家金幣是否足夠
  - 驗證下注百分比是否在 min/max 範圍內（預設 0.1%~10%）
  - 驗證是否超過絕對上限（可選）
  - 警告：下注超過總資產 5%
- **GamblingOrchestrator**: 賭博編排器實作
  - 統籌驗證、引擎、計算、交易流程
  - `placeBet()`: 執行下注，返回完整結果
  - `getDefaultConfig()`: 取得預設配置

---

## 模組依賴誰？或被誰依賴？

**依賴的模組：**

- `nanoid`: 生成唯一 ID（種子、交易 ID）
- `chance`: 確定性隨機數生成

**被依賴的模組：**

- `game-play/shop`: 商店系統調用賭博功能
- `game-play/inventory`: 交易適配器需要與庫存整合（Infra 層）

**依賴架構：**

```
interfaces ← domain ← app ← infra
```

- Domain 依賴 interfaces（IRNGService, IGamblingConfig）
- App 依賴 interfaces + domain（編排器整合所有元件）
- Infra 將依賴 interfaces + domain（交易適配器整合庫存）

---

## 使用範例

### 老虎機下注

```typescript
import { GamblingOrchestrator, GameMode } from '@/game-play/shop-gambling'

const orchestrator = new GamblingOrchestrator()

const betRequest = {
  betAmount: 100,
  gameMode: GameMode.SLOT,
  slotMeta: {}, // 老虎機無需額外元數據
  seed: 'deterministic-seed-123', // 可選，未提供會自動生成
}

const playerAssets = {
  availableGold: 1000,
  totalAssets: 1500,
}

const result = await orchestrator.placeBet(betRequest, playerAssets)

console.log(result.outcome) // ISlotOutcome { reelSymbols: ['7', '7', '7'], winLines: [...] }
console.log(result.payoutAmount) // 450 (假設三個 7 賠付 5x，扣除賭場優勢)
console.log(result.netProfit) // 350 (賠付 - 下注)
```

### 固定賠率下注

```typescript
const betRequest = {
  betAmount: 200,
  gameMode: GameMode.FIXED_ODDS,
  fixedOddsMeta: {
    selectedRiskLevel: 'high', // 高風險 18% 機率贏 5x
  },
  seed: 'fixed-odds-seed-456',
}

const result = await orchestrator.placeBet(betRequest, playerAssets)

console.log(result.outcome) // IFixedOddsOutcome { isWin: true, multiplier: 5 }
console.log(result.payoutAmount) // 950 (200 × 5 × 0.95)
console.log(result.netProfit) // 750
```

### 自訂配置

```typescript
const customConfig = {
  gameMode: GameMode.SLOT,
  houseEdge: 0.08, // 8% 賭場優勢
  slotConfig: {
    reelCount: 3,
    symbols: [...], // 自訂符號權重
    paylines: [...], // 自訂支付線
    payoutConditions: [...] // 自訂賠付條件
  }
}

const result = await orchestrator.placeBet(betRequest, playerAssets, customConfig)
```

---

## 測試建議

### 單元測試

- **RNGService**: 驗證相同種子產生相同隨機序列
- **SlotEngine**: 驗證轉軸生成、支付線評估、賠付計算
- **FixedOddsEngine**: 驗證風險等級機率、賠率計算
- **PayoutCalculator**: 驗證賭場優勢扣除邏輯
- **BetValidator**: 驗證金額驗證規則、警告觸發

### 整合測試

- **GamblingOrchestrator**: 驗證完整下注流程（驗證 → 執行 → 計算 → 交易）
- **確定性回放**: 使用相同種子驗證結果一致性
- **邊界條件**: 最小/最大下注金額、零金幣、超額下注

### 壓力測試

- **大量下注**: 驗證效能與記憶體穩定性
- **極端配置**: 高符號數量、多條支付線、複雜賠付條件

---

## 開發者的碎碎念

（此段落由開發者手動填寫，AI 更新文件時保留此段落內容不變）

<!-- 在此記錄開發過程中的想法、決策原因、未來改進方向等 -->
