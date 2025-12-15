## 異常狀態設計

- 異常狀態也應該被視為一種數據模板
- 靜態模板:定義狀態名稱、ID、行為規則、最大/最小疊層、持續時間、是否可被清除等。(初步構思)
- 狀態實例（套用在哪個 生物 上、當前疊層/持續時間、來源等）。
- 在戰鬥系統的特定 Tick 階段被處理（如 DeBuff 傷害計算、Buff 狀態檢查）。
- 狀態（例如 Chill）的靜態定義（通常存為 JSON 或配置檔）應該包含其固定邏輯。(id,name,type,isStackable,maxStack,durationType,baseDurationTicks,等等更多)
- 當一個狀態被賦予給一個角色時，就會創建一個實例，並存儲在該角色的戰鬥 Context 中
- 在目標生物上創建或更新 Chill 實例
- 在 每 Tick 下的「處理狀態」階段，Status System 會遍歷所有 Entity 的狀態實例進行觸發、更新持續時間或層數、清除、聚合 aliment 影響後的 stat

---

### Affix 附加狀態的設計：以 Chill 為例

- 某 weapon 有條 affix 如果敘述「當攻擊時自動附加一層 chill 給敵人」，這種該怎麼設計？
- 靜態詞綴模板的定義 該詞綴模板需要定義它是哪個事件的監聽者以及執行什麼行為。(effectModule)
- 戰鬥前事務階段： 角色管理系統會檢查該角色所有裝備/遺物上的詞綴實例。
- 註冊監聽器： 針對帶有 eventType: "ON_HIT" 的詞綴，在戰鬥系統的 事件管理器 中註冊一個監聽器。
- 當一個攻擊事件（AttackEvent）在 HitCheck 成功後（即命中敵人），事件管理器會觸發 ON_HIT 事件。
- 註冊的監聽器捕獲到 ON_HIT 事件，執行詞綴模板中定義的 action: "APPLY_STATUS"，呼叫 Status System 的 ApplyStatusEffect
- Chill 狀態實例被創建或更新在敵方 的 Context 中。
