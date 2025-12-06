/**
 * Equipment slot types
 */
export type EquipmentSlot = 'weapon' | 'helmet' | 'armor' | 'necklace'
// TODO: 幫我評估，我在想戰鬥引擎對於裝備判別 Slot 似乎是不是沒那麼重要? 因為我不會對裝備不同部位做什麼特別的限制或運算。唯一目的只是為了戰鬥外防止重複同一個部位
