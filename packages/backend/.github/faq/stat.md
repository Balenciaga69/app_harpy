# Stats

## What are Stats?

- 單位的各種屬性總稱
- 分為以下類:
  - 防禦:
    - hp: 生命
    - evasion: 閃避百分比
    - damageReduction: 傷害減免百分比
  - 攻擊:
    - attackDamage: 攻擊力
    - attackCooldown: 攻擊冷卻時間(毫秒)
    - criticalChance: 暴擊百分比
    - criticalMultiplier: 暴擊傷害倍率
  - 能量:
    - maxEnergy: 最大能量
    - energyRegen: 每秒能量回復
    - energyGainOnAttack: 攻擊時獲得能量
  - 復活:
    - resurrectionChance: 復活機率
    - resurrectionHpPercent: 復活後生命百分比
- Stats 會被多種來源影響, 但不論什麼來源都會先被修飾成 Stat Modifier 再進行計算

## How are Stats calculated?

- 先將所有來源都轉換成屬性修飾詞(Stat Modifier)
- 再透過屬性計算器(Stat Calculator)進行計算
  - Stat Modifier 分為兩種:
    - Add: 加法運算, 例如 +50 hp
    - Multiply: 乘法運算, 例如 +10% hp

## What is a Stat Modifier?

- 我們知道 Affix 上面會有各種 AffectEffect
- 大部分 AffectEffect 在某些對應觸發點會轉換成 Stat Modifier
- 在進入聚合運算前, 所有 AffectEffect 都會先被轉換成 Stat Modifier
- 流程: 各種來源(Affix[]) -> AffectEffect -> Stat Modifier -> Stat Calculator 進行計算

## When are Stats calculations used?

- 戰鬥時
- 角色或敵人資訊面板顯示時

## Different sources of Stats for Player and Enemy

- Player 來源來自各種物品的修飾詞
- Enemy 來源來自 模板定義好的詞綴 與 難度加成
