# JWT Token Provider - 手寫實作 (已棄用)

## 📚 學習要點

這是一個自手寫的 JWT 實作，展示了如何手動管理 JWT 簽發與驗證。已改用 `@nestjs/jwt` 官方套件替代。

### 關鍵概念

1. **Secret 管理**
   - 驗證 JWT_SECRET 環境變數存在性
   - 強制最少 32 字元長度安全要求

2. **簽發 Token (sign)**
   - 使用 `jsonwebtoken` 庫的 `jwt.sign()` 方法
   - 支援自訂過期時間 (expiresIn)
   - 預設演算法：HS256 (HMAC SHA256)

3. **驗證 Token (verify)**
   - 檢查簽名正確性
   - 驗證過期時間
   - 明確指定允許的演算法 (HS256)

### 原始代碼

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

## 為什麼改用官方套件？

| 項目       | 手寫版本   | @nestjs/jwt     |
| ---------- | ---------- | --------------- |
| 代碼量     | 70 行      | 內建 (無需寫)   |
| 功能完整性 | 基礎功能   | 完整 + 高級功能 |
| 安全更新   | 需自行維護 | 官方更新        |
| 測試覆蓋   | 無         | 官方測試        |
| IDE 支援   | 基礎       | 完整            |

## 遷移方式

改用 `@nestjs/jwt` 的 `JwtService`：

```typescript
// 舊方式
private tokenProvider: JwtTokenProvider
const token = this.tokenProvider.sign(payload)

// 新方式
private jwtService: JwtService
const token = this.jwtService.sign(payload)
```

API 保持一致，無需改動業務邏輯。
