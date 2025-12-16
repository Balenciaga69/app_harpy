## 屬性

### 屬性分類

- maxHp / currentHp
- maxEnergy / currentEnergy
- energyRegen / energyGainOnAttack
- attackDamage / attackCooldown
- armor / evasion / accuracy
- criticalChance / criticalMultiplier
- resurrectionChance / resurrectionHpPercent

### 屬性聚合與運算

- 聚合來源：
  - 修飾類型（如 +10 點、增加 50%、造成 30% 更多攻擊力）
  - Added、Multi、More 運算後獲得最終結果
- 屬性有生命週期，分 Persistent Stats 與 Battle Stats
- 所有裝備、遺物、大招的 Affix 效果，經解析為 StatModifier 後，由屬性聚合系統轉化為可用數值
- 異常狀態系統可動態修改屬性，影響戰鬥表現
- 提供戰鬥行為（攻擊、防禦）所需權威數值
