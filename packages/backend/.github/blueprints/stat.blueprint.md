# Stat（屬性）

## 語意級

### 屬性分類

- maxHp / currentHp。
- maxEnergy / currentEnergy。
- energyRegen / energyGainOnAttack。
- attackDamage / attackCooldown。
- armor / evasion / accuracy。
- criticalChance / criticalMultiplier。
- resurrectionChance / resurrectionHpPercent。

## 架構級

### 屬性聚合與運算

- 聚合來源：
  - 修飾類型（如 +10 點、增加 50%、造成 30% 更多攻擊力）。
  - Added、Multi、More 運算後獲得最終結果。
- 屬性有生命週期，分 Persistent Stats 與 Battle Stats。
- 所有裝備、遺物、大招的 Affix 效果，經解析為 StatModifier 後，由屬性聚合系統轉化為可用數值。
- 異常狀態系統可動態修改屬性，影響戰鬥表現。
- 提供戰鬥行為（攻擊、防禦）所需權威數值。

### 難度係數與 StatModifier

- StatModifier 來源（如 affix、ultimate）在聚合前，已經根據「難度係數倍率」調整過數值。
- 聚合系統僅處理已經計算好的最終值，確保效能與一致性。

## 代碼級

### 設計原則

- StatModifier 來源多元，解析流程應統一。
- 所有來源皆經由轉換器轉為 StatModifier，聚合系統只處理 StatModifier。
- 解析規則資料化，方便擴展與測試。
