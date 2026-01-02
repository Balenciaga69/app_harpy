# Character 模組

## 簡介

- 負責角色和職業的定義管理。
- 包括角色屬性模板和職業修飾器的註冊與查詢。
- 支援角色按職業分類和屬性驗證。
- 最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- ICharacterDefinition：角色定義，包含基本屬性和職業ID。
- IClassDefinition：職業定義，包含屬性修飾器和裝備池。

### 主要輸出

- 註冊結果：成功註冊的定義。
- 查詢結果：根據ID或職業查詢的角色定義列表。

## 元件盤點

- CharacterDefinitionRegistry：角色定義註冊表，管理角色的註冊、查詢和按職業分類。
- ClassDefinitionRegistry：職業定義註冊表，管理職業的註冊和查詢。
- CharacterError：角色相關錯誤類，提供結構化錯誤處理。
- 介面層：定義ICharacterDefinition、IClassDefinition等契約，確保元件間一致性。

## 模組依賴誰?或被誰依賴?

- Character 模組依賴 definition-config 模組的模板定義。
- Character 模組被 combat 模組依賴，用於角色實例化和屬性初始化。

---

## 這個 Character 模組在做什麼？

- 職責：管理「角色」與「職業」的定義資料，確保每個角色、職業的資料唯一、正確，並能根據需求查詢。
- 定位：這是遊戲角色資料的「資料庫」，負責角色/職業的註冊、查詢、分類與驗證。

### 什麼時候會用到這個模組？

#### 1. 遊戲啟動時載入角色/職業資料

- 你會呼叫 `registerMany()` 把所有角色、職業定義註冊進 Registry。
- 如果有重複 id，會直接丟出錯誤，避免資料污染。

#### 2. 角色創建流程

- 玩家選擇職業時，系統會用 `ClassDefinitionRegistry.get(classId)` 取得職業資料。
- 創建角色時，會用 `CharacterDefinitionRegistry.get(characterId)` 取得角色模板，初始化屬性。

#### 3. 查詢某職業下有哪些角色

- 用 `CharacterDefinitionRegistry.getByClass(classId)`，快速取得所有屬於該職業的角色清單。
