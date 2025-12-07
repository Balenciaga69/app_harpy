# RUN 模組說明:

- 當玩家點開一局新的遊戲就會進入 Run 模組
- Run 模組負責管理整個遊戲流程與關卡進度調度與管理
- Run 模組作為流程中樞，維護著本次遊戲流程（一個 Run）中所有持續性、進度相關的數據
- Flow Controller 與 Orchestrator 的角色
- 狀態機 (State Machine)： 控制遊戲在不同階段（主菜單、地圖、戰鬥、商店、過場）之間的切換。
- 主遊戲循環
- 這是整個遊戲運行的骨架。它只負責協調，不處理具體的遊戲邏輯細節。

# RUN 所關心的

- 遊戲進度狀態： 當前位於第幾關
- 流程階段狀態： 在戰鬥、在閒置、本局遊戲結束狀態、開局前創建角色等等

# RUN 不關心的

- 戰鬥過程、角色屬性計算、裝備生成、存讀檔等細節邏輯
- 現在身上有啥裝備、角色屬性是多少這些細節，RUN 不關心
- 細節是交給其他 Module 處理的

# 可能的流程與內容

## 狀態

- 在第幾章節、第幾關
- 目前處在哪個狀態(創角色、戰鬥內、戰鬥外、本局遊戲結束)

---

Run 作為中間人,協調各模組的執行順序:

流程範例:

1. Run 進入 PRE_COMBAT 狀態
2. Run 通知 PreCombat 模組準備戰鬥
3. PreCombat 調用 CharacterManager 取得角色
4. PreCombat 調用 EnemyGenerator 生成敵人
5. PreCombat 調用 Shop 處理賽前下注
6. PreCombat 完成後通知 Run
7. Run 切換到 COMBAT 狀態
8. Run 調用 Combat Engine 執行戰鬥
9. Combat Engine 完成後返回結果給 Run
10. Run 切換到 POST_COMBAT 狀態

他關心 RunState RunProgress

Run 依賴 (單向依賴):
├─ CharacterManager // 取得角色實例
├─ Encounter // 生成關卡與路線
├─ PreCombat // 戰前準備
├─ Combat Engine // 執行戰鬥
├─ Shop // 商店交易
├─ Inventory // 庫存管理
├─ DifficultyScaler // 難度計算
└─ PersistentStorage // 存讀檔

###　被誰依賴／使用:
UI 層 → Run (查詢狀態與進度)
PersistentStorage → Run (存讀檔時序列化 Run 數據)

她靠著切換狀態與不同階段觸發調用其他功能。把玩家需要的功能準備好。
