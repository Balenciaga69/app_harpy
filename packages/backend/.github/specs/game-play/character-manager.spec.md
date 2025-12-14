# CharacterManager 模組規格說明

## 作者的話

- 尚未實作，僅有規格定義
- 需等待相關模組（CharacterSheet、Inventory、PersistentStorage）完成後實作

## 簡介

- 儲存和管理玩家的基礎角色實例，處理角色選擇與面板展示
- 負責角色實例的創建、儲存、載入與狀態管理
- 提供角色面板數據整合，包含屬性、裝備、遺物等完整資訊
- 與 EventBus 整合，發射角色相關事件供其他模組監聽
- 最後更新時間：2025-12-14

## 輸入與輸出

### 主要輸入

- 角色定義 ID（角色選擇與創建）
- 角色實例數據（載入/儲存操作）
- 面板展示請求（獲取角色完整狀態）

### 主要輸出

- 角色實例（創建或載入的角色物件）
- 角色面板數據（包含屬性、裝備、遺物等完整資訊）
- 操作結果（成功/失敗狀態與錯誤訊息）
- 事件通知（角色創建、選擇、狀態變更等）

## 元件盤點

### Interfaces 層

- ICharacterManager：角色管理器主要介面，定義所有角色管理操作
- ICharacterInstance：角色實例介面，定義角色運行時狀態
- ICharacterPanelData：角色面板數據介面，定義面板展示所需資訊
- ICharacterManagerEvents：事件定義，包含角色相關事件類型
- ICharacterSelectionResult：角色選擇結果介面

### Domain 層

- CharacterManagerError：角色管理器錯誤類別
- CharacterNotFoundError：角色未找到錯誤
- InvalidCharacterStateError：無效角色狀態錯誤
- CharacterManagerConstants：常數定義，包含訊息模板與限制

### App 層

- CharacterManager：角色管理器實作，負責角色實例的完整生命週期管理
- CharacterInstanceFactory：角色實例工廠，負責根據定義創建角色實例
- CharacterPanelCalculator：角色面板計算器，整合各模組數據生成面板資訊

## 模組依賴誰或被誰依賴

### 依賴模組

- features/character：使用角色與職業定義
- features/attribute：使用屬性相關類型與計算
- game-play/inventory：獲取角色裝備與遺物狀態
- game-play/character-sheet：獲取角色屬性面板計算結果
- shared/event-bus：使用 EventBus 進行事件通訊
- PersistentStorage：角色數據持久化（待實作）

### 被依賴模組

- Run：遊戲運行時使用角色實例
- Shop：角色裝備購買時更新角色狀態
- PreCombat：戰前準備時獲取角色面板數據
- UI：角色選擇與面板展示

## 核心功能需求

### 角色實例管理

- 根據角色定義創建角色實例
- 儲存與載入角色實例狀態
- 管理角色實例的生命週期
- 支援多角色實例切換

### 角色選擇邏輯

- 提供可用角色列表
- 處理角色選擇操作
- 驗證角色選擇的有效性
- 支援角色預覽功能

### 面板數據整合

- 整合角色基礎屬性
- 整合裝備與遺物效果
- 整合角色當前狀態
- 生成完整面板展示數據

## 進階需求

### 角色狀態管理

- 角色屬性狀態追蹤
- 裝備變更時自動更新
- 遺物堆疊變更時更新
- 狀態變更事件發射

### 數據驗證

- 角色實例數據完整性檢查
- 屬性值範圍驗證
- 裝備槽位一致性檢查
- 職業與裝備相容性驗證

### 效能優化

- 面板數據緩存機制
- 選擇性數據更新
- 事件驅動的狀態同步
- 記憶體使用優化

### 錯誤處理

- 角色創建失敗處理
- 數據載入錯誤處理
- 狀態不一致修復
- 詳細錯誤訊息提供

## 介面需求

### ICharacterManager

- createCharacter(characterDefinitionId: string): Promise<ICharacterInstance>
- loadCharacter(characterId: string): Promise<ICharacterInstance>
- saveCharacter(character: ICharacterInstance): Promise<void>
- getAvailableCharacters(): ICharacterDefinition[]
- selectCharacter(characterId: string): ICharacterSelectionResult
- getCharacterPanel(characterId: string): ICharacterPanelData
- updateCharacterStatus(characterId: string): Promise<void>

### ICharacterInstance

- id: string
- definitionId: string
- currentAttributes: BaseAttributeValues
- inventoryId: string
- status: CharacterStatus
- createdAt: Date
- updatedAt: Date

### ICharacterPanelData

- basicInfo: { id, name, className }
- attributes: BaseAttributeValues
- equipment: EquipmentSlotMap
- relics: IRelicInstance[]
- status: CharacterStatus
- statistics: CharacterStatistics

## 開發者的碎碎念

- CharacterManager 是遊戲核心模組之一，需要與多個模組緊密整合
- 角色實例的狀態管理至關重要，避免數據不一致問題
- 面板數據整合需要高效，避免頻繁重新計算
- 事件驅動架構有助於模組間解耦，但需注意事件順序
- 持久化整合是關鍵，需要設計良好的序列化機制
- 初期先實作基礎功能，逐步添加進階特性
- 單元測試覆蓋率要高，特別是狀態管理邏輯</content>
<parameter name="filePath">g:\Coding\app_harpy\packages\backend\.github\specs\game-play\character-manager.spec.md