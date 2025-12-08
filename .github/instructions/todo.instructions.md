# Combat & Replay 模組 v0.4

## 很急

## 需要討論(討論時你的視角是資深架構師)

- combat 的業務邏輯似乎不關心 Equipment,Relic? 似乎只是為了提取他們的 effects? 這假說成立嗎?如果這個假說成立你認為該怎麼改?
- combat 目前 DamageChain 與 Attack 相關似乎沒做到反擊、反傷等邏輯，這假說成立嗎?如果這個假說成立你認為該怎麼改?
  反傷會重新運算一輪新的 DamageChain 才造成傷害。然後對方又有反傷的話不得循環。

- 我們是否要來製作 character 的當前屬性(已經被修飾完)，讓玩家能在戰鬥外看到已經算好的面板數值?
- 角色面板跟戰鬥內的屬性計算都會用到 Effect 還有 Attribute 計算邏輯，這部分要不要抽出來共用?從你的觀點來看
- 把這些你的看法整理成一份 next_plan.md 計劃書 生成在 .github/plans 目錄下

## 不急

## 未來統一實作

- 單元測試 (Jest) - 先不做
- 錯誤處理 (Try...Catch)

-
