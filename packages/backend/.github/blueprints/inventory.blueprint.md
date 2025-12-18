# Inventory（倉庫）

## 語意級

### 基本功能

- 存取操作：
  - 存入、取出物品（支援批量操作）
  - 背包容量固定 25 格，僅存放裝備
- 整理功能：
  - 搜尋、過濾、排序（可選）
  - 建議使用簡單 SelectBox，不需打字搜尋

### 不建議功能

- 複雜搜尋：
  - 避免玩家需要輸入文字搜尋
  - 若需搜尋代表設計不夠輕量

### 裝備 Slot 結構

玩家可同時穿戴 4 件裝備，每個 Slot 限一種類型：

1. 武器（Weapon Slot）
   - 唯一可卸下的槽位
   - 可任意替換
2. 上著（Upper Armor Slot）
   - 唯一可卸下的槽位
   - 可任意替換
3. 下著（Lower Armor Slot）
   - 唯一可卸下的槽位
   - 可任意替換
4. 技能寶石（SkillGem Slot）
   - 限制：無法卸下，僅能替換
   - 替換時原有的 Plugin Affix 自動銷毀
   - 保證玩家始終擁有一個有效技能

## 架構級

### 倉庫責任邊界

倉庫模組專責：

- 物品存取與容量管理
- 倉庫狀態的序列化/反序列化
- 批量操作的事務協調

倉庫不負責的內容：

- 金幣管理：由其他系統（如 CurrencySystem）負責
- 已穿戴裝備：由角色管理（CharacterManager）負責
- 物品出售：由交易系統（TradeSystem）負責
- 交易原子性：由外部事務系統處理（DynamoDB 層面實現）

### 裝備與遺物的區別

- 裝備（Equipment）
  - 可穿戴於 4 個 Slot 之一
  - 詞綴數值隨難度係數動態調整
  - 存放於背包（25 格容量）
- 遺物（Relic）
  - 不存放於背包，由獨立系統管理
  - 設計風格：規則性疊加而非純數值成長
  - 詞綴效果保持穩定（難度係數不影響）

## 代碼級

### 倉庫資料結構

```typescript
interface Inventory {
  capacity: number // 固定 25 格
  items: ItemInstance[] // 當前存放物品
}

interface EquipmentSlots {
  weapon: ItemInstance | null // 武器（Weapon）Slot
  upperArmor: ItemInstance | null // 上著（Upper Armor）Slot
  lowerArmor: ItemInstance | null // 下著（Lower Armor）Slot
  skillGem: ItemInstance // 技能寶石（Skill Gem）Slot（永不為空）
}
```

### 核心操作

#### 添加到倉庫

- 檢查容量是否充足
- 若滿則拒絕操作
- 成功時廣播 `InventoryUpdated` 事件

#### 從倉庫移除

- 檢查物品是否存在
- 支援批量移除
- 移除後更新計數

#### 穿戴裝備

- 檢查目標 Slot 是否與物品類型匹配
- 若 Slot 已有裝備 → 放回倉庫
- SkillGem 替換時銷毀舊有 Plugin Affix
- 廣播 `EquipmentChanged` 事件

#### 卸下裝備

- SkillGem Slot 禁止卸下
- 其他 Slot 卸下的裝備回到倉庫
- 檢查倉庫是否有空間
