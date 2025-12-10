# Item 模組規格說明

## 簡介

Item 模組負責定義和管理遊戲中的物品系統，包括裝備、遺物、詞綴和相關的視角投影。模組提供統一的物品資料結構、工廠模式生成和多層次視角支援，確保物品系統的靈活性和可擴充性。

### 核心責任

Item Module 是整個遊戲中「物品系統」的基礎設施，提供：

1. **物品定義管理** - 靜態模板的註冊與查詢
2. **物品實例生成** - 從定義隨機生成具體物品
3. **物品投影轉換** - 將物品轉換為不同視角（Combat、UI、Inventory）
4. **詞綴系統** - 物品屬性的核心機制
5. **效果資訊提取** - 提供效果模板資訊給 Logic 層建構

最後更新時間：2025/12/10。

## 輸入與輸出

### 輸入

- 物品定義數據（IItemDefinition, IEquipmentDefinition, IRelicDefinition）：包含物品 ID、詞綴池和生成規則
- 詞綴定義數據（IAffixDefinition）：包含詞綴 ID、數值範圍、權重和效果模板 ID
- 生成參數（隨機種子、難度等）：用於物品實例生成
- 查詢參數（ID 或類型）：用於從註冊表查詢定義

### 輸出

- 物品定義實例：查詢到的物品或詞綴定義數據
- 物品實例（IEquipmentInstance, IRelicInstance）：生成的具體物品物件
- 詞綴實例（IAffixInstance）：生成的詞綴物件
- 視角投影（ICombatItemView, IInventoryItemView, IUIItemView）：針對不同場景的物品表示
- 效果模板資訊（IEffectTemplateInfo）：提供給 Logic 層建構具體效果的資料
- 錯誤資訊（ItemError）：註冊或生成失敗時的錯誤訊息

## 元件盤點

### 定義元件

- IItemDefinition：物品核心定義介面，作為裝備和遺物的基礎，提供詞綴池和生成規則。
- IEquipmentDefinition：裝備定義介面，包含槽位、基礎屬性和稀有度。
- IRelicDefinition：遺物定義介面，支援堆疊機制。
- IAffixDefinition：詞綴定義介面，定義數值範圍、權重、分類標籤和效果模板 ID。
- EquipmentSlot：裝備槽位類型定義。
- EquipmentRarity：裝備稀有度類型定義。

### 實例元件

- IEquipmentInstance：裝備實例介面，包含唯一 ID、定義 ID、稀有度和詞綴列表。
- IRelicInstance：遺物實例介面，包含唯一 ID、定義 ID、堆疊數量和詞綴列表。
- IAffixInstance：詞綴實例介面，包含定義 ID 和滾動值。

### 工廠元件

- CombatItemFactory：戰鬥物品工廠，負責將物品定義轉換為戰鬥視角投影。
- EffectFactory：效果工廠，負責從物品詞綴提取效果模板資訊，提供給 Logic 層建構具體效果。

### 投影元件

- ICombatItemView：戰鬥視角的物品投影，只包含戰鬥計算所需的 ID 和詞綴實例。
- IInventoryItemView：倉庫視角的物品投影，包含倉庫管理所需的完整物品資訊。
- IUIItemView：UI 視角的物品投影，包含介面顯示所需的格式化資料。

### 註冊表元件

- ItemDefinitionRegistry：物品定義註冊表，提供物品定義的註冊和查詢。
- AffixDefinitionRegistry：詞綴定義註冊表，提供詞綴定義的註冊和查詢。

### 工具元件

- AffixRoller：詞綴滾動器，負責根據定義生成隨機詞綴實例。

### 效果相關元件

- IEffectTemplateInfo：效果模板資訊介面，包含模板 ID 和對應詞綴實例，提供給 Logic 層建構具體效果。

### 概念元件

- Item（物品）：裝備與遺物的統稱，作為可穿戴/使用的遊戲物件，提供屬性加成。
- Equipment（裝備）：不可堆疊的物品，一個裝備槽只能裝備一件，如武器、頭盔等。
- Relic（遺物）：可堆疊的物品，可無限累積，如特殊道具、被動技能等。
- Affix（詞綴）：物品的屬性修飾器，決定具體的數值效果，包含定義與實例之分。
- Definition（定義）：靜態模板，描述物品/詞綴的基礎屬性，包含生成規則但不含具體數值。
- Instance（實例）：從定義生成的具體物件，包含隨機產生的數值，可序列化儲存。

### 核心概念詳細定義

#### Item（物品）

裝備（Equipment）與遺物（Relic）的統稱，作為可穿戴/使用的遊戲物件，提供屬性加成。純資料結構，可序列化，跨語言友好。

#### Equipment（裝備）

不可堆疊的物品，一個裝備槽只能裝備一件。例子包括武器、頭盔、護甲、項鍊、鞋子等。有稀有度等級，決定詞綴數量與品質。

#### Relic（遺物）

可堆疊的物品，可無限累積。例子包括特殊道具、被動技能等。有堆疊計數（stackCount），效果可疊加。

#### Affix（詞綴）

物品的屬性修飾器，決定具體的數值效果。例子：`+25 攻擊力`、`+8% 暴擊率`、`+100 HP`。有定義（AffixDefinition）與實例（AffixInstance）之分，包含效果模板 ID（effectTemplateId），有階級（tier）、權重（weight）、標籤（tags）。

#### Definition（定義）

靜態模板，描述物品/詞綴的基礎屬性。種類包括 IItemDefinition、IEquipmentDefinition、IRelicDefinition、IAffixDefinition。包含生成規則，但不包含具體數值。

#### Instance（實例）

從定義生成的具體物件，包含隨機產生的數值。種類包括 IEquipmentInstance、IRelicInstance、IAffixInstance。可序列化儲存，包含玩家進度。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- 無直接依賴：作為基礎定義模組，不依賴其他模組

### 被依賴的模組

- logic/item-generator：物品生成器，依賴物品定義進行隨機生成
- logic/combat：戰鬥系統，依賴物品實例和視角進行戰鬥計算
- logic/inventory：倉庫系統，依賴物品定義和投影進行物品管理
- logic/attribute-system：屬性系統，依賴物品效果進行屬性修改
- logic/effect-system：效果系統，依賴效果模板資訊建構具體效果實例
- UI 層：物品顯示，依賴視角投影進行介面渲染

## 與 Effect 的關係

### 設計原則

- 單一事實來源：Effect 來源完全由 IAffixDefinition.effectTemplateId 決定
- 關注點分離：Domain 層只負責提供 IEffectTemplateInfo（純資料），Logic 層負責建構具體 IEffect 實例
- 低耦合：Combat Engine 只接收 IEffect[]，不知 Item 的存在
- 可移植性：資料結構 JSON 友好，便於跨語言實作

### 資料流程

物品實例 (IEquipmentInstance/IRelicInstance) → 詞綴實例 (IAffixInstance[]) → 詞綴定義 (IAffixDefinition.effectTemplateId) → 效果模板資訊 (IEffectTemplateInfo) → 具體效果 (IEffect)

#### 從物品轉換成效果的詳細流程圖(僅說明)

```
物品實例 (IEquipmentInstance/IRelicInstance)
    ↓ 包含
詞綴實例 (IAffixInstance[])
    ↓ 透過 AffixDefinitionRegistry 查詢
詞綴定義 (IAffixDefinition.effectTemplateId)
    ↓ 由 EffectFactory 封裝為
效果模板資訊 (IEffectTemplateInfo)
    ↓ 由 Logic 層使用
具體效果 (IEffect)
```
