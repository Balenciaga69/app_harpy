# Inventory 模組

## 簡介

- 負責管理角色的背包系統，包括：
  - 裝備和遺物的增刪查改操作。
  - 裝備槽位的裝備與卸裝管理。
  - 事件驅動的通知機制。
- 支援堆疊遺物和獨立裝備實例。
- 最後更新時間：2025-12-14。

## 輸入與輸出

### 主要輸入

- IEquipmentInstance：裝備實例，用於添加或裝備操作。
- IRelicInstance：遺物實例，用於添加或移除操作。
- equipmentId/relicId：物品 ID，用於查詢或移除。
- EquipmentSlot：裝備槽位，用於裝備操作。

### 主要輸出

- IInventoryOperationResult：操作結果，包含成功狀態和錯誤訊息。
- IEquipmentInstance[]/IRelicInstance[]：裝備或遺物列表。
- Map<EquipmentSlot, IEquipmentInstance>：已裝備物品映射。

## 元件盤點

- InventoryManager：核心管理器，處理背包的所有操作和狀態。
- EquipmentSlots：裝備槽位管理器，負責槽位的裝備與卸裝邏輯。
- InventoryEventBus：事件總線實作，提供事件發佈和訂閱功能。
- 錯誤類別：InventoryError、ItemNotFoundError 等，處理各種異常情況。
- 常數與訊息：INVENTORY_MESSAGES 等，定義操作訊息和限制。

## 模組依賴誰?或被誰依賴?

- Inventory 模組依賴 shared/event-bus 模組的事件總線，以及 features/item 模組的物品定義和類型。
- Inventory 模組被 character-manager 模組依賴，用於角色背包管理，以及其他 game-play 模組依賴，用於物品操作。
