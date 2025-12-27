# EntityModel

- 此為全新主題凌駕於其他 FAQ 內容
- 若有衝突則以此為準

## 為何會有這一篇內容?

- 目前專案中大多數都是貧血模型 (Anemic Model)
- 貧血模型的物件只包含最基本的屬性與關聯 ID
- 已經無法滿足我們現在的規則需求

## 會影響到甚麼

- 絕招, 遺物, 物品, 詞綴, 敵人等等領域物件
- 我們以 Character 為例
  - Character 身上裝備著 Relic
  - Relic 有多個 Affix
  - Affix 有多個 Effect
  - Effect 則是最底層的邏輯單元
  - 而每一層都靠 ID 組裝, 這在持久入庫時是必要的
  - 但在業務邏輯運算時, 這樣的設計會帶來許多不便
    - 例如計算 Character 的屬性時, 需要一路從 Character -> Relic -> Affix -> Effect 拿到 Effect 的邏輯
    - 這樣的設計讓業務邏輯散落在多個層級, 難以維護與擴展
  - 此外, 這樣的設計也違反了物件導向設計的封裝原則
    - 物件應該負責自己的行為與狀態, 而不是依賴外部的查找與組裝

## 我們重新定義甚麼? (以 Relic 為例)

- RelicTemplate (需要模板時才開發)
  - 定義物件的靜態屬性與規則由設計師設計, 靜態的來自 Google Sheet
- RelicAggregate
  - 會從 template 運行時生成
  - 定義動態屬性, 例如當前堆疊數, 耐久度等
  - 會有行為與方法
  - 裡面包含更多的 Aggregate Item
  - 基本上就是 Record 與 Template **所有字段的組合體**
  - 不會被存入 DB
- RelicRecord (當這東西需要被存入 DB 才用)
  - 會記錄跟哪個 template 關聯
  - 會被存入 DB
  - 只包含 ID 關聯的字段
  - 讀取時會被組裝成 RelicAggregate
