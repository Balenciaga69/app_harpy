## TODO

### CombatContext 不應該依賴 EventLogger

- 如果你讓 CombatContext 持有 EventLogger，你實際上是在走回頭路，讓 Context 再次承擔了不該有的職責。
- CombatContext 的職責是 「提供戰鬥當下的狀態 (State)」。
- EventLogger 的職責是 「記錄過去發生的歷史 (History/Output)」。
  狀態不應該依賴於輸出的機制。
- 你的戰鬥邏輯（System）不應該知道「日誌」的存在。System 只需要負責「做事」和「發送事件」。
- EventLogger 應該是一個 「掛在 EventBus 旁邊的監聽者」。
