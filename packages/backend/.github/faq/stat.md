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

- 先將所有來源都轉換成 Stat Modifier
- 再透過 Stat Calculator 進行中的 Add, Multiply 等運算

## When are Stats calculations used?

- 戰鬥時
- 角色或敵人資訊面板顯示時

## Different sources of Stats for Player and Enemy

- Player 來源來自各種物品的修飾詞
- Enemy 來源來自 模板定義好的詞綴 與 難度加成
