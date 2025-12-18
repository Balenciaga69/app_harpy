import { nanoid } from 'nanoid'
import { ItemInstance, EquipmentInstance, RelicInstance } from '../../domain/item/models/ItemInstance'
import { ItemTemplate, EquipmentTemplate, RelicTemplate } from '../../domain/item/models/ItemTemplate'
import { AffixInstanceGenerator } from './AffixInstanceGenerator'

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
    atCreated: {
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
