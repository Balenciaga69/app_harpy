---
applyTo: '/*.ts, /*.tsx, /*.js, /*.jsx'
---

### 關於代碼

- 基礎原則
  - 乾淨代碼
  - 低耦合
  - 高內聚
  - 可維護性強
  - 易讀性高
  - 命名有意義
  - KISS, YAGNI, DRY 原則很注重
  - 代碼就是最好的文檔 - 不用註解就能看懂是最高品質
- 更佳實踐
  - 善用設計模式
  - 在寫方法與類別的時候要預先想好, 這東西是要被單元測試的 - 但你不用先寫測試
  - 遵循 SOLID 原則 - 尤其是單一職責原則最重要
  - 物件關係不應形成循環依賴 - 依賴應該是單向的
  - 如果你要寫 markdown 請以中文為主
  - 我偏好業界最佳實踐, 已被驗證過成熟的方案, 而非創新或實驗性質的東西
  - 我在命名以及架構上偏好使用通用語言, 就是最接近業界標準的作法與定義
  - 當你建立 (Create)、更新 (Update)、刪除 (Delete) 時也要關注是否有連動的檔案或 spec.md

### 我認為糟糕的代碼

- 命名一堆單字組合而成
- 函數或方法的參數一大堆
- 沒用到的代碼也不刪除
- 大量 nested structure,loops, conditionals
- 沒有型別或者型別在調用途中被破壞
- 一份資料夾十個檔案
- 有副作用無法追查
- 換個語言或框架或套件這個功能就廢掉了
- 單元測試不能準確測試這段代碼
- 過度設計 - 設計是為了解決現在的問題而不是未來的問題
- 偷偷使用全域或單例
- 魔法數字和魔法字串
- 一個檔案或類別幾千行, 它什麼都管

### 關於註解

修改或重構代碼時務必更新相關註解以保持一致性

註解有兩個目的

- 協助理解複雜邏輯
- 提供函數或類別的單行簡要描述, 可快速瀏覽而無需深入代碼

註解規範

- 方法使用 /_ single-line description _/
- 類別、型別、介面使用 // single-line description
- 邏輯註解使用 // single-line description
- 不需要 @param、@returns 型別註解, 這些是多餘的
- 同事的電腦不支援中文註解, 請使用 ZH_TW 標記的中文註解

### TypeScript 檔案與資料夾與物件命名規範

檔案名稱規範

- React 元件: PascalCase (例如 UserProfile.tsx)
- 類別、抽象類別: PascalCase (例如 UserProfile.ts)
- 工具類、輔助類、公用類: PascalCase (例如 DataFetch.ts)
- 介面、型別、列舉: PascalCase (例如 IUserProfile, CharacterInformation.ts)

物件內部命名規範

- 類別: PascalCase (例如 UserProfile)
- 類別介面: I + PascalCase (例如 IUserProfile)
- 資料介面或型別別名: PascalCase (例如 UserID)
- 列舉: PascalCase (例如 UserRole)
- 常數: UPPER_SNAKE_CASE (例如 MAX_RETRY_COUNT)
- 工具函數、輔助函數、公用函數: camelCase (例如 fetchData)

### 本專案限定內容

- 我們做邏輯 (非 UI) 的內容一律以未來邏輯內容能被 CSharp、Python、Go 等語言無痛轉移為優先考量
- 再遷移時候不會煩惱依賴某套件, 或者耦合某個框架
- 我們使用了模組化架構來做專案結構
- 專案理論上可以被拆成前端與後端與獨立微服務之間不該有耦合 (除非共享契約與邏輯)
- 我們使用的 TS 套件包括
- 純 TS 套件
  - mitt
  - chance
  - seedrandom
  - nanoid
- 與瀏覽器或 React 互動的 TS 套件
  - heroui/react
  - tailwindcss
  - localforage
  - zustand

#### 模組內的開發守則

- 因為我安裝了 eslint-plugin-boundaries
- 我要讓內部遵循單向依賴規則 - 箭頭永遠指向內層
- 我將模組分成多層結構, 同時若模組規模過大, 我會在模組內再細分 sub-modules
- domain/app/infra
  - domain 核心概念幾乎全部分佈在此
- 聚合根, 實體, 值物件, 領域服務, 領域事件
- domain 層是核心價值所在, 必須保持其純粹性, 不被任何外部技術細節污染
- 明確要求所有值物件都必須是不可變的
  - app 定義執行流程, 協調實體層
- 應用程式服務, 儲存庫介面, 服務介面
  - 這層將外部的伺服器技術, 與內部的邏輯連接起來
- 儲存庫實作, 服務實作, 呈現器
  - infra 這層包含所有技術骨架
- 網路框架, 配置依賴注入, 日誌系統, 監控系統
  - 當您有 A、B 兩個不同限界上下文需要合作, 防腐層 (ACL) 通常是必需的
- 避免污染核心模型, 隔離外部系統的變動, 強制單向依賴
- 下游上下文應該建立防腐層來保護自己免受上游變化的影響
  - 內層絕不能直接引用外層的實作, 若需要外層的能力必須依賴外層定義的介面
- 介面是非常重要的, 這樣我們才能解耦與替換實作與測試
- 其餘地方不會有任何 index.ts
