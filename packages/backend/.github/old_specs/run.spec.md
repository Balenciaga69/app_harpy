# Run 模組規格說明

## 簡介

Run 模組負責遊戲運行流程的整體協調和管理，採用狀態機模式控制遊戲狀態轉換。模組使用 Facade 模式提供簡潔介面，封裝複雜的子系統互動邏輯，包括角色管理、戰鬥協調、商店操作和存檔載入。支援檢查點儲存載入，確保遊戲進度不會因意外中斷而丟失。最後更新時間：2025/12/09。

## 輸入與輸出

### 輸入

- 角色 ID（characterId: string）：選擇遊戲角色
- 新狀態（newState: RunStateType）：狀態機轉換目標
- 檢查點 ID（checkpointId: string）：載入存檔識別碼
- 金幣數量（amount: number）：金幣操作金額

### 輸出

- 當前狀態（RunStateType）：遊戲當前狀態
- 進度資訊（RunProgress）：包含章節、節點和難度係數
- 完整上下文（Readonly<RunContext>）：遊戲運行完整狀態
- 布林值（boolean）：操作成功與否（如金幣扣除）
- 協調器實例：進階使用下的子系統訪問

## 元件盤點

### 核心元件

- RunOrchestrator：運行協調器，使用 Facade 模式提供統一介面，管理狀態機和所有協調器。

### 狀態機元件

- RunStateMachine：狀態機實作，負責狀態轉換邏輯和處理器管理。
- IRunStateMachine：狀態機介面，定義狀態轉換契約。
- IRunStateHandler：狀態處理器介面，定義狀態進入/離開行為。
- 狀態處理器：CharacterSelectionState、CombatState、ShopState 等，實現具體狀態邏輯。

### 協調器元件

- CharacterCoordinator：角色協調器，處理角色選擇和屬性查詢。
- EncounterCoordinator：遭遇協調器，管理關卡地圖和事件生成。
- CombatCoordinator：戰鬥協調器，處理戰鬥前後邏輯。
- ShopCoordinator：商店協調器，管理商品和交易。
- StorageCoordinator：儲存協調器，處理檢查點儲存載入。

### 生命週期元件

- RunInitializer：運行初始化器，負責新遊戲建立和檢查點恢復。
- RunFinalizer：運行完成器，處理遊戲結束邏輯。

### 模型元件

- RunContext：運行上下文，包含遊戲完整狀態資訊。
- RunProgress：進度資訊，記錄章節、節點和難度。
- RunState：狀態枚舉，定義所有可能的遊戲狀態。

### 錯誤元件

- RunNotInitializedError：運行未初始化錯誤。
- InvalidStateTransitionError：無效狀態轉換錯誤。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- logic/character：角色管理，依賴角色選擇和屬性計算
- logic/combat：戰鬥系統，依賴戰鬥協調和結果處理
- logic/shop：商店系統，依賴商品管理和交易邏輯
- logic/encounter：遭遇系統，依賴關卡地圖和事件生成
- logic/persistent-storage：持久化儲存，依賴檢查點儲存載入

### 被依賴的模組

- UI 層：遊戲介面，依賴運行狀態進行介面更新和用戶互動
- 應用入口：主應用程式，依賴運行協調器啟動和管理遊戲流程
