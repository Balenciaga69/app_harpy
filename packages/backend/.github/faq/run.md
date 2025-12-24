# Run

## 什麼是 Run

- 遊戲的核心循環單位, 代表一次完整的遊戲運行
- 類似 Slay the Spire 或 Hades 的單次冒險
- 每次 Run 包含隨機生成的關卡、敵人、物品和事件
- 玩家從選擇角色開始, 通過戰鬥和決策推進, 直到勝利或失敗
- Run 狀態是臨時的, 成功或失敗後結束
- 玩家帳戶層級的進度 (成就、解鎖內容) 會保留
- 由多個 Context 組成: 角色資訊、倉庫、商店狀態、關卡進程
- Context 在 Run 期間動態更新

## 創建角色與開啟新 Run

### 創角色

- 取得玩家可選的 Profession 和 Start Relic 等模板給前端
- 玩家可調整名稱 (可選)
- 驗證模板是否存在、是否已解鎖 (基於帳戶進度)
- 創建角色實例, 連同 Run Context 存儲到帳戶

### 開啟新遊戲

- 若有局外之物需注入本 Run (如永久升級), 做成管道函數
- API 端口層驗證是否可創建: 檢查無其他啟動中的 Run、用戶合法性、資源充足
- 生成所有 Context: 角色資訊、倉庫、商店狀態、關卡進程
- 序列化後存儲到外部持久化系統
- 存儲策略: 拆分成多個子 JSON 欄位, 添加版本與樂觀鎖機制
- 若玩家有未結束 Run: 提供恢復選項或強制結束舊 Run

### 找回 Run 的內容

- 大多數功能都需與各種 Context 交互
- 從持久化存儲調取反序列資訊是必須的
- 所有行為視為請求, 非本地狀態管理
- 初始化函數: 在 serverless 環境中預載入 RUN Context
  - 從外部持久化系統獲取子欄位
  - 加速請求並確保數據一致性
- 創角色請求不需初始化 (僅帳戶數據)
- Run 相關請求 (如繼續遊戲) 需觸發初始化

## Run 狀態持久化

### Context 拆分儲存策略

- 不把所有 context 儲存在單一文件或欄位
- 拆分為多個獨立的 JSON 欄位
  - RunContext、CharacterContext、StashContext 等
  - 並行更新效率更高
  - 易於查詢和序列化
  - 若某個 context 損壞, 不影響其他欄位

### 版本號與全域版本欄位

- 每個 context 都有自己的 version 欄位 - 詳見 context.md
- 額外的 globalVersion 欄位
  - 存放在 Run 的主文件或獨立欄位
  - 任何 context 變更都遞增 globalVersion
  - 用於跨 context 原子性檢查

### Repository 介面契約

- 定義泛型 Repository 介面, 所有 context repo 繼承
  - getById(id): 讀取 context, 包含版本號
  - update(context, expectedVersion): 樂觀鎖更新, 衝突回傳 null
  - create(context): 建立新 context, 自動設定 version=1
  - delete(id): 刪除 context
- 定義 ContextBatchRepository 介面
  - updateBatch(updates, globalVersion): 原子性更新多個 context
  - 若任一 context 版本不符, 全部回滾
- 介面定義在 app 層, 實作在外部專案 (infra 層)

### 跨 Context 操作示意

- 戰鬥結算
  - 更新 RunContext、CharacterContext、StashContext
  - 一次呼叫 updateBatch, 全部成功或全部失敗
- 商店購買 (減少金幣、增加物品)
  - 更新 StashContext、RunContext、ShopContext
  - 一次呼叫 updateBatch
- 裝備遺物
  - 更新 CharacterContext: 遺物
  - 更新 StashContext: 移除遺物
  - 一次呼叫 updateBatch

## 版本控制與併發安全

### 樂觀鎖原理簡述

- 樂觀鎖: 假設衝突不常發生, 不在讀取時上鎖
- 流程
  - 讀取資料及其版本號
  - 在本地修改資料
  - 更新時, 檢查版本號是否與資料庫相符
  - 相符: 寫入並遞增版本號
  - 不相符: 放棄寫入, 提示衝突
- 優點: 高併發下效率更好、無死鎖風險
- 缺點: 衝突後需重試、應用層邏輯略複雜

### 多裝置登入同帳號的一致性保證

- 玩家在裝置 A 和裝置 B 同時登入
- 兩個裝置都讀取相同版本的 context (v1)
- 裝置 A 先更新 context v1 -> v2, 存入資料庫
- 裝置 B 嘗試更新, 但期望版本是 v1, 資料庫版本已是 v2
- 衝突檢查失敗, 裝置 B 回傳 null 或錯誤
- 裝置 B 應重新讀取最新資料 (v2), 重新計算、重新提交
- 最終結果: 全部操作都對應到最新版本, 保證一致性

### 外部專案職責 (交易、回滾)

- 外部專案 (NestJS + DocumentDB 或其他可能的技術實踐) 實作
  - 版本號比對邏輯
  - 原子性寫入 (多 context 同時更新)
  - 衝突時的自動回滾
  - 自動遞增版本號
  - 重試機制 (可選)
- 本專案只需
  - 定義 repository 介面
  - 傳遞 expectedVersion
  - 根據結果決定應用層動作
- 版本衝突不是 bug, 是正常的併發現象, 應優雅處理

## Store vs Repository

- 專案中有 Store, Repo 兩種儲存會使人困惑
- Store 是靜態資源的訪問器, 就好比遊戲該有哪些裝備模板,角色模板,不用在乎併發問題
- Repository 是即時遊戲狀態的動態持久操作, 在實作會涉及 DB, 版本檢查,鎖 等機制
