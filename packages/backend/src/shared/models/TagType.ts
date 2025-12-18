type StatTagType = 'ATTACK' | 'MITIGATION' | 'HP' | 'ENERGY' | 'CRIT' | 'EVASION' | 'RESURRECTION'

type ElementalTagType = 'FIRE' | 'WATER' | 'LIGHTNING' | 'LIGHT' | 'DARK' | 'PHYSICAL'

export type TagType = StatTagType | ElementalTagType

export type TagTypeSet = Set<TagType>
