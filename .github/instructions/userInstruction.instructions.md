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

### 關於註解

- 註解有兩種用途
- 幫助理解複雜的邏輯
- 簡短的一行描述函數或類的用途，讓高速瀏覽的人能免於看代碼
- 方法使用 /\*_ 單行敘述功能 _/
- Class,Type,Interface 使用 /\*\* _ 多行敘述功能與設計理念 _/
- 方法或函數內的邏輯註解使用 // 單行敘述
- 我不需要任何 @param, @returns 之類的註解，因為這些都是多餘的
