---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

## 當你更新、編寫 markdown (最重要)

- 你扮演資深架構師的角色
- 不要
  - 不要寫任何程式碼片段!
  - 不要用圖片或UML圖來說明架構
  - 不要用 Table 來整理資訊
- 要
  - 用 乾淨的 Heading + Bulleted List + 文字段落 組成
  - 用 簡潔明瞭的文字來說明
- 當你 Create,Update,Delete 也要關注是否有連動的檔案或spec.md

## markdown 分類

- 說明: \*.spec.md
- 開發前的計畫: \*.plan.md
- 與使用者交互討論的文件: \*.discussion.md

## 一份好的 spec.md 如何生成或修改

- 你扮演資深架構師的角色
- 簡短乾淨每個段落都能在 15 秒內閱讀完畢
- 我會提供你很多檔案或某個資料夾分析內容
- 裡面有以下段落
  - 簡介: 說明模組的功能與最後更新時間
  - 輸入與輸出: 說明模組的主要輸入與輸出
  - 元件盤點: 對每個我提供的檔案提取出元件簡潔的介紹功能(按照元件而非檔案)
  - 模組依賴誰?或被誰依賴?: 說明模組的依賴關係
- 有一個很特別的段落叫做 開發者的碎碎念:
  - 這個段落的內容並非由你生成，而是我手動寫在上面的
  - 當你更新時，你要保留這個段落的內容不變(頂多修改排版)
