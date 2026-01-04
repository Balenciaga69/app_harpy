# Post Combat

- 是指遊戲中戰鬥結束後的邏輯階段，負責處理勝利或失敗結果，包括生成獎勵、更新玩家狀態、調整資源等。
- 如高稀有度遺物、高親合度遺物、金幣、頭目擊殺獎勵等。
- 決定戰鬥後的回饋機制，影響資源獲取（如金幣、物品）、進度推進（如切換 Run 狀態），強化策略選擇（例如選取獎勵）。
- 作為戰鬥系統的延伸，驅動遊戲循環（戰鬥 → 賽後 → 繼續冒險）。

## 目前定義的獎勵類型包括

- 高稀有度遺物 (HighRarityRelic)
- 高親合度遺物 (HighAffinityRelic)
- 金幣 (Gold)
- 頭目擊殺獎勵 (BossKillReward) 等

## 關於新增獎勵選項

- 獎勵內容是可以新增的
- 參考: CombatRewardType, RewardFactory, PostCombatProcessor

## 關於失敗

- 無獎勵生成: 失敗時不提供任何獎勵，玩家無法獲得資源或物品。
- 扣除重試次數: 會扣除 deductedRetryCount（重試次數），限制玩家重試機會。
- 當 Boss 戰或 Endless 模式下失敗, 則結束當前 Run。
