在 DDD（領域驅動設計）中，**Aggregate Root（聚合根）**、**Domain Entity（領域實體）**、**Value Object（值物件）** 是三個核心概念：

---

## 1. 聚合根（Aggregate Root）

- **定義**：聚合根是聚合（Aggregate）內部所有實體與值物件的唯一入口，負責維護聚合內部的一致性與完整性。
- **特點**：
  - 聚合根本身一定是實體（有唯一識別）。
  - 外部只能透過聚合根操作聚合內部的其他實體或值物件。
- **範例（以你的專案）**：
  - `Shop`：`Shop` 類就是商店聚合根，管理所有商店物品（`ShopItemAggregate`），外部只能透過 `Shop` 來增刪查改物品。
  - `Stash`：`Stash` 是倉庫聚合根，管理所有物品。
  - `CharacterAggregate`：角色聚合根，管理角色資料、職業、聖物、大絕招等。

---

## 2. 領域實體（Domain Entity）

- **定義**：具有唯一識別（ID），可隨時間變化的物件。
- **特點**：
  - 有自己的生命周期與識別。
  - 聚合根本身也是一種實體。
- **範例**：
  - 帶有 ID，且有自己的狀態。

---

## 3. 值物件（Value Object）

- **定義**：不具唯一識別，僅以屬性值判斷相等的物件，通常是不可變的。
- **特點**：
  - 只關心值，不關心身份。
  - 通常不可變（immutable）。
- **範例**：
  - 例如一個價格、地點、顏色等，兩個內容完全一樣的值物件視為同一個。

---

## 你的專案與傳統 DDD 的比較

### 1. **聚合根的設計**

- 你的專案明確將 `Shop`、`Stash`、`CharacterAggregate`、`Run` 等設計為聚合根，並且所有狀態變更都透過這些類別的方法（如 `addItem`、`removeItem`、`equipRelic` 等）來進行，這與 DDD 的聚合根設計原則一致。

### 2. **實體與聚合根的分界**

- 你的 `ShopItemAggregate`、`RelicAggregate`、`UltimateAggregate` 等，雖然名稱帶有 Aggregate，但實際上是聚合根內部的實體（Entity），而不是聚合根本身。這種命名方式在 DDD 社群中偶有出現，但嚴格來說只有聚合根才是 Aggregate，其他應稱為 Entity。
- 例如 `Shop` 是聚合根，`ShopItemAggregate` 是其內部的實體。

### 3. **值物件的使用**

- 你的專案有明確的值物件（如 `I18nField`、`ItemRollModifier`），但有些型別（如 `ChapterInfo`、`RunStatus`）是否為值物件，需看其是否只以值判斷相等且不可變。

### 4. **不可變性與狀態變更**

- 你的聚合根方法多數是「回傳新實例」而非直接修改自身，這很接近函數式 DDD 的實踐（immutable aggregate），這點與傳統 OOP DDD（直接改物件狀態）略有不同，但更利於狀態追蹤與測試。

### 5. **命名與分層**

- 命名上有些「Aggregate」其實是 Entity，這是小差異。
- 分層上，domain 層與 infra、app 層分離，符合 DDD 精神。

---

## 總結

- **聚合根**：聚合內唯一入口，維護一致性（如 Shop、Stash、CharacterAggregate）。
- **實體**：有唯一 ID，可變（如 ShopItemAggregate、RelicAggregate）。
- **值物件**：只以值判斷相等，不可變（如 I18nField）。
- **你的專案**：設計上大致符合 DDD，僅命名上「Aggregate」用於 Entity 有些混用，且偏向 immutable aggregate 的實踐，這是現代 DDD 的一種趨勢。

如需更細節範例或針對某個類別深入解析，歡迎再問！
