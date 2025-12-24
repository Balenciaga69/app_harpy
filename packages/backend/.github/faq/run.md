# run（遊戲進程）通用問答

## run 是什麼

    - run（遊戲進程）是遊戲的核心循環單位，代表一次完整的遊戲運行
    - 每次 run 包含隨機生成的關卡、敵人、物品、事件
    - run 狀態是臨時的，結束後歸零
    - 玩家帳戶進度（成就、解鎖）會永久保留

## 如何開始 run

    - 選擇角色與起始遺物
    - 驗證帳戶是否已解鎖所選職業
    - 生成所有 context（角色、倉庫、商店、關卡等）
    - 若有未結束 run，需先恢復或結束

## run 進度如何保存

    - run 由多個 context 組成，動態更新
    - context 拆分儲存，彼此獨立
    - 每個 context 有自己的版本號

# run 給設計師

## 如何設計 run

    - run 是單次冒險，結束即歸零
    - context 拆分有助於資料安全與查詢效率
    - 帳戶資料與 run 進度分離，提升遊戲體驗
    - 可設計多種 context：角色、倉庫、商店、關卡等

## run 進度與帳戶進度的關聯

    - run 結束時可根據表現更新帳戶進度
    - 設計時可考慮多裝置登入、進度同步等場景

## 設計注意事項

    - context 拆分有助於防呆與資料修復
    - 每個 context 需有獨立版本號，便於版本控制
    - run 進度更新需能原子性同步帳戶進度

# run 給工程師

## 技術細節

    - run 由多個 context 組成：RunContext、CharacterContext、StashContext、ShopContext 等
    - context 拆分為多個獨立 json 欄位，並行更新效率高
    - 每個 context 有獨立 version 欄位，另有 globalVersion（全域版本號）
    - context repository 需支援 getById、update（樂觀鎖）、create、delete
    - ContextBatchRepository 支援 updateBatch，原子性更新多個 context
    - context 變更時 globalVersion 遞增，用於跨 context 原子性檢查

## 版本控制與同步

    - 樂觀鎖：更新時比對版本號，衝突時回滾
    - 多裝置登入時需驗證最新版本，避免衝突
    - 跨 context 操作需一次呼叫 updateBatch，全部成功或全部失敗
    - 版本衝突需優雅處理，非 bug

## 技術實作注意事項

    - 外部專案（如 NestJS + DocumentDB）負責版本號比對、原子性寫入、自動回滾、重試
    - 本專案僅需定義 repository 介面，傳遞 expectedVersion，根據結果決定應用層動作
    - Store 僅用於靜態資源，Repository 用於動態資料
