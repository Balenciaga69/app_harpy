## 很急

- ShopManager 需要實作介面
- 需要拆開 內部的代碼 G:\Coding\app_harpy\packages\backend\src\features\shop\interfaces\IShopModels.ts
- src\features\run\app\state-machine\RunStateMachine.ts
  src\features\run\app\state-machine\IRunStateMachine.ts
  src\features\run\app\state-machine\IRunStateHandler.ts 通通搬遷到介面
- src\features\character-sheet\app\CharacterSheetCalculator.ts 需要實作介面
- CombatEngine(G:\Coding\app_harpy\packages\backend\src\features\combat\app\combat-engine\CombatEngine.ts)
  裡面依賴的Class 改成 interface,如果有缺乏就調用
- G:\Coding\app_harpy\packages\backend\src\features\combat\app\damage\AttackExecutor.ts 已經違反規則了
  內部依賴需要改成 interface
- npm run check , npm run lint 可以找到更多錯誤幫我處理

#### COMBAT模組內的開發守則

- 因為我安裝了 eslint-plugin-boundaries
- 我要讓內部遵循 單向依賴規則：箭頭永遠指向內層。
- infra -> interfaces -> app -> domain (此範本不考慮 presentation 層)
  - infra 可以透過 interfaces 與 app,domain 引用
  - infra 放置與基礎設施、外部資源、第三方整合有關的程式碼
  - interfaces 放置所有介面（interface）、型別（type）、契約（contract）、抽象類別
  - interfaces 理論上不會引用任何實作，且貧血。
  - app 放置應用層邏輯，負責協調，不包含任何業務與領域邏輯
  - app 可以引用 interfaces
  - domain 放置純業務邏輯、核心規則、演算法
  - domain 可以引用 interfaces
  - 所有實作都只 import interface，不 import 其他實作
- 我們用不到值物件、領域模型、聚合根這些DDD概念
- 我偏好 feature(舉例:combat,replay) 內有 分層概念，每層再來建立 sub-features folder 的結構
- sub-feature 內則遵循單向依賴規則
- 各 sub-feature 引用也應該遵循 單向依賴規則
- 實作永遠不引用實作(只引用介面)

我們剛剛已經對 大部分feature 成功搬遷了
但不論 app/domain/infra 裡面肯定都還有

1. 之前高度耦合的程式碼，現在要遵循 單向依賴規則
2. 直接依賴 Class 是禁止的，應該依賴 interface (除非這是他的util或sub-class)
3. 搬遷的時候沒有import export 乾淨的遺留錯誤
4. 命名錯誤 或者 一看就知道放錯層
5. TODO: 內容且很容易判斷的也請修正
   請幫我檢查以下檔案是否有上述問題，請你直接修改
6. 依賴外部模組的地方請一律TODO標記一下，然後讓他們保持原狀
7. 一個檔案放了一大堆類別、類型、介面、枚舉、函數等等

如果你有疑慮可以參考package.json 我們有 script

你先修好 npm run check 跟TODO: 的內容最重要
另外我eslint也規範
