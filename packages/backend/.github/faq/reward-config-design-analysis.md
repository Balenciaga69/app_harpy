# 物品生成配置深度分析与优化建议

## 问题 1: extractRarityMultipliers 与 RewardRollConfigs 的关系

### 当前设计问题

```
RewardRollConfigs (data 层)
├── rarityWeights: 基础稀有度权重
│   ├── COMMON: 0
│   ├── RARE: 16
│   ├── EPIC: 4
│   └── LEGENDARY: 1
└── modifierStrategies
    └── { strategyId: 'RARITY_PREFERENCE', multiplier: 1 }

extractRarityMultipliers (application 层)  ❌ 分离
├── HIGH_RARITY_RELIC: { COMMON: 0, RARE: 0.5, EPIC: 2, LEGENDARY: 3 }
├── BOSS_REWARD: { COMMON: 0, RARE: 0, EPIC: 1.5, LEGENDARY: 4 }
└── default: { COMMON: 1, RARE: 1, EPIC: 1, LEGENDARY: 1 }
```

**问题分析：**

| 项       | RewardRollConfigs | extractRarityMultipliers            | 问题                         |
| -------- | ----------------- | ----------------------------------- | ---------------------------- |
| 定义位置 | data 层           | application 层                      | 分散，难以协调               |
| 更新时机 | 配置时更新        | 代码变更时更新                      | 业务与技术混淆               |
| 依赖关系 | 独立              | 依赖上方的 RARITY_PREFERENCE 被选中 | 隐性耦合                     |
| 可见性   | 可视化配置        | 隐藏在代码中                        | 设计师看不到，只有开发者知道 |

### 关键区别

```
rarityWeights (在 RewardRollConfigs 中)
├─ 作用：定义这个奖励类型的基础稀有度权重分布
├─ 场景：控制不同稀有度的生成概率
└─ 例子：BOSS_REWARD 的 rarityWeights
   COMMON: 0      (BOSS 不掉常见物品)
   RARE: 16       (稍多的稀有品)
   EPIC: 4        (更多的史诗品)
   LEGENDARY: 1   (少量传奇)

RARITY_PREFERENCE 倍率 (在 extractRarityMultipliers 中)  ❌ 应该在 data 层
├─ 作用：针对特定奖励类型，进一步加成某些稀有度
├─ 场景：用稀有度策略修饰符时，增加特定稀有度的权重倍数
└─ 例子：HIGH_RARITY_RELIC 的倍率
   COMMON: 0      (完全不选)
   RARE: 0.5      (降低稀有品权重)
   EPIC: 2        (加倍史诗品权重)
   LEGENDARY: 3   (三倍传奇权重)
```

**它们的关系：**

```
最终权重 = rarityWeights × RARITY_PREFERENCE倍率

例子：BOSS_REWARD 选择了 RARITY_PREFERENCE 策略
- COMMON 最终权重: 0 × 1 = 0
- RARE 最终权重: 16 × 0 = 0 (如果倍率是 0)
- EPIC 最终权重: 4 × 1.5 = 6
- LEGENDARY 最终权重: 1 × 4 = 4
```

---

## 问题 2: 配置中的重复内容分析

### 重复情况统计

**完全相同的配置：**

```typescript
// ❌ 在 COMMON、HIGH_AFFINITY、LOW_AFFINITY、GOLD 中完全相同
itemTypeWeights: { RELIC: 1 }

// ❌ 在 HIGH_RARITY_RELIC、HIGH_AFFINITY、LOW_AFFINITY、GOLD、BOSS_REWARD 中相同
rarityWeights: {
  COMMON: 0,
  RARE: 16,
  EPIC: 4,
  LEGENDARY: 1,
}
```

**代码重复度统计：**

- itemTypeWeights 重复度：100% (5/5 个奖励类型相同)
- rarityWeights 重复度：80% (4/5 个奖励类型相同)
- 总重复行数：约 50 行（占总配置的 40%）

### 建议：使用基础配置 + 覆盖模式

```typescript
// 基础配置（所有奖励类型的共同部分）
const BaseRewardConfig = {
  sourceType: 'POST_COMBAT_REWARD',
  itemTypeWeights: { RELIC: 1 },
  rarityWeights: {
    COMMON: 0,
    RARE: 16,
    EPIC: 4,
    LEGENDARY: 1,
  },
}

// 特定奖励类型的覆盖配置
const RewardRollConfigs: Record<string, RewardRollConfig> = {
  HIGH_RARITY_RELIC: {
    ...BaseRewardConfig,
    rewardType: 'HIGH_RARITY_RELIC',
    modifierStrategies: [
      { strategyId: 'RARITY_PREFERENCE', multiplier: 1 },
      { strategyId: 'MOST_FREQUENT_TAG', multiplier: 1 },
    ],
  },
  HIGH_AFFINITY: {
    ...BaseRewardConfig,
    rewardType: 'HIGH_AFFINITY',
    modifierStrategies: [{ strategyId: 'MOST_FREQUENT_TAG', multiplier: 1.5 }],
  },
  // ... 其他奖励类型
}
```

**优点：**

- ✅ 消除重复，易于维护
- ✅ 改基础配置可同步影响所有奖励类型
- ✅ 新增奖励类型时只需定义差异部分
- ✅ 代码行数减少 ~60%

**缺点：**

- ⚠️ 隐式默认值，需要文档说明
- ⚠️ 修改基础配置影响范围广

---

## 问题 3: extractRarityMultipliers 为何写死在代码中

### 历史原因分析

```
时间线：
T0: RewardRollConfigs 配置完成
    └─ 定义了 RARITY_PREFERENCE 策略，但倍率还需要确定

T1: extractRarityMultipliers 临时实现
    ├─ 原因：避免 RewardRollConfig 接口变得复杂
    ├─ 假设：倍率值会频繁变化，不宜固化在配置中
    └─ 结果：实现了快速迭代，但埋下了技术债
```

### 问题诊断

| 方面         | 现状                      | 问题                                              |
| ------------ | ------------------------- | ------------------------------------------------- |
| **位置**     | application 层            | 业务规则不应在 application 层定义                 |
| **可见性**   | 代码中隐藏                | 设计师、数据分析师看不到                          |
| **可维护性** | 分散在多处                | rewardType switch-case，业务规则碎片化            |
| **扩展性**   | 新增倍率要改代码          | 添加 ELITE_REWARD 需要改 extractRarityMultipliers |
| **一致性**   | 与 RewardRollConfigs 分离 | 无法一眼看出完整的业务规则                        |

### 为何不早期配置化

**可能的设计考量：**

1. RewardRollConfig 接口简洁性
   - 担心字段过多会导致接口臃肿
   - 希望 modifierStrategies 足以表达所有修饰符

2. 灵活性考虑
   - 认为稀有度倍率可能会动态计算
   - 实际上它是静态配置

3. 分离关注点
   - RewardRollConfigs：定义「选什么策略」
   - extractRarityMultipliers：定义「策略的参数是什么」
   - 初衷是好的，但实践中造成了分散

---

## 问题 4: 商店 vs 奖励配置分离的权衡

### 当前设计：分离

```
ShopRefresh (商店)
  ├─ rarityWeights: COMMON:32, RARE:16, EPIC:8, LEGENDARY:1
  └─ modifierStrategies: [MOST_FREQUENT_TAG × 1.5]

RewardRollConfigs (奖励)
  ├─ HIGH_RARITY_RELIC: COMMON:0, RARE:16, EPIC:4, LEGENDARY:1
  ├─ HIGH_AFFINITY: COMMON:0, RARE:16, EPIC:4, LEGENDARY:1
  └─ ... (5 种奖励类型)
```

### 分析：拆分 vs 不拆分

#### ✅ 拆分的优点

1. **职责清晰**

   ```
   ShopRefresh
   ├─ 目的：提高玩家购买欲望
   ├─ 策略：鼓励购买已有TAG的物品（亲合度）
   └─ 稀有度：常见物品多，传奇少（COMMON:32 LEGENDARY:1）

   RewardRollConfigs
   ├─ 目的：根据战斗表现奖励
   ├─ 策略：多样化（有亲合、有稀有度、有反向）
   └─ 稀有度：都是 COMMON:0（战斗奖励不给常见品）
   ```

2. **独立演进**
   - 商店规则变化不影响奖励
   - 可以为商店定制策略（如「高堆叠物品折扣」）
   - 奖励类型可自由扩展

3. **配置清晰**
   - 设计师立即看出商店与奖励的不同
   - 避免混淆两者的目的

#### ❌ 拆分的缺点

1. **重复配置**
   - itemTypeWeights 完全相同
   - 大部分 rarityWeights 相同
   - 修改基础权重需要改多个地方

2. **概念复杂度**
   - ItemRollConfig vs RewardRollConfig 两个接口
   - 需要在两个地方定义类似的东西

3. **扩展复杂**
   - 新增来源（如「宝箱奖励」「任务奖励」）时不清楚是否该新增接口

#### ✅ 合并的优点

1. **DRY 原则**
   - 统一的 ItemRollConfig 接口
   - 共享基础配置

2. **简化扩展**
   - 新增任何来源时逻辑一致
   - 可以创建「来源预设」（SHOP、REWARD 等）

#### ❌ 合并的缺点

1. **职责混淆**
   - ItemRollConfig 要同时承载商店与奖励的概念
   - 接口会变得通用但不专业

2. **隐性成本**
   - 某些字段对商店有意义，对奖励无意义
   - 文档和代码会有大量的「注意此字段仅用于 XXX」

### 建议：现状维持，配置优化

**保持拆分，但优化配置方式：**

```typescript
// 保留 RewardRollConfig 的拆分设计（职责清晰）
// 但优化内部配置（消除重复）

const BaseRewardConfig: Omit<RewardRollConfig, 'rewardType' | 'modifierStrategies'> = {
  sourceType: 'POST_COMBAT_REWARD',
  itemTypeWeights: { RELIC: 1 },
  rarityWeights: { COMMON: 0, RARE: 16, EPIC: 4, LEGENDARY: 1 },
}

const RewardRollConfigs: Record<string, RewardRollConfig> = {
  HIGH_RARITY_RELIC: {
    ...BaseRewardConfig,
    rewardType: 'HIGH_RARITY_RELIC',
    modifierStrategies: [...]
  },
  // ... 其他使用相同基础配置的奖励类型
}
```

---

## 问题 5: 添加 ELITE_REWARD

### 当前步骤（复杂）

**第一步：在 data 层添加配置**

```typescript
ELITE_REWARD: {
  rewardType: 'ELITE_REWARD',
  sourceType: 'POST_COMBAT_REWARD',
  itemTypeWeights: { RELIC: 1 },
  rarityWeights: { COMMON: 0, RARE: 16, EPIC: 4, LEGENDARY: 1 },
  modifierStrategies: [
    { strategyId: 'RARITY_PREFERENCE', multiplier: 1 },
  ],
}
```

**第二步：在 application 层添加倍率**

```typescript
private extractRarityMultipliers(rewardType: CombatRewardType): Record<ItemRarity, number> {
  switch (rewardType) {
    // ... 已有的
    case 'ELITE_REWARD':
      return {
        COMMON: 0,
        RARE: 0.3,      // 比 BOSS_REWARD 的 0 多
        EPIC: 1.2,      // 比 BOSS_REWARD 的 1.5 少
        LEGENDARY: 2.5, // 比 BOSS_REWARD 的 4 少
      }
  }
}
```

**问题：**

- 需要同时改两个文件
- 倍率定义离配置很远
- 新增奖励类型容易遗漏

### 建议的改进方案

#### 方案 A：完全配置化（最优）

**在 data 层创建稀有度倍率配置：**

```typescript
// item-roll-config.data.ts

/** 稀有度偏好倍率配置 */
const RarityPreferenceMultipliers: Record<string, Record<ItemRarity, number>> = {
  HIGH_RARITY_RELIC: {
    COMMON: 0,
    RARE: 0.5,
    EPIC: 2,
    LEGENDARY: 3,
  },
  ELITE_REWARD: {
    COMMON: 0,
    RARE: 0.3,
    EPIC: 1.2,
    LEGENDARY: 2.5,
  },
  BOSS_REWARD: {
    COMMON: 0,
    RARE: 0,
    EPIC: 1.5,
    LEGENDARY: 4,
  },
}

const RewardRollConfigs: Record<string, RewardRollConfig> = {
  HIGH_RARITY_RELIC: {
    rewardType: 'HIGH_RARITY_RELIC',
    sourceType: 'POST_COMBAT_REWARD',
    itemTypeWeights: { RELIC: 1 },
    rarityWeights: { COMMON: 0, RARE: 16, EPIC: 4, LEGENDARY: 1 },
    modifierStrategies: [
      { strategyId: 'RARITY_PREFERENCE', multiplier: 1 },
      { strategyId: 'MOST_FREQUENT_TAG', multiplier: 1 },
    ],
    rarityPreferenceMultipliers: RarityPreferenceMultipliers.HIGH_RARITY_RELIC,
  },
  ELITE_REWARD: {
    rewardType: 'ELITE_REWARD',
    sourceType: 'POST_COMBAT_REWARD',
    itemTypeWeights: { RELIC: 1 },
    rarityWeights: { COMMON: 0, RARE: 16, EPIC: 4, LEGENDARY: 1 },
    modifierStrategies: [{ strategyId: 'RARITY_PREFERENCE', multiplier: 1 }],
    rarityPreferenceMultipliers: RarityPreferenceMultipliers.ELITE_REWARD,
  },
  // ... 继续其他
}

export function getRarityPreferenceMultipliers(rewardType: string): Record<ItemRarity, number> | undefined {
  return RarityPreferenceMultipliers[rewardType]
}
```

**更新 RewardRollConfig 接口：**

```typescript
// ItemRollConfig.ts
export interface RewardRollConfig extends ItemRollConfig {
  readonly rewardType: string
  readonly rarityPreferenceMultipliers?: Record<ItemRarity, number>
}
```

**简化 ItemRollModifierStrategyFactory：**

```typescript
createRewardStrategies(rewardType: CombatRewardType): IItemRollModifierStrategy[] {
  const { itemStore } = this.configStoreAccessor.getConfigStore()
  const rewardConfig = itemStore.getRewardRollConfig(rewardType)
  if (!rewardConfig) return []

  const strategies: IItemRollModifierStrategy[] = []
  for (const strategyConfig of rewardConfig.modifierStrategies) {
    switch (strategyConfig.strategyId) {
      case 'MOST_FREQUENT_TAG':
        strategies.push(
          new MostFrequentTagRewardModifierStrategy(
            this.configStoreAccessor,
            this.contextSnapshot,
            strategyConfig.multiplier
          )
        )
        break
      case 'RARITY_PREFERENCE':
        // ✅ 直接从配置中读取倍率
        const multipliers = rewardConfig.rarityPreferenceMultipliers
        if (multipliers) {
          strategies.push(new RarityPreferenceRewardModifierStrategy(multipliers))
        }
        break
      // ... 其他
    }
  }
  return strategies
}
```

**移除 extractRarityMultipliers 方法。**

#### 方案 B：保留 extractRarityMultipliers，但使用查找表

```typescript
private extractRarityMultipliers(rewardType: CombatRewardType): Record<ItemRarity, number> {
  // 使用查找表而非 switch-case
  const multipliers: Record<CombatRewardType, Record<ItemRarity, number>> = {
    HIGH_RARITY_RELIC: { COMMON: 0, RARE: 0.5, EPIC: 2, LEGENDARY: 3 },
    ELITE_REWARD: { COMMON: 0, RARE: 0.3, EPIC: 1.2, LEGENDARY: 2.5 },
    BOSS_REWARD: { COMMON: 0, RARE: 0, EPIC: 1.5, LEGENDARY: 4 },
    // ... 其他默认为 { COMMON: 1, RARE: 1, EPIC: 1, LEGENDARY: 1 }
  }
  return multipliers[rewardType] ?? { COMMON: 1, RARE: 1, EPIC: 1, LEGENDARY: 1 }
}
```

**优点：**

- 相对少改代码
- 保留现有 extractRarityMultipliers 函数

**缺点：**

- 仍然是代码而非配置
- 设计师无法直接编辑

### 推荐：**方案 A（完全配置化）**

**理由：**

- ✅ 一致性最高：所有业务规则都在 data 层
- ✅ 易维护：新增 ELITE_REWARD 只需在 data 层添加两行配置
- ✅ 可见性最佳：设计师可以在一个地方看到所有奖励类型的完整规则
- ✅ 无需改 application 层代码
- ✅ 符合「配置驱动」设计哲学

---

## ELITE_REWARD 具体实现方案

### 第一步：扩展 RewardRollConfig

```typescript
// src/domain/item/roll/ItemRollConfig.ts

export interface RewardRollConfig extends ItemRollConfig {
  readonly rewardType: string
  /** RARITY_PREFERENCE 策略的稀有度倍率配置 */
  readonly rarityPreferenceMultipliers?: Record<ItemRarity, number>
}
```

### 第二步：在 data 层添加 ELITE_REWARD

```typescript
// src/data/item/item-roll-config.data.ts

const RarityPreferenceMultipliers: Record<string, Record<ItemRarity, number>> = {
  HIGH_RARITY_RELIC: {
    COMMON: 0,
    RARE: 0.5,
    EPIC: 2,
    LEGENDARY: 3,
  },
  ELITE_REWARD: {
    COMMON: 0,
    RARE: 0.3, // 适度增加稀有品
    EPIC: 1.2, // 适度增加史诗品
    LEGENDARY: 2.5, // 一定概率的传奇
  },
  BOSS_REWARD: {
    COMMON: 0,
    RARE: 0,
    EPIC: 1.5,
    LEGENDARY: 4,
  },
}

const RewardRollConfigs: Record<string, RewardRollConfig> = {
  // ... 已有的

  ELITE_REWARD: {
    rewardType: 'ELITE_REWARD',
    sourceType: 'POST_COMBAT_REWARD',
    itemTypeWeights: { RELIC: 1 },
    rarityWeights: {
      COMMON: 0,
      RARE: 16,
      EPIC: 4,
      LEGENDARY: 1,
    },
    modifierStrategies: [
      {
        strategyId: 'RARITY_PREFERENCE',
        multiplier: 1,
      },
    ],
    rarityPreferenceMultipliers: RarityPreferenceMultipliers.ELITE_REWARD,
  },

  BOSS_REWARD: {
    rewardType: 'BOSS_REWARD',
    sourceType: 'POST_COMBAT_REWARD',
    itemTypeWeights: { RELIC: 1 },
    rarityWeights: {
      COMMON: 0,
      RARE: 16,
      EPIC: 4,
      LEGENDARY: 1,
    },
    modifierStrategies: [
      {
        strategyId: 'RARITY_PREFERENCE',
        multiplier: 1,
      },
    ],
    rarityPreferenceMultipliers: RarityPreferenceMultipliers.BOSS_REWARD,
  },
}
```

### 第三步：更新 ItemRollModifierStrategyFactory

```typescript
// src/application/.../ItemRollModifierStrategyFactory.ts

createRewardStrategies(rewardType: CombatRewardType): IItemRollModifierStrategy[] {
  const { itemStore } = this.configStoreAccessor.getConfigStore()
  const rewardConfig = itemStore.getRewardRollConfig(rewardType)
  if (!rewardConfig) return []

  const strategies: IItemRollModifierStrategy[] = []
  for (const strategyConfig of rewardConfig.modifierStrategies) {
    switch (strategyConfig.strategyId) {
      case 'RARITY_PREFERENCE':
        // ✅ 从配置中直接读取倍率，无需 extractRarityMultipliers
        if (rewardConfig.rarityPreferenceMultipliers) {
          strategies.push(
            new RarityPreferenceRewardModifierStrategy(rewardConfig.rarityPreferenceMultipliers)
          )
        }
        break
      // ... 其他策略
    }
  }
  return strategies
}

// ✅ 删除 extractRarityMultipliers 方法
```

### 效果对比

| 新增需求                 | 修改前步骤                                                                        | 修改后步骤                                                                    |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **添加 ELITE_REWARD**    | 1. 改 data 层 RewardRollConfigs<br/>2. 改 application 层 extractRarityMultipliers | 1. 改 data 层 RarityPreferenceMultipliers<br/>2. 改 data 层 RewardRollConfigs |
| **改 ELITE_REWARD 倍率** | 改 application 层代码，需编译测试                                                 | 改 data 层配置，可动态验证                                                    |
| **新增策略类型**         | 同时改多个地方                                                                    | 只改 data 层 modifierStrategies                                               |

---

## 总结：设计建议

| 问题                                | 建议                         | 优先级                        |
| ----------------------------------- | ---------------------------- | ----------------------------- |
| **extractRarityMultipliers 配置化** | 完全移到 data 层，使用方案 A | 🔴 高                         |
| **消除配置重复**                    | 使用基础配置 + 覆盖的模式    | 🟠 中                         |
| **添加 ELITE_REWARD**               | 按方案 A 在 data 层添加即可  | 🟠 中（取决于是否先做方案 A） |
| **保留商店/奖励拆分**               | 设计清晰，推荐保留           | 🟢 低（已做好）               |

**立即行动：**

1. 扩展 RewardRollConfig 接口，新增 `rarityPreferenceMultipliers` 字段
2. 在 data 层定义 RarityPreferenceMultipliers 常量
3. 更新 ItemRollModifierStrategyFactory，从配置读取倍率
4. 删除 extractRarityMultipliers 方法
5. 添加 ELITE_REWARD 配置
