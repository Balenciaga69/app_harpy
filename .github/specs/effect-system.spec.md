# Effect-System 模組規格說明

## 簡介

Effect-System 模組負責管理附加到角色的效果實例，支援效果的添加、移除和觸發。模組採用服務定位器模式，解耦效果與具體實現，支援戰鬥內外使用，並易於跨語言移植。最後更新時間：2025/12/09。

## 輸入與輸出

### 輸入

- 效果實例（IEffect）：包含 ID、名稱和鉤子函數的效果物件
- 服務提供者（IEffectServices）：提供角色操作能力的介面
- 效果 ID（string）：用於查詢或移除特定效果
- 過濾條件（predicate）：用於清除效果的條件函數

### 輸出

- 效果實例（IEffect）：查詢到的單個效果
- 效果列表（readonly IEffect[]）：所有附加的效果
- 布林值（boolean）：效果存在檢查結果
- 無返回值：效果操作的副作用

## 元件盤點

### 核心元件

- EffectManager：效果管理器，負責效果的添加、移除、查詢和觸發，提供清除和復活相關功能。

### 模型元件

- IEffect：效果介面，定義效果的基本屬性和鉤子。
- IEffectLifeHook：效果生命週期鉤子，定義應用和移除時的行為。
- ICharacterStateHook：角色狀態鉤子，定義血量為零和復活時的行為。
- ICombatEffectHook：戰鬥專屬鉤子，定義戰鬥相關事件。
- IEffectServices：效果服務介面，提供角色操作能力。
- ICombatEffectServices：戰鬥專屬服務介面，擴展基礎服務。
- ICharacterFacade：角色外觀介面，提供角色狀態訪問。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- domain/attribute：屬性定義，依賴屬性類型進行效果計算
- logic/attribute-system：屬性系統，依賴屬性管理應用效果修改

### 被依賴的模組

- logic/combat：戰鬥系統，依賴效果管理處理戰鬥中的效果觸發
- impl/effects：效果實現，依賴效果介面實現具體效果邏輯
- domain/character：角色定義，依賴效果系統管理角色狀態
