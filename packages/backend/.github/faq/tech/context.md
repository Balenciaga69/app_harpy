# context（上下文）通用問答

## context 是什麼

- context（上下文）是遊戲中用來保存即時資料的單元
- 角色、倉庫、遊戲進程等系統都有各自的 context
- context 會被儲存到持久化資料庫，確保遊戲進度不會遺失

# context 給設計師

## 如何設計 context

- context 應保持精簡，只存放必要的遊戲資料
- 避免塞入過多樣板或重複的資料結構
- 設計時要考慮資料容易儲存與讀取，方便遊戲狀態還原

# context 給工程師

## 技術細節

- 每個 context（如 RunContext、StashContext、CharacterContext）都有獨立的版本號
- 版本號為遞增整數，每次 context 變更都必須更新版本號
- 採用樂觀鎖策略：不加鎖，僅比對版本號，確保資料一致性
- App 層負責傳遞版本號，Infra 層負責驗證與更新
- 跨多個 context 的操作需用全域版本號，確保所有資料同步更新
- 全域版本號在任一 context 變更時都會遞增，避免部分資料更新失敗
- 更新時需傳遞 expectedVersion，Infra 層比對資料庫版本是否一致
- 若版本衝突，Infra 層自動回滾，App 層可選擇重試或提示用戶
- 支援批次更新，確保多個 context 要麼全部成功，要麼全部失敗，維護遊戲邏輯正確
- App 層負責讀取 context 與版本號、計算新 context、傳遞 expectedVersion 並根據結果決定後續動作
- Infra 層負責驗證 expectedVersion、遞增版本號、提交或回滾所有更新，以及處理資料庫交易與並發控制
