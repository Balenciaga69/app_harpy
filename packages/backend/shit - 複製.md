### 系統架構與軟體層面分析 潛在矛盾、衝突、不完善與空白點

基於提供的藍圖文檔（尤其是 affix.blueprint.md 作為核心，以及相關聯的 ailment.blueprint.md、character.blueprint.md 等），我從系統架構師的角度分析整體設計。重點關注一致性、耦合度、實作可行性、空白填補，以及軟體開發中的潛在問題（如狀態管理、擴展性、測試性）。設計整體強調解耦與無狀態，這是好事，但仍有幾處矛盾或不完善。以下按主題分類列出問題，並附簡要建議。

#### 1. 詞綴（Affix）層次結構與轉換邏輯的模糊性

- 問題 AffixTemplate（靜態藍圖）定義觸發條件 + 行為類型 + 參數，但轉換為 AffixInstance（運行時實例）時，如何處理「具體數值」（Rolled Value）？StatModifier（純數值修飾）如何從 AffixInstance 解析？文檔提及「影響屬性、運算方式（Added, Multi, More）」，但缺乏具體轉換規則（e.g., 一個 Affix 如何衍生多個 Modifier？條件觸發如「低於 50% 魔力」如何實作？）。這可能導致實作時邏輯混亂，屬性聚合系統難以統一處理。
- 衝突 與 ailment.blueprint.md 整合時，Affix 可附加狀態（如冰緩），但狀態實例（currentStack, currentDuration）如何與 StatModifier 區分？Affix 轉換為 Modifier 時，狀態效果是否也需解析為數值修飾？
- 建議 補充轉換管道（Pipeline）設計，定義明確的解析函數（e.g., `parseAffixToModifiers(affixInstance): StatModifier[]`）。確保條件觸發邏輯與事件系統（combat.blueprint.md）整合，避免硬編碼。

#### 2. 生成系統與池表的耦合與動態調整

- 問題 詞綴生成流程依賴詞綴池表（Affix Pool Table），但 generator-weight.blueprint.md 引入動態權重修飾符（e.g., Run Context 中的 JSON 陣列），這可能造成池表靜態定義與動態調整的衝突。如何確保權重調整後的 Roll 不破壞平衡？此外，難度係數（difficulty.blueprint.md）影響生成，但文檔未說明如何與池表整合（e.g., 難度提升時，是否動態篩選池內容？）。
- 空白 無盡模式（endless.blueprint.md）中敵人加入特殊 Affixes，但生成邏輯如何區分「僅此階段出現」？池表是否需支援階段標籤？
- 軟體層面問題 動態權重若存於 Run Context，可能導致狀態膨脹，影響序列化/反序列化效能。建議引入快取層或預計算邏輯。

#### 3. 角色與敵人作為 Unit 的不一致性

- 問題 character.blueprint.md 與 creature.blueprint.md 皆稱角色/敵人為 Unit，但角色有成長（裝備/遺物聚合），敵人由模板 + 生成參數決定，且「模板是死的，不會有 rolled 的問題」。然而，affix.blueprint.md 允許 Affix 附加到敵人（e.g., 無盡模式特殊 Affixes），這與「敵人模板死」的設計矛盾——若敵人有動態 Affix，如何保持模板靜態？
- 衝突 level.blueprint.md 中敵人模板可擔任 normal/elite/boss，但 Affixes 疊加方式不同。若 Affix 可附加，則敵人實例需支持動態修改，但文檔強調敵人「不會有 rolled 的問題」，這可能導致實作時被迫複製邏輯。
- 建議 明確區分「模板級 Affix」（靜態定義於敵人模板）與「實例級 Affix」（動態附加）。引入敵人生成器模組，統一處理模板 + 參數 + 動態 Affix，避免 Unit 類型過於抽象導致測試困難。

#### 4. 戰鬥系統與事件觸發的整合空白

- 問題 combat.blueprint.md 採用 Tick-based 設計，事件處理順序嚴格，但 Affix 的觸發（e.g., ON_HIT 事件）如何嵌入 Tick 流程？ailment.blueprint.md 提及狀態處理在特定 Tick 階段，但 Affix 行為（如 APPLY_STATUS）是否同步處理？若 Affix 觸發導致狀態變化，如何避免循環依賴（e.g., 狀態影響屬性聚合，反過來影響觸發）？
- 空白 事件監聽器（event listeners）如何註冊與觸發？文檔提及「事件管理器」，但未定義其架構。戰鬥重播（前端）如何處理這些事件，而不影響後端無狀態設計？
- 軟體層面問題 Tick 同步執行，若事件隊列過長，可能阻塞主執行緒。建議引入非同步事件處理或優先級隊列，並確保監聽器解耦（e.g., 使用中介者模式）。

#### 5. 儲存與持久化的狀態管理問題

- 問題 run.blueprint.md 強調 Run Context 存於儲存系統，但 AffixInstance 是運行時實例，如何持久化？若戰鬥中動態附加 Affix（如賽前變數），是否需存入 Context？stat.blueprint.md 分 Persistent Stats 與 Battle Stats，但未說明 Affix 屬於哪類，且異常狀態僅存於戰鬥 Context。
- 衝突 設計強調無狀態與水平擴展，但若 Context 包含動態數據（如 Affix 實例），可能導致版本不一致（e.g., 多設備登入時，舊請求處理舊狀態）。storage.blueprint.md 提及拆分 JSON 欄位，但未涵蓋 Affix 持久化。
- 建議 定義 AffixInstance 的序列化規則（e.g., 只存模板 ID + Rolled 值），戰鬥結束後清除動態部分。引入樂觀鎖或版本控制，避免衝突。

#### 6. 解耦原則的實作風險與測試性

- 問題 設計強調單向依賴（domain/app/adapter/infra），但 Affix 生成涉及多系統（池、難度、角色），可能形成隱藏耦合。e.g., 屬性聚合系統「不在乎 Affix」，但實際需解析 Modifier，這是否違反解耦？
- 軟體層面問題 TypeScript 實現需避免全局單例（instructions.md 禁止），但若使用事件總線，可能引入隱藏依賴。測試困難 Affix 行為模組若未模組化，單元測試難以隔離。
- 建議 強化介面定義（e.g., IAffixResolver），並使用依賴注入。補充行為模組的抽象層（e.g., EffectModule 介面），確保可替換與測試。

#### 7. 其他空白與擴展性問題

- 空白 ultimate.blueprint.md 中 Ultimate Gem 有 Affix 影響技能，但如何與 Affix 系統整合？pre-combat.blueprint.md 的賽前變數注入狀態，如何區分與 Affix？
- 擴展性 若新增 Affix 類型（如新運算方式），是否需改核心聚合邏輯？無狀態設計好，但若邏輯過於分散，可能增加維護成本。
- 建議 補充系統圖（e.g., UML 類圖），並定義擴展點（如插件式 Affix 行為）。整體而言，設計方向正確，但需更多實作細節（如介面定義、錯誤處理）以填補空白。

總結 設計有強大的解耦基礎，但轉換邏輯與動態元素需更明確定義，以避免實作時的混亂。建議優先補充轉換管道與事件系統的細節，並進行原型實作驗證。

#### Affix 系統 你嘴上說「純粹」，但實際上已經被污染

- 你反覆強調 AffixTemplate 不關心出現時機、不關心擁有者、不關心地點
- AffixTemplate 內包含：
  - 觸發條件（eventType）
  - 行為（APPLY_STATUS / MODIFY_STAT）
  - 生效條件（如 HP < 50%）
  - Tags
  - 生成限制（等級、章節）
  - 這已經不是「純藍圖」，而是「半生成規則 + 半行為描述」
    真正的衝突是什麼？你同時存在三個地方在「決定 Affix 是否能作用」：
- AffixTemplate 定義生效條件
- AffixPool / Generator 定義是否能被抽中
- Context（Run / Difficulty / Endless） 動態修改可出現性
  你需要強制切一刀：AffixTemplate 只定義「如果它被啟用，會做什麼」
- 章節 / 等級限制
- 出現模式（Boss only / Endless only）
- 禁用規則
  👉 全部集中到一個 **AffixAvailabilityPolicy / RuleSet（生成層）**

#### 問題：Status 其實是「另一種 AffixInstance」

你嘴上說它們是不同系統，但從行為來看：有來源 有數值 影響屬性 影響行為 差別只剩「是否有 duration」
這會產生兩個實際問題：

#### 問題 ：雙重聚合來源

你現在有：

- 裝備 → Affix → StatModifier
- 狀態 → Status → StatModifier

但**誰負責最終一致性？**

- Status Tick 後改變 Stat
- 屬性聚合階段又重新計算
- 那 Status 的影響是：
  - 永久寫回？
  - 還是每 Tick 重新套？

目前描述是模糊的。

#### 問題 ：裝備改變異常狀態行為

你說：

> 裝備、遺物可改變異常狀態計算方式

那請問：

- 是 Affix 改變 Status Template？
- 還是改變 Status Instance 行為？
- 還是插手 Status System 的計算？

👉 這三個選項架構差異極大，目前你**沒有選清楚**

##### 建議一個乾淨解法

把 Status 明確降級成：

> **「有 duration 的 Modifier 容器」**

也就是：

- StatusTemplate = ModifierTemplate + DurationRule
- StatusInstance = ModifierInstance + Timer

這樣：

- 屬性聚合永遠只吃 Modifier
- 不再有「狀態是否直接改 stat」的歧義
- Affix / Status 只是「來源不同」

這會讓你整個戰鬥層瞬間清爽很多。

#### Combat Tick 流程：邏輯順序漂亮，但有一個致命漏洞

你現在的 Tick 順序是：

1. 行為轉 Event
2. Event 處理（傷害）
3. 狀態系統
4. 屬性聚合
5. 生死判定

### 問題：**你在第 2 步用的是哪一版屬性？**

因為你說：

- 狀態會影響屬性
- 但屬性是第 4 步才聚合

那請問：

- Damage Event 在第 2 步計算時：
  - 用的是上一 Tick 的屬性？
  - 還是「即時狀態修改後的屬性」？

這不是細節，是**核心一致性問題**。

##### 極端案例（一定會遇到）

- ON_HIT → APPLY_CHILL
- Chill 降低敵人防禦
- 同一 Tick 內還有第二段傷害

請問第二段傷害有沒有吃到 Chill？

現在的描述 **兩種解釋都說得通**，代表設計不完整。

##### 你必須明確定義一個鐵則

例如其中一種：

- **Tick 開始時鎖定 Snapshot Stats**
- 本 Tick 所有 Event 都用這份
- 狀態只影響「下一 Tick」

或：

- 每個 Event 前重新聚合（成本高）

不選 = bug 溫床。

## Enemy / Boss / Endless：規則寫在模板裡，會害死你

你多次提到：

> 不同身份時 Affix 疊加方式寫在模板中

這在短期很方便，**但長期一定爆**。

因為：

- Endless mode 說「所有節點都是 Boss」
- 但 Boss 行為寫在 Enemy Template
- 那 Endless 是改模板？還是套規則？

👉 **模板是死的，模式是活的，不能反過來**

建議你強制規則：

- EnemyTemplate：只描述「能力上限」
- EnemyRoleConfig（Normal / Elite / Boss / Endless）：描述加成規則
- Mode（Endless）只疊 RoleConfig

否則你會得到一堆 `if (isEndless && isBoss)`。
