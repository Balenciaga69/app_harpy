# Replay 模組 v0.4 — 極簡說明

## 一、用途

- 播放 `CombatEngine` 產生的 log/snapshot
- 支援 play / pause / stop / seek / speed
- UI 可訂閱事件，實現戰鬥回放

## 二、核心 API

- `ReplayEngine.load(combatResult)` 載入資料
- `ReplayEngine.play()` 開始/繼續
- `ReplayEngine.pause()` 暫停
- `ReplayEngine.stop()` 停止並重置
- `ReplayEngine.seek(tick)` 跳轉
- `ReplayEngine.setSpeed(x)` 倍速 (0.5~3)
- `ReplayEngine.getState()` 取得狀態
- `ReplayEngine.getCurrentSnapshot()` 取得快照
- `ReplayEngine.on(event, handler)` 訂閱事件
- `ReplayEngine.dispose()` 清理

## 三、事件

- `replay:loaded` 資料載入
- `replay:started` 開始播放
- `replay:paused` 暫停
- `replay:stopped` 停止
- `replay:seeked` 跳轉
- `replay:tick` 每 tick 更新
- `replay:ended` 播放結束
- `replay:speedChanged` 倍速變更

## 四、設計原則

- 極簡：只保留核心功能
- 事件驅動：mitt 訂閱
- UI 無關：不依賴框架
- 可測試：TestTickScheduler

## 五、結構

- replay-engine/ReplayEngine.ts：唯一重點
- 其他皆內部輔助
