# 跨模組耦合與詞綴系統架構規劃報告

## 一、問題陳述

### 第一階段問題：裝備/遺物/效果的跨模組耦合

目前 Equipment 類別同時承載多個模組的需求，導致：

- Combat Engine 被迫依賴價格、圖示等不相關資訊
- Inventory 被迫依賴戰鬥效果的實作細節
- PersistentStorage 序列化了大量不必要的欄位

### 第二階段問題：裝備詞綴（Affix）與戰鬥效果的生成

詞綴系統需要處理三層轉換：

1. Affix Definition（靜態配置）
2. Affix Instance（動態生成）
3. Effect System（戰鬥計算）

目前缺乏明確的分層架構，可能導致 Combat Engine 與 Inventory 過度依賴彼此。

---

## 二、構思方案

### 核心原則

- 單一真相原則（Single Source of Truth）：每個裝備/遺物只有一份核心定義
- 視角投影模式（View Projection）：不同模組維護自己需要的視角
- 工廠模式（Factory Pattern）：負責將靜態定義轉換為運行時物件
- 跨語言友好：避免依賴特定框架，保持純資料結構可序列化

### 新增模組

將新增一個獨立模組 `item-system`，負責管理裝備與遺物的核心定義與視角投影。這個模組不依賴 Combat Engine 或 Inventory，而是作為共享的資料層。

---

## 三、Item System 模組設計

### 模組位置

新增 `src/core/item-system/` 目錄

### 目錄結構

- definitions/
  - 存放裝備基礎定義介面與型別
- affixes/
  - 存放詞綴定義、詞綴實例、詞綴池相關邏輯
- projections/
  - 存放各模組視角投影的介面定義
- factories/
  - 存放將定義轉換為視角投影的工廠類別
- registries/
  - 存放定義資料的靜態註冊表（類似資料庫）

### 新增檔案清單

1. definitions/item-definition.ts
   - 定義 IItemDefinition 介面，包含 id、effectTemplateIds、affixPool 等基礎欄位

2. definitions/equipment-definition.ts
   - 定義 IEquipmentDefinition 介面，繼承 IItemDefinition 並加入 slot、baseStats 等欄位

3. definitions/relic-definition.ts
   - 定義 IRelicDefinition 介面，繼承 IItemDefinition 並加入堆疊相關欄位

4. affixes/affix-definition.ts
   - 定義 IAffixDefinition 介面，包含 id、effectTemplateId、valueRange、tier 等欄位

5. affixes/affix-instance.ts
   - 定義 IAffixInstance 介面，包含 definitionId、rolledValue 等欄位

6. affixes/AffixRoller.ts
   - 詞綴生成器類別，接收 RNG 與定義表，產生 IAffixInstance

7. projections/combat-item-view.ts
   - 定義 ICombatItemView 介面，只包含 Combat Engine 需要的欄位

8. projections/inventory-item-view.ts
   - 定義 IInventoryItemView 介面，只包含 Inventory 需要的欄位

9. projections/ui-item-view.ts
   - 定義 IUIItemView 介面，只包含 UI 顯示需要的欄位

10. factories/CombatItemFactory.ts
    - 工廠類別，將 IItemDefinition 加上 IAffixInstance 陣列轉換為 ICombatItemView

11. factories/EffectFactory.ts
    - 工廠類別，將 effectTemplateId 加上參數轉換為 IEffect 實例

12. registries/ItemDefinitionRegistry.ts
    - 靜態註冊表，儲存所有 IItemDefinition 資料

13. registries/AffixDefinitionRegistry.ts
    - 靜態註冊表，儲存所有 IAffixDefinition 資料

---

## 四、既有模組修改

### Combat Engine 模組

1. 修改 EquipmentManager.ts
   - 改為接收 ICombatItemView 而非完整 Equipment
   - 只依賴 getEffects() 方法取得效果

2. 修改 RelicManager.ts
   - 改為接收 ICombatItemView 而非完整 Relic
   - 只依賴 getEffects() 方法取得效果

3. 修改 Equipment.ts（domain/item/models）
   - 移除 name、description、iconPath、price、rarity 等非戰鬥欄位
   - 改為實作 ICombatItemView 介面

### Inventory 模組（未來新增）

1. 新增 InventoryItem.ts
   - 實作 IInventoryItemView 介面
   - 儲存 itemDefinitionId 與 affixInstances（而非 effects）

2. 新增 InventoryManager.ts
   - 管理玩家持有的裝備與遺物
   - 使用 CombatItemFactory 在需要時生成戰鬥視角

### PersistentStorage 模組（未來新增）

1. 序列化格式
   - 只儲存 itemDefinitionId 與 affixInstances 陣列
   - 不儲存 effects 實例（運行時生成）

---

## 五、資料流程設計

### 裝備生成流程(TODO:先不做)

1. ItemGenerator 根據難度係數選擇 IEquipmentDefinition
2. AffixRoller 根據定義的 affixPool 生成 IAffixInstance 陣列
3. 建立 InventoryItem 儲存定義 ID 與詞綴實例
4. Inventory 模組持有 InventoryItem

### 進入戰鬥流程

1. 從 Inventory 取得 InventoryItem(這不是CombatEngine的事,調用前要做好準備)
2. CombatItemFactory 將 InventoryItem 轉換為 ICombatItemView
3. EffectFactory 根據詞綴實例生成 IEffect 陣列
4. Combat Engine 只接收 IEffect 陣列進行戰鬥計算

### 顯示 UI 流程(TODO:先不做)

1. 從 Inventory 取得 InventoryItem
2. UIItemViewFactory 將 InventoryItem 轉換為 IUIItemView
3. UI 模組只接收 IUIItemView 進行渲染

---

## 六、跨語言移植考量

### 友好設計

- 核心定義為純資料介面，可直接轉換為 JSON/YAML
- 視角投影是運行時生成，不需要持久化
- 工廠模式在 C#/Python/Go 都有對應實作
- 不依賴任何框架（React、EventBus 等）

### 移植建議

1. 定義檔案可直接轉換為目標語言的介面或結構體
2. 工廠類別的邏輯可無縫移植
3. 註冊表可改用目標語言的字典或映射表實作
4. RNG 介面保持簡單（只需 next() 方法），各語言都有對應實作

---

## 七、動工步驟

### 階段一：建立基礎架構

1. 建立 item-system 模組目錄結構
2. 定義 IItemDefinition 介面
3. 定義 IAffixDefinition 與 IAffixInstance 介面
4. 實作 AffixRoller 類別

### 階段二：建立視角投影

1. 定義 ICombatItemView 介面
2. 定義 IInventoryItemView 介面
3. 定義 IUIItemView 介面
4. 實作 CombatItemFactory 類別
5. 實作 EffectFactory 類別

### 階段三：建立註冊表

1. 實作 ItemDefinitionRegistry
2. 實作 AffixDefinitionRegistry
3. 建立範例定義資料

### 階段四：整合既有模組

1. 重構 Combat Engine 的 EquipmentManager
2. 重構 Combat Engine 的 RelicManager
3. 移除 Equipment 類別中的非戰鬥欄位

### 階段五：建立 Inventory 模組

1. 實作 InventoryItem 類別
2. 實作 InventoryManager 類別
3. 整合視角投影工廠

---

## 八、備註

### 關於效果模板系統

EffectFactory 需要維護一個效果模板註冊表，將 effectTemplateId 對應到具體的 IEffect 建構邏輯。這可以透過以下方式實作：

- 使用靜態映射表（Map）儲存模板 ID 與工廠函數的對應
- 每個效果類別註冊自己的建構邏輯
- 支援參數化建構（傳入詞綴數值）

### 關於現有 Equipment 類別

現有的 Equipment 類別可以暫時保留，作為過渡期的相容層。待新架構穩定後，再逐步移除舊實作。

### 關於單元測試

所有新模組應預先規劃可測試性，但實際測試撰寫排在未來統一實作。
