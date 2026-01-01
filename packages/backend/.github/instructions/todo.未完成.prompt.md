---
applyTo: '/*.ts, /*.md'
---

new tasks:

src\application\content-generation\service\item\ItemAggregateService.ts
src\application\content-generation\service\item\ItemConstraintService.ts
src\application\content-generation\service\item\ItemGenerationService.ts
src\application\content-generation\service\item\ItemModifierAggregationService.ts
src\application\content-generation\service\item\ItemRollService.ts
src\data\item\item-roll-config.data.ts
因為我們現在有獎勵派發系統獎勵派發系統它使用的生成策略完全跟目前的不同
代表這一塊我可能需要一個大修改的動作
ItemModifierAggregationService.aggregateModifiers 可能要被大幅度的調整

1. 商店的物品生成有自己的一套規則
2. 獎勵派發不同類型也有自己的規則

我來口頭敘述一下如何抽出物品生成的邏輯

### 關於商店刷新

商店刷新與生成 一律使用靜態模板 SHOP_REFRESH
商店也有自己的偏好生成策略 (這一塊寫在模板內) 然後實作在 代碼中
模板紀錄使用的 aggregateModifiers 策略 id
{策略id, 加成倍率} 這兩個參數
他喜愛 -[最常出現TAG] 穿戴在身上的物品中 TAG 出現最多次的 multiplier 會 n 倍加成 (寫在配置模板data中) -[高堆疊ID] 穿戴在身上大於 i 層的特定物品id, 會得到 j 程度加成 (寫在配置模板data中)

## 關於戰後獎勵

將分成三種獎勵類型他們用的默認 POST_COMBAT_REWARD 大致內容差不多
差別在修飾符聚合策略
第一組: 低頻出現獎勵 + 高稀有度獎勵
第二組: 高頻出現 + 金錢
低頻出現獎勵 使用一個策略 [反向最常出現前三名] 找出最常出現TAG前三名, 將權重加成 x 0 (也就是說這些TAG不會被選到)
高稀有度獎勵 使用一個策略 [稀有度偏好] COMMON x 0 RARE x 0.5 EPIC x 2
[最常出現TAG] 繼續沿用這一個
金錢則是直接用 {[最常出現TAG] 繼續沿用這一個} 拿到的物品假定販售到商店價格的估價

---

其他既有問題:
ItemRollService.rollItem 對於 modifiers 的使用 僅用於 rollRarity 這不符合我的期望
ItemRollService.rollTemplate 而是平均的骰出來 沒有用到任何修飾符

---

你看得懂我在寫甚麼嗎?
有甚麼想問的嗎?
會有困難嗎?
會有盲點嗎?還是可行?

## 上述已經討論完畢

修飾符如何影響 rollTemplate？
請參考 ItemRollService ItemRollModifier rollRarity aggregateRarityModifiers 怎麼做的

策略鏈的順序
SHOP_REFRESH 可能同時有「最常出現TAG」+ 「高堆疊ID」修飾符，如何組合？ 當然 aggregateModifiers(): ItemRollModifier[] {
const { rollModifiers } = this.contextSnapshot.getRunContext()
return [
//TODO: 改造成可調節變動的策略
...rollModifiers.filter((mod) => mod.durationStages !== 0),
...this.getHighFrequencyTagModifiers(),
...this.getHighStackRelicModifiers(),
]
} 類似這種
權重是相加還是相乘？ 一律 相乘
RewardGenerationContext 已有 type: CombatRewardType，修飾符聚合時直接透過它判斷？
是的

ItemRollConfig.策略 欄位是否該改為清晰的結構？ 是的 幫我修成 read only array
