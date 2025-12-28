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
