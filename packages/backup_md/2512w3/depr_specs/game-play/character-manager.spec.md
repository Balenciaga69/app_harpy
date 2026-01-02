# CharacterManager 模組

## 簡介

- 負責角色實例的完整生命週期管理，包括：
  - 角色實例的創建與初始化。
  - 角色的載入、儲存和狀態更新。
  - 角色選擇與面板數據計算。
- 支援事件驅動架構，便於其他模組監聽角色變更。
- 最後更新時間：2025-12-14。

## 輸入與輸出

### 主要輸入

- characterDefinitionId：角色定義 ID，用於創建角色實例。
- characterId：角色實例 ID，用於載入、儲存或查詢角色。
- ICharacterInstance：角色實例物件，用於儲存操作。

### 主要輸出

- ICharacterInstance：創建或載入的角色實例。
- ICharacterSelectionResult：角色選擇結果，包含成功狀態和錯誤訊息。
- ICharacterPanelData：角色面板數據，包含基本資訊、屬性、裝備等。

## 元件盤點

- CharacterManager：核心管理器，處理角色生命週期的所有操作。
- CharacterInstanceFactory：實例工廠，負責基於定義創建角色實例。
- CharacterPanelCalculator：面板計算器，整合角色資訊生成面板數據。
- InMemoryCharacterStorage：記憶體儲存實作，提供角色資料的存取。
- 錯誤類別：CharacterNotFoundError、CharacterDefinitionNotFoundError 等，處理各種異常情況。
- 常數與介面：定義狀態、事件和契約，確保模組一致性。

## 模組依賴誰?或被誰依賴?

- CharacterManager 模組依賴 shared/event-bus 模組的事件總線，definition-config 模組的角色定義，inventory 模組的背包管理，以及 attribute 模組的屬性計算。
- CharacterManager 模組被 game-play 的 combat、shop 等模組依賴，用於角色實例的管理和面板顯示。
