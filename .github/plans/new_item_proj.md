## 新 Item 模組重構計畫 (一次性切斷策略)

更新時間：2025-12-10

目標簡述

- 使 Combat Engine 完全不依賴 Item 模組；戰鬥只接收 Effect。
- 將 Effect 的來源單一化為 `AffixDefinition.effectTemplateId`，移除 `IItemDefinition.effectTemplateIds`。
- 採「一次性切斷」策略：先在 Item 模組內完成破壞性變更，不在此階段處理其他模組的相依性（後續由更高權限的 AI/工程師修復）。
- 我們現階段只會動到 domain/item 模組內的程式碼，其餘會有很多error 但我們先不管。

現況摘要

- 現況：程式碼「部分」支援把 affix 轉成 Effect，但有斷裂（bug／責任未對齊），因此還不能可靠地把任一 affix（不論 relic 或 equipment）完整轉成 Effect。(我們也先不管)
- Attribute 從 Effect 提取效果的方式是透過 IEffect.onApply 去觸發的。這可以用於初始屬性計算與戰鬥效果觸發。
- `IItemDefinition` 目前包含 `effectTemplateIds` 屬性；`CombatItemFactory` 將其複製到 `ICombatItemView`，並由 `EffectFactory` 嘗試由 affixInstance 建造效果。
- `IAffixDefinition` 已包含 `effectTemplateId`（單一真實來源），`IAffixInstance` 只記錄 `definitionId` 與 `rolledValue`。
- 專案中既有多處定義檔（equipment/relic templates）使用 `effectTemplateIds` 作為靜態效果宣告。

問題陳述（為何要改）

- 資料不一致風險：`effectTemplateIds` 分散在 ItemDefinition 和 AffixDefinition 會導致重複資料、差異與同步成本。
- 關注點混淆：Combat 關心的是 Effect，本不應該直接依賴整個 ItemBlueprint 的靜態欄位。
- 可維護性：未來多平台/多語言遷移時，希望 Item 資料可以純資料化（只保留 affix pool 與描述 key），而 Effect 由單一 registry 驅動。

設計原則

- 單一事實來源（Single Source of Truth）：Effect 由 `AffixDefinition.effectTemplateId` 驅動。
- 低耦合：Combat 只接收 `IEffect[]`（或 `ICombatItemView` 內的 affixInstances 由 EffectFactory 轉換為 effects），不知 Item 的存在。
- 可遷移性：資料結構盡量 JSON 序列化友好，便於跨語言實作。

一次性切斷的具體變更（Item 模組內）

- 刪除 `IItemDefinition.effectTemplateIds` 屬性。
- 刪除 `ICombatItemView.effectTemplateIds` 屬性；`ICombatItemView` 僅保留 `id`、`affixInstances` 與必要 metadata（rarity/slot/stackCount）。
- 更新 `CombatItemFactory.create`：不複製 effectTemplateIds，只產出 `affixInstances`。
- 更新 `EffectFactory.createFromCombatItem`：改為使用 `AffixDefinitionRegistry.get(definitionId)` 取得 `effectTemplateId` 再呼叫已註冊的 builder。
- 在 Item Definition Config（equipment-templates / relic-templates）中，將原本放在 `effectTemplateIds` 的宣告移至對應的 Affix 定義或移除（視情況），或在短期內加入轉換步驟以保留行為。

SQL 開發者視角的 Trade-offs（用類比 SQL 的思維說明）

- 正規化（Normalization） — 現在的推薦做法
  - 將 effect 的來源放在 `AffixDefinition`（類似在關聯資料庫中把 effectTemplateId 放在 affix table），呼叫端透過 join 或 lookup 取得資料。
  - 優點：避免重複、單一維護點、資料一致性好（更新一處即可改變所有受影響的 items）。
  - 缺點：查詢時有額外的「join/lookup」成本（但在記憶體 registry 情況下成本極低）；需要確保 registry 的可用性與初始化順序。
- 去正規化（Denormalization） — 保留 `effectTemplateIds` 在 ItemDefinition
  - 優點：查詢快速（直接讀取），在不願動後端邏輯時可快速回收行為。
  - 缺點：資料重複、同步成本高（affix 與 item 的 effect 定義可能不同步）、修改面向易出錯。
- 實務權衡（Trade-off 結論）
  - 若優先考量維護性與跨語言一致性，採正規化（Affix → Effect）是較佳方案。
  - 若優先考量短期最小變更（低風險快速上線），可先採去正規化或維持相容層；但這會留下長期債務。

一次性切斷策略的風險與 mitigations

- 風險：整個程式樹可能型別錯誤或 CI 失敗（因為其他模組仍仰賴已移除的欄位）。
- 緩解：在 PR/提交說明明確標註為「破壞性遷移」，並把更新清單與 grep pattern 提供給後續修復者或 AI（見下）。
- 允許的行為：此 PR 只變更 Item 模組內檔案；其他模組保留等待被修復的狀態。

供下一個 AI / 人類工程師的操作清單（搜尋 & 修改指引）

- 搜尋關鍵字：`effectTemplateIds`、`.effectTemplateIds`、`effectBuilder`、`EffectFactory.createFromCombatItem`。
- 主要修改檔案（建議先檢視）
  - `src/domain/item/definitions/item-definition.ts`
  - `src/domain/item/projections/combat-item-view.ts`
  - `src/domain/item/factories/CombatItemFactory.ts`
  - `src/domain/item/factories/EffectFactory.ts`
  - `src/definition-config/equipment/equipment-templates.ts`
  - `src/definition-config/relic/relic-templates.ts`
  - 以及所有使用 `effectTemplateIds` 的上下游模組（使用全 repo grep 找出清單）。
- 建議修復策略
  1. 在 Item 模組內完成型別變更（刪除欄位、更新 factory）。
  2. 立刻執行 `npm run check` 收集錯誤清單。
  3. 依錯誤清單逐一替換上游呼叫端：用 `AffixDefinitionRegistry.get()` 取得 affix def 再拿 `effectTemplateId`，或直接改為使用 `EffectFactory.createFromCombatItem(combatItemView)`。
  4. 若某處需要快速修補，可實作短期 shim：由舊的 `effectTemplateIds` 值動態產生（從 affix definition 反推），但標記為 deprecated。

交付物（此計畫檔希望交給高階 AI 繼續）

- 1. 這份計畫檔（你現在看到的檔案）。
- 2. repo grep pattern 列表（`effectTemplateIds`、`AffixDefinition`、`EffectFactory`）。
- 3. 期望行為定義：Combat 最終只會接收 IEffect 或由 EffectFactory 產生的效果清單。

備註

- 如果你確定要「一次性切斷」，我可以接著產生破壞性 patch（在 Item 模組內移除欄位並改寫 factory），並把 `npm run check` 的輸出結果留給你或下一個 AI 去修復其它模組。

---

（END）
