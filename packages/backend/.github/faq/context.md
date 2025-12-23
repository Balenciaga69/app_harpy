# Context 上下文

- 一包資料的通稱, 存放不同系統中需即時存取的資料
- 會被存入持久化存儲中
- 遊戲角色有角色上下文 (包含遺物)
- 倉庫系統有倉庫上下文 (包含未穿戴的物品)
- 遊戲進程有遊戲上下文

## 設計注意事項

- 上下文應盡量輕量化, 只包含必要資料
- 不要塞大量樣板資料和層層堆疊的實體
- 應易於序列化與反序列化

## 版本號與樂觀鎖

### 為什麼需要版本號

- 多裝置登入同帳號時, 需防止並發衝突
- 不同請求同時修改同個 context, 應檢查一致性
- 樂觀鎖策略: 不上鎖, 但記錄版本號, 更新時檢查版本是否相符

### Context 級版本號定義

- 每個 context (RunContext, StashContext, CharacterContext) 都有獨立版本號
- 版本號是遞增的正整數, 從 1 開始
- 任何 context 變更都必須遞增版本號
- App 層負責傳遞版本號, infra 層負責檢查版本是否相符

### 全域版本號用途

- 跨 context 操作 (如戰鬥結算同時更新角色, 倉庫, 進度), 需用全域版本確保一致性
- 全域版本在任何 context 變更時都遞增
- 用於防止部分成功問題 (角色更新成功, 倉庫更新失敗)

### ExpectedVersion 檢查流程

- App 層從 context 讀取目前版本號
- App 層計算新 context 並保存舊版本號作為 expectedVersion
- 呼叫 repository 更新時, 同時傳遞 context 與 expectedVersion
- Infra 層檢查: 資料庫中的版本號是否等於 expectedVersion
  - 相符: 更新資料庫, 遞增版本號, 回傳新 context
  - 不相符: 版本衝突, 回傳 null 或拋錯

### 版本衝突處理

- 版本衝突表示另一請求已修改此 context
- Infra 層自動回滾, 不寫入不一致的資料
- App 層決定如何處理: 重新讀取, 重新計算, 重新提交
- 簡單場景: 告訴使用者資料已被修改, 請重新加載
- 複雜場景: App 層實作自動重試或合併邏輯

## 批量更新與一致性

### 為什麼需要跨 Context 原子性

- 遊戲邏輯常常一次變更多個 context
  - 戰鬥結算: 更新進度, 角色, 倉庫
  - 商店購買: 更新倉庫, 進度, 金幣
- 若某個 context 更新失敗, 其他已更新的 context 會造成不一致
- 原子性更新: 全部成功或全部失敗, 確保遊戲邏輯的正確性

### UpdateBatch 介面

- 一次呼叫可以更新 1 個或多個 context
- 同時傳遞多個 context 的 expectedVersion
- Infra 層檢查所有 context 的版本, 全部相符才更新
- 一旦任一 context 版本不符, 全部回滾

### 版本衝突場景與回滾機制

- 場景 1: 單 context 衝突
  - 角色版本不符, 倉庫版本相符
  - 結果: 全部不更新, 回傳 null
- 場景 2: 多 context 衝突
  - 多個 context 版本不符
  - 結果: 全部不更新, 回傳 null
- 場景 3: 無衝突
  - 所有 context 版本相符
  - 結果: 全部更新, 遞增版本號, 回傳新 context
- 回滾機制: Infra 層自動處理, App 層無須操心

### App 層與 Infra 層職責分工

- App 層職責
  - 讀取 context 與版本號
  - 計算新 context
  - 傳遞 expectedVersion 給 repository
  - 根據更新結果決定後續動作 (成功繼續, 衝突重試)
- Infra 層職責
  - 檢查 expectedVersion 是否與資料庫相符
  - 遞增版本號
  - 提交或回滾所有更新
  - 處理資料庫交易和並發控制
