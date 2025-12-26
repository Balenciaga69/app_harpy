---
applyTo: '/*.ts, /*.md'
---

## 問題一:

Character, Stash 都有一種高頻操作: 新增、移除物品
在傳統開發上, 新增, 移除哪個東西 都會發送 API
舉例 穿上遺物,又卸下遺物 這樣反覆十次 就會發送 20 次 API 外加 DB 存取
現在我打算是把這些高頻操作都放在前端, 等到使用者確定要儲存的時候(可能是默認關閉後), 再一次發送 API
同時又很麻煩, 我要驗證使用者的操作是否合法, 不會產生複製裝,神裝,遺失裝等問題例如他拿到某個神裝的ID, 然後生成

所以我必須開發一個"操作記錄"系統且同時又要可以抵銷(補償), 防止大量操作堆積傳輸。
而目前 Character , Stash 都各自為政 而且寫得不太好, 不是我要的樣子

### 衍伸問題

抵銷大量操作的問題, 例如前端對同一物件裝備上又放回倉庫5次, 應該視為0次。這種設計可行?
我很講究成熟的解決方案

## 問題二:

CharacterService 目前都在操作 Context 而非 Domain Object, 所以目前來看 Character Service 的功能不可行

## 問題三:

AffixEffectConditionProperty ON_EQUIP 有效果的 Affixes 將會默認穿戴上之後不論戰鬥內外都會生效
而 StatModifyAction 就能被轉換成 StatModifier. 目前還沒做這個問題

## 問題四:

- UltimateTemplate.UltimateHookEvent 跟 AffixEffectTrigger 應該要統一起來做成一個掛勾型別類

## 問題五:

我上述所有疑慮與煩惱是否都有成熟的解決方案?(不論是遊戲業或者轉換成企業軟體業都有?)

## 不急著做

- 多國語言資料支援
- Stage Event 支援
- 召喚系概念

# 我有想法了!

## 事件掛勾系統

- Type: GameHook (這裡後續我會自己調整,你先這樣做就好,這不需要豐富物件模型, 只需要一個簡單的 類型)
  ON_BEFORE_DAMAGE
  ON_COMBAT_START
  ON_EQUIP
  ON_UNEQUIP
  ON_CAST
  ON_DRAW
  ON_REDRAW
  ON_BATTLE_START
  ON_BATTLE_END
  先幫我做這幾個類別 然後讓 UltimateTemplate.UltimateHookEvent 跟 AffixEffectTrigger 都不再使用, 改用這個類
  這樣即可
