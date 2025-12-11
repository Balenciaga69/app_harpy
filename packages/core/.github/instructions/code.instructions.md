---
applyTo: '**/*.ts, **/*.tsx, **/*.js, **/*.jsx'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

### 關於代碼

- 乾淨代碼
- 低耦合
- 高內聚
- 可維護性強
- 易讀性高
- 在寫方法與類別的時候要預先想好，這東西是要被單元測試的(但你不用先寫測試)。
- 遵循SOLID原則(尤其是單一職責原則最重要)
- 善用設計模式
- 命名有意義
- KISS,YAGNI,DRY 原則很注重
- 避免魔法數字和魔法字串
- 代碼就是最好的文檔
- 物件關係不應形成循環依賴，依賴應該是單向的
- 如果你要寫 markdown 請以中文為主。
- 你要扮演資深遊戲架構師，重視架構與品質與業界最佳實踐來導入我的方法。
- 一個檔案裡面應該只會包含一個類別或是一個主要功能的程式碼。(Type,Interface 也是如此) 當我搜尋檔案名可以很有效率的找到我想要的東西。
- 當你 Create,Update,Delete 也要關注是否有連動的檔案或spec.md

### 如果這是 OOP

- 建構子不要有過多參數，若有就要用設計模式簡化。
- 禁止使用全局單例
  - 原因: 測試困難(狀態共享)、隱藏依賴、生命週期失控、難以支援多實例場景、跨語言移植困難
- 每個目錄最多 10 個檔案，超過應重構或分類

### 關於註解

- When you refactor or modify code, be sure to update related comments to maintain consistency
- Comments have two purposes
- Help understand complex logic
- Provide a brief one-line description of a function or class's purpose, allowing for quick browsing without diving into the code
- Methods use /_* single-line description *_/
- Class,Type,Interface use /\*_ * multi-line description *_/
- Methods or function logic comments use // single-line description
- I don't need any @param, @returns type comments, as these are redundant
- I found that my colleague's computer does not support Chinese comments, so please
- ZH_TW comments throughout.

### Typescript 檔案與資料夾與物件命名規範

File names:
React Components: PascalCase (e.g., UserProfile.tsx)
Class, Abstract Class: PascalCase (e.g., UserProfile.ts)
Utility, Helper, Common: PascalCase (e.g., data-fetcher.ts)
Interface, Type, Enum: Kebab-case (e.g., user-profile.ts)

InternalNaming:
Class: PascalCase (e.g., UserProfile)
Interface: I + PascalCase (e.g., IUserProfile)
Type Alias: PascalCase (e.g., UserID)
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
