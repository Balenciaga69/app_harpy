# 後端架構設計

## 概述

NestJS 後端應用作為 **協調層**，主要職責是：

- 接收 HTTP 請求，驗證輸入
- 調用 game-core 遊戲邏輯
- 持久化遊戲狀態
- 返回結構化響應

## 分層架構

```
HTTP Request
     ↓
[Controllers] - 路由與請求驗證
     ↓
[Services] - 業務邏輯協調（調用 game-core）
     ↓
[game-core] - 核心遊戲邏輯（獨立模組）
     ↓
[Infra] - 儲存層、配置層
     ↓
Database / Memory Store
```

### 各層職責

#### **Controllers** 層

- 解析 HTTP 請求並驗證 DTO
- 調用 Service 層
- 返回標準化響應
- 處理 HTTP 狀態碼和異常

位置：`src/controllers/`

範例：

```typescript
@Controller('api/run')
export class RunController {
  @Get('relics')
  async getRelicTemplates() {
    return this.runService.getRelicTemplates();
  }
}
```

#### **Services** 層

- 協調 game-core 的多個服務
- 單一職責：一個 Service 對應一個主要業務流程
- 不涉及 HTTP 細節，可獨立測試

位置：`src/run/`

範例：

```typescript
@Injectable()
export class RunService {
  async getRelicTemplates() {
    const configStore = await this.configService.getConfigStore();
    return configStore.itemStore.getAllRelics();
  }
}
```

#### **DTO** 層

- 定義請求/響應的資料結構
- 使用 `class-validator` 自動驗證

位置：`src/run/dto/`

範例：

```typescript
export class InitRunDto {
  @IsString()
  professionId: string;

  @IsOptional()
  @IsNumber()
  seed?: number;
}
```

#### **Infrastructure** 層

- **ConfigService**：管理靜態遊戲配置（單例）
- **InMemoryContextRepository**：遊戲狀態儲存（開發用）
- 未來可擴展為數據庫操作

位置：`src/infra/` 和 `src/run/`

### 與 game-core 的邊界

game-core 是 **獨立模組**，提供：

- `RunInitializationService` - 初始化遊戲進度
- `ShopService` - 商店交易邏輯
- `ConfigStore` - 靜態遊戲配置（通過 Assembler 加載）

**重要原則**：

- NestJS 不應在 Services 層直接訪問 game-core 的內部實現
- 透過 `ConfigService` 和 `*Repository` 作為防腐層
- 所有邏輯調用都應隔離外部依賴

## 文件組織

```
src/
├── controllers/
│   └── app.controller.ts          # 健康檢查
├── run/
│   ├── config.service.ts          # 配置管理
│   ├── run.controller.ts          # API 端點
│   ├── run.service.ts             # 業務邏輯協調
│   ├── run.module.ts              # 模組定義
│   └── dto/
│       ├── InitRunDto.ts
│       ├── BuyItemDto.ts
│       ├── SellItemDto.ts
│       └── RefreshShopDto.ts
├── infra/
│   └── InMemoryContextRepository.ts # 狀態儲存（開發用）
├── app.module.ts                  # 根模組
├── app.controller.ts              # 已遷移到 controllers/
├── from-game-core.ts              # game-core 導出統一點
└── main.ts                        # 應用入口

```

### 為什麼這樣組織？

- **Controllers & Services 分離**：職責清晰，服務可被多個控制器復用
- **一個文件一個責任**：便於定位和修改
- **DTO 集中管理**：便於追蹤 API 契約變化
- **from-game-core.ts 統一點**：所有 game-core 導出集中管理，便於版本控制

## 開發流程

### 添加新 API 端點

1. **創建 DTO**（如需要）

   ```typescript
   // src/run/dto/YourActionDto.ts
   export class YourActionDto {
     @IsString()
     runId: string;
   }
   ```

2. **在 Service 中添加方法**

   ```typescript
   // src/run/run.service.ts
   async yourAction(dto: YourActionDto) {
     const configStore = await this.configService.getConfigStore();
     // 調用 game-core 邏輯
   }
   ```

3. **在 Controller 中暴露端點**
   ```typescript
   // src/run/run.controller.ts
   @Post('your-action')
   @ApiOperation({ summary: '你的操作說明' })
   async yourAction(@Body() dto: YourActionDto) {
     return this.runService.yourAction(dto);
   }
   ```

## 約定

### 命名規範

- **Controllers**：`*Controller.ts`
- **Services**：`*Service.ts`
- **DTOs**：`*Dto.ts`
- **Module**：`*.module.ts`

### 返回格式

標準化成功響應：

```typescript
{
  success: true,
  data: { /* 具體資料 */ }
}
```

標準化異常：

```typescript
throw new BadRequestException({
  error: 'ERROR_CODE',
  message: '錯誤說明',
});
```

## Swagger 文檔

API 文檔已通過 `@nestjs/swagger` 集成，訪問地址：

```
http://localhost:3000/api
```

添加新端點後，使用 Swagger 裝飾器：

```typescript
@Get('relics')
@ApiOperation({ summary: '取得所有聖物模板' })
@ApiResponse({
  status: 200,
  description: '成功取得聖物模板列表'
})
async getRelicTemplates() { }
```

## 性能考量

### ConfigStore 單例

- `ConfigService` 使用延遲初始化，首次請求時載入
- 所有配置存放於記憶體，避免重複磁盤讀取
- 適合靜態數據，不適合頻繁變化的數據

### 異步操作

- 所有 Service 方法都是 `async`，支持並發請求
- game-core 服務可無狀態水平擴展

## 未來改進方向

- [ ] 添加數據庫層（replace InMemoryContextRepository）
- [ ] 實現完整的 E2E 測試
- [ ] 添加身份驗證與授權層
- [ ] 完善錯誤處理與日誌系統
- [ ] game-core 類型定義完善
