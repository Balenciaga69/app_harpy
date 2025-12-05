# Combat 模組 v0.4

## 很急(我們只圍繞在 combat 模組)

## 需要討論(暫時先不提及)

## 不急

- 引入領域錯誤 CombatError Extends Errors

## 未來統一實作

- 單元測試 (Jest) - 先不做
- 錯誤處理 (Try...Catch)
  - 對每個模組評估是否該做 Exception 或者 純粹回傳 Result 型別
  - 這一塊有爭議，有人說戰鬥模組不應該有拋例外狀況
  ```朋友意見
    用途：只在最外層（CombatEngine.start() 這層轉成錯誤往外拋，中間所有模組一律不 throw。對不要在 DamageChain、EffectProcessor、AttackExecutor 裡面 throw → 會把整場戰鬥打斷，玩家會直接看到「戰鬥異常」失敗。
    戰鬥迴圈 100% 禁止拋 Exception全部改用 Result<T, CombatError> 或 Railway-Oriented Programming
    你現在這套 OOP 已經接近極限了，99% 的情況不需要再優化
    除非你有一天要同時模擬 1000 場戰鬥（AI 訓練場景），否則你現在這套 OOP 已經是性價比最高的寫法。
    把 Ticker 改 async generator（避免阻塞事件循環）
  ```
- 記憶體管理與效能優化
