---
title: PreCombat 模組規格
updated: 2025-12-14
---

## 簡介

描述 PreCombat（戰鬥前準備）模組的職責：產生賽前變數（PreCombatVariable）、處理賽前博弈（血量區間下注）、提供 reroll 流程、並在戰鬥開始前回傳最終注入的變數與下注結果。此模組需與 CombatEngine、Run、Inventory、EventBus 整合。

**實作狀態**: ✅ 已完成核心實作（2025-12-14）

**檔案結構**:

```
src/game-play/precombat/
├── interfaces/         # 所有介面定義
│   ├── IPreCombatVariable.ts
│   ├── IPreCombatState.ts
│   ├── ICombatBettingResult.ts
│   ├── IBettingConfig.ts
│   ├── IEncounterContext.ts
│   ├── IPlayerSummary.ts
│   ├── IVariableGenerator.ts
│   ├── IBettingService.ts
│   ├── IRerollController.ts
│   ├── IPreCombatOrchestrator.ts
│   ├── IEffectApplier.ts
│   └── index.ts
├── domain/            # 核心邏輯
│   ├── VariableTemplate.ts
│   ├── VariableTemplateLibrary.ts
│   ├── VariableGenerator.ts
│   ├── BettingConfig.ts
│   ├── BettingService.ts
│   └── index.ts
├── app/              # 應用層協調
│   ├── RerollController.ts
│   ├── PreCombatOrchestrator.ts
│   └── index.ts
├── infra/            # 基礎設施
│   ├── EffectApplier.ts
│   └── index.ts
└── index.ts          # 模組入口
```

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

### Interfaces 層

- **IPreCombatVariable**: 賽前變數契約，包含 id、描述、應用邏輯識別碼、持續時間、影響摘要、參數
- **IPreCombatState**: 賽前狀態，包含變數列表、下注結果、確認狀態、種子、時間戳記
- **ICombatBettingResult**: 下注結果，包含區間、金額、賠率、潛在收益
- **IBettingConfig**: 下注配置，定義區間、賠率表、下注限制
- **IEncounterContext**: 遭遇戰上下文，包含節點資訊、難度係數、章節層數
- **IPlayerSummary**: 玩家摘要，包含資產、金幣、reroll 次數
- **HealthBracket**: 血量區間常數（CRITICAL 1-10%, LOW 11-30%, MEDIUM 31-60%, HIGH 61-100%）

### Domain 層

- **VariableTemplate**: 變數模板定義，包含類型、描述模板、參數生成函數、權重
- **VARIABLE_TEMPLATES**: 預定義變數模板庫（8 種變數：冰緩、復活率、充能、攻速、傷害、防禦、燃燒、流血）
- **VariableGenerator**: 變數生成器實作
  - 功能：根據 seed 與 difficulty 生成 1-3 個候選變數
  - 使用 Chance.js 處理權重隨機、模板選擇
  - 支援參數替換與模板實例化
- **BettingConfig**: 下注配置與工具函數
  - DEFAULT_BETTING_CONFIG: 預設配置（4 個區間，賠率 8x/4x/2x/1.2x）
  - getBracketConfig: 取得區間配置
  - determineBracket: 判斷血量屬於哪個區間
- **BettingService**: 下注服務實作
  - validateBet: 驗證下注（區間、百分比、資產）
  - placeBet: 執行下注並返回結果
  - settleBet: 結算下注（判斷勝負、計算賠付）

### App 層

- **RerollController**: Reroll 控制器
  - ExponentialRerollCostStrategy: 指數增長成本策略（基礎 500，倍率 2.0）
  - calculateCost: 計算 reroll 成本與可負擔性
  - reroll: 執行 reroll（驗證資產、次數限制）
- **PreCombatOrchestrator**: 主編排器
  - generatePreCombat: 生成初始賽前狀態（1-3 個變數）
  - placeBet: 處理下注請求
  - rerollVariables: 處理 reroll 請求
  - confirmAndStartCombat: 確認並準備進入戰鬥

### Infra 層

- **EffectApplier**: 效果應用器
  - serializeForCombat: 序列化變數為 CombatEngine 注入格式
  - validateVariables: 驗證變數格式完整性

## 實作細節

### 變數生成流程

1. PreCombatOrchestrator 接收 encounterContext 與 seed
2. VariableGenerator 從 VARIABLE_TEMPLATES 過濾符合難度要求的模板
3. 使用權重隨機選擇 1-3 個模板（避免重複）
4. 對每個模板調用 generateParameters 生成參數（基於 difficulty 與 seed）
5. 替換模板中的參數佔位符（如 {layers}、{percent}）
6. 返回完整的 IPreCombatVariable 陣列

### 下注流程

1. 玩家選擇 HealthBracket 與 betPercentOfAssets
2. BettingService.validateBet 驗證：
   - 區間是否有效
   - 百分比是否在 1%-50% 範圍內
   - 計算實際金額（totalAssets × percent）
   - 檢查可用金幣是否足夠
3. 驗證通過後，placeBet 創建 ICombatBettingResult
4. 戰鬥結束後，settleBet 比對實際血量與下注區間，計算賠付

### Reroll 成本策略

- 使用指數增長：cost = baseCost × (multiplier ^ rerollCount)
- 預設基礎成本 500，倍率 2.0（第 1 次 500、第 2 次 1000、第 3 次 2000）
- 成本上限為玩家總資產的 80%
- 支援 maxRerolls 限制（-1 表示無限制）

### 資料序列化

- EffectApplier 將 IPreCombatVariable[] 轉換為 ICombatInjectionPayload
- 保留所有必要欄位（id、applyLogicIdentifier、durationTicks、parameters）
- 添加 serializedAt 時間戳記
- 驗證資料完整性（id、邏輯識別碼、持續時間必須有效）

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

## 使用範例

```typescript
import { PreCombatOrchestrator, VariableGenerator, BettingService, HealthBracket } from '@/game-play/precombat'

// 初始化
const orchestrator = new PreCombatOrchestrator()

// 生成賽前狀態
const state = orchestrator.generatePreCombat(encounterContext, playerSummary, 'seed-12345')

// 下注
const updatedState = orchestrator.placeBet(state, {
  playerSummary,
  bracket: HealthBracket.MEDIUM,
  betPercentOfAssets: 0.1, // 10%
})

// Reroll
const { state: newState, rerollResult } = orchestrator.rerollVariables(updatedState, playerSummary, 'seed-67890')

// 確認進入戰鬥
const finalState = orchestrator.confirmAndStartCombat(newState)
```

## 測試建議

### 單元測試

- **VariableGenerator**
  - 固定 seed 下輸出一致的變數序列
  - 難度過濾正確（低難度關卡不出現高難度變數）
  - 權重隨機選擇無重複
  - 模板參數替換正確

- **BettingService**
  - 下注驗證邏輯（區間、百分比、資產）
  - 賠率計算正確
  - 結算判斷勝負邏輯
  - 邊界情況（0%、100% 血量）

- **RerollController**
  - 成本計算（指數增長、上限）
  - 次數限制檢查
  - 資產檢查

### 整合測試

- **完整流程**
  - generate → placeBet → confirm
  - generate → reroll → placeBet → confirm
  - 模擬戰鬥結束後的 settleBet

- **錯誤處理**
  - 資產不足時下注失敗
  - 超過 reroll 次數限制
  - 確認後無法修改狀態

### 效能測試

- 生成 1000 次變數的執行時間（應 < 100ms）
- 大量 seed 測試可重現性

## 開發者的碎碎念

- 這些模組是遊戲核心，需確保生成邏輯的平衡性和可玩性。
- 隨機種子對於重播和測試至關重要，需從設計階段就考慮。
- 與前端整合時，需注意資料傳輸效率，避免過大 payload。
- 建議先實現最小可行版本，然後根據測試反饋迭代。
