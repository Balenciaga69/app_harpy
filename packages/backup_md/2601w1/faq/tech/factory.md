# Factory 通用問答

## Q: Factory 是什麼？

A: Factory 是一種用來生成遊戲內動態 Aggregate 的工廠模式。它會根據靜態模板與當前遊戲狀態自動產生物品、敵人、詞綴、大絕招等內容。所有需要動態生成的遊戲資料都會經過 Factory 統一流程產生。

## Q: 什麼時候會用到 Factory？

A: 當遊戲需要產生新的 Aggregate 時：

- 關卡掉落物品
- 商店刷新物品
- 隨機生成敵人
- 給角色分配大絕招
- 任何需要根據模板與當前 context 動態產生 Aggregate 的情況

## Q: 設計師需要理解 Factory 嗎？

A: 不需要。設計師只需設計模板與規則，Factory 會根據設計自動產生對應遊戲內容。技術細節交給工程師處理。

## Q: 工程師在 Factory 層需要做什麼？

A: Factory 的工程師職責：

- 負責整合 Template + Record，組裝出完整的 Aggregate
- 集中管理所有生成邏輯（難度係數計算、詞綴應用、權重調整等）
- 保證所有動態資料都經過統一規則產生，避免邏輯分散

## Q: Factory 與 AggregateService 有什麼區別？

A:

- **Factory**：將 Template 與 Record 組合為完整 Aggregate（如 RelicRecordFactory）
- **AggregateService**：使用 Factory 與 IConfigStoreAccessor、IContextSnapshotAccessor 來建立 Aggregate（如 ItemAggregateService）
- **簡單說**：Factory 是低階的組裝工具，AggregateService 是高階的業務服務
