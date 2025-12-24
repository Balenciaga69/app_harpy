# Player

## 什麼是 Game Player

- 遊戲中 Run 之外的資訊
- 包含養成內容、解鎖內容、成就系統、帳戶資訊等

## 帳戶進度管理

### 玩家帳戶資料 vs Run Context 分離

- 帳戶資料
  - 長期儲存, 跨 Run 保留
  - 包含: 解鎖的職業、遺物、升級、成就、統計資訊
  - 不會因為 Run 失敗而重置
- Run Context
  - 臨時儲存, 僅限單一 Run 使用
  - 包含: 角色、倉庫、進度、金幣、種子
  - Run 結束時清除或歸檔
- 分離的好處
  - 帳戶資料與遊戲進度邏輯解耦
  - 帳戶操作與 Run 操作可獨立進行
  - 版本控制策略可不同

### 帳戶層與 Run 層儲存契約

- 帳戶層
  - 存儲玩家帳戶資訊 (ID、名稱、創建時間)
  - 存儲解鎖進度 (職業、遺物、成就)
  - 存儲永久升級或修飾符
  - Repository: IPlayerAccountRepository
    - getById(accountId)
    - update(account, expectedVersion)
    - create(account)
- Run 層
  - 存儲當前活躍的 Run Context (角色、倉庫、進度)
  - Repository: IContextBatchRepository 與單個 context repository
  - 關聯到帳戶 ID, 但存儲獨立
- 關聯關係
  - 建立 Run 時, 驗證帳戶是否已解鎖所選職業
  - Run 結束時, 更新帳戶的解鎖進度或統計資訊

### 版本控制應用場景

- 帳戶級版本控制
  - 玩家解鎖新職業, 帳戶版本遞增
  - 多裝置登入時, 一個裝置解鎖職業, 另一裝置嘗試建立 Run
  - 需驗證最新版本帳戶的解鎖狀態
- Run 級版本控制
  - Run 進度更新, 各 context 版本遞增
  - 多裝置同時進行一個 Run, 需防止衝突
  - 確保戰鬥結算、商店購買等操作的正確性
- 跨層版本控制
  - Run 結束後, 需更新帳戶進度
  - 原子性: 同時提交 Run 狀態更新與帳戶進度更新
  - 若其中一個失敗, 整個操作回滾

## 安全性設計

- TODO: 尚未說明
