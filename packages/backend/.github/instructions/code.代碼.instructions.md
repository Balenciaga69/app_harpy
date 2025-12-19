---
applyTo: '/*.ts, /*.tsx, /*.js, /*.jsx'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

### 關於代碼

- 基礎原-+
  則
  - 乾淨代碼
  - 低耦合
  - 高內聚
  - 可維護性強
  - 易讀性高
  - 命名有意義
  - 避免魔法數字和魔法字串
  - KISS,YAGNI,DRY 原則很注重
  - 代碼就是最好的文檔(理不用任何comment也能懂主要邏輯)
- 更佳實踐
  - 善用設計模式
  - 在寫方法與類別的時候要預先想好，這東西是要被單元測試的(但你不用先寫測試)。
  - 遵循SOLID原則(尤其是單一職責原則最重要)
  - 物件關係不應形成循環依賴，依賴應該是單向的
  - 如果你要寫 markdown 請以中文為主。
  - 你要扮演資深遊戲架構師，重視架構與品質與業界最佳實踐來導入我的方法。
  - 當你 Create,Update,Delete 也要關注是否有連動的檔案或spec.md

### 如果這是 OOP

- 建構子不要有過多參數，若有就要用設計模式簡化。
- 禁止使用全局單例，這會測試困難(狀態共享)、隱藏依賴、生命週期失控、難以支援多實例場景、跨語言移植困難
- 每個目錄最多 10 個檔案，超過應重構或分類

### 關於註解

- When you refactor or modify code, be sure to update related comments to maintain consistency
- Comments have two purposes
- Help understand complex logic
- Provide a brief one-line description of a function or class's purpose, allowing for quick browsing without diving into the code
- Methods use /_* single-line description *_/
- Class,Type,Interface use // single-line description
- Methods or function logic comments use // single-line description
- I don't need any @param, @returns type comments, as these are redundant
- I found that my colleague's computer does not support Chinese comments, so please
- ## ZH_TW comments throughout.

### Typescript 檔案與資料夾與物件命名規範

File names:
Almost time, FileName = InternalName
React Components: PascalCase (e.g., UserProfile.tsx)
Class, Abstract Class: PascalCase (e.g., UserProfile.ts)
Utility, Helper, Common: PascalCase (e.g., DataFetch.ts)
Interface, Type, Enum: PascalCase (e.g., IUserProfile,CharacterInformation.ts)

InternalNaming:
Class: PascalCase (e.g., UserProfile)
Class's Interface: I + PascalCase (e.g., IUserProfile)
Data Interface or Type Alias: PascalCase (e.g., UserID)
Enum: PascalCase (e.g., UserRole)
Constants: UPPER_SNAKE_CASE (e.g., MAX_RETRY_COUNT)
Utility, Helper, Common Functions: camelCase (e.g., fetchData)

### 本專案限定內容

- 我們做邏輯(非UI)的內容一律以未來邏輯內容能被 CSharp Python Go 等語言無痛轉移為優先考量
- 再遷移時候不會煩惱依賴某套件、或者耦合某個框架
- 我們使用了模組化架構來做專案結構
- 專案理論上可以被拆成前端與後端與獨立微服務之間不該有耦合，(除非共享契約與邏輯)
- 我們使用了 TS 套件包括:
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
- 我要讓內部遵循 單向依賴規則：箭頭永遠指向內層。
- 我將模組分成多層結構。同時若模組規模過大，我會在模組內再細分 sub-modules。
- domain/app/infra
  - domain 核心概念幾乎全部分佈在此
    - 聚合根、實體、值物件、領域服務、領域事件
    - domain 層是核心價值所在，必須保持其純粹性，不被任何外部技術細節污染。
    - 明確要求所有值物件都必須是不可變的
  - app 定義執行流程，協調實體層
    - 應用程式服務、儲存庫介面、服務介面
  - 這層將外部的伺服器技術，與內部的邏輯連接起來。
    - 儲存庫實作、服務實作、呈現器
  - infra這層包含所有技術骨架。
    - 網路框架、配置依賴注入、日誌系統、監控系統
  - 當您有 A,B 兩個不同限界上下文需要合作，防腐層（ACL）通常是必需的。
    - 避免污染核心模型、隔離外部系統的變動、強制單向依賴
    - 下游上下文應該建立防腐層來保護自己免受上游變化的影響。
  - 內層絕不能直接引用外層的實作，若需要外層的能力必須依賴外層定義的介面
- 介面是非常重要的，這樣我們才能解耦與替換實作與測試
- 每個 sub-module 或 module 都應該有一個 index.ts 作為進入點，並且只暴露必要的介面與類別
- 其餘地方不會有任何 index.ts
