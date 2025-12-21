import { ItemRollSourceType } from '../../domain/item/roll/ItemRollConfig'
import { IRunContext } from '../../domain/run/IRunContext'
import { TemplateStore } from '../store/TemplateStore'

const generate = (ctx: IRunContext, generationSource: ItemRollSourceType, templateStore: TemplateStore) => {
  // 取得靜態物品掉落限制表
  const staticRollConfig = templateStore.getItemRollConfig(generationSource)
  if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
  // 取得動態生成調節修飾符 同時幫忙清理掉已過期的修飾符
  ctx.rollModifiers = ctx.rollModifiers.filter((mod) => mod.durationStages !== 0) // TODO:這是副作用 需要思考怎麼處理
  const modifiers = ctx.rollModifiers
  // 先對稀有度分別計算最終權重
  const finalItemTypeWeights: Record<string, number> = {}
  const finalRarityWeights: Record<string, number> = {}
  Object.entries(staticRollConfig.itemTypeWeights).forEach(([itemType, weight]) => {
    finalItemTypeWeights[itemType] = weight
  })
  Object.entries(staticRollConfig.rarityWeights).forEach(([rarity, weight]) => {
    finalRarityWeights[rarity] = weight
  })
  modifiers.forEach((mod) => {
    if(mod.type==="RARITY") {
      Object.entries(finalRarityWeights).forEach(([rarity, weight]) => {
        if(rarity === mod.rarity) {
          finalRarityWeights[rarity] = weight * mod.multiplier
        }
      })
    }
  }
})
