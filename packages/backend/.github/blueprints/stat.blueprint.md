# Stat（屬性）

## 1. 語意級

### 1.1 屬性分類

- maxHp / currentHp
- maxEnergy / currentEnergy
- energyRegen / energyGainOnAttack
- attackDamage / attackCooldown
- damageReduction（減傷百分比）
  - 取代原有 armor（護甲），以百分比形式呈現減傷效果，便於理解與計算。
- evasion（閃避率）
  - 將原有 evasion（閃避）與 accuracy（命中）簡化合併為 evasion（閃避率），部分異常狀態可影響閃避率。
- criticalChance / criticalMultiplier
- resurrectionChance / resurrectionHpPercent

---

## 2. 架構級

### 2.1 屬性聚合與運算

- 屬性聚合來源：
  - 修飾類型（如 +10 點、增加 50%攻擊力）。
  - Added、Multi 運算後獲得最終結果。
- 屬性有生命週期，分 Persistent Stats 與 Battle Stats。
- 所有裝備、遺物、大招的 Affix（詞綴）效果，經解析為 StatModifier（屬性修飾符）後，由屬性聚合系統轉化為可用數值。
- 異常狀態系統可動態修改屬性，影響戰鬥表現。
- 提供戰鬥行為（攻擊、防禦）所需權威數值。

#### 2.2 難度係數與 StatModifier

- StatModifier 來源（如 affix、ultimate）在聚合前，已經根據「難度係數倍率」調整過數值。
- 聚合系統僅處理已經計算好的最終值，確保效能與一致性。

---

## 3. 代碼級

### 3.1 設計原則

- StatModifier 來源多元，解析流程應統一。
- 所有來源皆經由轉換器轉為 StatModifier，聚合系統只處理 StatModifier。
- 解析規則資料化，方便擴展與測試。
