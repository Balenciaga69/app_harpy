# Combat 模組

## 很急

- (討論)Effect, Item,Ultimate 等東西都會調用 ICharacter 的方法。是否該改成 character ID 而非物件本身? 你來TradeOff一下。
- CombatContext 物件 我同意包含 EventBus,Rng,Registry.
- CombatContext 內的 Entity,Tick這些東西與相關操作如果要搬移 應該移動到?要建立新系統嗎?

## 需要討論(暫時先不提及)

- 我目前代碼轉不可變純函數特性，TradeOffs下，假設轉換成本為0 因為是 AI 重構。
- 探討不可變純函數的遊戲管理機制用的語法以及特性
- 狀態分散在 Context + 各 Manager → 改用「純資料狀態 + 純函數系統」是否可行?

## 不急

- 引入領域錯誤 CombatError Extends Errors
- 導入 immer.js 實現不可變

## 未來統一實作

- 單元測試 (Jest)
- 錯誤處理 (Try...Catch)
  - 對每個模組評估是否該做 Exception 或者 純粹回傳 Result 型別
  - 這一塊有爭議，有人說戰鬥模組不應該有拋例外狀況
- 記憶體管理與效能優化
