# Stats

## 什麼是屬性

- 單位的各種屬性總稱
- 屬性類型
  - hp: 生命
  - evasion: 閃避百分比
  - attackDamage: 攻擊力
  - maxEnergy: 最大能量
  - resurrectionChance: 復活機率
  - resurrectionHpPercent: 復活後生命百分比
- 多種來源影響, 但都先轉換成 Stat Modifier 後計算

## 屬性如何計算

- 將所有來源轉換成 Stat Modifier
- 透過 Stat Calculator 進行計算
- Stat Modifier 分兩種
  - Add: 加法運算 (例如 +50 HP)
  - Multiply: 乘法運算 (例如 +10% HP)

## 什麼是 Stat Modifier

- Affix 上有各種 AffectEffect
- 大部分 AffectEffect 轉換成 Stat Modifier
- 流程: Affix[] -> AffectEffect -> Stat Modifier -> Stat Calculator 計算
- TODO: AffectEffect -> Stat Modifier 轉換過程

## 屬性計算使用時機

- 戰鬥時
- 角色或敵人資訊面板顯示時

## 玩家與敵人的屬性來源

- Player: 來自各種物品的修飾詞
- Enemy: 來自模板定義的詞綴與難度加成
