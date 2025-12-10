# EffectBuilder 實作計畫

## 更新時間

2025-12-10

## 背景說明

Item 模組重構已完成，將 Effect 來源單一化為 `IAffixDefinition.effectTemplateId`。目前 Domain 層能提供 `IEffectTemplateInfo`，但 Logic 層缺少從 `IEffectTemplateInfo` 到 `IEffect` 的轉換邏輯。Combat System 需要具體的 `IEffect[]` 實例才能運作。

## 目標

建立完整的 Effect 建構鏈，讓物品效果能正確注入到角色與戰鬥系統中。

### 具體目標

- 實作 EffectBuilder 處理 `effect_static_*` 與 `effect_class_*` 兩種類型
- 完成 Item → Effect 的完整資料流程
- 確保 Combat Engine 能接收正確的 `IEffect[]`
- 維持 Domain/Logic 層的關注點分離

## 負責模組

**logic/effect-system** 模組負責此功能。

### 設計原則

- **關注點分離**：Domain 層提供資料，Logic 層建構行為
- **效能優化**：靜態效果避免不必要的鉤子註冊
- **擴充性**：支援動態註冊新效果類型
- **測試性**：EffectBuilder 可單獨測試

## 需要建立的元件

### 1. EffectBuilder 類別

核心元件，負責接收 `IEffectTemplateInfo[]` 並輸出 `IEffect[]`。

#### 主要方法

- `buildEffects(templateInfos: IEffectTemplateInfo[]): IEffect[]`
- `buildStaticEffect(templateInfo: IEffectTemplateInfo): IEffect`
- `buildClassEffect(templateInfo: IEffectTemplateInfo): IEffect`

#### 依賴注入

- 靜態效果生成器
- Class 效果註冊表

### 2. 靜態效果生成器 (StaticEffectGenerator)

處理 `effect_static_*` 的自動實例化。

#### 支援的靜態效果類型

- effect_static_attack_power：攻擊力加成
- effect_static_health：血量加成
- effect_static_critical_rate：暴擊率加成
- effect_static_defense：防禦加成

#### 實作方式

根據 templateId 解析屬性類型與數值，生成輕量級實例。

### 3. Class 效果註冊表 (ClassEffectRegistry)

維護 `effect_class_*` 與對應 Class 的映射。

#### 註冊機制

- `register(effectClassId: string, constructor: EffectConstructor)`
- `getConstructor(effectClassId: string): EffectConstructor`

#### 支援的 Class 效果類型

- effect_class_blood_pact：BloodPactEffect
- effect_class_thunder_strike：ThunderStrikeUltimate
- effect_class_native_status：各種原生狀態效果

## 需要修改的現有元件

### 1. 更新 logic/effect-system spec

在 effect-system 的 spec 文檔中加入 EffectBuilder 的完整說明。

### 2. Character 建構流程整合

在 Character 建構時加入 EffectBuilder 調用點。

#### 整合位置

- CharacterSheetCalculator 或 Character 建構器
- 從 Inventory Manager 獲取物品實例
- 透過 EffectFactory 獲取 IEffectTemplateInfo[]
- 使用 EffectBuilder 生成 IEffect[]
- 注入到 Character 的 EffectManager

### 3. 錯誤處理增強

為 EffectBuilder 加入完善的錯誤處理機制。

#### 錯誤類型

- UnknownEffectTemplate：未知的 effectTemplateId
- InvalidStaticEffect：靜態效果格式錯誤
- ClassNotRegistered：Class 效果未註冊

## 實作步驟

### 階段一：基礎架構建立

1. 建立 EffectBuilder 類別骨架
2. 實作靜態效果生成器的基礎邏輯
3. 建立 Class 效果註冊表

### 階段二：靜態效果實作

1. 定義支援的靜態效果類型
2. 實作屬性解析邏輯
3. 建立輕量級效果實例生成

### 階段三：Class 效果整合

1. 實作 Class 效果註冊機制
2. 整合現有的 Effect 實作
3. 處理建構參數注入

### 階段四：系統整合

1. 更新 Character 建構流程
2. 整合 Inventory 與 Effect 系統
3. 更新相關 spec 文檔

### 階段五：測試與驗證

1. 單元測試 EffectBuilder
2. 整合測試 Character 效果注入
3. 端到端測試物品效果在戰鬥中的表現

## 設計考量

### 效能考量

- 靜態效果使用記憶體池避免頻繁實例化
- Class 效果實例重用機制
- 批次處理多個效果建構

### 擴充性考量

- 支援動態載入新效果類型
- 效果參數化配置
- 版本相容性處理

### 測試性考量

- EffectBuilder 獨立測試
- Mock 依賴注入
- 效果行為驗證

### 維護性考量

- 清晰的錯誤訊息
- 詳細的日誌記錄
- 效果建構追蹤

## 驗證方式

### 單元測試

- EffectBuilder.buildEffects 正確處理不同類型效果
- 靜態效果生成正確的屬性加成
- Class 效果正確實例化對應類型

### 整合測試

- Character 建構時正確注入物品效果
- 戰鬥中效果正確觸發
- 屬性計算包含物品加成

### 端到端測試

- 玩家穿戴裝備後屬性正確更新
- 戰鬥中特殊效果正確運作
- 效果移除時屬性正確還原

## 風險評估

### 技術風險

- 效果建構參數注入複雜度
- 記憶體洩漏風險（效果實例管理）
- 效能瓶頸（大量效果實例化）

### 業務風險

- 效果行為不一致
- 向後相容性問題
- 測試覆蓋不足

## 後續工作

### 短期

- 實作 EffectBuilder 基礎版本
- 支援核心靜態效果
- 整合現有 Class 效果

### 中期

- 完善錯誤處理
- 效能優化
- 擴充效果類型支援

### 長期

- 效果編輯器支援
- 動態效果載入
- 多平台效果同步
