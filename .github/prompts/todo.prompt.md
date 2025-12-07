# Combat & Replay 模組 v0.4

## 很急

## 需要討論

## 不急

## 未來統一實作

- 單元測試 (Jest) - 先不做
- 錯誤處理 (Try...Catch)

---

我在開發我們的 Roguelite 遊戲時遇到一些架構上的煩惱，希望能請教你的意見。

---

### 第一階段煩惱：裝備/遺物/效果的跨模組耦合

目前的問題是，我們的 `Equipment` 類別同時承載多個模組的需求，導致責任不清、資料冗餘以及跨模組耦合。例如：

```ts
class Equipment {
  readonly name: string // Inventory 需要
  readonly description: string // UI 需要
  readonly iconPath: string // UI 需要
  readonly price: number // Shop 需要
  readonly rarity: ItemRarity // Inventory 需要
  private effects: IEffect[] // Combat Engine 需要
}
```

問題如下：

- Combat Engine 被迫依賴價格、圖示等不相關資訊
- Inventory 被迫依賴戰鬥效果的實作細節
- PersistentStorage 序列化了大量不必要的欄位

我想採用「單一真相 + 多視角投影」的方案：

- 每個裝備、遺物有唯一的資料來源（Single Source of Truth）
- 不同模組維護自己的視角投影（View Projection）
- 裝備綁定效果模板 ID，由效果系統生成戰鬥效果

我想請問：

1. 這種多視角投影的實作方式，你會建議用什麼樣的資料結構或模式？
2. Combat Engine 讀取效果時，直接讀取模板 ID 並生成效果是否合理？還是應該有中間層？
3. 你覺得這種方式對未來跨語言移植（C#, Python, Go）友好嗎？

---

### 第二階段煩惱：裝備詞綴（Affix）與戰鬥效果的生成

我們的詞綴系統大致流程如下：

1. **Affix Definition（靜態配置）**：定義詞綴屬性
2. **Affix Instance（動態生成）**：生成隨機值
3. **Effect System（戰鬥計算）**：將詞綴生成效果應用到角色戰鬥數值

例如商店生成一頂帽子，帶有暴擊與攻擊速度詞綴：
附加詞綴:
[(affix_id: affix_crit_rate_up, rolledValue: 12)]
[(affix_id: affix_attack_speed_up, rolledValue: 8)]

這些詞綴在角色屬性面板或戰鬥計算時會被 createEffectFromAffixes 使用。

我想請教：

這種三層架構（Definition → Instance → Effect）在設計上合理嗎？

是否有推薦的資料結構來管理詞綴與效果的映射，避免 Combat Engine 或 Inventory 過度依賴彼此？

在生成隨機詞綴時，有什麼設計模式可以保持靈活性但又不破壞單一真相原則？
希望能聽到你的建議，特別是關於「多視角投影」和「詞綴效果生成」的實作細節。

謝謝！
