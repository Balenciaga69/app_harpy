# Item 模組規格書

## 目標功能與範圍

### 會實現的功能

- 定義物品基礎介面與裝備遺物擴充介面
- 定義詞綴系統（定義與實例）
- 提供詞綴生成器（支援可重現隨機數）
- 定義裝備槽位與稀有度
- 提供視角投影介面（戰鬥、庫存、UI）
- 提供效果工廠（泛型設計）
- 提供物品與詞綴定義註冊表
- 提供專屬錯誤類別

### 不會實現的功能

- 物品生成邏輯（由 ItemGenerator 模組負責）
- 庫存管理（由 Inventory 模組負責）
- 戰鬥效果實作（由 Combat 模組負責）
- UI 渲染（由 UI 模組負責）
- 物品掉落計算（由 Loot 模組負責）

---

## 架構與元件關係

### 模組定位

物品系統的共享定義層，提供純資料模板與轉換工具。

### 依賴方向

- ItemGenerator 使用此模組生成物品實例
- Combat Engine 使用戰鬥視角介面取得物品效果
- Inventory 使用庫存視角介面管理物品
- UI 使用 UI 視角介面渲染物品資訊

### 檔案結構

- definitions 目錄包含物品、裝備、遺物定義介面
- affixes 目錄包含詞綴定義、實例、生成器
- projections 目錄包含三種視角投影介面
- factories 目錄包含物品工廠與效果工廠
- registries 目錄包含物品與詞綴註冊表
- errors 目錄包含錯誤處理類別

---

## 核心定義

### 物品定義

包含唯一識別碼、效果模板 ID、詞綴池 ID、詞綴數量範圍。裝備定義擴充槽位與稀有度，遺物定義擴充堆疊資訊。

### 詞綴定義

包含唯一識別碼、效果模板 ID、數值範圍、權重、分層標籤。詞綴實例包含定義 ID 與擲出數值。

### 裝備槽位

定義六個槽位：武器、頭盔、胸甲、手套、腿甲、鞋子。

---

## 視角投影系統

### 戰鬥視角

僅包含戰鬥引擎需要的欄位：物品 ID、效果模板 ID、詞綴實例。不包含 UI 資訊與庫存資訊。

### 庫存視角

僅包含庫存管理需要的欄位：物品 ID、定義 ID、詞綴實例、槽位、堆疊數量。不包含效果資訊與 UI 資訊。

### UI 視角

僅包含 UI 渲染需要的欄位：物品 ID、顯示名稱、描述、圖示、稀有度、槽位、價格、詞綴描述。不包含效果資訊。

---

## 核心類別

### 詞綴生成器

接受隨機數生成器與詞綴定義，提供權重隨機選取與擲骰功能。支援可重現隨機數，保證同種子同結果。

### 效果工廠

泛型設計，支援註冊效果建構邏輯。可從詞綴實例或戰鬥視角物品批量建立效果。

### 物品定義註冊表

註冊與查詢物品定義，防止重複註冊，提供批量註冊功能。

### 詞綴定義註冊表

註冊與查詢詞綴定義，防止重複註冊，支援按分層查詢。

---

## 錯誤處理

使用專屬 ItemError 類別處理五種錯誤：重複定義、定義未找到、無效詞綴池、無效數值範圍、效果建構器未找到。

---

## 對外暴露的主要功能

### 類型定義

- IItemDefinition、IEquipmentDefinition、IRelicDefinition 物品定義
- IAffixDefinition、IAffixInstance 詞綴定義與實例
- ICombatItemView、IInventoryItemView、IUIItemView 視角投影
- EquipmentSlot、EquipmentRarity 槽位與稀有度

### 核心類別

- AffixRoller 詞綴生成器
- EffectFactory 效果工廠
- ItemDefinitionRegistry、AffixDefinitionRegistry 註冊表
- ItemError 錯誤類別

### 資料流程

物品生成器選擇定義，詞綴生成器擲出詞綴，建立庫存物品。進入戰鬥時，轉換為戰鬥視角，效果工廠建立效果，傳遞給戰鬥引擎。

### 顯示 UI 流程

```
1. 從 Inventory 取得 InventoryItem
2. UIItemViewFactory 轉換為 IUIItemView
3. UI 模組只接收 IUIItemView 進行渲染
```

---

## 八、設計原則

- **單一真相原則**：每個物品只有一份核心定義
- **視角投影模式**：不同模組維護自己需要的視角
- **工廠模式**：負責將靜態定義轉換為運行時物件
- **跨語言友好**：純資料結構，可序列化為 JSON
- **低耦合**：不依賴 Combat Engine、Inventory 或任何框架

---

## 九、與其他模組的關係

| 模組          | 依賴方向             | 說明                                    |
| ------------- | -------------------- | --------------------------------------- |
| Combat Engine | Item → Combat        | 使用 `ICombatItemView` 與 `IEffect`     |
| Inventory     | Item → Inventory     | 使用 `IInventoryItemView`               |
| ItemGenerator | Item → ItemGenerator | 使用 `IItemDefinition` 與 `AffixRoller` |
| UI            | Item → UI            | 使用 `IUIItemView`                      |

---

## 十、待辦事項

### 已完成

- [x] 建立 item 模組目錄結構
- [x] 定義 `IItemDefinition` 介面
- [x] 定義 `IEquipmentDefinition` / `IRelicDefinition` 介面
- [x] 定義 `IAffixDefinition` / `IAffixInstance` 介面
- [x] 實作 `AffixRoller` 類別
- [x] 定義視角投影介面
- [x] 實作 `CombatItemFactory` / `EffectFactory`
- [x] 實作註冊表類別
- [x] 建立 `ItemError` 錯誤類別
- [x] 整合 Combat Engine（移除舊 Equipment/Relic 抽象類別）

### 進行中

- [ ] 建立範例裝備與遺物定義資料

### 待實作

- [ ] 實作 `UIItemViewFactory`
- [ ] 建立 `Inventory` 模組整合
- [ ] 建立 `ItemGenerator` 模組
- [ ] 單元測試（未來統一實作）
