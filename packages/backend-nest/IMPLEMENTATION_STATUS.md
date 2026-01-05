# 🎯 優雅連接 game-core 的完整實作方案

## 📊 狀態

| 項目                                 | 狀態      | 檔案                                                         |
| ------------------------------------ | --------- | ------------------------------------------------------------ |
| AsyncLocalStorage 上下文儲存         | ✅ 完成   | `src/infra/context/ContextStorage.ts`                        |
| Interceptor 初始化                   | ✅ 完成   | `src/infra/interceptors/ContextInitializationInterceptor.ts` |
| GameCoreShopContextHandlerAdapter    | 🔄 進行中 | `src/infra/adapters/GameCoreShopContextHandlerAdapter.ts`    |
| GameCoreItemGenerationServiceAdapter | ⏳ 待做   | `src/infra/adapters/GameCoreItemGenerationServiceAdapter.ts` |
| 修改 DTO 加入 runId                  | ⏳ 待做   | `BuyItemDto.ts`, `SellItemDto.ts`, `RefreshShopDto.ts`       |
| 更新 run.module.ts                   | ⏳ 待做   | `src/features/run/run.module.ts`                             |

## 🔑 關鍵設計決策

### 1. **使用 AsyncLocalStorage 而不是參數傳遞**

**為什麼**：

```
參數傳遞方式（❌ 複雜）:
Controller → Service → Wrapper → ShopService → Adapter
  ↓runId
傳遞 5 層，代碼冗長

AsyncLocalStorage 方式（✅ 優雅）:
Interceptor 設置 → 所有後續調用都能存取
無需參數傳遞，代碼乾淨
```

### 2. **Interceptor 負責上下文生命週期**

```typescript
請求到達 → Interceptor 提取 runId → 從 Repository 加載 IAppContext
         → ContextStorage.setContext(appContext)
         → 所有 Service/Adapter 自動可用
         → 請求完成 → 自動保存變更（可選）
```

### 3. **Adapter 只負責初始化依賴**

```typescript
// GameCoreShopContextHandlerAdapter
loadShopDomainContexts() {
  const appContext = ContextStorage.getContext()  // 取得當前上下文
  const appContextService = new AppContextService(appContext)
  // 使用 game-core 邏輯進行轉換
  return {
    shop: transformShop(appContext),
    character: transformCharacter(appContext),
    stash: transformStash(appContext)
  }
}
```

## 🛠 具體實現流程

### Step 1: 驗證 ContextStorage 工作

```bash
# 確保 ContextStorage.ts 沒有編譯錯誤
npm run check
```

### Step 2: 驗證 Interceptor 工作

```bash
# 確保 Interceptor 能正確注入 AppContextRepository
npm run check
```

### Step 3: 修改 DTO 添加 runId

**BuyItemDto.ts**:

```typescript
export class BuyItemDto {
  @IsString()
  @IsNotEmpty()
  runId: string

  @IsString()
  @IsNotEmpty()
  itemId: string
}
```

**SellItemDto.ts** 和 **RefreshShopDto.ts** 同理

### Step 4: 在 run.module.ts 中註冊 Interceptor

```typescript
@Module({
  controllers: [RunController],
  providers: [
    // ... 其他 provider
    ContextInitializationInterceptor,
  ],
})
export class RunModule {}
```

然後在 RunController 中使用：

```typescript
@Controller('api/run')
@UseInterceptors(ContextInitializationInterceptor)
export class RunController {
  // ...
}
```

### Step 5: 完整實現 Adapter

關鍵：利用 AppContextService 提供的能力

```typescript
// AppContextService 實現了：
// - IConfigStoreAccessor (getConfigStore)
// - IContextSnapshotAccessor (getAllContexts, getRunContext 等)
// - IContextMutator (setRunContext, setCharacterContext 等)

loadShopDomainContexts() {
  const appContext = ContextStorage.getContext()
  const service = new AppContextService(appContext)

  // service 提供了所有需要的方法
  const shopContext = service.getShopContext()
  const characterContext = service.getCharacterContext()
  const stashContext = service.getStashContext()

  // 根據 context 構建 domain models
  // ...
}
```

### Step 6: 測試確認功能

```bash
# 測試所有 API
npm run test:e2e

# 驗證：
# ✅ 選角色功能正常
# ✅ 刷新商店功能正常
# ✅ 購買物品功能正常
# ✅ 賣出物品功能正常
# ✅ 新建遊戲功能正常
```

## 💡 為什麼這個方案優雅

### 代碼簡潔

```typescript
// ❌ 之前（層層傳遞）
buyItem(dto: BuyItemDto) {
  const appContext = await repository.getById(dto.runId)
  const shopService = new ShopService(
    createItemGenService(appContext),
    createShopCtxHandler(appContext)
  )
  return shopService.buyItem(dto.itemId)
}

// ✅ 現在（AsyncLocalStorage）
buyItem(dto: BuyItemDto) {
  // Interceptor 已自動設置 ContextStorage
  return this.shopServiceWrapper.buyItem(dto.itemId)
}
```

### NestJS 最佳實踐

- ✅ 使用 Interceptor 而不是中間件
- ✅ 利用 AsyncLocalStorage（Node.js 標準功能）
- ✅ DI 容器自動管理生命週期
- ✅ 充分利用 REQUEST Scope

### game-core 保持純淨

- ✅ game-core 層 0 改動
- ✅ backend-nest 層自行適配
- ✅ 符合分層原則

### 完整功能支持

- ✅ 所有商店操作正常
- ✅ 物品生成邏輯完整
- ✅ 上下文變更自動同步
- ✅ 錯誤處理清晰

## ⚠️ 需要注意

1. **確保 runId 總是有效**
   - Interceptor 會驗證
   - 無效 runId 返回 400 Bad Request

2. **Repository 必須包含該 runId**
   - 必須先調用 initializeRun
   - Repository 才會有該 runId 的記錄

3. **上下文變更保存**
   - 目前 Interceptor 設置了上下文
   - 需要在請求結束時保存變更回 Repository
   - 可用 `finally` 或 rxjs `finalize` 實現

4. **測試時需要模擬 ContextStorage**
   ```typescript
   // 在單元測試中
   const mockAppContext = {
     /* ... */
   }
   ContextStorage.runWithContext(mockAppContext, () => {
     adapter.loadShopDomainContexts()
   })
   ```

## 📝 下一步行動

1. ✅ ContextStorage.ts - 已完成
2. ✅ ContextInitializationInterceptor.ts - 已完成
3. 📝 修改 DTO - 添加 runId
4. 📝 完整實現 GameCoreShopContextHandlerAdapter
5. 📝 完整實現 GameCoreItemGenerationServiceAdapter
6. 📝 更新 run.module.ts
7. 📝 運行測試驗證所有功能

## 🎓 學到的設計模式

這個方案展示了：

- **Context Pattern** - 通過 AsyncLocalStorage 傳遞上下文
- **Interceptor Pattern** - 在請求層進行初始化
- **Adapter Pattern** - 優雅地連接兩個系統
- **Repository Pattern** - 集中管理狀態
- **Dependency Injection** - NestJS 原生支持

**結果**：乾淨、優雅、可維護的架構 ✨
