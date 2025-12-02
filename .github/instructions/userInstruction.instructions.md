---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

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
- 我們做邏輯(非UI)的內容一律以未來可能遷移語言能無痛轉移與乾淨為優先考量

### 關於註解

- When you refactor or modify code, be sure to update related comments to maintain consistency
- Comments have two purposes
- Help understand complex logic
- Provide a brief one-line description of a function or class's purpose, allowing for quick browsing without diving into the code
- Methods use /_* single-line description *_/
- Class,Type,Interface use /\*_ * multi-line description *_/
- Methods or function logic comments use // single-line description
- I don't need any @param, @returns type comments, as these are redundant
- I found that my colleague's computer does not support Chinese comments, so please use English comments throughout. However, my English level is not very good, so your English should not be too difficult, and should not exceed B2 level. I need to be able to read it and he needs to understand it.
