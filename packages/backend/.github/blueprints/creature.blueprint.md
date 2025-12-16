## Entity,Unit,Minion

- Entity 擁有各自的戰鬥上下文。但它本質上非常抽象。。它代表著可以被狀態、詞綴和戰鬥事件作用的對象。
- 玩家和敵人都應該被視為同一個 Unit 類型，是 Entity 的具體實作
- 召喚物、圖騰 屬於 Minion 功能比 Unit 少很多，Unit 全死亡，但還留著 Minion 依然算輸。
