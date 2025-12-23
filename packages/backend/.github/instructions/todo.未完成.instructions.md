---
applyTo: '/*.ts, /*.md'
---

## 已經可以:

- 可以在單一 Chapter 生成十個 StageNodes
- 可以根據 StageNodes 隨機生成適合的 EnemyInstance [O]
- 可以生成遺物 [O]

## 想要來做

- 可以創建角色
- 可以生成新的 Run
- 可以載入 Run

### 那就要先做

- IXxxRepository 介面
- Contexts 的 樂觀鎖與版本 序列 與 反序列功能
- 樣板載入器

### 再來是

- 角色生成器, Run 生成器, 倉庫

## 不急著做

- 多國語言資料支援
- Stage Event 支援
- 召喚系概念

## 臨時備忘錄:

幾件事情 給我建議:

1. Repo pattern 要幹嘛?
2. C:\Users\wits\Desktop\GitRepo\app_harpy\packages\backend\src\infra\loader\InternalEnemyConfigLoader.ts 這東西是不是要搬出該專案?還是不建議? 目前infra只有這東西
3. 樂觀鎖與版本號是這專案該在乎的事情嗎?還是 有nestjs的實作專案在乎的?我怕的是必須在這專案實踐 但這樣又跟遊戲本體邏輯耦合?
4. 我們操作 Contexts 多半會跨多個 Context 處理 要允許 1 or n 個操作
