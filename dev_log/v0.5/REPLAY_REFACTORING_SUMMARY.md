# Replay System Refactoring Summary

## 重構日期

2025/12/02

## 重構目標

解決 replay 系統的架構問題，提升可維護性、可測試性與代碼品質。

---

## 主要問題與解決方案

### 1. ❌ 瀏覽器 API 耦合 (最嚴重)

**問題**: ReplayEngine 直接使用 `requestAnimationFrame`，與瀏覽器環境強耦合

**解決方案**:

- 創建 `ITickScheduler` 接口抽象時間控制
- 實現 `BrowserTickScheduler` (使用 RAF)
- 實現 `TestTickScheduler` (可控時間，用於測試)
- ReplayEngine 通過構造函數注入 ITickScheduler

**效果**:

- ✅ 遊戲邏輯與瀏覽器 API 解耦
- ✅ 支持在 Node.js 環境運行測試
- ✅ 未來可輕鬆替換為其他時間控制實現

---

### 2. ❌ 重複代碼 (DRY 原則違反)

**問題**: PlaybackController 和 TimelineController 都有相同的 log 查詢邏輯

**解決方案**:

- 創建 `LogQueryService` 集中管理所有 log 查詢
- 提供可重用的查詢方法 (getUltimateTicks, getDeathTicks, getCriticalTicks 等)
- Controllers 依賴注入 LogQueryService

**效果**:

- ✅ 消除代碼重複
- ✅ 單一職責：查詢邏輯集中在一處
- ✅ 更容易擴展新的查詢功能

---

### 3. ❌ 缺少抽象層 (依賴倒置原則違反)

**問題**: 沒有接口定義，Controllers 直接依賴具體的 ReplayEngine 類別

**解決方案**:

- 創建 `IReplayEngine` 接口
- ReplayEngine 實現該接口
- Controllers 依賴接口而非具體實現

**效果**:

- ✅ 符合 SOLID 的依賴倒置原則 (DIP)
- ✅ 更容易進行單元測試 (可 mock)
- ✅ 未來可替換不同的 ReplayEngine 實現

---

### 4. ❌ 缺乏錯誤處理

**問題**: 關鍵操作靜默失敗 (直接 return)，難以調試

**解決方案**:

- 創建 `ReplayError` 自定義錯誤類別
- 定義 `ReplayErrorCode` 類型 (NOT_LOADED, INVALID_DATA, INVALID_TICK, INVALID_SPEED, INVALID_STATE)
- 在關鍵路徑拋出有意義的錯誤

**效果**:

- ✅ 錯誤更清晰易懂
- ✅ 提供錯誤上下文方便調試
- ✅ 調用者可正確處理異常情況

---

## 新增模組結構

```
replay/
├── infra/                          # 基礎設施層 (NEW)
│   ├── tick-scheduler.interface.ts
│   ├── browser-tick-scheduler.ts
│   ├── test-tick-scheduler.ts
│   └── index.ts
├── services/                       # 服務層 (NEW)
│   ├── log-query.service.ts
│   └── index.ts
├── replay.engine.interface.ts      # 引擎接口 (NEW)
├── replay.engine.ts                # 引擎實現 (REFACTORED)
├── models/
│   ├── replay.error.model.ts       # 錯誤模型 (NEW)
│   └── ...
├── controllers/                     # 控制器 (REFACTORED)
│   ├── playback.controller.ts
│   └── timeline.controller.ts
└── ...
```

---

## 使用範例

### 基本使用 (與之前相同)

```typescript
import { ReplayEngine } from '@/modules/replay'

const engine = new ReplayEngine()
engine.load(combatResult)
engine.play()
```

### 測試環境使用

```typescript
import { ReplayEngine, TestTickScheduler } from '@/modules/replay'

const testScheduler = new TestTickScheduler()
const engine = new ReplayEngine({}, testScheduler)

engine.load(combatResult)
engine.play()

// 手動控制時間推進
testScheduler.triggerTick(16) // 推進 16ms
```

### 使用 Controllers (需注入 LogQueryService)

```typescript
import { ReplayEngine, PlaybackController, LogQueryService } from '@/modules/replay'

const engine = new ReplayEngine()
const logQuery = new LogQueryService(combatResult.logs)
const playback = new PlaybackController(engine, logQuery)

playback.jumpToNextUltimate()
playback.togglePlayPause()
```

---

## 重構效果總結

### 代碼品質提升

- ✅ 解除瀏覽器耦合，符合平台無關原則
- ✅ 消除代碼重複，符合 DRY 原則
- ✅ 引入接口抽象，符合 DIP 原則
- ✅ 單一職責更清晰，符合 SRP 原則
- ✅ 錯誤處理完善，提升健壯性

### 可維護性提升

- ✅ 職責分離清晰，易於理解
- ✅ 低耦合高內聚，易於修改
- ✅ 有意義的錯誤訊息，易於調試

### 可測試性提升

- ✅ 可在 Node.js 環境運行
- ✅ 可注入 mock 物件
- ✅ 時間控制可測試

---

## 後續改進建議

1. **單元測試**: 為新的抽象層編寫測試
2. **記憶體優化**: 檢查快照與 log 的記憶體使用
3. **UI 整合**: 實現完整的回放 UI 介面
4. **進階功能**:
   - 支持變速回放時的插值 (interpolation)
   - 支持儲存/載入回放進度
   - 支持回放標記/註解功能
