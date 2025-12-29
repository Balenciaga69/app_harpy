你好，我是 GitHub Copilot。

針對你的三個核心問題：**事件驅動的邊界**、**雙軌道（Result Pattern）的落地計畫**，以及**現有架構的風險盤點**，我將基於你的專案現狀與大型遊戲開發經驗進行分析。

---

### 1. 事件驅動：解耦與邊界

#### **Q: 業務邏輯內要用事件驅動來解耦嗎？**
**原則：聚合根（Aggregate）內部的強一致性邏輯，絕不使用事件；跨系統的副作用，才使用事件。**

*   **例子：脫下衣服 -> 自動運算負重**
    *   **判斷**：這是**內部強一致性**邏輯。
    *   **做法**：**不要用事件**。應該在 `Character.unequipRelic()` 方法內部直接呼叫 `this.recalculateStats()`。
    *   **原因**：如果用事件，可能會出現「裝備脫了，但負重還沒變」的短暫不一致狀態。在遊戲邏輯中，屬性計算必須是原子性（Atomic）的。

*   **例子：脫下衣服 -> 觸發「裸體狂奔」成就**
    *   **判斷**：這是**外部副作用**。
    *   **做法**：**使用事件**。`Character` 發出 `RelicUnequipped` 事件，`AchievementSystem` 訂閱並處理。
    *   **原因**：成就系統掛了不應該影響玩家脫裝備；成就系統的邏輯也不該寫在 `Character` 裡。

#### **Q: 事件 EventBus 是一種射後不理（Fire-and-Forget）嗎？**
在單體架構（Monolith）的 Node.js 遊戲後端中，通常有兩種模式：

1.  **同步事件（Domain Events - In-Process Sync）**：
    *   **不是**射後不理。
    *   `EventBus.publish(event)` 會等待所有訂閱者執行完畢。
    *   **用途**：確保所有邏輯在同一個 Transaction 內完成（例如：扣錢 + 給道具）。如果給道具失敗，錢要退回來。
2.  **非同步事件（Integration Events - Async）**：
    *   **是**射後不理。
    *   通常透過 Queue (Redis/RabbitMQ) 或 `setImmediate` 執行。
    *   **用途**：非關鍵業務（Log、分析數據、推播通知）。

**結論**：你的專案目前建議先實作 **同步 EventBus**，這樣除錯比較簡單，也能保證邏輯順序。

---

### 2. 雙軌道（Result Pattern）落地盤點

我們需要將「預期內的失敗」從 `throw Error` 改為 `return Result.fail()`。

#### **第一步：基礎建設 (Shared)**
*   **位置**：`src/shared/result/Result.ts` (需新建)
*   **內容**：定義 `Result<T, E>` 類別。

#### **第二步：Domain 層 (核心邏輯)**
這裡最需要改，因為這裡是業務規則的源頭。

*   **Character.ts**
    *   `equipRelic()`:
        *   原：若負重滿了可能拋錯或回傳 false。
        *   改：回傳 `Result<void, 'Overweight' | 'SlotOccupied'>`。
    *   `unequipRelic()`:
        *   改：回傳 `Result<void, 'RelicNotFound'>`。
*   **Stash.ts**
    *   `addItem()`:
        *   改：回傳 `Result<void, 'StashFull'>`。
*   **`src/domain/shop/Shop.ts`** (假設未來有)
    *   `buyItem()`:
        *   改：回傳 `Result<void, 'NotEnoughGold'>`。

#### **第三步：Application 層 (服務協調)**
這裡負責接住 Domain 的 Result，並決定怎麼辦。

*   **EquipmentService.ts**
    *   `equipRelicAndUpdateContexts()`:
        *   原：`throw new Error('Failed to equip relic')`
        *   改：
            ```typescript
            const result = character.equipRelic(relic);
            if (result.isFailure) {
                return Result.fail(result.error); // 將錯誤向上傳遞
            }
            // ... 成功才更新 Context
            ```

#### **第四步：Infra 層 (資料庫/配置)**
**保持原樣 (Throw Error)**。
*   `IRepositories` 的實作：如果資料庫連線斷了，或者 SQL 寫錯了，這是 Bug 或系統故障，**請繼續拋出 Exception**。這不是業務邏輯能處理的。

---

### 3. 架構風險掃描 (Code Review)

檢查目前的代碼，有幾個潛在的「危險」區域：

#### **風險 1：手動 Context 同步 (Manual Context Sync)**
*   **位置**：`EquipmentService.ts`
*   **問題**：
    ```typescript
    // 修改 domain 物件
    const newCharacter = character.unequipRelic(relicId)
    // 危險：必須手動記得把 record 塞回 appContextService
    this.appContextService.setCharacterContext({ ...characterContext, ...newCharacter.record })
    ```
*   **風險**：如果開發者在寫新的 Service 時，修改了 Domain 物件但**忘記**呼叫 `setCharacterContext`，或者只更新了一半，會導致記憶體中的狀態不一致。
*   **建議**：未來應封裝一個 `Repository.save(aggregate)` 或 `UnitOfWork` 模式，自動提取 `record` 並更新 Context，而不是讓 Service 手動拼湊 JSON。

#### **風險 2：貧血模型 (Anemic Domain Model) 的跡象**
*   **觀察**：目前 `EquipmentService` 承擔了「從 Stash 拿出來 -> 放進 Character」的流程控制。
*   **風險**：如果邏輯變複雜（例如：有些裝備脫下來會自動回到特定倉庫頁籤），Service 會變得越來越肥。
*   **建議**：確保 `Character` 和 `Stash` 的方法足夠強大。例如 `character.equipFromStash(stash, relicId)` (這可能導致 Domain 耦合，需權衡)，或者保持 Service 協調但邏輯盡量下沉。

#### **風險 3：缺乏輸入驗證 (Input Validation)**
*   **位置**：RunInitializationService.ts
*   **問題**：`params` 直接被使用。
*   **風險**：如果前端傳來 `seed: "abc"` 或者 `relicIds` 包含惡意字串？
*   **建議**：在 Application 層的入口處（Controller 或 Service 開頭）引入 Zod 或 Joi 進行 Schema 驗證。

#### **風險 4：缺乏事務一致性 (Transaction Consistency)**
*   **位置**：`EquipmentService.ts`
*   **問題**：
    ```typescript
    this.appContextService.setCharacterContext(...) // 1. 更新角色
    this.appContextService.setStashContext(...)     // 2. 更新倉庫
    ```
*   **風險**：雖然目前是記憶體操作沒問題，但如果這兩步中間發生錯誤（例如第二步拋錯），那麼角色已經更新了，倉庫卻沒更新（裝備憑空消失或複製）。
*   **建議**：實作 Result Pattern 後，確保所有檢查都通過了，再一次性更新 Context；或者使用 `ContextMutator.commitBatch(updates)` 的概念。

### 總結行動清單

1.  **建立 `Result` 類別** (優先)。
2.  **重構 `EquipmentService`**：改用 Result Pattern，並確保「全有或全無」的 Context 更新。
3.  **引入 `EventBus`**：先做同步版，用於解耦成就系統。
4.  **保持 Infra 拋錯**：不要過度設計。