# Replay 模組規格書 v0.4

## 一、目標功能與範圍

### 核心目標

播放 CombatEngine 產生的戰鬥日誌與快照，提供 play/pause/seek/speed 控制，讓 UI 可訂閱事件實現戰鬥回放動畫。

### 會實現的功能

- 載入 CombatResult 資料
- 播放控制（play / pause / stop）
- 時間跳轉（seek to tick）
- 倍速調整（0.5x ~ 3x）
- 事件訂閱機制
- 快照查詢（O(log n) 二分搜尋）
- tick 範圍日誌查詢

### 不會實現的功能

- 戰鬥運算邏輯（由 Combat 模組負責）
- UI 渲染（由 React 元件負責）
- 音效播放（由 UI 層負責）
- 存讀檔（由 PersistentStorage 模組負責）

---

## 二、架構與元件關係

### 入口層

- `ReplayEngine`：Facade，唯一對外介面，協調所有子系統

### 資料層

- `ReplayDataAdapter`：載入並驗證 CombatResult，提供快照/日誌查詢

### 狀態層

- `PlaybackStateMachine`：管理播放狀態（idle / playing / paused / ended）

### 時間層

- `ITickScheduler`：時間推進抽象
- `BrowserTickScheduler`：使用 requestAnimationFrame
- `TestTickScheduler`：測試用手動控制

### 事件層

- `EventBus`：replay 事件通訊中心

---

## 三、對外暴露的主要功能

### ReplayEngine API

```
ReplayEngine(config?: Partial<ReplayConfig>)
  .load(result: CombatResult): void
  .play(): void
  .pause(): void
  .stop(): void
  .seek(tick: number): void
  .setSpeed(speed: number): void
  .getState(): ReplayState
  .getCurrentSnapshot(): CombatSnapshot | null
  .on(event, handler): void
  .off(event, handler): void
  .dispose(): void
```

### ReplayConfig 輸入

- `playbackSpeed: number` — 初始倍速（預設 1.0）
- `autoPlay: boolean` — 載入後自動播放
- `tickInterval: number` — 每 tick 間隔毫秒數

### ReplayState 輸出

- `status: 'idle' | 'playing' | 'paused' | 'ended'`
- `currentTick: number`
- `totalTicks: number`
- `speed: number`
- `isLoaded: boolean`

### 事件類型

- `replay:loaded` — 資料載入完成
- `replay:started` — 從頭開始播放
- `replay:resumed` — 暫停後繼續
- `replay:paused` — 暫停
- `replay:stopped` — 停止並重置
- `replay:seeked` — 跳轉完成
- `replay:tick` — 每 tick 更新（含 snapshot）
- `replay:ended` — 播放結束
- `replay:speedChanged` — 倍速變更

---

## 四、設計原則摘要

- **極簡**：只保留核心播放功能
- **事件驅動**：UI 透過訂閱事件更新
- **UI 無關**：不依賴任何 UI 框架
- **可測試**：TestTickScheduler 支援單元測試
- **低耦合**：透過 Adapter 隔離 Combat 依賴
