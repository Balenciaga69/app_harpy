# Character 模組規格說明

## 簡介

Character 模組負責定義和管理遊戲中的角色和職業系統，包括角色定義、職業定義、註冊表管理和錯誤處理。模組提供統一的角色資料結構和查詢機制，支援角色實例的建立和驗證。最後更新時間：2025/12/09。

## 輸入與輸出

### 輸入

- 角色定義數據（ICharacterDefinition）：包含角色 ID、名稱、職業和基礎屬性
- 職業定義數據（IClassDefinition）：包含職業 ID、名稱、屬性修正和裝備池
- 查詢參數（ID 或職業 ID）：用於從註冊表查詢定義

### 輸出

- 角色定義實例（ICharacterDefinition）：查詢到的角色定義數據
- 職業定義實例（IClassDefinition）：查詢到的職業定義數據
- 角色集合（ICharacterDefinition[]）：按職業篩選或全部角色列表
- 錯誤資訊（CharacterError）：註冊或查詢失敗時的錯誤訊息

## 元件盤點

### 定義元件

- ICharacterDefinition：角色核心定義介面，描述角色的基本資訊和屬性配置。
- IClassDefinition：職業核心定義介面，定義職業的特性和屬性修正。

### 錯誤處理元件

- CharacterError：角色領域的專屬錯誤類別，提供註冊重複、定義不存在等錯誤訊息。

### 註冊表元件

- CharacterDefinitionRegistry：角色定義的靜態註冊表，提供註冊、查詢和管理角色定義的功能。
- ClassDefinitionRegistry：職業定義的靜態註冊表，提供註冊、查詢和管理職業定義的功能。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- domain/attribute：屬性系統，依賴 BaseAttributeValues 和 AttributeType 進行角色屬性定義

### 被依賴的模組

- logic/combat：戰鬥系統，依賴角色定義建立戰鬥實例
- logic/attribute-system：屬性管理系統，依賴角色定義進行屬性計算
- UI 層：角色選擇和顯示，依賴角色和職業定義進行介面渲染
- Run 模組：遊戲運行邏輯，依賴角色定義初始化玩家角色
