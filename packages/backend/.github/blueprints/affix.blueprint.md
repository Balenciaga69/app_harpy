## Affix

- 詞綴模板本身不應該關心它能被誰擁有。
- 不應該關心誰能裝備，或者擁有者能堆疊多少個。
- 它的職責是定義行為與基礎數值。
- Affix 藍圖：保持純粹，專注於效果定義，不關心其出現的地理位置和時間。
- 這個 Affix 是 boss 特有或某裝備特有這件事情，不是 boss 或裝備該關心的。
- 也不是 affix 本身該關心的，而是生成系統與池系統該關心的。
- 生成服務（Item/Enemy）只負責讀取 Context 和分佈表，並執行生成行為。
- 這個詞綴只會出現第一章節的武器上，或第三章以上某一敵人成為 Boss 時，這件事情與 affix 藍圖無關。

## 誰關心 Affix

- 終極寶石 (Ultimate Gem) 是由詞綴組合。
- 物品、裝備、遺物是詞綴的主要載體。
- 詞綴可以指定執行行為。
- 在無盡模式下，敵人會加入僅此階段出現的特殊 Affixes。
- 詞綴生成系統：從詞綴池表中，根據 Weight 抽出並 Roll 數值。
- 然後將詞綴塞到 Item Instance。
- 沒有 Affixes 就做不出任何物品、裝備、遺物。
- 也做不出敵人、終極技能、賽前變數等等。
- 角色與敵人都是 Unit 類型。
- 角色的成長是透過裝備/遺物/模板上的詞綴聚合而成。
- 敵人數值也是如此。
- 賽前變數的效果會以狀態實例或屬性修飾符的形式注入。
- 這本質上是動態賦予了類似詞綴的短暫效果。

## 詞綴（Affix/Modifier）

### 詞綴定義

- Modifier：戰鬥或運算時的修飾符
- Affix：藍圖設定的詞綴，一個 Affix 可衍生多個 Modifier（如同時補 HP 又加暴擊）

### 詞綴層次結構

- AffixTemplate (靜態藍圖)：定義觸發條件 + 行為類型 + 參數
- AffixInstance (運行時實例，掛在裝備/敵人實例上)：從模板實例化，包含具體數值
- StatModifier (從 AffixInstance 解析出來的純數值修飾)：用於屬性聚合系統運算

### 屬性聚合系統

- 屬性聚合系統不在乎 Affix，只處理 StatModifier
- Affix 是存在於戰鬥外的，當戰鬥時要運算屬性時 Affix 會轉換成1-n個 Modifier 用於運算屬性

### 詞綴結構

- AffixTemplate：靜態藍圖，定義觸發條件 + 行為類型 + 參數
- AffixInstance：運行時實例，包含具體數值，掛在裝備/敵人實例上
- StatModifier：從 AffixInstance 解析出來的純數值修飾，用於屬性運算
- 結構內容（適用於 AffixTemplate）：
  - 影響屬性、運算方式（Added, Multi, More）、Rolled Value、生效條件（如低於 50% 魔力）、TAGs、生成限制（如等級、關卡門檻）

### 詞綴表（Affix Table）

- 定義單一詞綴所有靜態屬性：ID、Tags、MinMaxRange、CalcType、TargetStat 等

### 詞綴池表（Affix Pool Table）

- 定義詞綴出現概率：詞綴 ID、抽中 weight、可抽 affix 的 ItemTemplate

### 詞綴生成流程

1. 從詞綴池撈出符合條件的 AffixTemplate
2. 檢查排他（Exclusion Group，防止重複）
3. 根據 Weight 抽出並 Roll 數值
4. 從 AffixTemplate 創建 AffixInstance，並將其塞到 Item Instance
