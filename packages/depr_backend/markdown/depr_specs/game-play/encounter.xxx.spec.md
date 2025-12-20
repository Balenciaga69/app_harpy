---
title: Encounter 模組規格
updated: 2025-12-14
---

## 簡介

描述 Encounter（關卡 / 遭遇）模組的功能與邊界。此模組負責在 Run 流程中產生章節地圖、節點（節點類型：Combat/Boss/Event）、路線分支，以及提供節點預覽與玩家選擇介面資料。最後更新時間如上。

## 輸入與輸出

- 輸入
  - chapterNumber: number（章節序號，決定節點數量與 Boss 排列規則）
  - seed? : string | number（選用，決定隨機性以便可重現）
  - runState: RunContext（只含必要不可變訊息，例如當前難度係數、玩家資訊摘要）

- 輸出
  - EncounterMap
    - nodes: EncounterNode[]（節點陣列，按層序排列）
    - currentIndex: number（當前節點索引）
    - branchesPreview?: BranchPreview[]（在戰勝後提供的分支預覽）
  - Events emitted（EventBus）
    - encounter.created
    - encounter.nodeSelected
    - encounter.branchChosen

## 合約（Contract）

- 輸入/輸出形狀：如上 EncounterMap 與 EncounterNode（必有 id、type、threatLevel、rewardPreview）。
- 錯誤模式：在生成失敗時回傳結構化錯誤（EncounterGenerationError），不得拋出未捕捉異常。
- 成功準則：生成的 EncounterMap 滿足章節規則（10 個節點/章節；第5/第10 為 Boss 類型）且 seed 相同時可重現。

## 元件盤點（按功能元件，不按實作檔案）

- MapGenerator（domain）
  - 功能：根據 chapterNumber 與 seed 產生節點佈局、分支結構、威脅等級分配。
  - 輸入：chapterNumber, seed, DifficultyScaler
  - 輸出：EncounterMap

- NodeFactory（domain）
  - 功能：建立單一 EncounterNode（含 type、threatLevel、rewardPreview、metadata）。
  - 負責：Boss/Elite/Normal/Event 節點的模板化產生。

- BranchSelector（app）
  - 功能：在戰勝節點後根據規則 (2 選 1)，產生分支預覽資料。
  - 介面：提供給 UI 的 summary（不包含敵人細節，只提供 threatLevel 與 rewardPreview）。

- EncounterOrchestrator / Controller（app）
  - 功能：暴露高階方法：createEncounter、advanceToNode、selectBranch、serialize/deserialize map state。
  - 負責事件發送（encounter.created, encounter.nodeResolved, encounter.branchChosen）。

- Persistence Adapter（infra）
  - 功能：檢查點支援（save/load EncounterMap 的最小狀態），提供抽象介面以便未來換儲存層。

- Validators & Rules（interfaces/domain）
  - 功能：封裝章節規則（節點數量、Boss 位置、無盡模式判定等）與輸入驗證。

## 子功能 (Subfeatures) 建議

- generator/core：MapGenerator、NodeFactory、ThreatLevelDistributor
- branch/preview：BranchSelector、RewardSampler
- persistence/checkpoint：Persistence Adapter + Checkpoint model
- orchestration/api：EncounterOrchestrator、事件與 DTO（interfaces）

每個 subfeature 建議再細分成 app/domain/infra/interfaces 層，保持單向依賴。

## 模組依賴誰？或被誰依賴？

- 依賴
  - DifficultyScaler（取得當前難度係數以影響 reward 與 threat）
  - EnemyGenerator（在需要時用於生成戰鬥節點內的敵人，但一般不在 map preview 中暴露）
  - ItemGenerator（生成 rewardPreview 的具體候選）
  - EventBus / RunOrchestrator（事件發射與訂閱）

- 被誰依賴
  - Run（Run 模組會呼叫 createEncounter 並持有 EncounterMap）
  - UI 層（使用 branchesPreview 與 node rewardPreview 呈現給玩家）

## 核心流程（簡述）

1. RunOrchestrator 呼叫 EncounterOrchestrator.createEncounter(chapter, seed)
2. MapGenerator 產生 EncounterMap，NodeFactory 建立節點
3. encounter.created 事件發出，Run 追蹤 map state
4. 玩家完成節點後，BranchSelector 產生 branchesPreview；玩家選擇後發出 encounter.branchChosen，Orchestrator 更新 map

## 邊界情況與注意點

- seed 可選：若未提供 seed，使用全域 RNG 且仍需回傳 seed 以便復現。
- 不在預覽中暴露敵人具體資訊，僅暴露 threatLevel 與 rewardPreview。
- 無盡模式：當層數 > 30，MapGenerator 應啟用無盡模式生成器分支。
- 性能：生成應為同步且輕量（數百毫秒級），若需大量候選計算，放到 background job 或 limiter。

## 測試建議

- 單元測試
  - MapGenerator 在固定 seed 下輸出一致的 EncounterMap
  - NodeFactory 的各種 node type 模板輸出值域驗證

- 整合測試
  - createEncounter -> serialize -> deserialize 恢復相同狀態
  - 分支選擇流程（選擇後 map state 正確更新）

## 開發者的碎碎念

- 這些模組是遊戲核心，需確保生成邏輯的平衡性和可玩性。
- 隨機種子對於重播和測試至關重要，需從設計階段就考慮。
- 與前端整合時，需注意資料傳輸效率，避免過大 payload。
- 建議先實現最小可行版本，然後根據測試反饋迭代。
