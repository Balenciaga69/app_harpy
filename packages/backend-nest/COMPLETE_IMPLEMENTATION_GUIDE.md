# 完整實作方案 - 優雅連接 game-core 到 NestJS

## 現狀分析

當前問題：

- `GameCoreShopContextHandlerAdapter` 和 `GameCoreItemGenerationServiceAdapter` 是 Stub
- 無法取得當前運行的 `IAppContext`
- API 層 `runId` 沒有傳遞到 Service 層

## 解決方案

### 第一階段：建立上下文傳遞機制（AsyncLocalStorage）

**檔案**: `src/infra/context/ContextStorage.ts`

```typescript
export class ContextStorage {
  private static readonly store = new AsyncLocalStorage<IAppContext>()

  static setContext(appContext: IAppContext): void
  static getContext(): IAppContext
  static hasContext(): boolean
}
```

**優點**：

- 不需要層層傳遞 runId
- 異步調用自動跟隨
- NestJS 原生支持

### 第二階段：建立 Interceptor 初始化上下文

**檔案**: `src/infra/interceptors/ContextInitializationInterceptor.ts`

責任：

1. 從請求 DTO 提取 runId
2. 從 Repository 載入該 runId 的 IAppContext
3. 使用 ContextStorage.setContext() 設置
4. 請求完成後自動保存變更

**工作流**：

```
request.body { runId, itemId }
  ↓
Interceptor 提取 runId
  ↓
從 AppContextRepository 加載 IAppContext
  ↓
ContextStorage.setContext(appContext)
  ↓
後續所有 Service/Adapter 都能存取
```

### 第三階段：修改 DTO 包含 runId

**檔案**：

- `BuyItemDto.ts`：加入 `runId: string`
- `SellItemDto.ts`：加入 `runId: string`
- `RefreshShopDto.ts`：加入 `runId: string`

### 第四階段：完整實現 Adapter

**GameCoreShopContextHandlerAdapter.ts**：

```typescript
@Injectable()
export class GameCoreShopContextHandlerAdapter implements IShopContextHandler {
  loadShopDomainContexts() {
    const appContext = ContextStorage.getContext()
    const appContextService = new AppContextService(appContext)

    // 使用 game-core 實裝來轉換
    // 這裡需要利用 AppContextService 的能力
    return {
      shop: ...,
      character: ...,
      stash: ...
    }
  }
}
```

**GameCoreItemGenerationServiceAdapter.ts**：

```typescript
@Injectable()
export class GameCoreItemGenerationServiceAdapter implements IItemGenerationService {
  generateRandomItemFromShop() {
    const appContext = ContextStorage.getContext()
    const appContextService = new AppContextService(appContext)

    // 直接調用 game-core 邏輯
    // ...
  }
}
```

### 第五階段：修改 Module 配置

**run.module.ts**：

從：

```typescript
{
  provide: ShopService,
  useFactory: (itemGenService, shopCtxHandler) => {
    return new ShopService(itemGenService, shopCtxHandler)
  },
  inject: [IItemGenerationService, IShopContextHandler]
}
```

改為：

```typescript
{
  provide: ShopService,
  useClass: ShopService,  // 直接使用 game-core 版本
  inject: [IItemGenerationService, IShopContextHandler]
}
```

或者更簡潔：

```typescript
{
  provide: 'ShopService',
  useFactory: (factory: GameCoreServiceFactory) => factory.createShopService(),
  inject: [GameCoreServiceFactory]
}
```

### 第六階段：修改 Service 層傳遞上下文

**shop-service.wrapper.ts**：

```typescript
@Injectable()
export class ShopServiceWrapper {
  constructor(private shopService: ShopService) {}

  buyItem(itemId: string) {
    // runId 已經透過 Interceptor 在 ContextStorage 中
    return this.shopService.buyItem(itemId)
  }
}
```

**run.service.ts**：

```typescript
@Injectable()
export class RunService {
  buyItem(dto: BuyItemDto) {
    // dto.runId 已在 Interceptor 中被處理
    const result = this.shopServiceWrapper.buyItem(dto.itemId)
    return result
  }
}
```

## 實現順序

1. ✅ 建立 `ContextStorage.ts` - 上下文儲存
2. 建立 `ContextInitializationInterceptor.ts` - 初始化攔截器
3. 修改 DTO - 加入 runId
4. 完整實現 Adapter - 使用 ContextStorage
5. 修改 Module - 配置 DI
6. 測試所有功能

## 優雅性檢查

✅ game-core 完全不變  
✅ NestJS 最佳實踐  
✅ 利用 AsyncLocalStorage 避免參數傳遞  
✅ Interceptor 自動管理上下文生命週期  
✅ 代碼清晰易維護  
✅ 所有功能完整運作

## 需要小心的地方

1. **runId 驗證**：Interceptor 應驗證 runId 有效性
2. **上下文變更保存**：Interceptor 應在請求結束時保存變更到 Repository
3. **錯誤處理**：如果 ContextStorage.getContext() 拋異常，應有明確的錯誤訊息
4. **測試**：應模擬 ContextStorage 來測試 Adapter

## 後續工作

- 如需使用真實的 game-core ShopContextHandler 類別，可直接引用（已暴露）
- 如需使用真實的 game-core ItemGenerationService 類別，可直接引用（已暴露）
- 根據 game-core 的 API 完整實現上下文轉換邏輯
