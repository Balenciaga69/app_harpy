- 探討 Replay 是否需要 onion 層次的架構來做模組化
- 探討 Replay 用 Event mitt 的必要性
- 探討 Replay 職責、需要取得甚麼才能提供甚麼？
- 探討 Replay 未來可能的擴充性
- 探討 該版本是否該重構?
  上述以討論完畢

---

我知道了

- 我們的事件處理使用 mitt 且封裝並移工類型安全，除了發送器外其他物件不該知道 mitt 的存在
- Replay 職責就是時間軸標記 這點我確定了
- 你來詳細介紹 ReplayEngine 單獨這個檔案用途給我看。裡面代碼太多了
- 我在想是否 replay 依賴的 combat 內容單獨做一個檔案來管理會比較好? 還是沒幫助?
- 我在想 combat, replay 是否也要單獨做一個桶輸出的檔案?
  上述以討論完畢

---

我知道了

- 我們先討論為何 combat 用那麼麻煩的層次，而replay用 controller , services, models , utils, main(ReplayEngine) 這樣的架構? 還是說其實combat也該簡化成這樣(這題口頭敘述就好)
- ReplayEngine 確實需要拆分多大職責，他太擁擠且職責過多 (幫我調整)
- replay,combat 的桶輸出與連動修改 確實要做 這個也要納入等等調整內容
- replay 我們來依賴 mitt 而不是自己實作事件系統 這樣比較好維護
  上述都照著你想法處理吧!
