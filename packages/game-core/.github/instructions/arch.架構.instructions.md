---
applyTo: '/*.ts, /*.md'
---

# 技術架構與實現細節

上次更新：2025/12/14

## 1 角色與定位

### 1.1 你的角色

- 具備多觀點的系統與遊戲架構師
- 能從 Riot、TaoBao、UbiSoft、Nintendo 等公司汲取經驗
- 解釋技術選型與架構決策的合理性
- 延伸產業相關問題以深化技術探討

### 1.2 開發環境假定

- 開發環境：Windows 11
- 主要語言：TypeScript
- 運行時：Node.js
- 避免 Linux 特有指令

## 2 核心設計原則

### 2.1 系統的本質

- Context 驅動設計：輸入舊 Context → 應用業務規則 → 輸出新 Context
- 無狀態函數群體：不同 Server Instance 間可無痛切換
- 水平擴展性：可輕易增加 Server Instance 應對高流量
- 記憶體無持久化：遊戲狀態不保留在服務端記憶體或檔案系統

### 2.2 資料真相

- 唯一真相：所有狀態必須存放在後端資料庫
- 多裝置考量：玩家可能多裝置或多瀏覽器登入同一帳號
- 單一紀錄：同時只允許一個事實來源

## 3 系統架構分層

### 3.1 前端架構

- UI 層：純顯示與用戶互動，按鈕、畫面渲染、動畫效果，不涉及業務邏輯
- 邏輯層：前端業務規則與狀態管理，玩家操作驗證、遊戲狀態計算、事件處理，與 UI 分離
- Fetch API 層：統一數據請求與回應，開發階段本地模擬或上線階段真 API 調用，封裝網路邏輯

### 3.2 後端架構

- API 層：外部請求驗證、路由與中介邏輯，用戶登入、請求解析、錯誤處理，作為遊戲核心入口
- 遊戲核心層：專注遊戲邏輯與計算，無關資料來源（API 或直接調用）或儲存方式（Memory 或 DB），接收 Context 執行 RUN、戰鬥、商店等操作

### 3.3 開發範圍與邊界

- 當前範圍：遊戲邏輯層
- 外部層次：APIs (RESTful/GraphQL)、驗證、NoSQL/RDB、Redis
- 設計假定：無需考慮自己是 RESTful 或 GraphQL，或被當成函式庫直接調用
- 核心目標：作為無狀態的函數群體提供服務

## 4 領域模型與資料結構

### 4.1 靜態資料系統（Config）

資料特性：不隨玩家行為改變，由設計師維護

- 定義內容字典與規則書
- 決定所有可用內容、生成規則、數值範圍與條件
- 遊戲啟動時載入記憶體供邏輯查詢

Config 系統組成：

- Config Loader：從外部來源（JSON、資料庫、表格）載入並轉換格式
- Config Store：將資料存放於記憶體，提供高效查詢介面（getItem、getEnemy 等）
- Config Assembler：統一組裝與初始化所有靜態資料，處理資料關聯與驗證
- Config DTO：定義 Loader 載入時的資料格式

### 4.2 領域模型三層結構（Template / Record / Aggregate）

解決問題：貧血模型無法滿足複雜業務規則需求

設計層級（以 Relic 為例）：

- RelicTemplate：靜態屬性與規則定義，由設計師維護，來自表格
  - 負責說明這個物件是什麼
- RelicRecord：持久化資料，記錄與模板關聯、堆疊數等動態狀態
  - 負責記錄玩家擁有什麼
  - 被存入 DB
  - 只包含 ID 關聯的最小字段（貧血模型）
- RelicAggregate：Template + Record 組合，包含運行時行為與計算
  - 負責提供業務邏輯與行為
  - Template 與 Record 所有字段的組合體
  - 不被存入 DB，需要時動態組裝
  - 包含方法與行為（getStackCount、addStack、removeStack 等）

適用領域：詞綴（Affix）、敵人（Enemy）、物品（Item）、大絕招（Ultimate）、角色（Character）等

### 4.3 內容生成系統（Factory）

工廠用途：根據靜態模板與當前遊戲狀態動態生成 Aggregate

生成體系：

- 物品生成：商店、關卡掉落、獎勵
- 敵人生成：隨機選擇模板並套用難度係數
- 詞綴生成：與物品或敵人關聯
- 關卡節點生成：章節進度相關

Factory 層級：

- Factory（低階）：將 Template 與 Record 組合為完整 Aggregate
- AggregateService（高階）：使用 Factory、Config Store、Context Snapshot 來建立 Aggregate

## 5 動態資料系統（Context）

Context 定義：遊戲運行時的狀態快照，保存動態資料以供持久化

### 5.1 上下文分類

- 角色資訊（Character Context）
- 倉庫（Stash Context）
- 商店狀態（Shop Context）
- 戰鬥前事務（Pre-battle Context）
- 戰鬥後事務（Post-battle Context）
- 關卡進程（Stage Progress Context）
- 敵人資訊（Enemy Context）

### 5.2 儲存策略

- 拆分儲存：將 Run Context 拆分成多個子 JSON 欄位（角色屬性 JSON、倉庫 JSON、商店 JSON 等）
- 儲存位置：NoSQL 資料庫（遊戲核心 NoSQL），每個 Run 對應一筆記錄

優勢：

- 高效更新：小操作（如購買物品）僅讀取/更新相關欄位（倉庫 JSON），減少 IO
- 查詢支援：支援索引查詢（如金幣欄位），便於統計分析
- 性能優化：多欄位允許精準讀寫

挑戰：

- 一致性：欄位間一致性需額外處理（如交易確保多欄位同步）

### 5.3 版本控制與並發

機制：樂觀鎖策略，不加鎖，僅比對版本號

版本層級：

- 每個 Context 有獨立 version 欄位
- 全域版本號（globalVersion）用於跨 Context 原子性檢查
- 任一 Context 變更時全域版本號遞增

更新流程：

- App 層：讀取 Context 與版本號、計算新 Context、傳遞 expectedVersion
- Infra 層：驗證 expectedVersion、遞增版本號、提交或回滾所有更新

衝突處理：

- 版本不匹配時自動回滾
- App 層可選擇重試或提示用戶

批次更新：

- ContextBatchRepository 支援原子性更新多個 Context
- 要麼全部成功，要麼全部失敗

詳見 tech/context.md 的版本號與樂觀鎖章節

### 5.4 禁止清單

- 不存實體，只存 Template 與狀態
- 讓實際代碼還原成物件
- 所有狀態只在請求生命週期內存在於記憶體

## 6 儲存系統設計

### 6.1 儲存層次分工

NoSQL（遊戲核心）：

- 用於：Run 狀態與遊戲進度資料
- 特點：高效的 JSON 欄位操作、索引查詢、快速讀寫
- 職責：承載 Context 的動態資料

RDB（帳戶系統）：

- 用於：帳號資訊、金錢餘額、成就進度等後端業務核心資料
- 特點：高度一致性、交易性、明確關聯性

### 6.2 唯一真相

- 儲存系統（無論 Redis、PostgreSQL、MongoDB）扮演遊戲世界的唯一真相
- 所有狀態都來自資料庫，不允許在服務端保留
- 支援多 Server Instance 無痛切換

## 7 核心系統盤點

### 7.1 後端遊戲機制核心

基礎概念群（辭典）：

- 職業（Profession）
- 屬性（Stat）
- 異常狀態（Ailment）
- 大絕招（Ultimate）
- 詞綴（Affix）
- 物品（Item）
  - 遺物（Relic）
  - 裝備（Equipment）
- 關卡（Stage）
  - 戰鬥關卡（Combat Stage）
  - 事件關卡（Event Stage）
- 實體（Entity）
  - 敵人模板（Enemy Template）
  - 角色（Character）
  - 召喚物（Summon）
  - 戰鬥單位（Unit）
- 難度（Difficulty）

內容生成與數據管理：

- 生成系統：物品、詞綴、敵人、關卡
- 關卡節點生成
- 敵人配置生成
- 事件配置生成
- 原型轉實例系統：物品原型轉物品聚合、詞綴原型轉詞綴聚合、敵人原型轉敵人聚合
- 池系統：物品池、敵人池、事件池
- 屬性聚合系統
- 金幣系統
- 戰鬥運算系統

### 7.2 高階功能模組

- 戰鬥系統
  - 回合與階段系統
  - 牌型計算系統
  - 傷害計算系統
  - 戰局全域系統
  - ECS.js
- RUN 系統
- 商店系統
- 戰鬥前後事務系統
  - 下注遊戲
  - 賽前變數系統
  - 賽後獎勵與生成系統
- 賭博系統
- 倉庫系統
- 角色管理系統
- 商店交易系統

### 7.3 前端遊戲核心

- 角色與裝備面板
- 戰鬥重播系統
- 商店與賭博介面
- 倉庫介面
- RUN 進程介面
- 戰鬥前下注與賽前變數介面
- 戰鬥後獎勵選擇介面

### 7.4 後端業務核心

- 儲存系統（RUN 狀態、使用者資料）
- 使用者系統（註冊、登入、權限）
- 玩家系統（連結玩家帳戶）
  - 成就系統
  - 統計系統
  - 解鎖可用物系統

## 8 開發假定與前提

### 8.1 運作前提

- 所有輸入資料都已驗證（使用者正確、Run 已驗證）
- 驗證、阻攔等職責不在遊戲邏輯層負責
- 本專案不需意識到自己是線上遊戲

### 8.2 討論焦點

- 內容 95% 以上是單機 Run 內發生的事
- 帳戶層與 Run 層分離
- Run 結束即歸零，帳戶進度永久保留

## 9 相關文件導覽

詳細概念請參考 FAQ：

- tech/config.md：靜態資料系統設計
- tech/entity-model.md：Template/Record/Aggregate 三層結構
- tech/context.md：動態資料與版本控制詳解
- tech/factory.md：工廠模式與內容生成
- stat.md、affix.md、ultimate.md 等：具體領域模型實現
- run.md、stage.md、shop.md、stash.md 等：功能系統詳解
