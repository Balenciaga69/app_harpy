# 戰鬥系統重構 TODO

遵循 SOLID 原則（尤其 SRP）與乾淨代碼指引，逐步改進戰鬥模組的設計。

---

## 1. 📌 isCharacter() 類型守衛遷移

**問題**  
`CombatContext.isCharacter()` 是工具函數，不應該是資料管理容器的方法，違反 SRP

**現況**

- 位置：`src/modules/combat/context/combat.context.ts` (L37-42)
- 用途：檢查某物件是否為 ICharacter

**改進方案**

- [ ] 建立 `src/modules/combat/shared/utils/typeGuards.util.ts`
- [ ] 實作 `isCharacter(obj: unknown): obj is ICharacter`
- [ ] 搜尋 repo 找出所有 `context.isCharacter()` 的使用處並替換為 import 的工具函式
- [ ] 從 `CombatContext` 移除 `isCharacter()` 方法

**接受標準**

- [ ] 新工具檔案已建立並匯出 `isCharacter`
- [ ] 所有原調用處已替換，無殘留使用
- [ ] `CombatContext` 恢復為純資料管理職責（無工具方法）

---

## 2. 🧹 TickerDriver.stop 事件與資源清理

**問題**  
`TickerDriver.stop()` 只設置 flag `isRunning = false`，未做清理或發送事件，易造成資源洩漏

**現況**

- 位置：`src/modules/combat/tick/ticker.driver.ts` (L50-52)
- 現狀：`public stop(): void { this.isRunning = false }`

**設計決策需求**
需先決定事件系統的清理策略：

1. **主動清理模式**：每個系統訂閱者監聽 `ticker:stopped` 並主動清理自己的資源
2. **集中清理模式**：由 `CombatEngine.dispose()` 統一呼叫所有子系統的 `dispose()`
3. **混合模式**：發出 stop 事件 + Engine 二層保險清理

**建議**：採用**混合模式** — 發事件讓訂閱者反應，Engine.dispose 作為最後保險

**改進方案**

- [ ] 評估現有事件系統中各訂閱者是否都有對應的清理邏輯（例如 EventBus 的 listeners、定時器、pending tasks）
- [ ] 在 `TickerDriver.stop()` 中：
  - [ ] 清除 setInterval（如果有）
  - [ ] 取消任何 pending callbacks
  - [ ] 發出 `ticker:stopped` 事件讓訂閱者主動清理
  - [ ] 呼叫 `_cleanupInternal()` 清空 internal state
- [ ] 確保 `CombatEngine.dispose()` 會呼叫 `ticker.stop()`
- [ ] 驗證沒有重複清理或 race condition（stop 應可安全重入）

**接受標準**

- [ ] `stop()` 發出事件且做資源清理
- [ ] 無因 stop 造成的訂閱 listener 洩漏
- [ ] `dispose()` 流程明確，不留懸掛的定時器或回調

---

## 3. 🔨 DamageChain 拆分為 Sub-Classes 與獨立模組

**問題**  
`DamageChain` 負責流程協調、Hook 調用、命中判定、暴擊、傷害修飾、防禦計算等多項職責，難以測試、擴充與維護

**現況**

- 位置：`src/modules/combat/damage/damage.chain.ts` (223 行)
- 職責：5+ 個獨立階段（beforeCalculation, hitCheck, critCheck, damageModify, defenseCalculation 等）

**Trade-off 分析**

| 面向         | 不拆                     | 拆成 Step 架構                        |
| ------------ | ------------------------ | ------------------------------------- |
| **測試**     | 難，需 mock 整個流程     | 易，每個 step 獨立測試                |
| **擴充**     | 加新效果需改 DamageChain | 加新 step class，Coordinator 配置即可 |
| **可讀性**   | 單一檔案，初期易懂       | 多檔案，但每個專責，易追蹤            |
| **效能**     | 少一層抽象               | 多層調用，但通常可忽略                |
| **初期投入** | 低                       | 中（新增檔案與介面）                  |

**建議方案**：採用 **Step 架構**（策略模式 + 協調者）

**改進方案**

- [ ] 建立 `src/modules/combat/damage/steps/` 目錄
- [ ] 定義 `DamageStep` 介面：`execute(ctx: DamageContext): DamageContext`
- [ ] 新增各 step class：
  - [ ] `HitCheckStep` — 命中判定
  - [ ] `CriticalStep` — 暴擊判定
  - [ ] `DamageModifyStep` — 傷害修飾
  - [ ] `DefenseCalculationStep` — 防禦計算
  - [ ] `ApplyDamageStep` — 應用傷害與發事件
- [ ] 建立 `DamageChainCoordinator` 作為協調者
  - [ ] 持有 `DamageStep[]` 陣列
  - [ ] 提供 `execute(event: DamageEvent): DamageResult`
  - [ ] 依序執行每個 step，傳遞 context 並允許 early exit
- [ ] 逐步把 `DamageChain` 的邏輯遷移到各 step
- [ ] 更新所有 `DamageChain` 的使用處為 `DamageChainCoordinator`
- [ ] 為每個 step 撰寫單元測試

**接受標準**

- [ ] 各 step 單一職責，易測試與維護
- [ ] Coordinator 提供清晰的公開 API
- [ ] 無功能迴歸，所有戰鬥流程結果一致
- [ ] 新增 effect 時，只需新增 step class 或修改現有 step 邏輯

---

## 4. 📝 DamageEvent.tags 從 Set<string> 遷移到 Enum

**問題**  
`tags: Set<string>` 缺乏型別安全，易拼字錯誤，無法編譯時檢查或 IDE autocomplete

**現況**

- 位置：`src/modules/combat/damage/models/damage.event.model.ts` (L33)
- 型別：`tags: Set<string>`
- 使用例：`event.tags.add('crit')` 無型別檢查

**改進方案**

### Phase 1：建立 Enum 並支援兼容轉換

- [ ] 新增 `src/modules/combat/damage/models/damage.tag.enum.ts`
  ```typescript
  export enum DamageTag {
    Critical = 'critical',
    AoE = 'aoe',
    DoT = 'dot',
    Reflect = 'reflect',
    // ... 其他 tag
  }
  ```
- [ ] 建立兼容 helper：`normalizeTags(raw?: Set<string> | string[]): DamageTag[]`
  - 負責將舊 Set 或陣列轉為 DamageTag[]
  - 忽略不在 enum 中的值並 log warning

### Phase 2：逐步替換使用處

- [ ] 搜尋所有 `event.tags` 的使用
- [ ] 把 `DamageEvent.tags` 型別改為 `DamageTag[]`
- [ ] 更新所有 `tags.add()` 為 `tags.push()`
- [ ] 更新所有 `tags.has()` 為 `tags.includes()`
- [ ] 在關鍵點使用 `normalizeTags()` 確保型別安全

### Phase 3：移除舊兼容邏輯

- [ ] 移除 `normalizeTags()` helper（如無舊 Set 產生器）
- [ ] 確認無殘留的 `Set<string>` tag 使用

**接受標準**

- [ ] `DamageTag` enum 已建立與完整
- [ ] `DamageEvent.tags` 改為 `DamageTag[]`
- [ ] IDE 可 autocomplete DamageTag 值
- [ ] 所有現有戰鬥邏輯無迴歸，單元測試通過
- [ ] 拼字錯誤在編譯期被捕獲

---

## 📋 實施順序建議

**優先級（由小到大）**：

1. **isCharacter() 遷移** ✅ 最小改動，快速勝利
2. **DamageEvent.tags Enum** ✅ 依賴少，收益高（型別安全）
3. **TickerDriver.stop 清理** ⚠️ 需先評估事件系統設計
4. **DamageChain 拆分** ⚠️ 改動最大，需配合測試

---

## 🔗 相關檔案

- `src/modules/combat/context/combat.context.ts` — CombatContext（isCharacter）
- `src/modules/combat/tick/ticker.driver.ts` — TickerDriver（stop）
- `src/modules/combat/damage/damage.chain.ts` — DamageChain（拆分目標）
- `src/modules/combat/damage/models/damage.event.model.ts` — DamageEvent（tags）
- `src/modules/combat/shared/` — 工具檔案放置地

---

## 📌 檢查清單

- [ ] 所有 phase 1 任務完成
- [ ] 單元測試覆蓋新改動
- [ ] 執行 `pnpm run test` 與 `pnpm run lint` 無錯誤
- [ ] 簡單戰鬥測試（`runSimpleCombat()`）仍可正常執行
- [ ] 提交 PR 附帶重構摘要
