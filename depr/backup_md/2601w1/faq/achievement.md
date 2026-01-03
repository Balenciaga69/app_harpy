# Achievement

- 這是 Player 旗下的子系統
- 負責追蹤與管理玩家的成就進度
- 當玩家在 Run 中達成某些條件時, AchievementProgress 會更新對應的成就狀態

## 技術細節

- AchievementTemplate：定義成就的靜態屬性、觸發條件、獎勵等
- AchievementRecord：記錄玩家的成就進度，包含 templateId、完成狀態、進度數值等
- AchievementAggregate：由 Template + Record 組合而成，包含運行時行為
  - isCompleted()：檢查是否已完成
  - updateProgress()：更新進度
  - getReward()：取得獎勵
- AchievementAggregate 不被存入 DB，需要時由 Template + Record 動態組裝
- 成就包含多種類型：第幾關、蒐集物品、勝利次數、遊玩次數等
- 成就進度在 Run 結束或終止時進行評估與更新
- 成就條件（AchievementCondition）定義觸發規則與進度判定邏輯
