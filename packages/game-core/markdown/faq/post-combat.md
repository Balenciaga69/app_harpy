# Post Combat

- 戰鬥結束後關於勝利與失敗的處理
- 包含派發獎勵與失敗處理邏輯
- 勝利會依據戰鬥情況派發不同獎勵
- 失敗會有不同的處理方式, 視戰鬥類型而定

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
