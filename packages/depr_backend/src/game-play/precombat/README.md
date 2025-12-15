# PreCombat 模組

戰鬥前準備模組，負責生成賽前變數、處理血量區間下注、提供 reroll 功能。

## 功能概述

### 賽前變數系統

- 隨機生成 1-3 個影響雙方的戰鬥變數
- 支援 8 種變數類型（冰緩、復活率、充能、攻速、傷害、防禦、燃燒、流血）
- 基於難度係數調整變數強度
- 使用權重系統控制出現機率

### 血量區間下注

- 4 個下注區間：CRITICAL (1-10%, 8x)、LOW (11-30%, 4x)、MEDIUM (31-60%, 2x)、HIGH (61-100%, 1.2x)
- 下注金額為玩家總資產的百分比（1%-50%）
- 猜中獲得倍率獎勵，猜錯僅得基礎獎勵

### Reroll 功能

- 花費金幣重新生成變數
- 成本指數增長（500 → 1000 → 2000）
- 支援次數限制或無限制模式

## 快速開始

```typescript
import { PreCombatOrchestrator, HealthBracket } from '@/game-play/precombat'

const orchestrator = new PreCombatOrchestrator()

// 生成賽前狀態
const state = orchestrator.generatePreCombat(encounterContext, playerSummary)

// 下注
const withBet = orchestrator.placeBet(state, {
  playerSummary,
  bracket: HealthBracket.MEDIUM,
  betPercentOfAssets: 0.1,
})

// 確認
const final = orchestrator.confirmAndStartCombat(withBet)
```

## 架構

```
precombat/
├── interfaces/    # 契約定義
├── domain/        # 核心邏輯（生成器、下注服務）
├── app/          # 協調器（編排器、reroll 控制器）
└── infra/        # 基礎設施（效果應用器）
```

## 關鍵設計

### 可重現性

所有隨機性基於 seed，確保測試與重播一致。

### 單向依賴

interfaces ← domain ← app ← infra，實作永不引用實作。

### 無狀態

所有方法為純函數或返回新狀態，不修改輸入。

## 相關文檔

- [完整規格](../../../.github/specs/game-play/precombat.spec.md)
- [遊戲設計大綱](../../../.github/instructions/game.prompt.md)
