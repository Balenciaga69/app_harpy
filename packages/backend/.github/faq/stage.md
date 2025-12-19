# Stage and Chapter

## What are the main responsibilities of Stage and Chapter?

- Chapter: 將 Run 分割多個階段以明確目標與進度
- Stage: 作為主要戰鬥與事件的觸發點

## What is a stage and a chapter?

- Stage 是組成 Chapter 的基本單位
- Chapter 固定由 10 個 Stages 組成
- Run 有 3 個 Chapters
- Stage 分為 Enemy 與 Event 兩種 Stage
  - Enemy Stage 包含 Normal, Elite, Boss Stage
  - Stage 5 is always an Elite Stage
  - Stage 10 is always a Boss Stage
  - Event Stage 包含各種隨機事件

## How do a stage and chapter work?

- 當 Player 進入新的 Chapter 時, 會生成 10 個 Stage Nodes, 並分配每個 Node 類型
- 當 Player 到達 Stage Node 時, 會根據 Node 類型生成對應的 Stage Instance
- 如果是 Enemy Stage, 則會骰出符合條件的 EnemyTemplate, 再添加上 Difficulty 後生成 EnemyInstance 資訊存放在 [TODO:] 某個地方。
