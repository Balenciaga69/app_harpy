我打算使用以下套件來建立帳號系統：

- `@nestjs/jwt`
- `passport`
- `passport-jwt`
- `@nestjs/passport`
- `bcrypt`

### 功能需求

-
- 註冊：
  - 在註冊時加密密碼。
  - 註冊流程非常簡單，只需要提供帳號與密碼。
- 登入：
  - 在登入時比對密碼。
  - 登入成功後，回傳 JWT Token。

### 系統架構

- User Model：定義使用者的資料結構。
- Service：處理業務邏輯，例如加密密碼、驗證密碼。
- Controller：處理 HTTP 請求，提供註冊與登入的 API。
- Repository：負責與資料庫交互。

### 配置需求

- JWT 配置：
  - 採用 access token + refresh token 的機制。
  - 採用 RS256 指定的簽名演算法。
  - Payload 僅包含 UserId
- AuthGuard 配置：
  - Local Strategy 我要
  - JWT Strategy 我要
  - 無須基於 role, permission 做額外的權限控管。
  - 可以控制 global or specific route。
  - 單純驗證 token 是否通過

### 整合模組

- 需要整合到哪些模組：
  - 暫時先不用
