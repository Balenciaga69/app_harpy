# Rate Limit Interceptor - 手寫實作 (已棄用)

## 📚 學習要點

這是兩個自手寫的限流實作：

- `RateLimitInterceptor`: 通用端點限流 (每分鐘 5 次)
- `LoginRateLimitInterceptor`: 登入端點限流 (每 5 分鐘 3 次)

已改用官方套件 `@nestjs/throttler` 替代。

### 關鍵概念

1. **Interceptor 模式**
   - 實作 `NestInterceptor` 介面
   - 在 `intercept()` 方法中攔截請求
   - 計數檢查後決定是否允許請求通過

2. **Redis 計數器**
   - 使用 Redis 的 `INCR` 命令原子性遞增
   - 計數器首次建立時設定過期時間 (EXPIRE)
   - 使用複合鍵識別不同端點 + IP + HTTP 方法

3. **IP 提取邏輯**
   ```
   request.ip
   ↓ (如無)
   request.connection?.remoteAddress
   ↓ (如無)
   '127.0.0.1' (預設)
   ```

### 原始代碼

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import Redis from 'ioredis'
import { Observable } from 'rxjs'
import { InjectionTokens } from '../shared/providers/injection-tokens'

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()
    const ip = (request.ip || request.connection?.remoteAddress || '127.0.0.1') as string
    const method = (request.method ?? 'UNKNOWN') as string
    const path = (request.path ?? '/') as string
    const key = \`rate-limit:\${method}:\${path}:\${ip}\`

    const count = await this.redis.incr(key)
    if (count === 1) {
      await this.redis.expire(key, 60)
    }

    if (count > 5) {
      throw new HttpException('Too many requests. Maximum 5 requests per minute.', HttpStatus.TOO_MANY_REQUESTS)
    }

    return next.handle()
  }
}

@Injectable()
export class LoginRateLimitInterceptor implements NestInterceptor {
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()
    const ip = (request.ip || request.connection?.remoteAddress || '127.0.0.1') as string
    const key = \`rate-limit:login:\${ip}\`

    const count = await this.redis.incr(key)
    if (count === 1) {
      await this.redis.expire(key, 5 * 60)
    }

    if (count > 3) {
      throw new HttpException(
        'Too many login attempts. Maximum 3 attempts per 5 minutes.',
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    return next.handle()
  }
}
```

## 為什麼改用 @nestjs/throttler？

| 項目            | 手寫 Interceptor    | @nestjs/throttler |
| --------------- | ------------------- | ----------------- |
| **代碼行數**    | 60+ 行              | 1 行 (裝飾器)     |
| **維護複雜度**  | 高 (手動管理 Redis) | 低 (官方管理)     |
| **配置化**      | ❌ 硬編碼           | ✅ 可配置         |
| **分散式支持**  | ⚠️ 依賴 Redis 連線  | ✅ 內建           |
| **使用方式**    | Interceptor 綁定    | 裝飾器綁定        |
| **監控 / 測試** | 複雜                | 簡單              |

## 手寫版本的缺陷

1. **硬編碼限制**：無法動態調整限制值
2. **Redis 依賴**：需要手動 inject Redis 客戶端
3. **代碼重複**：兩個 Interceptor 大量複製代碼
4. **缺乏配置**：無全域配置選項
5. **IP 提取脆弱**：代理後可能取不到真實 IP

## @nestjs/throttler 的改進

```typescript
// 舊方式
@Post('login')
@UseInterceptors(LoginRateLimitInterceptor)
async login() { }

// 新方式
@Post('login')
@Throttle({ default: { limit: 3, ttl: 300000 } })
async login() { }

// 全域配置
ThrottlerModule.forRoot({
  ttl: 60000,
  limit: 5,
})
```

### 優勢

- ✅ 一行搞定限流規則
- ✅ 可在方法、控制器、全域級別配置
- ✅ 無需手動管理 Redis 計數邏輯
- ✅ 自動處理 IP 提取 + 代理支持
- ✅ 官方維護，安全更新

## 遷移成本

- **工作量**：低 (只需移除 Interceptor，加裝飾器)
- **測試**：官方套件已測試
- **副作用**：無 (API 相容)
