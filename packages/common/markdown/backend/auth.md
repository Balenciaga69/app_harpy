# Auth

- User 身分認證: 註冊, 登入, 登出, 密碼驗證功能.
- Token 認證: 發放與刷新 Access Token 與 Refresh Token.
- 登出黑名單: 紀錄需被強制登出 JWT ID 與 device ID.
- 訪客功能: 提供未登入使用者有身分能操作應用.

## 補充說明

- Guard 能辨別使用者是 User 或 Guest 用以決定是否允許存取資源.
- 我們支援多裝置登入
