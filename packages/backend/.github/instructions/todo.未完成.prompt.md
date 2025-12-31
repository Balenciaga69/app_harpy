---
applyTo: '/*.ts, /*.md'
---

- 似乎需要一套 價格系統才能 調節遊戲內的訂價 與 獎勵價值
- 價格調整應該要來自外部 price
- 獎勵要按照價值生成物品，這需要對算法下功夫

---

- 目前價格是綁定自 shop config 配置, 看來需要分離出來
  src\domain\shop\ShopConfig.ts
  src\domain\shop\PriceHelper.ts
  src\domain\shop\Shop.ts
  src\application\features\post-combat\PostCombatProcessor.ts
