# JWT Token Provider - 完全棄用

## 🗑️ 已遷移至 @nestjs/jwt

此檔案及其實作已完全由 `@nestjs/jwt` 套件的 `JwtService` 替代。

### 原始實作

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

export interface JwtPayload {
  sub: string
  is_anon: boolean
  ver: number
}

@Injectable()
export class JwtTokenProvider {
  private readonly secret: string

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required and must not be empty')
    }
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long')
    }
    this.secret = secret
  }

  sign(payload: JwtPayload, expiresIn: jwt.SignOptions['expiresIn'] = '15m'): string {
    const token = jwt.sign(payload, this.secret, { expiresIn })
    return token
  }

  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      })
      return decoded as unknown as JwtPayload
    } catch {
      throw new UnauthorizedException('無效或過期的 Token')
    }
  }
}
```

## 遷移路徑

### 舊版本用法

```typescript
// 以前
constructor(private tokenProvider: JwtTokenProvider) {}

// 簽發 Token
const token = this.tokenProvider.sign(payload)

// 驗證 Token
const decoded = this.tokenProvider.verify(token)
```

### 新版本用法

```typescript
// 現在
constructor(private jwtService: JwtService) {}

// 簽發 Token
const token = this.jwtService.sign(payload)

// 驗證 Token
const decoded = this.jwtService.verify(token)
```

## API 相容性

| 操作 | 舊 API                      | 新 API                    | 差異       |
| ---- | --------------------------- | ------------------------- | ---------- |
| 簽發 | `sign(payload, expiresIn?)` | `sign(payload, options?)` | 選項更靈活 |
| 驗證 | `verify(token)`             | `verify(token)`           | ✅ 相同    |
| 錯誤 | `UnauthorizedException`     | `JwtException`            | 需適配     |

## 為何棄用

1. **代碼重複** - 官方已提供，無需自寫
2. **安全維護** - 官方負責安全更新
3. **功能完整** - 支援更多選項 (audience, issuer 等)
4. **最佳實踐** - NestJS 官方推薦方案

## 相關文件

- `auth.service.ts` - 現在使用 `@nestjs/jwt`
- `jwt.strategy.ts` - 依賴 `@nestjs/jwt` 的 `JwtService`
- `auth.module.ts` - 配置 `JwtModule.registerAsync()`
