## 完整實作方案設計文檔

### 架構概述

```
Controller (HTTP 層)
  ↓ runId + 操作數據
Interceptor (初始化上下文)
  ↓ 加載 IAppContext，設置到 AsyncLocalStorage
Service 層 (業務層)
  ↓ 使用 runId 調用
Adapter (連接層)
  ↓ 從 AsyncLocalStorage 取出 IAppContext
  ↓ 初始化 game-core 服務
game-core 層 (純邏輯層)
```

### 核心設計原則

1. **AsyncLocalStorage 上下文傳遞**
   - 優點：自動跟隨異步調用，不需要層層傳遞
   - 優點：NestJS 原生支持
   - 優雅度：★★★★★

2. **REQUEST Scope ContextManager**
   - 生命週期與請求一致
   - 自動提交變更
   - 自動清理資源

3. **完整的 Adapter 實現**
   - 根據 IAppContext 初始化所有 game-core 依賴
   - 提供真實的 IShopContextHandler 實現
   - 提供真實的 IItemGenerationService 實現

4. **DTO 需要包含 runId**
   - Controller 驗證 runId 存在
   - Interceptor 根據 runId 加載上下文

### 實現步驟

#### 第1步：建立上下文提供者（AsyncLocalStorage）

- 檔案：`src/infra/context/ContextStorage.ts`
- 職責：管理當前請求的 IAppContext

#### 第2步：建立 ContextManager（REQUEST Scope）

- 檔案：`src/infra/context/ContextManager.ts`
- 職責：加載、管理、提交 IAppContext
- 生命週期：REQUEST

#### 第3步：建立初始化 Interceptor

- 檔案：`src/infra/interceptors/ContextInitializationInterceptor.ts`
- 職責：在每個請求開始時從 DTO 提取 runId
- 負責：加載 IAppContext 到 ContextStorage

#### 第4步：實現完整 Adapter

- 檔案：修改 `GameCoreShopContextHandlerAdapter.ts` 和 `GameCoreItemGenerationServiceAdapter.ts`
- 職責：根據 ContextStorage 中的 IAppContext 初始化 game-core 服務
- 完整實現：不再是 Stub

#### 第5步：修改 Module 配置

- 移除 useFactory 的複雜初始化
- 改為依賴注入 Adapter
- Adapter 內部自動取得 IAppContext

#### 第6步：修改 DTO

- 確保所有操作 DTO 都包含 runId
- Controller 層驗證

### 優點

✅ game-core 完全不變  
✅ 所有 game-core 功能都能使用  
✅ 優雅利用 NestJS 特性  
✅ 自動的上下文管理  
✅ 清晰的分層  
✅ 易於測試

### 需要改動的檔案

- `AsyncAppContextProvider.ts` (新建)
- `ContextManager.ts` (修改當前的)
- `ContextInitializationInterceptor.ts` (新建)
- `GameCoreShopContextHandlerAdapter.ts` (完整實現)
- `GameCoreItemGenerationServiceAdapter.ts` (完整實現)
- `run.module.ts` (修改 DI 配置)
- `BuyItemDto.ts`, `SellItemDto.ts`, `RefreshShopDto.ts` (確保有 runId)
- `ShopServiceWrapper.ts` (修改簽名，改為 async)
- `run.service.ts` (傳遞 runId 和 appContext)
