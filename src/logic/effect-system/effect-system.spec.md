# Effect System 模組規格說明

## 簡介

Effect System 模組負責管理角色的動態效果實例，支援效果的建構、添加、移除和觸發。系統採用服務定位器模式，解耦效果與具體實現，支援戰鬥內外使用，並易於跨語言移植。最後更新時間：2025/12/10。

## 輸入與輸出

### 輸入

- **效果模板資訊（IEffectTemplateInfo）**：來自 Domain 層的物品詞綴資訊，包含模板 ID 與詞綴實例
- **效果實例（IEffect）**：已建構的具體效果物件
- **服務提供者（IEffectServices/ICombatEffectServices）**：提供角色操作能力的介面
- **效果 ID（string）**：用於查詢或移除特定效果
- **過濾條件（predicate）**：用於清除效果的條件函數

### 輸出

- **效果實例（IEffect）**：查詢到的單個效果或建構的新效果
- **效果列表（readonly IEffect[]）**：所有附加的效果
- **布林值（boolean）**：效果存在檢查結果
- **屬性修飾器（AttributeModifier）**：靜態效果產生的屬性加成
- **無返回值**：效果操作的副作用

## 元件盤點

### 效果管理元件

#### EffectManager

效果管理器，負責管理附加到角色的效果實例。提供添加、移除、查詢效果的功能，以及觸發效果鉤子和清除效果的機制。

#### StackableEffect

可疊加效果的抽象基類，提供疊加層數的管理邏輯。子類可以實現具體的疊加行為，如 ChargeEffect、ChillEffect 等。

### 效果建構元件

#### EffectBuilder

效果建構器，負責從效果模板資訊建構具體的效果實例。是 Domain 層（資料）與 Logic 層（行為）之間的橋樑，支援靜態效果和 Class 效果的建構。

#### StaticEffectGenerator

靜態效果生成器，處理 effect*static*\* 類型的效果模板。根據模板 ID 解析屬性類型，使用詞綴實例的數值生成輕量級屬性加成效果。

#### ClassEffectRegistry

Class 效果註冊表，維護 effect*class*\* 與對應 Effect Class 的映射。支援動態註冊新效果類型，使用單例模式提供全局共享的註冊表。

#### StaticAttributeEffect

靜態屬性效果實作類，輕量級效果僅提供屬性加成，不註冊任何鉤子。透過 AttributeModifier 實現屬性修改。

### 服務介面元件

#### IEffectServices

Effect 基礎服務介面，定義效果執行時需要的最小服務集。不包含戰鬥專屬邏輯，可在戰鬥內外使用。

#### ICombatEffectServices

戰鬥專屬 Effect 服務介面，擴展基礎服務，添加戰鬥專屬功能。僅在戰鬥內使用，提供事件發送、tick 取得、隨機數等功能。

#### ICharacterFacade

角色屬性操作最小介面，定義效果需要的角色操作能力。提供屬性存取、修飾器管理、生命值設定等功能。

### 效果介面元件

#### IEffect

所有效果的基礎介面，定義效果的基本屬性和鉤子。包含唯一識別碼、名稱、復活清除標記等。

#### IEffectLifeHook

效果生命週期鉤子，定義效果應用和移除時的行為。

#### ICharacterStateHook

角色狀態鉤子，定義血量為零和復活時的效果行為。

#### ICombatEffectHook

戰鬥專屬鉤子，定義戰鬥相關事件如 tick、傷害修改、暴擊檢查等。

### 配置元件

#### registerDefaultClassEffects

預設 Class 效果註冊函式，應在應用初始化時調用。註冊所有內建的 Class 效果，讓 EffectBuilder 能夠正確建構這些效果實例。

### 錯誤處理元件

#### EffectBuilderError

效果建構器基礎錯誤類別，提供效果建構過程中的錯誤處理。

#### UnknownEffectTemplateError

未知效果模板錯誤，當 effectTemplateId 格式無法識別時拋出。

#### InvalidStaticEffectError

無效靜態效果錯誤，當靜態效果格式錯誤或無法解析時拋出。

#### ClassNotRegisteredError

Class 效果未註冊錯誤，當 Class 效果未在註冊表中時拋出。

### 實用元件

#### EffectConstructor

效果建構函式類型定義，描述接收參數並返回效果實例的函式簽名。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- **domain/attribute**：屬性定義，依賴屬性類型進行效果計算
- **logic/attribute-system**：屬性系統，依賴屬性修飾器應用效果修改
- **domain/item**：物品系統，依賴效果模板資訊建構效果實例
- **impl/effects**：效果實作，依賴效果介面實現具體效果邏輯

### 被依賴的模組

- **logic/combat**：戰鬥系統，依賴效果管理處理戰鬥中的效果觸發
- **logic/character-sheet**：角色面板計算，依賴效果系統管理角色狀態
- **logic/run**：關卡進程，依賴效果系統處理遊戲進程中的效果
- **logic/item-generator**：物品生成，間接依賴效果系統驗證物品效果
