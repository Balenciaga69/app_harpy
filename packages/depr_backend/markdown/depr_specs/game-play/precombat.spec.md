# PreCombat 模組

## 簡介

- 負責戰鬥前準備流程，包括：
  - 隨機生成賽前變數（狀態效果、屬性修飾等）。
  - 處理血量區間下注邏輯。
  - 提供變數 reroll 功能。
- 支援可重現的隨機性，基於 seed 確保一致性。
- 最後更新時間：2025-12-14。

## 輸入與輸出

### 主要輸入

- IEncounterContext：遭遇上下文，包含難度係數等。
- IPlayerSummary：玩家摘要，包含資產和 reroll 狀態。
- seed：隨機種子，用於生成可重現結果。
- IBetRequest：下注請求，包含區間和金額百分比。

### 主要輸出

- IPreCombatState：賽前狀態，包含變數、下注和確認狀態。
- IRerollResult：reroll 結果，包含新變數和成本。
- ICombatBettingResult：下注結果，包含倍率和潛在獎勵。

## 元件盤點

- PreCombatOrchestrator：核心協調器，編排生成、下注和 reroll 流程。
- VariableGenerator：變數生成器，基於模板和難度生成隨機變數。
- BettingService：下注服務，處理下注驗證、放置和結算。
- RerollController：reroll 控制器，計算成本並執行 reroll。
- EffectApplier：效果應用器，將變數序列化為戰鬥注入載荷。
- 模板庫：VARIABLE_TEMPLATES 等，定義變數類型和生成邏輯。
- 常數與配置：BettingConfig 等，定義下注區間和成本策略。

## 模組依賴誰?或被誰依賴?

- PreCombat 模組依賴 shared 模組的工具函數，以及 features/effect 模組的狀態效果定義。
- PreCombat 模組被 combat 模組依賴，用於戰鬥前準備，以及 run 模組依賴，用於遊戲流程控制。
