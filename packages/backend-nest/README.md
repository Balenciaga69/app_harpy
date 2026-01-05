# Game Core Backend - NestJS API 伺服器

這是遊戲核心的後端 API 層，使用 NestJS 框架構建。

## 目的

- 提供 HTTP API 接口供前端調用
- 協調 game-core 邏輯層
- 管理遊戲狀態持久化
- 文檔化 API 接口（Swagger）

## 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式運行

```bash
npm run start:dev
```

應用會在 `http://localhost:3000` 啟動

### Swagger 文檔

訪問 `http://localhost:3000/api` 查看完整 API 文檔

### 編譯生產版本

```bash
npm run build
npm run start:prod
```

## 架構

詳見 [ARCHITECTURE.md](./ARCHITECTURE.md)

簡要說明：

- **Controllers** → 處理 HTTP 請求
- **Services** → 協調 game-core 邏輯
- **DTO** → 定義請求/響應結構
- **Infra** → 配置和存儲層

## API 端點

### Health Check

- `GET /health` - 應用健康狀態

### Run（遊戲進度）

- `GET /api/run/professions` - 取得職業列表
- `GET /api/run/relics` - 取得所有聖物模板
- `POST /api/run/init` - 初始化新遊戲進度
- `POST /api/run/shop/buy` - 購買物品
- `POST /api/run/shop/sell` - 賣出物品
- `POST /api/run/shop/refresh` - 刷新商店

詳細信息見 Swagger 文檔

## 開發指南

### 添加新 API 端點

1. **定義 DTO**（如需要）

   ```typescript
   // src/run/dto/YourActionDto.ts
   export class YourActionDto {
     @IsString()
     yourField: string
   }
   ```

2. **在 Service 添加業務邏輯**

   ```typescript
   // src/run/run.service.ts
   async yourAction(dto: YourActionDto) {
     // 調用 game-core 邏輯
   }
   ```

3. **在 Controller 暴露端點**
   ```typescript
   // src/run/run.controller.ts
   @Post('your-action')
   @ApiOperation({ summary: '操作說明' })
   async yourAction(@Body() dto: YourActionDto) {
     return this.runService.yourAction(dto);
   }
   ```

### 代碼風格

- 使用 TypeScript 嚴格模式
- 避免 `any` 類型
- 每個 Service 一個責任
- 使用 JSDoc 註釋重要方法

## 依賴

核心依賴：

- `@nestjs/common` - NestJS 核心
- `@nestjs/swagger` - API 文檔
- `@app-harpy/game-core` - 遊戲邏輯

## 相關項目

- [game-core](../game-core) - 遊戲邏輯核心模組
