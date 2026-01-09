import { ItemRollConstraint } from '../../domain/item/roll/ItemRollConstraint'
const itemRollConstraint_warrior_resolute_heart: ItemRollConstraint = {
  templateId: 'relic_warrior_resolute_heart',
  professionTypes: ['WARRIOR'],
}
const itemRollConstraint_pirate_rum: ItemRollConstraint = {
  templateId: 'relic_pirate_rum',
  chapters: [1, 2],
}
const itemRollConstraint_necromancer_embrace: ItemRollConstraint = {
  templateId: 'relic_necromancer_embrace',
  chapters: [3],
}
export const ItemRollConstraintList: ItemRollConstraint[] = [
  itemRollConstraint_warrior_resolute_heart,
  itemRollConstraint_pirate_rum,
  itemRollConstraint_necromancer_embrace,
]
