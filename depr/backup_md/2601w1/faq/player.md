# player（玩家帳戶）通用問答

## player 是什麼

- player（玩家帳戶）是 Run 之外的長期進度資料
- 包含養成、解鎖、成就、帳戶資訊等
- Player 是可選的, 不該為了支援帳戶系統阻礙 Run 的建立
- Player 在設計階段是被允許放在 db, local, 或者根本不存任何地方 (NullPlayer)
- Player 是允許登入或不登入但找不回的

# Player 負責

- 紀錄成就與進度系統(AchievementProgress)
- 已解鎖的各種內容
- 帳戶累計數據與統計
- 帳戶資訊、生命週期管理(可否建立新戰局)
- 防多瀏覽器多裝置修改衝突

## player 帳戶與 Run 有什麼不同

- 帳戶資料長期保存，Run Context（遊戲進程資料）僅限單次遊戲
- 帳戶資料不會因 Run 失敗而重置
- Run 結束時帳戶資料可更新

## player 帳戶進度如何管理

- 解鎖職業、遺物、成就等都屬於帳戶進度
- 帳戶進度與 Run 進度分離，互不影響

# player 給設計師

## 如何設計 player 帳戶

- 帳戶資料需能跨 Run 保留
- 解鎖內容、成就、升級等都屬於帳戶層級
- Run Context 僅保存單次遊戲的臨時資料
- 帳戶與 Run 分離有助於遊戲體驗與資料安全

## 帳戶進度與 Run 進度的關聯

- 建立 Run 時需驗證帳戶解鎖狀態
- Run 結束時可根據表現更新帳戶進度
- 設計時可考慮多裝置登入、進度同步等場景
- 開發階段時 遊戲進度存在前端
- 開發上線後 遊戲進度存在後端, 不保留未登入的進度, 無登入用戶進度會定期清除

## 設計注意事項

- 帳戶資料需有版本控制，避免多裝置衝突
- Run 進度更新需能原子性同步帳戶進度
- 帳戶資料與 Run Context 分離有助於維護

# player 給工程師

## 技術細節

- PlayerTemplate：定義玩家帳戶的靜態設定
- PlayerRecord：記錄玩家帳戶的持久化資料，包含解鎖狀態、成就進度、統計數據等
- PlayerAggregate：由 Template + Record 組合而成，包含所有運行時行為
  - getUnlockedContent()：取得已解鎖的內容
  - getAchievementProgress()：取得成就進度
  - updateUnlocked()：更新解鎖狀態
- PlayerAggregate 不被存入 DB，需要時由 Template + Record 動態組裝
- 帳戶層 Repository：IPlayerAccountRepository
  - getById(accountId)
  - update(account, expectedVersion)
  - create(account)
- Run 層 Repository：IContextBatchRepository 及各 context repository
- Run 與帳戶以帳戶 ID 關聯，但資料獨立

## 版本控制與同步

- 帳戶級版本控制：解鎖新內容時帳戶版本遞增
- Run 級版本控制：每個 context 有獨立版本
- 跨層版本控制：Run 結束時需原子性同步帳戶與 Run 狀態
- 多裝置登入時需驗證最新版本，避免衝突

## 技術實作注意事項

- 樂觀鎖機制：更新時比對版本號，衝突時回滾
- Repository 介面需支援原子性批次更新
- 版本衝突需優雅處理，非 bug
- Store 僅用於靜態資源，Repository 用於動態資料
