# Effect System 模組規格書

## 目標功能與範圍

### 會實現的功能

- 管理角色身上的效果實例
- 支援效果生命週期管理（onApply、onRemove）
- 支援角色狀態回應（onRevive、onHpZero）
- 支援戰鬥專屬週期事件（onTick）
- 透過服務定位器模式解耦具體實現
- 支援戰鬥內外使用（戰鬥內、角色面板）
- 提供效果清除機制（復活時清除 Debuff）

### 不會實現的功能

- 具體效果實現（由各 Effect 類別負責）
- 傷害計算邏輯（由 DamageChain 負責）
- 屬性計算（由 AttributeSystem 負責）
- 戰鬥事件總線（由 Combat 模組負責）
- UI 顯示（由 UI 模組負責）

---

## 架構與元件關係

### 模組定位

位於後端純運算模組層（logic/effect-system），提供純邏輯的效果管理功能，透過服務介面解耦，可被戰鬥內外使用。

### 依賴方向

- 僅依賴 domain/attribute 與 logic/attribute-system
- 不依賴 Combat 模組的任何具體實現
- 被 Combat Engine 使用（戰鬥內）
- 被 CharacterModifierSystem 使用（戰鬥外面板）

### 檔案結構

- EffectManager.ts 管理效果實例集合
- models/effect.ts 定義效果介面
- models/effect-hooks.ts 定義生命週期與狀態鉤子
- models/effect-services.ts 定義服務定位器介面
- models/character-facade.ts 定義角色操作最小介面
- index.ts 統一導出

---

## 核心元件

### EffectManager

管理附加到角色的效果實例。僅持有角色 ID 而非角色引用，透過服務定位器取得角色操作能力。

### IEffect

定義效果的基礎介面，包含唯一識別碼、名稱、復活清除標記。繼承生命週期與狀態鉤子。

### IEffectServices

基礎服務介面，定義 Effect 執行時需要的最小服務集。僅包含角色查詢功能，不含戰鬥專屬邏輯。

### ICombatEffectServices

戰鬥專屬服務介面，擴展基礎服務，添加事件發送、tick 查詢、隨機數生成等戰鬥專屬功能。

### ICharacterFacade

角色操作最小介面，定義 Effect 需要的角色能力：取得屬性、添加修飾器、移除修飾器。

---

## 設計模式

### 服務定位器模式

Effect 不直接依賴具體實現，而是透過服務介面取得需要的能力。戰鬥內外提供不同的服務實現。

### 介面分離原則

將通用功能（IEffectServices）與戰鬥專屬功能（ICombatEffectServices）分離，符合 ISP 原則。

### 適配器模式

Combat 模組提供 CombatEffectServices 適配器，將 CombatContext 適配為服務介面。

---

## 生命週期鉤子

### IEffectLifeHook

定義效果的基礎生命週期事件，使用基礎服務介面，支援戰鬥內外使用。

onApply：當效果被應用到角色時觸發，用於初始化（如應用屬性修飾器）

onRemove：當效果從角色移除時觸發，用於清理（如移除屬性修飾器）

### ICharacterStateHook

定義角色狀態變化的回應，使用基礎服務介面，支援戰鬥內外使用。

onRevive：當角色復活時觸發，用於復活後觸發的效果

onHpZero：當角色血量歸零時觸發（死亡檢查前），用於死亡觸發效果

### ICombatEffectHook

定義戰鬥中的周期性事件，使用戰鬥專屬服務介面，僅在戰鬥內使用。

onTick：每個戰鬥 tick 觸發一次，用於周期性效果（如中毒傷害、層數衰減）

---

## 使用場景

### 戰鬥內使用

Combat Engine 建立 CombatEffectServices 適配器，將 CombatContext 適配為服務介面。Character 使用 EffectManager 管理效果，Effect 透過服務介面操作角色屬性與發送事件。

### 戰鬥外使用

CharacterModifierSystem 建立靜態服務實現，提供固定的角色操作能力。EffectManager 注入裝備遺物效果，計算最終屬性後返回結果。不需要 tick、事件等戰鬥專屬功能。

### 單元測試

可 mock 服務介面，獨立測試 EffectManager 與各種 Effect 實現，無需啟動完整戰鬥系統。

---

## 對外暴露的主要功能

### 類別導出

- EffectManager 效果管理器

### 介面導出

- IEffect 效果介面
- IEffectLifeHook 生命週期鉤子
- ICharacterStateHook 狀態鉤子
- ICombatEffectHook 戰鬥鉤子
- IEffectServices 基礎服務介面
- ICombatEffectServices 戰鬥服務介面
- ICharacterFacade 角色操作介面

---

## 設計原則

### 依賴反轉

Effect 依賴抽象的服務介面，而非具體的 CombatContext 或 Character 實現。

### 單一職責

EffectManager 僅負責效果集合管理，不處理屬性計算或戰鬥邏輯。

### 開閉原則

新增效果類型無需修改 EffectManager，僅需實現 IEffect 介面。

### 跨語言可移植

無框架耦合，純邏輯設計，可直接轉譯為 C#、Python、Go 等語言。
