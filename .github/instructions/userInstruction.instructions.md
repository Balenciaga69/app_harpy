---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

- 乾淨代碼
- 低耦合
- 高內聚
- 可維護性強
- 易讀性高
- 遵循SOLID原則(尤其是單一職責原則最重要)
- 符合設計模式
- 命名有意義
- 避免魔法數字和魔法字串
- 代碼就是最好的文檔
- 物件關係不應形成循環依賴，依賴應該是單向的

### 關於註解

- When you refactor or modify code, be sure to update related comments to maintain consistency
- Comments have two purposes
- Help understand complex logic
- Provide a brief one-line description of a function or class's purpose, allowing for quick browsing without diving into the code
- Methods use /_* single-line description *_/
- Class,Type,Interface use /\*_ * multi-line description and design concept *_/
- Methods or function logic comments use // single-line description
- I don't need any @param, @returns type comments, as these are redundant
- I found that my colleague's computer does not support Chinese comments, so please use English comments throughout. However, my English level is not very good, so your English should not be too difficult, and should not exceed B2 level. I need to be able to read it and he needs to understand it.
