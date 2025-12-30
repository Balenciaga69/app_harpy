# Character

- 角色是指遊戲內的單一角色
- 而非玩家帳號, 那個被稱為 Player

## Character 與 Character Context 區別

- CharacterTemplate：定義角色靜態屬性、職業、基礎能力等
- CharacterRecord：記錄角色的持久化資料，包含 templateId、當前等級、經驗等
- CharacterAggregate：由 Template + Record 組合而成，包含運行時行為與計算
  - getUnitStats()：計算最終屬性
  - getEquippedRelics()：取得裝備中的遺物
  - 根據難度係數動態計算所有數值
- ICharacterContext：遊戲進程快照，保存 CharacterRecord 以供持久化
- Character 的業務邏輯由 Aggregate 實現，Context 僅記錄持久化資料

## FAQ

### Q: 什麼是 Character？

A: Character 是遊戲內的單一角色實體，代表玩家在遊戲運行（Run）中的角色。它不是玩家帳號（Player），而是遊戲邏輯中的可操作單位，包含屬性、裝備和行為。

### Q: CharacterTemplate 是什麼？

A: CharacterTemplate 定義角色的靜態屬性，例如職業（Profession）、基礎能力值、初始裝備等。它是角色的模板，用於生成新角色時的基礎設定。

### Q: CharacterRecord 是什麼？

A: CharacterRecord 是角色的持久化資料記錄，包含角色的動態狀態，如 templateId（模板ID）、當前等級、經驗值、金幣、裝備的聖物（Relics）、大絕招（Ultimate）、負重容量等。它是可序列化的資料，用於存儲和恢復角色狀態。

### Q: CharacterAggregate 是什麼？

A: CharacterAggregate 是角色的聚合根（Aggregate Root），由 CharacterTemplate 和 CharacterRecord 組合而成。它包含運行時的行為和計算邏輯

### Q: ICharacterContext 是什麼？

A: ICharacterContext 是遊戲進程的快照（Snapshot），保存 CharacterRecord 以供持久化。它擴展了 CharacterRecord，加上 runId（運行ID）和 version（版本號），用於版本控制和事務管理。Context 僅記錄資料，不包含業務邏輯。

### Q: CharacterAggregate 和 ICharacterContext 的區別是什麼？

A: CharacterAggregate 負責業務邏輯和運行時計算，而 ICharacterContext 僅是持久化的資料快照。Aggregate 用於操作和計算，Context 用於存儲和恢復狀態。設計上，業務邏輯在 Aggregate 中實現，Context 保持輕量。

### Q: 角色如何與其他系統交互？

A: 角色與聖物系統（裝備聖物影響屬性）、職業系統（決定基礎能力）、倉庫系統（裝備/卸下聖物時交互）、統計系統（屬性計算）等緊密整合。角色狀態通過 Context 持久化在資料庫中。

### Q: 如何創建一個新角色？

A: 使用 CharacterFactory 創建 CharacterRecord，然後通過 CharacterAggregateService 組裝成 CharacterAggregate。初始化時，RunInitializationService 會創建 ICharacterContext。

### Q: 角色的負重機制如何工作？

A: 角色有 loadCapacity（負重容量）和 currentLoad（當前負重）。裝備聖物會消耗負重，如果超載則無法裝備。可以使用 expandLoadCapacity 擴展容量。

### Q: 聖物堆疊限制是什麼？

A: 每個聖物有最大堆疊數（maxStacks），角色無法裝備超過限制的相同聖物。CharacterAggregate 的 isMaxStacks 方法檢查此限制。

### Q: 角色如何參與戰鬥？

A: 角色通過 Unit 介面轉換為戰鬥單位（見 Unit.ts），結合屬性、聖物效果和大絕招參與戰鬥邏輯。

### Q: 設計師需要注意什麼？

A: 確保業務邏輯在 Aggregate 中實現，避免在 Context 中添加邏輯。角色狀態必須通過 Unit of Work 原子更新，以維持一致性。難度係數會影響屬性計算，所以測試不同難度下的行為。
