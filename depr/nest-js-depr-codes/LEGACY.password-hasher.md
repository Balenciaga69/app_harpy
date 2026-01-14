# Password Hasher - 手寫實作 (已棄用)

## 📚 學習要點

這是一個自手寫的密碼雜湊實作，展示了如何使用 Node.js 原生 `crypto` 模組實現安全的密碼儲存。已改用業界標準的 `bcrypt` 套件替代。

### 關鍵概念

1. **鹽值 (Salt) 生成**
   - 隨機產生 32 位元組的鹽值
   - 每次雜湊都產生不同的鹽值 (使相同密碼的雜湊值也不同)
   - 轉換為 16 進制字串儲存

2. **PBKDF2 演算法**
   - 使用 `crypto.pbkdf2Sync()` 進行密鑰衍生
   - 迭代次數：100,000 次 (計算成本高，防止暴力破解)
   - 輸出長度：64 位元組
   - 雜湊演算法：SHA256

3. **時序安全比較 (Timing-Safe Comparison)**
   - 使用 `crypto.timingSafeEqual()` 比較雜湊值
   - 防止時序攻擊 (timing attack)
   - 始終用固定時間比較，而不是提前 return

### 原始代碼

```typescript
import * as crypto from 'crypto'

export class PasswordHasher {
  private readonly iterations = 100000
  private readonly keyLength = 64
  private readonly algorithm = 'sha256'

  hash(password: string): string {
    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, this.algorithm).toString('hex')
    return \`\${salt}:\${hash}\`
  }

  verify(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':')
    if (!salt || !hash) {
      throw new Error('Invalid hash format')
    }
    const computedHash = crypto
      .pbkdf2Sync(password, salt, this.iterations, this.keyLength, this.algorithm)
      .toString('hex')
    // 時序安全比較
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash))
  }
}
```

## 為什麼改用 bcrypt？

| 項目             | PBKDF2 (手寫)          | bcrypt                     |
| ---------------- | ---------------------- | -------------------------- |
| **代碼行數**     | 30 行                  | 2 行                       |
| **算力適應**     | ❌ 固定 (100,000 迭代) | ✅ 自動調整成本            |
| **未來安全性**   | ⚠️ 需手動增加迭代次數  | ✅ 參數 (cost factor) 調整 |
| **實現複雜度**   | 高 (自己管理 salt)     | 低 (全自動)                |
| **業界標準**     | 可用                   | **推薦** (OWASP)           |
| **密碼檢查耗時** | 可控                   | 可控 + 防 GPU 破解         |

## 核心差異

### PBKDF2 時序安全比較的用途

```typescript
// ❌ 不安全 (會提前 return)
if (computedHash === storedHash) return true
return false

// ✅ 安全 (始終執行完整比較)
return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash))
```

攻擊者可以測量比較時間來推斷密碼，時序安全比較可防止此問題。

## bcrypt 的自適應成本

```typescript
// bcrypt 可自動隨著硬體升級調整
await bcrypt.hash(password, 10) // cost factor 10 (2024 建議)
await bcrypt.hash(password, 12) // cost factor 12 (未來可調整)

// 無需修改驗證代碼
const isValid = await bcrypt.compare(password, hashedPassword)
```

## 遷移方式

改用 `bcrypt` 的 `PasswordService`：

```typescript
// 舊方式
private passwordHasher = new PasswordHasher()
const hashed = this.passwordHasher.hash(password)
const isValid = this.passwordHasher.verify(password, hashed)

// 新方式
constructor(private passwordService: PasswordService) {}
const hashed = await this.passwordService.hash(password)
const isValid = await this.passwordService.verify(password, hashed)
```

### 重點改動

1. **非同步化**：bcrypt 是 I/O 密集，改用 `async/await`
2. **簡化 API**：無需管理 salt，全自動
3. **安全升級**：自動防止時序攻擊 + GPU 破解
