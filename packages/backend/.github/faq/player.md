# player（玩家帳戶）通用問答

## player 是什麼

- player（玩家帳戶）是 Run 之外的長期進度資料
- 包含養成、解鎖、成就、帳戶資訊等

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

## 設計注意事項

- 帳戶資料需有版本控制，避免多裝置衝突
- Run 進度更新需能原子性同步帳戶進度
- 帳戶資料與 Run Context 分離有助於維護

# player 給工程師

## 技術細節

- 帳戶資料長期儲存，包含解鎖、成就、升級、統計等
- Run Context 為臨時資料，包含角色、倉庫、進度、金幣、種子
- 帳戶與 Run Context 分離，資料結構獨立
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

## 安全性設計

- 尚未說明，建議補充帳戶安全、資料一致性等設計
