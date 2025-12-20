# Stage and Chapter

## What are the main responsibilities of Stage and Chapter?

- Chapter: 將 Run 分割多個階段以明確目標與進度
- Stage: 作為主要戰鬥與事件的觸發點

## What is a stage and a chapter?

- 關卡是組成章節的基本單位
- 章節固定由 10 個關卡組成
- Run 有 3 個 章節
- 關卡 分為 敵人關卡 與 事件關卡
  - 敵人關卡包含 普通, 精英, 首領 三種
  - 每章節第 5 關為 精英關卡
  - 每章節第 10 關為 首領關卡
  - 事件關卡包含各種隨機事件

## How do a stage and chapter work?

- 當玩家進入新的章節時, 會生成 10 個關卡節點, 並分配每個節點類型
- 當玩家到達關卡節點時, 會根據節點類型生成對應的關卡實例
- 如果是敵人關卡, 則會骰出符合條件的敵人模板, 再添加上難度後生成敵人實例資訊存放在 [TODO:] 某個地方。
