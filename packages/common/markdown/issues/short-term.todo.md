### 我預期的檔案

- auth\guest\guest.guard.ts
- auth\guest\guest.repository.ts
- auth\guest\guest.service.ts
- auth\user
- auth\user\strategy
- auth\user\strategy\jwt.strategy.ts
- auth\user\strategy\local.strategy.ts
- auth\user\auth.config.ts
- auth\user\jwt-auth.guard.ts
- auth\user\refresh-token.repository.ts
- auth\user\token-blacklist.ts
- auth\user\user.entity.ts
- auth\user\user.repository.ts
- auth\user\user.service.ts
- auth\auth.controller.ts
- auth\auth.module.ts

我打算使用以下套件來建立帳號系統：

- `@nestjs/jwt`
- `passport`
- `passport-jwt`
- `@nestjs/passport`
- `bcrypt`

### 功能需求

- **註冊**：
  - 在註冊時加密密碼。
  - 註冊流程非常簡單，只需要提供帳號與密碼。
- **登入**：
  - 在登入時比對密碼。
  - 登入成功後，回傳 JWT Token。

### 系統架構

- **User Model**：
  - 定義使用者的資料結構，包含：
    - 帳號（pk）
    - 密碼
    - 創建於、更新於
    - 啟用/停用欄位
- **Service**：
  - 處理業務邏輯，例如加密密碼、驗證密碼。
- **Controller**：
  - 處理 HTTP 請求，提供註冊與登入的 API。
- **Repository**：
  - 負責與資料庫交互。
- **資料庫類型**：
  - 尚未確定，目前使用 Redis AOF 模式進行測試。
- **其他需求**：
  - 註冊時檢查帳號是否重複。
  - 支持多設備登入，使用 Refresh Token 的唯一標識（JIT）。

### 配置需求

- **JWT 配置**：
  - 採用 Access Token + Refresh Token 的機制。
  - 使用 RS256 指定的簽名演算法。
  - Payload 僅包含 UserId。
  - 需要黑名單機制。
- **AuthGuard 配置**：
  - Local Strategy：用於帳號密碼驗證。
  - JWT Strategy：用於 Token 驗證。
  - 無需基於角色或權限進行額外控管。
  - 支持全域或特定路由的控制。
  - 單純驗證 Token 是否通過。
  - 是否需要支持多種策略（可選）。

### 訪客模式

- **訪客身份管理**：
  - 訪客身份應該是臨時的，與具名用戶（已註冊用戶）分開管理。
  - 當用戶以訪客身份進入應用時，生成一個臨時的訪客 Token。
  - 將該 Token 存儲在客戶端，並在伺服器端記錄。
  - 設置訪客 Token 的過期時間（如 24 小時），過期後需要重新生成。

- **訪客數據轉移**：
  - 當訪客完成註冊或登入後：
    1. 查找該訪客 Token 對應的數據。
    2. 將數據轉移到該用戶的正式帳號中。
    3. 刪除訪客 Token 和相關數據。

- **身份更新**：
  - 註冊或登入成功後，生成正式用戶的 JWT Token，替換訪客 Token。

- **路由保護**：
  - 設置一個 GuestGuard，允許訪客身份訪問特定路由。
  - 在 JWT Payload 中加入 `role` 欄位，區分訪客（guest）與正式用戶（user）。
