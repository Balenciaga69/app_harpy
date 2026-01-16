### JWT

- JWT 與 Session 如何選?
- JWT 有無指定 algorithm 的區別?
- JWT 的 payload 裡面可以放與不該放什麼資訊?
- JWT 前後端傳遞與存放該放哪裡?(HttpOnly Cookie)
- JWT 失效之後要幹嘛?
- 何時該發新的 JWT Token? 一筆請求可以攜帶多筆 Token 嗎?
- 為何使用 Access Token 與 Refresh Token 的雙重 Token 機制?
- 如果我不使用 httpOnly 並且前端被監控了, JWT 會有什麼風險?
- 如何控制多裝置驗證機制?
- 使用者如果真的被盜取了 JWT Token 該怎麼辦?後端可以做什麼?
- 當專案的授權驗證需要查庫時, JWT 的 stateless 還有優勢嗎?
- 當只要未到期我就 Access Token 不用查庫驗證, 這樣會有什麼風險嗎?
- 每次 JWT Guard 都會去查 Redis 以即時阻擋 vs 縮短 Access Token 時效 但不查庫, 該如何取捨?
- 我何時才需要考慮導入 Refresh Token 的輪轉機制?

### Language Features

- AsyncLocalStorage 何時該使用? C# 中有類似的東西嗎?
- 在多實體的微服務情況下 NestJs中如何對某個端點限流?
- Passport.js 整套機制是怎麼運作的?

### Redis

- 為何我要用 Hash 而不是 String 來存取資料?
