# difficulty

- 會隨著等級與關卡提升的數值。
- 基於一套公式計算
- 將會影響敵人、物品詞綴、大絕招詞綴的 Multiplier 數值

## 難度係數 與 Multiplier

- UltimateEffect 的 ultimateMultiplier
- AffixEffectAction affixMultiplier
- 都會經過 難度係數 的調整
- 例如: 基礎倍率 1.2, 難度係數 3.0, 最終倍率 = 1.2 \* 3.0 = 3.6 去改寫 baseValue
- 當然有些是 0 代表不受難度影響

## 我的技能跟遺物已經無法跟上敵人的強度了?

- 這是遊戲設計的一部分
- 你可以選擇換掉而買更強的新玩意
- 你也可以取得一種遺物叫做 "煥然一新"
  - 使用後 chapter,stage,difficulty 將會被刷新
  - 當裝備該遺物時會將全身物品與技能的難度係數重置並移除該遺物
  - 使得計算難度係數時將會滿足當前強度
  - 如何取得呢? 商店:傳奇級別遺物
