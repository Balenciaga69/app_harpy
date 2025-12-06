# Combat & Replay 模組 v0.4

## 很急

- 盤點 戰鬥引擎還有甚麼沒做的？

## 需要討論

## 不急

## 未來統一實作

- 單元測試 (Jest) - 先不做
- 錯誤處理 (Try...Catch)

## 資深開發給的長遠建議:

- CombatEngine 已經是「半事件驅動」了，但還差最後一里路。
- 要達到真正「業界頂級 RogueLite 戰鬥引擎」的標準（Hades / Slay the Spire / Dead Cells / Risk of Rain 2 內部都是這樣），必須把現在「在 Tick 裡面撈 hook」的做法全部改成「純事件驅動 + 事件訂閱」。每一個「可被中斷、可被監聽、可被取代」的動作都 emit 事件 → 所有效果、遺物、buff 都只監聽事件 → 完全不在 Tick 裡面撈 hook。
  CombatEngine 如果純 Event驅動 那這樣做會有順序正確性問題嗎?
  例如魔力恢復前執行了施放大絕招?攻擊七大階段無法正確執行?
  多角色同tick下事件順序會亂掉?
  盤點如果保持現在這樣 CombatEngine 在哪些情況與改動下將會遇到困難?給我幾個甲方需求讓我想像，
  (我其實不太懂他的想法，我都有 attack phase 可以擴充了 還有 Damage chain 可以按階段劃分不同的戰鬥階段狀態呈現更細緻的控制) 為何他還要給我這些建議

說明上述內容
接著你來開發 骨架雛形 關於 run　未完成的內容你就 not implemented

---
