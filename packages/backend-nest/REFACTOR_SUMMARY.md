# 儲存庫層與非同步持久化重構總結

日期：2026-01-10  
變更範圍：`ContextManager`, `InMemoryContextRepository`, `RedisContextRepository`

---

## 1. ContextManager 的改進

### 問題

- 儲存庫層存在但從未被呼叫
- 所有上下文只留在記憶體，應用重啟就遺失
- 持久化層與 `ContextManager` 完全解耦，無法啟動

### 解決方案

#### a) 可選注入儲存庫

```typescript
constructor(
  configStore: IConfigStore,
  @Optional() @Inject('IContextBatchRepository') private readonly repository?: IContextBatchRepository
)
```

- 使用 `@Optional()` 確保即使未注入儲存庫也能運作
- 注入令牌 `'IContextBatchRepository'` 用於模組綁定
- 支援在測試時注入 Mock 實作

#### b) 非同步持久化流程

```typescript
saveContext(appContext: IAppContext) {
  // 1. 同步更新記憶體（快速）
  this.runContexts.set(runId, runContext)

  // 2. 非同步持久化（不阻塞）
  this.persistToRepositoryAsync(runId, contexts)
}
```

**特點：**

- 記憶體更新立即完成，不受儲存庫性能影響
- Redis 寫入非同步執行，不阻塞 HTTP 回應
- 失敗時僅記錄日誌，不拋出例外（fail-safe）
- 應用可在 Redis 不可用時繼續運作

#### c) 流程圖

```
API 請求
    ↓
Service 層
    ↓
ContextManager.saveContext()
    ├→ 同步更新 Map（runContexts）[立即完成]
    │
    └→ persistToRepositoryAsync()
        └→ Promise 鏈（非同步）
            └→ repository.updateBatch() → Redis [後台執行]
```

---

## 2. 儲存庫簡化

### 前提

減法設計：只保留介面定義的方法

| 方法                       | InMemory | Redis | 保留？         |
| -------------------------- | -------- | ----- | -------------- |
| `updateBatch()`            | ✓        | ✓     | **✓ 介面定義** |
| `getByKey()`               | ✓        | ✓     | **✓ 介面定義** |
| `updateRunContext()`       | ✓        | ✓     | ✗ 刪除         |
| `updateCharacterContext()` | ✓        | ✓     | ✗ 刪除         |
| `updateStashContext()`     | ✓        | ✓     | ✗ 刪除         |
| `updateShopContext()`      | ✓        | ✓     | ✗ 刪除         |
| `getRunContext()`          | ✓        | ✓     | ✗ 刪除         |
| `getCharacterContext()`    | ✓        | ✓     | ✗ 刪除         |
| `getStashContext()`        | ✓        | ✓     | ✗ 刪除         |
| `getShopContext()`         | ✓        | ✓     | ✗ 刪除         |
| `getGlobalVersion()`       | ✗        | ✓     | ✗ 刪除         |
| `clear()`                  | ✓        | ✓     | ✗ 刪除         |

### 刪除原因

1. **單個 update/get 方法**：`updateBatch()` 已涵蓋所有 4 個上下文
   - 增加複雜度：8 個額外的 try-catch 邏輯
   - 違反 DRY 原則
   - 版本控制邏輯重複

2. **`getGlobalVersion()`**：未被使用，且版本管理應在更高層

3. **`clear()`**：測試專用，不應在生產儲存庫中

### 程式碼對比

**InMemoryContextRepository 精簡**

```typescript
// 刪除前：124 行
// 刪除後：55 行 (-55%)

// 僅保留
async updateBatch(...): Promise<IContextUpdateResult | null>
getByKey(key: string): unknown
```

**RedisContextRepository 精簡**

```typescript
// 刪除前：218 行
// 刪除後：104 行 (-52%)

// 僅保留核心邏輯
async updateBatch(...): Promise<IContextUpdateResult | null>
getByKey(key: string): unknown
```

---

## 3. 介面規範化

### `IContextBatchRepository` 最終簽名

```typescript
export interface IContextBatchRepository {
  /**
   * 批次更新四個上下文
   * - 全有或全無：单次操作
   * - 失敗返回 null 或錯誤結果
   */
  updateBatch(
    updates: {
      run?: ISingleContextUpdate<IRunContext>
      stash?: ISingleContextUpdate<IStashContext>
      character?: ISingleContextUpdate<ICharacterContext>
      shop?: ISingleContextUpdate<IShopContext>
    },
    globalVersion?: number
  ): Promise<IContextUpdateResult | null>

  /**
   * 通用讀取（同步）
   * - Redis 版本：返回警告日誌
   * - 用於測試或偶發查詢
   */
  getByKey(key: string): unknown
}
```

---

## 4. 使用方式

### 模組注入（NestJS）

```typescript
// app.module.ts 或業務模組
@Module({
  providers: [
    ContextManager,
    RedisContextRepository, // 或 InMemoryContextRepository
    {
      provide: 'IContextBatchRepository',
      useClass: RedisContextRepository, // 或 InMemoryContextRepository
    },
  ],
})
export class MyModule {}
```

### 開發測試

```typescript
// test.module.ts
{
  provide: 'IContextBatchRepository',
  useClass: InMemoryContextRepository,  // 使用記憶體版本
}
```

### 應用流程

```typescript
// service.ts
constructor(private ctxManager: ContextManager) {}

async updateCharacter(characterContext: ICharacterContext) {
  // 應用邏輯...

  // 自動非同步持久化
  const appContext = this.ctxManager.getContext()
  this.ctxManager.saveContext(appContext)  // → Redis (後台)
}
```

---

## 5. 優勢總結

| 項目         | 改進                                      |
| ------------ | ----------------------------------------- |
| **程式碼量** | 減少 60+ 行冗餘代碼                       |
| **複雜度**   | 降低循環複雜度（消除重複的 4x try-catch） |
| **可維護性** | ✓ 單一職責（updateBatch 處理所有更新）    |
| **可測性**   | ✓ 支援 Mock 注入；InMemory 作 Test Double |
| **故障恢復** | ✓ Redis 失敗時記憶體仍可用                |
| **效能**     | ✓ 非同步持久化不阻塞 HTTP 回應            |
| **解耦度**   | ✓ 儲存庫實作完全隱藏在注入容器中          |

---

## 6. 後續建議

1. **模組綁定**：在 `backend-nest` 的主模組中完成 `IContextBatchRepository` 的 `useClass` 綁定
2. **環境配置**：根據 `NODE_ENV` 選擇 Redis 或 InMemory
3. **測試補全**：為 `persistToRepositoryAsync` 添加單元測試
4. **監控**：在 `logger.warn()` 出現時建立警報（持久化失敗）

---

## 檔案變更清單

| 檔案                           | 行數變化 | 說明                   |
| ------------------------------ | -------- | ---------------------- |
| `ContextManager.ts`            | +30      | 注入、非同步持久化邏輯 |
| `InMemoryContextRepository.ts` | -69      | 刪除冗餘方法           |
| `RedisContextRepository.ts`    | -114     | 刪除冗餘方法           |
| **合計**                       | -153     | 整體簡化               |
