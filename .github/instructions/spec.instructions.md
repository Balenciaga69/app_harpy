---
applyTo: '**/*.md'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

### 當你開發規格書

- 規格書名稱: xxxx.spec.md (xxxx 為模組名稱)
- 這份 markdown 包含以下內容:
  - 目標功能與範圍
  - 指出會實現哪些功能
  - 指出不會實現哪些功能(儘管很類似，但不在此模組範圍內)
  - 架構與元件關係
  - 對外暴露的主要功能(不管是 API 還是其他模組調用的方式)
- 整份規格書以簡潔、沒有代碼、圖片為首要目標，最好每一段都是 15 秒以內可以閱讀完的長度
- 不需要寫計畫書、使用的語言、安全、驗收等等這些不重要。最重要的是功能敘述
