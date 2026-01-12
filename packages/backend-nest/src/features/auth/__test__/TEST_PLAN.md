# Auth 模組測試計畫

## 測試概述

本測試套件覆蓋 Auth 模組的核心功能與安全機制，分為以下幾個部分：

## 1. JWT Token Provider 測試

**檔案**: `jwt-token-provider.spec.ts`

### 測試內容

- **Token 簽署**
  - 使用預設過期時間 (15m) 建立 JWT
  - 使用自訂過期時間 (如 7d) 建立 JWT
  - 驗證 payload 資料被正確編碼至 token

- **Token 驗證**
  - 解碼有效的 token 並返回 payload
  - 拒絕無效的 token (格式錯誤、被篡改)
  - 拒絕過期的 token
  - 處理不同的使用者類型 (匿名、已驗證)

### 測試特點

- 完整的 token 生命週期測試
- 邊界條件測試 (過期時間、篡改)
- 類型安全驗證

---

## 2. JWT Strategy 測試

**檔案**: `jwt-strategy.spec.ts`

### 測試內容

- **Payload 轉換**
  - 將 JWT payload 轉換為 AuthenticatedUser 物件
  - 保留版本資訊
  - 區分匿名與已驗證使用者

- **Token 萃取**
  - 從 Authorization header 提取 Bearer token
  - 處理缺少 header 的情況
  - 拒絕非 Bearer 前綴的 token

### 測試特點

- 資料轉換的正確性驗證
- HTTP header 解析測試

---

## 3. Auth Guard 測試

**檔案**: `auth-guard.spec.ts`

### 測試內容

#### IsAuthenticatedGuard (必須驗證)

- 允許通過已驗證的使用者
- 拒絕 null/undefined 使用者 (拋出 UnauthorizedException)
- 拋出並傳遞外部錯誤

#### AllowAnonymousGuard (允許匿名)

- 允許通過已驗證的使用者
- 允許通過 null (匿名使用者)
- 在錯誤時返回 null 而非拋出

### 測試特點

- 權限控管邏輯驗證
- 兩種 guard 行為對比測試
- 邊界情況處理 (falsy 值)

---

## 4. GetUser Decorator 測試

**檔案**: `get-user-decorator.spec.ts`

### 測試內容

- 從 request 物件萃取 user 屬性
- 處理缺少 user 的情況
- 處理 user 為 null 的情況
- 支援不同類型的使用者物件 (包含自訂欄位)

### 測試特點

- 參數裝飾器功能驗證
- 動態物件結構處理

---

## 5. InMemory User Repository 測試

**檔案**: `in-memory-user-repository.spec.ts`

### 測試內容

#### CRUD 操作

- 儲存並按 ID 取回使用者
- 按 username 查詢使用者
- 更新現有使用者
- 返回 null 當使用者不存在

#### 匿名使用者管理

- 不存在時建立匿名使用者
- 返回現有匿名使用者而非重複建立

#### 資料過期

- 驗證使用者資料在過期時間後自動移除

#### 多使用者場景

- 處理多個使用者
- 維持正確的 username 索引

### 測試特點

- 記憶體中資料結構的完整測試
- 生命週期與清理邏輯驗證
- 索引一致性檢查

---

## 6. Auth Controller 整合測試

**檔案**: `auth-controller.integration.spec.ts`

### 測試內容

#### Guest (訪客登入)

- 建立匿名 session 並返回 token 與 userId

#### Login (使用者登入)

- 現有使用者登入並返回 token
- 新使用者自動建立並登入
- 密碼錯誤時拒絕登入

#### Refresh (刷新 Token)

- 使用有效的 refresh token 取得新的 access token
- 無效 token 時拋出錯誤

#### Upgrade (升級帳戶)

- 匿名使用者升級為已驗證使用者
- 拒絕升級非匿名使用者

#### Get Me (取得使用者資訊)

- 返回當前已驗證使用者的資訊
- 支援匿名使用者查詢

#### Cookie 處理

- 生產環境設定安全 cookie (secure: true, httpOnly: true)
- 測試環境設定非安全 cookie (secure: false)

### 測試特點

- 完整的 API 端點流程測試
- 安全機制驗證 (cookie 設定)
- 錯誤情境測試

---

## 測試執行方式

```bash
# 執行所有 Auth 測試
npm test -- auth

# 執行特定測試檔案
npm test -- jwt-token-provider.spec.ts
npm test -- auth-controller.integration.spec.ts

# 與覆蓋率一起執行
npm test -- --coverage auth
```

---

## 測試覆蓋率目標

| 模組              | 單元測試     | 整合測試 | 覆蓋目標 |
| ----------------- | ------------ | -------- | -------- |
| AuthService       | ✓ (existing) | ✓        | 100%     |
| JwtTokenProvider  | ✓            | ✓        | 100%     |
| JwtStrategy       | ✓            | ✓        | 100%     |
| AuthGuard         | ✓            | ✓        | 100%     |
| GetUser Decorator | ✓            | ✓        | 100%     |
| UserRepository    | ✓            | ✓        | 95%+     |
| AuthController    | ✓            | ✓        | 90%+     |

---

## AAA 模式說明

每個測試都遵循 **Arrange-Act-Assert (AAA)** 模式：

```typescript
it('should do something', () => {
  // Arrange: 準備測試資料與 mock
  const mockUser = { userId: 'test', isAnonymous: true }

  // Act: 執行被測試的邏輯
  const result = authService.createAnonymousSession()

  // Assert: 驗證結果
  expect(result.userId).toBe('test')
})
```

---

## Mock 與隔離策略

- **UserRepository**: 完全 mock，測試 AuthService 邏輯
- **JwtTokenProvider**: 完全 mock，測試 controller 邏輯
- **ConfigService**: Partial mock，只 mock 必要的方法
- **外部依賴**: 一律 mock，避免外部系統依賴

---

## 不需要測試的內容

✗ auth.module.ts - 純組裝，無業務邏輯
✗ InjectionTokens - 常數定義，無邏輯
✗ RedisUserRepository - 應該用整合測試或 testcontainers
