# Attribute 模組

## 簡介

- 負責管理角色的屬性系統，包括：
  - 基礎屬性值的初始化。
  - 修飾器的應用與排序。
  - 最終屬性值的計算。
- 支援加法與乘法修飾器，並提供優先級處理。
- 最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- BaseAttributeValues：基礎屬性值，用於初始化角色屬性。
- AttributeModifier：屬性修飾器，包含值、模式和來源。

### 主要輸出

- 計算後的屬性值：應用修飾器後的數值。
- 修飾器列表：特定屬性的所有修飾器。
- 屬性狀態：基礎值和修飾器的組合。

## 元件盤點

- AttributeCalculator：屬性計算器，處理修飾器的排序和應用邏輯。
- AttributeManager：屬性管理器，管理基礎值和修飾器的增刪查改。
- AttributeConstants：屬性常數，定義預設值和限制範圍。
- AttributeValues：屬性值介面，提供基礎屬性結構和預設創建函數。
- AttributeModifier：修飾器介面，定義修飾器的結構和優先級。
- AttributeType：屬性類型定義，列出所有支援的屬性。
- 介面層：定義IAttributeCalculator和IAttributeManager契約，確保元件間一致性。

## 模組依賴誰?或被誰依賴?

- Attribute 模組依賴 definition-config 模組的屬性模板和類型定義。
- Attribute 模組被 character-sheet 模組依賴，用於計算角色屬性，以及 combat 模組依賴，用於戰鬥屬性應用。

---

## 這個 Attribute 模組在做什麼？

想像你在做一款遊戲，每個角色都有「攻擊力」、「最大 HP」、「暴擊率」等屬性。這些屬性會被裝備、技能、Buff、Debuff 等各種來源影響，而且這些影響有加法（+100 攻擊力）、乘法（攻擊力 x1.2）、還有優先順序（先加再乘）。

**這個 Attribute 模組，就是專門負責「角色屬性的管理與計算」的。**

---

### 什麼時候你會需要調查或用到它？

#### 1. 玩家裝備了一把新武器

- 你需要把武器的攻擊力加到角色身上。
- 這時你會呼叫 `AttributeManager.addModifier()`，新增一個攻擊力修飾器。
- 角色的最終攻擊力怎麼算？呼叫 `AttributeCalculator.calculateAttribute('attackDamage')`，它會自動把所有加法、乘法修飾器套用，算出正確的數值。

#### 2. 玩家中了「攻擊力提升 20%」的 Buff

- 你會新增一個 mode 為 multiply 的修飾器。
- 這個修飾器會被自動套用在計算流程裡。

#### 3. 玩家死亡復活，HP 要重設

- 你會用 `AttributeManager.setBase('currentHp', 新值)`，同時這個值會被限制在合法範圍內（不會超過最大 HP，也不會變成負數）。

#### 4. 你要 Debug 為什麼角色攻擊力怪怪的

- 你可以用 `AttributeManager.getModifiers('attackDamage')` 查出所有影響攻擊力的修飾器來源。
- 這樣就能追蹤是哪個裝備、Buff、Debuff 影響了最終數值。
