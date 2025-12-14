---
title: PreCombat 模組規格
updated: 2025-12-14
---

## 簡介

描述 PreCombat（戰鬥前準備）模組的職責：產生賽前變數（PreCombatVariable）、處理賽前博弈（血量區間下注）、提供 reroll 流程、並在戰鬥開始前回傳最終注入的變數與下注結果。此模組需與 CombatEngine、Run、Inventory、EventBus 整合。

## 輸入與輸出

- 輸入
  - encounterContext: EncounterContext（包含即將進入的節點摘要、難度係數）
  - playerContext: PlayerSummary（玩家總資產、角色摘要、可用 reroll 次數或花費）
  - seed? : string | number（選用，支持可重現）

- 輸出
  - PreCombatState
    - variables: PreCombatVariable[]（最終被確認注入的變數清單）
    - betting: CombatBettingResult | null（玩家下注結果與賠率）
    - confirmed: boolean（是否確認進入戰鬥）
  - Events emitted
    - precombat.generated
    - precombat.rerolled
    - precombat.betPlaced
    - precombat.confirmed

## 合約（Contract）

- PreCombatVariable 應包含：id, description, applyLogicIdentifier（或可序列化的規則引用）、durationTicks, impactSummary（簡短摘要給 UI 顯示）。
- BettingConfig 應包含區間定義、倍率表、賭金計算策略（基於 player.totalAssets 的百分比）。
- 錯誤模式：所有金錢變更必須回傳 TransactionResult，且若下注失敗（資產不足）應回滾狀態。

## 元件盤點（按功能元件）

- VariableGenerator（domain）
  - 功能：根據 seed 與 difficulty 生成 1..n 個候選 PreCombatVariable
  - 支援多種變數類型：屬性加成、異常狀態注入、復活率調整、大招充能效率改變等

- VariableSampler（app）
  - 功能：從候選集中抽樣並生成 UI 預覽（包含效果簡述與估計影響指標）

- BettingService（app/domain）
  - 功能：計算下注賠率、驗證下注金額（基於 player 總資產百分比）、結算賭注（勝利/失敗後）。
  - 輸出 CombatBettingResult，並在需要時發出 precombat.betPlaced 事件。

- RerollController（app）
  - 功能：處理 reroll 流程（花費、次數限制、結果替換），發出 precombat.rerolled 事件。

- PreCombatOrchestrator（app）
  - 功能：公開高階流程：generatePreCombat, placeBet, rerollVariables, confirmAndStartCombat。負責整合 VariableGenerator、BettingService、EventBus。

- EffectApplier Adapter（infra/interfaces）
  - 功能：在戰鬥開始前，將最終 variables 轉換成 CombatEngine 可接受的注入資料（保持最小的、序列化友好的 payload）。

## 子功能 (Subfeatures) 建議

- variables/core：變數定義（interfaces）、生成器、模板
- betting/core：賠率表、下注策略、賠付計算
- reroll/flow：reroll 成本策略、使用者互動 API
- applier/bridge：與 CombatEngine 的資料橋接

同樣建議每個 subfeature 採用 app/domain/infra/interfaces 分層。

## 模組依賴誰？或被誰依賴？

- 依賴
  - CombatEngine（需要提供可注入的變數格式）
  - Run（會在流程中呼叫 PreCombat）
  - Inventory（若 reroll 或下注需要消耗道具或金幣）
  - DifficultyScaler（變數強度與出現權重依賴難度）

- 被誰依賴
  - RunOrchestrator（在進入戰鬥前呼叫，並依結果啟動 CombatEngine）

## 核心流程（簡述）

1. Run 呼叫 PreCombatOrchestrator.generatePreCombat(encounterContext, playerContext, seed)
2. VariableGenerator 返回候選變數，VariableSampler 提供 UI 用的簡短預覽
3. 玩家可選擇下注（BettingService），或選擇 reroll（RerollController）
4. 玩家確認後，PreCombatOrchestrator 發出 precombat.confirmed 並透過 EffectApplier 將變數序列化為 CombatEngine 注入格式

## 邊界情況與注意點

- 可重現性：seed 必須一起回傳並儲存到 run state，以便重播/測試。
- 金錢安全：下注與 reroll 都會影響玩家資產，任何失敗流程需完整回滾。
- 回放一致性：PreCombat 的所有隨機性結果（包括 reroll）要能在 Replay 中還原。
- 避免過多 payload：只在戰鬥開始時把必要的 effect 指標傳給 CombatEngine，複雜邏輯保持在 PreCombat 模組端。

## 測試建議

- 單元測試
  - VariableGenerator 在固定 seed 下輸出一致的變數序列
  - BettingService 的賠率計算與資產校驗

- 整合測試
  - generate -> placeBet -> confirm 流程，模擬勝利與失敗情形並驗證資產變化
  - reroll 的資金消耗與結果替換行為

## 開發者的碎碎念

- 這些模組是遊戲核心，需確保生成邏輯的平衡性和可玩性。
- 隨機種子對於重播和測試至關重要，需從設計階段就考慮。
- 與前端整合時，需注意資料傳輸效率，避免過大 payload。
- 建議先實現最小可行版本，然後根據測試反饋迭代。
