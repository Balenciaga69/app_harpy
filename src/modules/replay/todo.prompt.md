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
  ✅ 已完成 (2025/12/04)

---

## 重構完成總結

### 完成項目

1. ✅ 建立 IEventBus 接口和 EventBus 實現
2. ✅ 建立 ReplayDataAdapter 隔離 Combat 模組依賴
3. ✅ 建立 PlaybackStateMachine 管理播放狀態轉換
4. ✅ 重構 ReplayEngine 為協調者（從 250+ 行簡化到 200 行）
5. ✅ 建立 combat/index.ts 統一導出公共 API
6. ✅ 更新 replay/index.ts 導出新架構的類型和類別
7. ✅ 刪除舊的 ReplayEventEmitter.ts

### 架構改進

- **職責分離**: ReplayEngine 從 6 個職責減少到 1 個（協調）
- **依賴隔離**: Combat 依賴集中到 ReplayDataAdapter
- **事件系統**: 使用 mitt 並提供類型安全的封裝
- **狀態管理**: PlaybackStateMachine 獨立管理狀態轉換
- **模組化**: 清晰的桶輸出，隱藏內部實現

### 新檔案結構

```
src/modules/
├── combat/
│   └── index.ts (新增桶輸出)
└── replay/
    ├── index.ts (更新桶輸出)
    ├── ReplayEngine.ts (重構為協調者)
    ├── adapters/
    │   └── ReplayDataAdapter.ts (新增)
    ├── core/
    │   └── PlaybackStateMachine.ts (新增)
    └── infra/
        ├── replay-event-emitter.ts (新增接口)
        └── EventBus.ts (新增實現)
```
