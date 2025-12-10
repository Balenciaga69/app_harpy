# Effect System 說明文件

## 簡介

Effect System 是一個共享的效果系統，負責管理角色的動態效果（Buff、Debuff、裝備效果等）。系統設計遵循關注點分離原則，可在戰鬥內外使用，並易於跨語言移植。

**最後更新時間：2025-12-10**

## 輸入與輸出

### 輸入

- **效果模板資訊（IEffectTemplateInfo）**：來自 Domain 層的物品詞綴資訊
- **效果建構參數**：詞綴擲骰數值（rolledValue）
- **服務提供者（IEffectServices）**：角色操作介面

### 輸出

- **效果實例（IEffect）**：可被 EffectManager 管理的效果物件
- **屬性修飾器（AttributeModifier）**：靜態效果產生的屬性加成

## 元件盤點

### 核心管理元件

#### EffectManager

效果管理器，負責管理附加到角色的效果實例。

- 添加、移除效果
- 觸發效果鉤子（onApply、onRemove、onHpZero、onRevive）
- 清除符合條件的效果（如復活時清除 Debuff）
- 支援戰鬥內外使用

#### StackableEffect

可堆疊效果的抽象基類。

- 支援效果層數管理
- 自動處理層數增減邏輯
- 提供模板方法模式

### 效果建構元件

#### EffectBuilder

效果建構器，負責從效果模板資訊建構具體的效果實例。

- 支援靜態效果（effect*static*_）與 Class 效果（effect*class*_）
- 自動判斷效果類型並調用對應建構邏輯
- 批次建構效果實例

#### StaticEffectGenerator

靜態效果生成器，處理 effect*static*\* 類型的效果模板。

- 根據模板 ID 解析屬性類型
- 生成輕量級屬性加成效果
- 支援的屬性類型：
  - attack_damage（攻擊傷害）
  - max_hp（最大生命值）
  - critical_chance（暴擊率）
  - critical_multiplier（暴擊倍率）
  - armor（護甲）
  - evasion（閃避）
  - accuracy（命中）
  - energy_regen（能量回復）
  - energy_gain_on_attack（攻擊能量獲取）
  - resurrection_chance（復活率）
  - attack_cooldown（攻擊冷卻）

#### ClassEffectRegistry

Class 效果註冊表，維護 effect*class*\* 與對應 Effect Class 的映射。

- 單例模式，全局共享註冊表
- 支援運行時註冊新效果類型
- 提供清晰的錯誤訊息

#### registerDefaultClassEffects

預設 Class 效果註冊函式，應在應用初始化時調用。

- 註冊所有內建的 Class 效果
- 包括裝備效果、原生狀態效果、特殊效果

### 錯誤處理元件

#### EffectBuilderError

效果建構器基礎錯誤類別。

#### UnknownEffectTemplateError

未知效果模板錯誤，當 effectTemplateId 格式無法識別時拋出。

#### InvalidStaticEffectError

無效靜態效果錯誤，當靜態效果格式錯誤或無法解析時拋出。

#### ClassNotRegisteredError

Class 效果未註冊錯誤，當 Class 效果未在註冊表中時拋出。

### 介面定義

#### IEffect

所有效果的基礎介面。

- id：唯一識別碼
- name：效果名稱
- cleanseOnRevive：復活時是否清除此效果

#### IEffectLifeHook

效果生命週期鉤子。

- onApply：效果應用時觸發
- onRemove：效果移除時觸發

#### ICharacterStateHook

角色狀態鉤子。

- onHpZero：血量歸零時觸發
- onRevive：復活時觸發

#### ICombatEffectHook

戰鬥專屬鉤子。

- onTick：每個戰鬥 tick 觸發
- onDamageModify：傷害修改階段觸發
- onCritCheck：暴擊檢查階段觸發
- 等...（與 Combat System 整合）

#### IEffectServices

Effect 基礎服務介面。

- getCharacter：取得角色操作介面

#### ICombatEffectServices

戰鬥專屬 Effect 服務介面。

- 繼承 IEffectServices
- emitEvent：發送事件（用於日誌記錄）
- getCurrentTick：取得當前 tick
- random：取得隨機數

#### ICharacterFacade

角色屬性操作最小介面。

- getAttribute：取得屬性值
- addAttributeModifier：添加屬性修飾器
- removeAttributeModifier：移除屬性修飾器
- setCurrentHpClamped：設定當前生命值
- isDead：是否死亡

## 模組依賴關係

### 依賴誰

- **domain/attribute**：屬性類型定義（AttributeType）
- **logic/attribute-system**：屬性修飾器（AttributeModifier）
- **domain/item**：效果模板資訊（IEffectTemplateInfo）
- **impl/effects**：具體效果實作（BloodPactEffect、ChargeEffect 等）

### 被誰依賴

- **logic/combat**：戰鬥系統使用效果管理器與效果實例
- **logic/character-sheet**：角色面板計算使用效果系統
- **logic/run**：關卡進程使用效果系統
- **未來的戰鬥外系統**：任何需要動態效果的系統

## 使用流程

### 1. 初始化效果系統

```typescript
import { registerDefaultClassEffects } from '@/logic/effect-system'

// 應在應用啟動時調用一次
registerDefaultClassEffects()
```

### 2. 從物品建構效果

```typescript
import { EffectBuilder } from '@/logic/effect-system'
import { EffectFactory } from '@/domain/item/factories/EffectFactory'

// 提取效果模板資訊
const effectFactory = new EffectFactory(affixRegistry)
const templateInfos = effectFactory.createFromCombatItem(combatItem)

// 建構效果實例
const effectBuilder = new EffectBuilder()
const effects = effectBuilder.buildEffects(templateInfos)
```

### 3. 將效果注入到角色

```typescript
import { EffectManager } from '@/logic/effect-system'

// 角色的效果管理器
const effectManager = new EffectManager(characterId)

// 添加效果
for (const effect of effects) {
  effectManager.addEffect(effect, services)
}
```

### 4. 觸發效果鉤子

```typescript
// 血量歸零時
effectManager.triggerHpZero(services)

// 復活時
effectManager.triggerRevive(services)
effectManager.cleanseOnRevive(services)
```

## 設計原則

### 關注點分離

- **Domain 層（Item）**：提供資料（效果模板資訊）
- **Logic 層（Effect System）**：建構行為（效果實例）
- **Impl 層（Effects）**：具體實作（各種效果類別）

### 服務定位器模式

- 效果不直接持有角色引用
- 透過 IEffectServices 取得角色操作能力
- 解耦效果與具體角色實作

### 介面分離原則

- IEffectServices：基礎服務，戰鬥內外共用
- ICombatEffectServices：戰鬥專屬服務
- 效果可選擇性實作鉤子介面

### 效能優化

- 靜態效果使用輕量級實作，避免不必要的鉤子註冊
- Class 效果按需實例化
- 支援批次處理效果建構

### 擴充性

- 支援動態註冊新效果類型
- 效果參數化配置
- 易於新增新的效果鉤子

## 未來擴展

### 短期

- 完善靜態效果支援的屬性類型
- 優化 Class 效果參數傳遞機制
- 增強錯誤處理與日誌記錄

### 中期

- 效果優先級系統
- 效果互斥機制
- 效果條件觸發

### 長期

- 效果編輯器支援
- 動態效果載入
- 多平台效果同步
