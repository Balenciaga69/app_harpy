# Enemy

## What is an Enemy?

- Enemy: 語意上指的是 遊戲中所有可遇見的 NPC 敵對角色
- EnemyTemplate: 由設計師設計的靜態敵人資料
- EnemyInstance: 由系統動態生成的動態敵人資料
  - 包含套用 Difficulty 後的 Stats, Affixes, Ultimate 等資訊
  - 將會在 combat simulation 中轉變成 Unit 進行互動
- Enemy
  - 有 stats, affixes, ultimate
  - 沒有 equipments, relics
  - 且被分成 NORMAL, ELITE, BOSS 三種 roles
  - 每個 enemy 都會配置當他們是不同 role 時的 affixes 與 ultimate
- Enemy Spawn Rules:
  - 該 Chapter 可出現的
  - 之前沒打過的

## How are Enemies generated?

### Enemy generation process

- 有個 Store 會從外部載入所有 EnemyTemplates 與 Spawn Info
- 由 WeightRoller 骰出符合條件的 EnemyTemplate
- 根據當前 Difficulty 生成 EnemyInstance
- [TODO:] 轉為 Combat Unit 進行戰鬥
