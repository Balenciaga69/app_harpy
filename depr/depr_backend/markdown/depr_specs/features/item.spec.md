# Item 模組

## 簡介

- 負責管理物品系統，包括裝備、遺物和詞綴的定義、註冊和實例化。
- 支援物品的動態生成和效果轉換。
- 提供完整的物品管理架構。
- 最後更新時間 ：2025-12-13。

## 輸入與輸出

### 主要輸入

- IItemDefinition ：物品定義，包含基本屬性和配置。
- IAffixInstance ：詞綴實例，包含定義ID和滾動值。

### 主要輸出

- IEquipmentInstance/IRelicInstance ：物品實例，包含詞綴和屬性。
- IEffectTemplateInfo[] ：效果模板資訊，用於效果生成。

## 元件盤點

- AffixDefinitionRegistry ：詞綴定義註冊表，管理詞綴的註冊和查詢。
- ItemDefinitionRegistry ：物品定義註冊表，管理物品的註冊和查詢。
- CombatItemFactory ：戰鬥物品工廠，生成戰鬥用的物品視圖。
- EffectFactory ：效果工廠，從詞綴生成效果模板資訊。
- 定義介面 ：IEquipmentDefinition、IRelicDefinition等，定義物品結構。
- 投影介面 ：ICombatItemView、IInventoryItemView等，提供不同場景的視圖。
- 錯誤處理 ：ItemError，自訂錯誤類別。

## 模組依賴誰?或被誰依賴?

- Item 模組依賴 definition-config 模組的物品和詞綴模板。
- Item 模組被 character-sheet 模組依賴，用於裝備和遺物處理，以及 effect 模組依賴，用於效果生成。

---

## 模組設計理念解讀

### 核心概念：Definition vs Instance

這個模組最重要的概念是區分定義和實例。

Definition 定義

- IAffixDefinition：詞綴的藍圖，定義可增加的屬性範圍。
- IEquipmentDefinition：裝備的藍圖，定義可擁有的詞綴數量。
- 就像遊戲資料表，靜態不變，可重複使用。

Instance 實例

- IAffixInstance：具體的詞綴，包含實際滾動的數值。
- IEquipmentInstance：具體的裝備，屬於特定玩家。
- 就像遊戲存檔，動態唯一，包含玩家數據。

為什麼要分開？

- 節省記憶體：相同藍圖的物品不需重複儲存靜態資料。
- 靈活性：同一藍圖可生成無限件不同屬性的物品。
- 符合遊戲設計：策劃定義藍圖，程式生成實例。

### 各層職責拆解

介面層：契約定義

- definitions：定義資料結構契約，IItemDefinition 為基礎契約，IEquipmentDefinition 和 IRelicDefinition 繼承並擴充特定屬性。
- projections：提供不同場景的視圖契約，ICombatItemView 用於戰鬥，IInventoryItemView 用於背包，IUIItemView 用於介面顯示。遵循單一職責原則，不同場景只取需要的資料。
- factories：定義工廠輸出契約，IEffectTemplateInfo 描述詞綴到效果的轉換。
- 設計優點：介面只定義型別不包含邏輯，可被其他模組安全引用，實作變更不影響契約。

領域層：核心邏輯

- Registry 模式：AffixDefinitionRegistry 和 ItemDefinitionRegistry 管理所有定義，提供集中管理、防止重複註冊、快速查詢和批量操作。
- 使用實例而非全局單例：支援測試時建立獨立實例，互不干擾，也支援多實例場景。
- ItemError：統一錯誤處理，用 code 區分錯誤類型，用靜態方法建立錯誤，攜帶 context 便於除錯。

應用層：應用協調

- Factory 模式：CombatItemFactory 轉換定義和詞綴實例為戰鬥視圖，EffectFactory 轉換詞綴實例為效果模板資訊。
- 封裝建立邏輯：統一處理複雜的物品創建流程。
- 依賴注入：EffectFactory 接收 AffixDefinitionRegistry，不直接依賴實作。
- EffectFactory 依賴 AffixRegistry 的原因：需要根據 affixInstance.definitionId 查找詞綴定義，從定義中取得 effectTemplateId 生成效果。

### 資料流動路徑

以玩家獲得裝備為例說明元件協作流程。

載入遊戲時

- definition-config 提供藍圖資料。
- ItemDefinitionRegistry 和 AffixDefinitionRegistry 註冊定義。

生成裝備時

- ItemGenerator 查詢 Registry 取得 IEquipmentDefinition。
- 根據 affixPoolIds 隨機選擇詞綴。
- 滾動 rolledValue 在 minValue 到 maxValue 之間。
- 生成 IEquipmentInstance。

裝備上角色時

- CharacterSheet 接收 IEquipmentInstance。
- CombatItemFactory 轉換成 ICombatItemView。
- EffectFactory 從詞綴生成 IEffectTemplateInfo。
- EffectManager 根據 templateId 建立實際效果。
- 效果影響角色屬性。

顯示在 UI 時

- ItemUIMapper 查詢 Registry 取得定義。
- 組合成 IUIItemView。
- 前端渲染名稱、圖示、屬性描述。

### 為什麼需要多種 View

不同場景需要不同的視圖隔離。

各 View 的用途

- ICombatItemView：戰鬥邏輯只需要 id 和詞綴效果。
- IInventoryItemView：背包系統需要槽位和堆疊資訊。
- IUIItemView：UI 需要展示所有資訊但不需要內部 definitionId。

設計好處

- 降低耦合：各系統只看到需要的資料。
- 減少資料傳輸：跨前後端時不傳送冗餘資訊。
- 提高安全性：避免暴露內部實作細節。

---

## Equipment 與 Relic 差異說明

- Equipment（裝備）
  - 主要用於角色穿戴，會有明確的裝備槽位（如武器、頭盔、護甲等）。
  - 每件裝備只能裝備在一個特定的槽位上（如 `slot: 'weapon'`）。
  - 不允許堆疊，每個角色同時只能穿戴一件同類型裝備。
  - 具備詞綴池（affixPoolIds），可隨機生成不同屬性的裝備。
  - 具備稀有度（rarity）、最小/最大詞綴數（minAffixes/maxAffixes）等屬性。
  - 主要影響角色的基礎戰鬥能力。

- Relic（遺物）
  - 通常作為特殊增益物品，提供額外能力或被動效果。
  - 可以設定是否可堆疊（`stackable: boolean`），以及最大堆疊數（`maxStack`）。
  - 沒有明確的裝備槽位，通常以收集或持有的方式存在。
  - 也有詞綴池與稀有度等屬性，但設計上更偏向於收集與疊加效果。
  - 主要用於提供額外的被動能力或特殊效果，強化角色。

---

### 設計上的意義

- 裝備：強調「穿戴」與「唯一性」，每個部位只能有一件，直接影響角色屬性。
- 遺物：強調「收集」與「堆疊性」，可同時持有多個，疊加效果靈活，設計上更偏向策略與搭配。
