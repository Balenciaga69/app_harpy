# ShopGambling 模組實作報告

## 實作摘要

**模組名稱：** ShopGambling (商店賭博系統)  
**完成時間：** 2025-01-16  
**狀態：** ✅ 核心功能已完成

---

## 已實作內容

### 檔案統計

- **Interfaces 層**：10 個檔案
- **Domain 層**：6 個檔案
- **App 層**：3 個檔案
- **文件**：README.md + spec 更新
- **總計**：20 個檔案

### 核心功能

1. **老虎機系統 (Slot Machine)**
   - 3 轉軸，6 種符號（7, BAR, CHERRY, LEMON, ORANGE, PLUM）
   - 加權隨機選擇（7 權重 1，BAR 權重 2，CHERRY 權重 3，其他權重 4）
   - 5 條支付線（橫 3 + 斜 2）
   - 8 種賠付條件（三個 7 最高，一個 CHERRY 最低）

2. **固定賠率系統 (Fixed Odds)**
   - 高風險：18% 機率 × 5x 賠率
   - 中風險：30% 機率 × 3x 賠率
   - 低風險：60% 機率 × 1.5x 賠率

3. **下注驗證系統**
   - 最小/最大下注百分比限制（預設 0.1% ~ 10%）
   - 可用金幣驗證
   - 絕對上限檢查（可選）
   - 風險警告（超過 5% 總資產）

4. **隨機數生成 (RNG)**
   - 基於 Chance.js 的確定性隨機數
   - 支援 seed 回放
   - 提供 integer, float, pick, weighted 方法

5. **賠付計算**
   - 賭場優勢 (House Edge) 控制
   - 公式：`basePayout × (1 - houseEdge)`
   - 預設賭場優勢：5%

---

## 架構設計

### 分層架構

```
interfaces (介面層)
   ↑
domain (領域層)
   ↑
app (應用層)
   ↑
infra (基礎設施層) ⏳ 待實作
```

### 依賴關係

- **Domain 層**依賴 interfaces 層（IRNGService, IGamblingConfig）
- **App 層**依賴 interfaces + domain 層
- **完全單向依賴**，無循環引用

### 設計模式

- **Strategy Pattern**：不同遊戲引擎（SlotEngine, FixedOddsEngine）實作統一介面
- **Dependency Injection**：所有類別透過建構子注入依賴
- **Immutable State**：所有方法返回新狀態，不修改輸入

---

## API 使用範例

### 老虎機下注

```typescript
import { GamblingOrchestrator, GameMode } from '@/game-play/shop-gambling'

const orchestrator = new GamblingOrchestrator()

const result = await orchestrator.placeBet(
  {
    betAmount: 100,
    gameMode: GameMode.SLOT,
    slotMeta: {},
    seed: 'deterministic-seed-123',
  },
  {
    availableGold: 1000,
    totalAssets: 1500,
  }
)

console.log(result.netProfit) // 可能結果：350 (假設三個 7)
```

### 固定賠率下注

```typescript
const result = await orchestrator.placeBet(
  {
    betAmount: 200,
    gameMode: GameMode.FIXED_ODDS,
    fixedOddsMeta: { selectedRiskLevel: 'high' },
    seed: 'fixed-odds-seed-456',
  },
  { availableGold: 1000, totalAssets: 1500 }
)

console.log(result.outcome) // { isWin: true, multiplier: 5 }
console.log(result.payoutAmount) // 950 (200 × 5 × 0.95)
```

---

## 已知限制與待改進

### ⏳ Infra 層未實作

- **TransactionAdapter**：目前使用模擬交易
- **整合需求**：需與 Inventory/Wallet 整合執行真實金錢變動

### ❌ RiskManager 未實作

- **功能**：監控期望值、玩家行為、賭注分布
- **狀態**：規格中提到但未實作，可作為未來擴展

### 命名衝突

- ShopGambling 與 PreCombat 存在命名衝突（`IBetRequest`, `IBetValidationResult`）
- 解決方案：不在 `game-play/index.ts` 中 re-export，需直接從模組導入

```typescript
// ❌ 無法使用
import { IBetRequest } from '@/game-play'

// ✅ 正確用法
import { IBetRequest } from '@/game-play/shop-gambling'
```

---

## 測試建議

### 單元測試重點

1. **RNGService**：相同種子產生相同序列
2. **SlotEngine**：固定種子產生可預期結果
3. **FixedOddsEngine**：機率計算正確
4. **BetValidator**：邊界條件驗證
5. **PayoutCalculator**：賭場優勢計算正確

### 統計測試

- 執行 100,000 次模擬驗證期望值接近設定
- 驗證符號權重分布
- 驗證風險等級勝率

### 整合測試

- 完整下注流程（驗證 → 執行 → 計算 → 交易）
- 確定性回放（相同種子產生相同結果）
- 錯誤處理（餘額不足、無效參數）

---

## 檔案清單

### Interfaces 層 (10 檔案)

1. `IGamblingConfig.ts` - 配置介面 + GameMode 常數
2. `IBetRequest.ts` - 下注請求介面
3. `IGamblingResult.ts` - 賭博結果介面
4. `IRNGService.ts` - RNG 服務介面
5. `ISlotEngine.ts` - 老虎機引擎介面
6. `IFixedOddsEngine.ts` - 固定賠率引擎介面 + RiskLevel 常數
7. `IBetValidator.ts` - 下注驗證器介面
8. `IPayoutCalculator.ts` - 賠付計算器介面
9. `IGamblingOrchestrator.ts` - 編排器介面
10. `index.ts` - 匯出所有介面

### Domain 層 (6 檔案)

1. `RNGService.ts` - Chance.js 包裝器
2. `GamblingConfig.ts` - 預設配置常數
3. `SlotEngine.ts` - 老虎機引擎實作
4. `FixedOddsEngine.ts` - 固定賠率引擎實作
5. `PayoutCalculator.ts` - 賠付計算器實作
6. `index.ts` - 匯出所有領域元件

### App 層 (3 檔案)

1. `BetValidator.ts` - 下注驗證器實作
2. `GamblingOrchestrator.ts` - 編排器實作
3. `index.ts` - 匯出所有應用元件

### 文件 (2 檔案)

1. `README.md` - 使用文件與範例
2. `.github/specs/game-play/shop-gambling.spec.md` - 規格文件更新

---

## 總結

ShopGambling 模組已完成核心功能實作，提供完整的老虎機與固定賠率賭博系統。系統設計遵循 SOLID 原則，支援確定性回放，具備良好的可測試性與可擴展性。目前缺少 Infra 層的交易整合，待與 Inventory 系統整合後即可投入使用。

**編譯狀態：** ✅ 無錯誤  
**下一步：** 實作 TransactionAdapter 整合 Inventory 系統
