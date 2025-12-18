# Affix（詞綴）

## 語意級（設計師閱讀）

### 詞綴的定義

Affix（詞綴）是靜態模板，描述遊戲中發生的效果與參數（如影響屬性、觸發行為、賦予狀態）。

模板不包含運行時邏輯，由生成層與運行時系統（事件系統、屬性聚合系統等）協作實現。

### 數值調整與難度係數

- Affix/Effect 數值會根據「難度係數倍率」進行調整。
- 生成 AffixInstance 時，會帶入當前關卡或遊戲進度的難度係數。
- 計算公式範例：
  - 最終數值 = 基底值 × 難度係數 × 詞綴倍率
- 例：基底 100，難度係數 30，詞綴倍率 0.9，則最終為 100 × 30 × 0.9 = 2700。
- 這種設計可讓同一模板在不同進度下產生不同強度，提升遊戲彈性與平衡。

### 詞綴的職責

詞綴模板（AffixTemplate）責任明確：

- 定義行為與基礎數值，保持純粹。
- 不關心持有者或堆疊規則（由載體決定）。
- 所有詞綴由物品模板或敵人模板預先綁定，無動態選擇、無權重、無 roll。
- 效果直接嵌入物品/敵人模板，啟動時全量附加。

### 誰關心 Affix

- 載體：物品、裝備、遺物、終極寶石（Ultimate Gem）。
- 系統：詞綴生成系統、狀態系統、屬性聚合系統、事件系統。
- 表現：賽前變數效果以狀態實例或屬性修飾符（StatModifier）注入。

### 常見問答

#### Q: 詞綴是什麼？

A: 靜態模板，定義效果與參數（ID、Tags、EffectTemplateId 等）。生成與運行時規則由其他系統處理。

#### Q: 修飾符是什麼？

A: 運行時純數值單元（Modifier / StatModifier），由 AffixInstance 與 EffectTemplate 解析產生，被屬性聚合系統使用（Add/Multi/More 等）。

#### Q: 詞綴實體（AffixInstance）如何生成？

A: 物品模板預定義詞綴列表 → 直接附加所有詞綴到物品實例 → 檢查排他/家族規則確保無矛盾 → 建立 AffixInstance 注入目標。

## 架構級

### 名詞定義統一

- AffixTemplate（詞綴模板）
  - 靜態藍圖，定義觸發條件、行為類型與參數
- AffixInstance（詞綴實體）
  - 物品模板綁定的詞綴實例，含 affixTemplateId、sourceId、metadata、uniqueCounter
- Modifier / StatModifier
  - 由 AffixInstance 與 EffectTemplate 解析的純數值修飾，用於屬性運算

### 詞綴層次與轉換

- Affix 屬戰鬥外靜態資源。
- 戰鬥時，Affix 轉換為 1..n 個 Modifier 並送入聚合系統。
- 轉換過程由專門的 EffectProcessor 負責，將 AffixInstance 與 EffectTemplate 解析為 StatModifier。
- 聚合系統維持穩定介面，不直接依賴轉換細節。

### 屬性聚合系統

聚合系統要點：

- 僅依賴 StatModifier，不直接認識 AffixTemplate 或 preCombat。
- 轉換器由上層注入，轉換 AffixInstance 與 EffectTemplate 為 ModifierInstance。
- 聚合系統維持穩定介面，便於擴充來源。

### 詞綴綁定結構

- 詞綴直接綁定在模板中：
  - 物品模板綁定：
    - itemTemplate.affixes = [affixId1, affixId2, ...]（無權重、無選擇）
  - 敵人模板綁定：
    - enemyTemplate.affixes（按難度模式不同可設定不同詞綴陣列）
  - 詞綴定義：
    - ID
    - Tags
    - EffectTemplateId
    - 運算方式（Add / Multi / More）
    - 生效條件

## 代碼級

### 詞綴生成流程

1. 物品/敵人模板預定義 affixes 陣列。
2. 實例化時直接讀取該陣列中所有詞綴。
3. 建立 AffixInstance 陣列並注入目標。

【無選擇、無權重、完全按模板決定。】

### EffectProcessor（效果處理器）

轉換詞綴效果的專門処理器，責任清晰：

- 作用：將 AffixInstance 與 EffectTemplate 解析為 StatModifier 或其他可執行的效果單元。
- 流程：讀取 EffectTemplate 定義 → 應用難度係數倍率 → 生成 ModifierInstance 並注入屬性聚合系統。
- 隔離：EffectProcessor 獨立於業務邏輯，易於測試與擴展。
- 復用性：同一 Processor 可被多個來源使用（Affix、Ultimate、Item 等）。

### 測試工具：上帝模式

提供「上帝模式」測試工具，具備功能：

- 自由選擇並附加任意詞綴組合到任何載體。
- 用於邊界測試與驗證。
- 正式環境套用 Context 規則以確保平衡。

### 設計原則

- 隔離依賴：Affix 生成涉及多系統，明確隔離避免隱性耦合。
- 轉換器介面：設計專責資料轉換的介面，不放業務規則。
- 事件驅動：多數條件由 EventSystem（OnAttack、OnUltimate、OnDeath、OnCast）實作。
- 狀態語義：狀態/層數、不可逆與堆疊需明確定義。
- 無狀態設計：AffixInstance 本身不持有「當前是第幾次攻擊」等運行時狀態，詞綴只負責查詢相關數值。狀態管理由系統層級（如事件計數器、屬性聚合系統）維護。

## 參考構思範例

- 賽前變數
  - 開局獲得 16 層充能
- 敵人詞綴（普通）
  - 每三次攻擊第三次傷害 ×2.0
- 敵人詞綴（Boss）
  - 每三次攻擊第三次傷害 ×2.0，附加 2 層 Chill
    | 聖遺物詞綴 | 每次攻擊吸血 1%，可疊加最多 20 個 |
    | 裝備詞綴 | 生命值 <10% 時，復活率 +20%、復活生命 +15% |
    | 賽前變數 | 施放大招後，敵人閃避與護甲 -10% |
    | 裝備詞綴 | 每層 Chill 攻擊力 +5% 或 +12 |
    | 裝備詞綴 | 當敵人HP低於50%我的攻擊力+10%,當TargetEnemy生命低於10%我的攻擊命變成他當前生命值得truedamge |
