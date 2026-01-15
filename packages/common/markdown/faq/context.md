# 儲存與讀取

- ContextUnitOfWork 這東西會讀寫記憶體內的 Context 狀態
- IRepository 這東西會讓 api 專案實現具體的儲存邏輯(RDB/NoSQL...)

## 存取概念設想

- 我們要來刷新商店商品
- (async) 前端玩家呼叫 API
- (async) API 專案從 (DB/Cache) 取 Run,Character,Shop,Stash 等 Context
- 將 Context 注入進 xo-c 層
- 使用 xo-c 的 shopService 刷新商品方法
- 同時操作 扣角色錢, 更新商店商品等聚合根行為
- 透過 ContextUnitOfWork 一次性提交所有變更至記憶體中的短期 Context 快照 管理器
- (async) API 層取得以上業務邏輯操作的結果, 透過 IRepository 實現將變更寫回 (DB/Cache)
- (async) 回傳結果給前端玩家
