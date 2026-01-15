# 盤點：從開始到現在

## ✅ 已解決的問題

- **數據同步不一致**：refreshShop 後 ContextManager 的 Map 層與 ALS 層數據不同步
  - 修復方式：ShopContextHandler.commit() 後主動調用 saveContext()
  - 效果：z 現在會正確顯示 50（扣款後）而非 100

- **架構耦合問題**：xo-c 層不應直接依賴 xo-b 的 ContextManager
  - 修復方式：創建 IContextPersistence 介面在 xo-c 層，由 xo-b 實現 Adapter
  - 效果：遊戲層對基礎設施完全無感

- **異步持久化預留**：為未來 DB 支援預留接口
  - 改造：ContextManager 改成 async 方法
  - 效果：未來改用 PostgreSQL/DynamoDB 只需改 Repository 實現

- **代碼品質清理**：移除所有 console.info 調試代碼，編譯驗證通過

## ⏳ 還未解決的問題

- **Equipment 與 Run 模組**：只改了 Shop，其他兩個業務模組還未同步
  - 工作量：30 分鐘（複製貼上 Shop 的改法）
  - 風險：低（模式完全一致）

- **樂觀鎖 AOP 自動化**：現在還是手動在 commit 後呼叫 saveContext()
  - 目前狀態：API 層明確負責（可測試、可控制）
  - 優化方向：用 Decorator 或 Interceptor 隱式化

- **本地 DB 集成**：ContextManager 支援 async，但 InMemoryContextRepository 還未實現
  - 預計工作：PostgreSQL/DynamoDB Repository 實現（2-3 小時）

- **樂觀鎖實現**：IContextBatchRepository 的樂觀鎖檢查邏輯還未寫
  - 預計工作：添加 version 欄位、衝突檢測、指數退避重試（2 小時）

## 🔄 衍伸出的新問題

- **API 層的重試邏輯**：如果 saveContext 失敗怎麼辦？需要重試機制嗎？
  - 現狀：拋出例外，讓 NestJS 的全局異常過濾器處理
  - 待決：要不要在 API 層加重試邏輯（trade-off：複雜度 vs 可靠性）

- **請求隔離的邊界**：REQUEST scope 的 AppContextHolder 在異步操作中是否還安全？
  - 現狀：ContextManager 有明確的 runId 傳遞，不依賴 REQUEST scope 的隱式
  - 待決：是否保留 AppContextHolder 還是完全移除（trade-off：向下兼容 vs 代碼清晰度）

- **版本控制**：多實例或 Serverless 環境下，同一 runId 的並發修改怎麼辦？
  - 現狀：Map 層天然無法支援多實例
  - 待決：樂觀鎖版本欄位從何而來？（trade-off：資料庫 sequence vs 時間戳 vs 事件版本號）

## 💭 Trade-off 討論的議題

| 議題                    | 選項 A            | 選項 B            | 選項 C               | 我們選了                     |
| ----------------------- | ----------------- | ----------------- | -------------------- | ---------------------------- |
| **同步在哪層**          | 基礎設施層（UoW） | API 層（Service） | AOP（Interceptor）   | **B**（現在）→ **C**（未來） |
| **ContextManager 命名** | 改名更清晰        | 保留現名          | 增加註解說明         | **B**（保留名字）            |
| **xo-c 依賴**           | 直接依賴 NestJS   | 抽象介面隔離      | 完全無依賴           | **B**（介面隔離）            |
| **本地快取方式**        | 只用 Map          | 只用 DB           | Map + DB 混合        | **C**（兩層快取）            |
| **DB 選擇時機**         | 現在就改          | 等到上線前改      | 預留接口，用時改     | **C**（預留接口）            |
| **樂觀鎖層級**          | 領域層（xo-c）    | API 層（xo-b）    | 數據層（Repository） | **B**（API 層）              |

## 🎯 討論過的核心議題

- **設計模式**：UoW、Repository、Adapter、Decorator 模式的合理性
- **架構邊界**：xo-c 純淨性 vs 實用性的平衡
- **異步策略**：何時 async、誰負責 await
- **依賴方向**：單向依賴規則的嚴格執行
- **測試性**：改造後的代碼是否易於單元測試（答案：是）
- **遷移成本**：現在的設計對未來改用 DB 或 Serverless 的成本有多大（答案：極低）
- **性能考量**：Map 快取 + DB 持久化的兩層架構是否會有開銷（答案：可接受，異步不阻塞）

## 🚀 接下來的三個方向

**立即（今天）**

- 改造 Equipment 與 Run 模組（30 分鐘）
- 測試 API 確保功能正常

**短期（本週）**

- 實現樂觀鎖 AOP（Decorator + Interceptor）
- 實現 PostgreSQL/DynamoDB Local Repository

**中期（上線前）**

- 完整的批量更新 + 版本控制
- Serverless 環境的多實例衝突處理
