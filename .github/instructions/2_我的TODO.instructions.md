---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

## v0.5已發生更動

- 新增資源註冊表（Resource Registry）機制
- Character 改為持有資源 ID，透過 Registry 查詢實體
- 移除 character id、entity id（實在沒意義，這不是 value object 而且沒用處）
- 角色物件太髒亂，新增大絕招、裝備、聖物管理器，仿造效果管理器
- 角色與效果、大絕招、裝備、聖物之間的依賴關係改為統一用註冊表解耦。

## Combat 模組目前有些事情還沒做:(但也不急著做)

### 很急

- 回放系統(UI)，但這個很麻煩，可能很考驗 UI/UX 不是我擅長的

### 不急

- 單元測試
- Try...Catch 錯誤處理
- 記憶體管理與效能優化(正式版前要處理)
- 先假定我未來會導入 DB 與 快取 與全面實踐 DIP 可單元測試，為前提來思考
- 資源容器查找效能優化（目前每次存取都需要 Map 查找，未來可考慮加入快取層）
- Redis 資源容器實作（需要 async/await 重大重構，v0.6+ 處理）

#### AI 給出的隱憂

- CombatContext 作為一切的門戶 EventBus, RandomProvider, 隊伍資訊)。這雖然簡化了依賴注入，但也使其成為一個超大物件 (God Object)，未來若系統擴展，這部分可能難以維護。但不符合單一職責原則 (SRP)。
- Hook/Effect 介面的多重職責 IEffect 介面同時也是 ICombatHook。效果 (數據) 和鉤子 (行為) 被合併在同一個實體中。雖然方便，但在工程上，數據 (Effect) 和行為 (Hook) 通常應保持分離，以符合 SRP 原則。
- 回放與遊戲邏輯耦合 ReplayEngine 似乎直接使用瀏覽器的 requestAnimationFrame (animationFrameId) 進行時間控制。這將回放系統與特定運行環境 (如 Web) 耦合，缺乏抽象層。缺乏解耦。更正規的做法是將 Tick 速率抽象出來，不依賴瀏覽器 API。
- (這邊我會考慮重構)在 PoisonEffect.ts 中，使用 ticksPassed / 100 來計算秒數。這假設了固定 100 Tick/秒，是一種簡單粗暴的遊戲時間管理方式。適用於單一幀率的模擬。但若要支持可變幀率，則需要更複雜的時間同步邏輯。

### 循環依賴問題未解決

1. domain/character/interfaces/character.interface.ts

   > domain/character/interfaces/effect.owner.interface.ts
   > context/index.ts
   > context/combat.context.interface.ts
   > infra/resource-registry/resource.registry.interface.ts

2. context/index.ts

   > context/combat.context.interface.ts
   > infra/resource-registry/resource.registry.interface.ts
   > domain/effect/models/effect.model.ts

3. domain/character/interfaces/character.interface.ts
   > domain/character/interfaces/effect.owner.interface.ts
   > context/index.ts
   > context/combat.context.ts
