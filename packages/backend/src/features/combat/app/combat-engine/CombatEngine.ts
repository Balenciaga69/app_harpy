/* eslint-disable boundaries/element-types */
// 這個檔案保留為相容性層，將舊路徑的引用轉發到新的 engine 目錄下的實作。
// 讓舊有的 import '.../combat/app/combat-engine/CombatEngine' 繼續工作。
import { CombatEngine as NewCombatEngine } from '../engine/CombatEngine'

export { NewCombatEngine as CombatEngine }
export default NewCombatEngine
/* eslint-enable boundaries/element-types */
