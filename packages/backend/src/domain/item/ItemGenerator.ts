import { nanoid } from 'nanoid'
import { AffixInstanceGenerator } from '../affix/AffixInstanceGenerator'
import { EquipmentInstance, ItemInstance, RelicInstance } from './models/itemInstance'
import { EquipmentTemplate, ItemTemplate, RelicTemplate } from './models/ItemTemplate'

const generateItemInstance = (
  template: ItemTemplate,
  ownerUnitId: string,
  difficulty: number,
  stageProgress: number
): ItemInstance => {
  const affixInstances = AffixInstanceGenerator.generator(template.affixIds, difficulty, stageProgress, ownerUnitId)
  return {
    id: `item-${nanoid()}`,
    templateId: template.id,
    affixInstances: affixInstances,
    atAcquisition: {
      stageProgress,
      difficulty,
    },
  }
}

const generateEquipment = (
  template: EquipmentTemplate,
  ownerUnitId: string,
  difficulty: number,
  stageProgress: number
): EquipmentInstance => {
  const item = generateItemInstance(template, ownerUnitId, difficulty, stageProgress)
  return { ...item, slot: template.slot }
}
const generateRelic = (
  template: RelicTemplate,
  ownerUnitId: string,
  difficulty: number,
  stageProgress: number
): RelicInstance => {
  const item = generateItemInstance(template, ownerUnitId, difficulty, stageProgress)
  return { ...item, currentStacks: template.currentStacks }
}

export const ItemGenerator = {
  generateEquipment,
  generateRelic,
}
