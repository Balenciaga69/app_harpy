原本: 以 JSON 字串的形式儲存在 Redis 的 String 類型中
改為 Redis Hash 類型 並練習與觀察差異 以及注意事項與未來擴充與優缺點
以及 如何處理只讀取部分欄位的需求

---

在用戶登入或刷新 token 時
加入一個 sorted set
來計算累計 Run 關卡數量最多玩家有哪些

---

我們的 REPO save 方法已經使用了 pipeline 來確保多個操作的原子性
這是一個很好的基礎，可以進一步探討更複雜的並發控制。
如果 AccessTokenRecord 或 RefreshTokenRecord 的 expiresAt 是從 Redis 中讀取後再進行邏輯判斷和寫入，那麼在讀取和寫入之間可能會發生 race condition。
(WATCH/MULTI/EXEC) 或許是我們需要的解決方案?!

---

探討:
如果有多個服務實例同時嘗試執行 deleteAllByUserId，是否會存在潛在的 race condition？例如，一個實例正在讀取 smembers，另一個實例同時刪除了部分 member。雖然 pipeline 確保了 del 操作的原子性，但讀取 smembers 和執行 pipeline 之間仍然存在間隙。

---

目前 findByUsername 只能進行精確匹配。如果未來需要模糊搜尋、部分匹配或多欄位搜尋用戶，RediSearch 將是一個強大的工具。

---

把這些都視為 任務遊戲
我們目前的環境都能做到嗎?
還是要準備一些新工具或架構調整?
