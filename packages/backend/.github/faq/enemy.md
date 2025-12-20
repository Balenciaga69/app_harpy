# Enemy

## What is an Enemy?

- Enemy: 語意上指的是 遊戲中所有可遇見的 NPC 敵對角色
- EnemyTemplate: 由設計師設計的靜態敵人資料
- EnemyInstance: 由系統動態生成的動態敵人資料
  - 包含套用難度係數後的屬性, 詞綴, 大絕招等資訊
  - 將會在戰鬥模擬運算中轉變成單位進行互動
- Enemy
  - 有屬性, 詞綴, 大絕招
  - 沒有裝備, 遺物, 職業
  - 敵人被分成普通, 精英, 首領 三種等級
  - 每個 enemy 都會配置當他們是不同角色級別時的詞綴與大絕招
- 敵人生成規則:
  - 該章節可出現的
  - 之前沒打過的

## How are Enemies generated?

### Enemy generation process

- 有個 Store 會從外部載入所有 EnemyTemplates 與 Spawn Info
- 由權重骰子骰出符合條件的 EnemyTemplate
- 根據當前難度係數生成 EnemyInstance
- [TODO:] 轉為戰鬥單位進行戰鬥
