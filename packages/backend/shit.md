# 系統藍圖矛盾與設計疑慮盤點

讓我以架構師與遊戲設計師的雙重視角來檢視這份藍圖。

## 🔴 發現的矛盾與打架之處

### 1. **Affix 與 Modifier 的命名混亂**

**矛盾點：**

- `item.blueprint.md` 說：「Modifier：戰鬥或運算時的修飾符」、「Affix：藍圖設定的詞綴，一個 Affix 可衍生多個 Modifier」
- 但 `affix.blueprint.md` 標題寫「誰用了 Modifier」，內容又說「所有詞綴最終都會在戰鬥的 Tick 處理流程中聚合、觸發」

**問題：**

- Affix 到底是「靜態模板」還是「運行時實例」？
- Modifier 是 Affix 的子集還是平行概念？
- 屬性聚合系統應該處理 Affix 還是 Modifier？

**建議：**

```
明確定義層級：
- AffixTemplate (靜態藍圖)
- AffixInstance (運行時實例，掛在裝備/敵人上)
- StatModifier (從 AffixInstance 解析出來的純數值修飾)
```

---

### 2. **異常狀態與詞綴的職責重疊**

**矛盾點：**

- `ailment.blueprint.md`：「異常狀態為數據模板，分為靜態模板與狀態實例」
- `affix.blueprint.md`：「Affix 可以指定執行行為」，例如冰緩詞綴會 APPLY_STATUS

**問題：**

- 冰緩 (Chill) 既是異常狀態，也是詞綴行為的結果
- 如果裝備詞綴說「攻擊附加冰緩」，那冰緩的數值（持續時間、層數）是來自：
  - 詞綴的 Roll 值？
  - 異常狀態的靜態模板？
  - 還是兩者都要考慮？

**建議：**

```
明確規則：
- Affix 只定義「觸發條件 + 行為類型 + 參數」
  例：ON_HIT -> APPLY_STATUS(Chill, duration=2s, stack=1)
- Ailment 模板定義「基礎行為 + 可疊加規則」
- 最終效果 = Ailment 模板 × Affix 參數 × 目標抗性
```

---

### 3. **商店刷新的前後端責任不清**

**矛盾點：**

- `shop.blueprint.md`：「商店的刷新本身要像是 Roulette 旋轉調出的結果，很酷炫，但後端沒變」
- 同時又說：「商店刷新可定時或手動刷新，產生新物品列表」

**問題：**

- 如果「後端沒變」，那商店列表什麼時候生成？
- 玩家看到 Roulette 動畫時，後端是已經決定好結果，還是動畫結束才生成？
- 多設備登入時，商店狀態如何同步？

**建議：**

```
採用「預決定 + 延遲揭示」模式：
1. 玩家觸發刷新 → 後端立即生成新商品列表並存入 Context
2. 前端播放 Roulette 動畫（純視覺效果）
3. 動畫結束後顯示後端已決定的結果
4. 多設備登入時，顯示相同的「已決定」列表
```

---

### 4. **戰鬥結果的「預決定」vs「可變賽前變數」**

**矛盾點：**

- `combat.blueprint.md`：「戰鬥結果於載入時即決定，過程不可干預」
- `pre-combat.blueprint.md`：「賽前變數系統，玩家可花錢 reroll 賽前變數」

**問題：**

- 如果戰鬥結果「載入時即決定」，那玩家 reroll 賽前變數後：
  - 是否需要重新計算戰鬥結果？
  - 如果需要，「載入時即決定」就不成立
  - 如果不需要，那 reroll 變數就沒意義

**建議：**

```
修正為「戰鬥開始時決定」：
1. 玩家進入 pre-combat 階段
2. 可多次 reroll 賽前變數、調整裝備、下注
3. 點擊「開始戰鬥」→ 此時後端才執行戰鬥運算
4. 戰鬥運算完畢後，前端播放重播
```

---

### 5. **敵人生成的「模板 vs 實例」混淆**

**矛盾點：**

- `level.blueprint.md`：「敵人以模板（原型）定義」、「擔任菁英、首領、普通戰鬥時 Affixes 疊加方式不同」
- `creature.blueprint.md`：「敵人數據由敵人模板 (原型) 和關卡生成參數決定」

**問題：**

- 一個敵人模板能否同時擔任 normal/elite/boss？
- 如果可以，Affixes 疊加規則是寫在：
  - 模板裡？（那 normal 版本的模板就不該有 boss affixes）
  - 生成參數裡？（那模板只是個空殼）

**建議：**

```
採用「基礎模板 + 角色修飾」模式：
- EnemyTemplate: 定義基礎 Stats + 必定擁有的 Affixes
- RoleModifier (normal/elite/boss): 定義額外 Affixes Pool + 數值倍率
- 生成時: EnemyInstance = Template + RoleModifier + DifficultyModifier
```

---

## 🟡 需要深入討論的設計疑慮

### 1. **「無盡模式」的數值膨脹問題**

**疑慮：**

> `endless.blueprint.md`：「難度曲線切換為動態、指數級，確保敵人成長速度快於玩家累積成長」

**問題：**

- 指數成長會導致數值快速爆炸（第 100 層可能是 10^15 傷害）
- TypeScript 的 Number 精度有限（最大安全整數 2^53 - 1）
- 如何避免數值溢出？是否需要引入 BigInt 或科學記數法？

**參考：**

- POE：有傷害上限（999,999,999）
- TFT：無盡模式沒有數值膨脹，而是機制變態（8 星棋、複製金鏟）

---

### 2. **「同 Tick 下同時施放大招與攻擊」的合理性**

**疑慮：**

> `combat.blueprint.md`：「同 Tick 下同時施放大招與攻擊是可能的」

**問題：**

- 這在 TFT/POE 裡都不可能發生（行動互斥）
- 如果允許，會導致：
  - 傷害計算順序混亂（大招先還是攻擊先？）
  - 動畫表現困難（前端如何同時播放兩個動作？）
  - 平衡性災難（玩家可能設計出「大招 + 攻擊」一回合秒殺 Boss 的 Build）

**建議：**

- 改為「同 Tick 下優先級：大招 > 普攻」
- 或者「大招釋放後，本 Tick 不能普攻」

---

### 3. **「Context 驅動設計」的序列化成本**

**疑慮：**

> `技術概觀`：「輸入舊 Context，應用業務規則,輸出新 Context」

**問題：**

- 每個操作都要「讀取完整 Context → 修改 → 寫回」
- 如果 Context 包含 999 件裝備 + 100 層關卡歷史 + 所有詞綴實例，單次序列化可能幾 MB
- 高頻操作（如商店購買）會造成大量 IO

**建議：**

```
採用「子 Context 分離」策略：
- InventoryContext (倉庫相關)
- ShopContext (商店相關)
- CombatContext (戰鬥相關，不持久化)
- 每次操作只讀寫相關的子 Context
- 用 Version 字段實現樂觀鎖
```

---

### 4. **「裝備面板的屬性聚合」效能瓶頸**

**疑慮：**

> `character.blueprint.md`：「前端會向後端請求完整的 Run Context，面板會顯示角色所有計算後的屬性」

**問題：**

- 如果玩家有 20 件裝備，每件 5 個詞綴，每個詞綴 3 個 Modifier
- 總共 300 個 Modifier 需要聚合
- 每次打開面板都要重算一次嗎？

**建議：**

```
採用「快取 + 髒標記」策略：
- Context 中存一份 aggregatedStats (快取)
- 裝備變化時標記 isDirty = true
- 打開面板時:
  - 如果 isDirty == false → 直接返回快取
  - 如果 isDirty == true → 重新聚合並更新快取
```

---

## 🟢 我覺得設計得很好的地方

1. **Affix 作為統一介面** ✅
   - 裝備、敵人、技能都用同一套詞綴系統，代碼複用度高

2. **事件驅動的戰鬥流程** ✅
   - Tick-based + Event Queue，邏輯清晰，易於回放

3. **無狀態伺服器設計** ✅
   - 所有狀態存 DB，伺服器可水平擴展，符合現代架構

4. **生成系統與詞綴池分離** ✅
   - 生成器不關心詞綴內容，詞綴池不關心生成邏輯，職責清晰

---

## 📋 總結：需要優先解決的問題

| 優先級 | 問題                             | 影響範圍  |
| ------ | -------------------------------- | --------- |
| P0     | Affix/Modifier 命名與層級混亂    | 全系統    |
| P0     | 戰鬥結果決定時機（載入 vs 開始） | 戰鬥系統  |
| P1     | 異常狀態與詞綴的參數來源         | 戰鬥+生成 |
| P1     | 商店刷新的前後端時序             | 商店系統  |
| P2     | 無盡模式數值溢出                 | 無盡模式  |
| P2     | 同 Tick 雙行動合理性             | 戰鬥系統  |

## **我的建議是：先把 P0 問題討論清楚，再繼續往下設計。**

### 分析藍圖邏輯矛盾點

基於附件中的 blueprint.md 文件（迭代設計，可能有疏漏），以下盤點主要邏輯矛盾或衝突點。這些多因模組間耦合鬆散、術語定義不一致或流程重疊導致。重點標註來源文件，並簡述原因與潛在影響。

#### 1. **Affix 與 Modifier 的角色混淆（affix.blueprint.md vs. item.blueprint.md & stat.blueprint.md）**

- **矛盾描述**：affix.blueprint.md 將 Affix 定義為行為觸發器（e.g., 監聽事件、執行 APPLY_STATUS），不直接改屬性；但 item.blueprint.md 描述詞綴結構包含 "影響屬性、運算方式（Added, Multi, More）、Rolled Value"，這更像 Modifier。stat.blueprint.md 的屬性聚合也依賴 Added/Multi/More 運算。
- **原因**：Affix 定位為 "純粹效果定義"，但實作中混入數值修飾，導致行為 vs. 數值邏輯打架。
- **影響**：屬性聚合系統可能重複處理，難以區分 "觸發行為" 與 "數值加成"，測試與維護複雜。

#### 2. **異常狀態處理與 Tick 流程順序衝突（ailment.blueprint.md vs. combat.blueprint.md）**

- **矛盾描述**：ailment.blueprint.md 說異常狀態在 "戰鬥系統特定 Tick 階段統一處理"（e.g., DeBuff 傷害、Buff 檢查），並聚合對 stat 的影響；但 combat.blueprint.md 的 Tick 流程中，狀態處理是第3階段（處理 Buff/Debuff），之後才是第4階段屬性聚合。異常狀態應先影響屬性，再用於行為。
- **原因**：狀態效果需即時反饋屬性，但流程未明確狀態聚合發生在屬性聚合前。
- **影響**：戰鬥中屬性數值可能不一致（e.g., Buff 加攻擊，但下一 Tick 未及時聚合），導致傷害計算錯誤。

#### 3. **Entity/Unit 抽象層級模糊（creature.blueprint.md vs. character.blueprint.md）**

- **矛盾描述**：creature.blueprint.md 說 Entity 是抽象對象，Unit 是具體實作（玩家/敵人皆 Unit）；但 character.blueprint.md 稱 Character "本質上是 Unit 類型"，並強調角色由模板 + Context 聚合。未明確 Entity 與 Unit 的差異（e.g., Minion 是 Unit 子集？）。
- **原因**：抽象定義過於寬泛，Unit 實作未統一接口。
- **影響**：戰鬥系統處理 Entity 時，玩家/敵人/Minion 行為邏輯可能不一致，難以擴展新實體。

#### 4. **詞綴生成與池系統責任重疊（affix.blueprint.md vs. generator-weight.blueprint.md & item.blueprint.md）**

- **矛盾描述**：affix.blueprint.md 強調詞綴模板 "不關心出現位置"，生成由池系統負責；但 generator-weight.blueprint.md 引入 "動態權重修飾符"（Context 中 JSON 陣列調整 weight），item.blueprint.md 則描述詞綴池表（Affix Pool Table）定義出現概率。池系統與生成系統責任混淆。
- **原因**：動態修飾擴展了靜態池，但未整合為統一生成邏輯。
- **影響**：生成結果不可預測（e.g., 無盡模式特殊 Affixes 與動態 weight 衝突），平衡難調。

#### 5. **商店與倉庫/金幣系統解耦過度（shop.blueprint.md vs. inventory.blueprint.md）**

- **矛盾描述**：shop.blueprint.md 說商店負責買賣，但不負責金幣/倉庫；inventory.blueprint.md 倉庫負責存取，但不負責出售；交易系統作為 ACL 協調。但未定義交易失敗時的回滾邏輯（e.g., 金幣不足但物品已移出倉庫）。
- **原因**：模組解耦良好，但邊界未明確（e.g., 誰處理交易原子性？）。
- **影響**：數據一致性風險高，需額外樂觀鎖或事務處理（技術概觀提及樂觀鎖，但未細化）。

#### 6. **RUN 上下文與儲存系統拆分不一致（run.blueprint.md vs. 技術概觀.instructions.md）**

- **矛盾描述**：run.blueprint.md 說 RUN 管理持久化上下文；技術概觀說將 Context 拆成多欄位 JSON（角色屬性、倉庫等）存 NoSQL。但未說明 RUN 如何映射這些欄位（e.g., 戰鬥狀態存不存？）。
- **原因**：設計從 "單一 Context" 迭代到 "多欄位"，但 RUN 定義仍偏向整體管理。
- **影響**：儲存查詢效率 vs. 邏輯簡潔的權衡，潛在 IO 瓶頸。

#### 7. **Ultimate 與 Affix 組合邏輯模糊（ultimate.blueprint.md vs. affix.blueprint.md）**

- **矛盾描述**：ultimate.blueprint.md 說 Ultimate 由 Affixes 組合，綁定技能；affix.blueprint.md 說 Affix 是行為定義，不關心擁有者。但未說明組合後的 Affix 如何轉為技能實例（e.g., 斬殺波的補血效果如何實作）。
- **原因**：Ultimate 視為 "數據容器"，但組合邏輯未細化。
- **影響**：技能生成與詞綴觸發邏輯重疊，難以測試組合效果。

#### 8. **事件與戰鬥後流程整合不足（level.blueprint.md vs. post-combat.blueprint.md）**

- **矛盾描述**：level.blueprint.md 說事件是數據模板 + 邏輯執行器，僅流程控制；post-combat.blueprint.md 說戰勝後生成 "兩個獎勵事件分支"，每分支兩個獎勵。但未定義事件如何影響 RUN Context（e.g., 獎勵事件是否重用事件系統？）。
- **原因**：事件系統通用，但戰鬥後特定邏輯未整合。
- **影響**：獎勵生成邏輯孤立，難以擴展新事件類型。

#### 建議

- **優先修復**：統一 Affix/Modifier 定義，明確 Tick 階段順序，細化 ACL 與事務邏輯。
- **測試重點**：模擬戰鬥 Tick 流程，檢查屬性聚合與狀態效果一致性。
- **迭代建議**：引入統一術語表，避免抽象過泛；考慮單一 "Context Manager" 模組整合儲存與邏輯。
