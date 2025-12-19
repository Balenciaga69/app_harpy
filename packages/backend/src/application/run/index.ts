import { EnemyTemplate } from '../../domain/entity/Enemy'
import { IRunContext } from '../../domain/run/IRunContext'

const enemyStageInstanceGenerator = (ctx: IRunContext) => {
  // step1: 篩合理敵人函數
  // step2: 隨機選一位
  // step3: 套用難度係數與 stage 資訊
  // step4: 回傳實體
}
// export interface EnemyStageInstance {
//   id: string
//   type: 'ELITE' | 'BOSS' | 'NORMAL'
//   enemy: EnemyInstance
// }

// 過濾敵人條件: 沒打過 & 當前章節可用 (暫時先這樣 做成函數)
// 篩敵人條件 用 RandomHelper 按照權重 從可用敵人池中選一位
// 產生敵人實體 (套用 run ctx 中的資訊 與難度係數)
// 建立可用目標池（符合條件的敵人列表）。
// 每個目標有一個權重（可均等，也可依稀有度/機率設計）。
// 加總所有權重，產生一個總權重。
// 隨機產生一個數字（0~總權重）。
// 依序累加權重，落在哪個目標就選哪個。
const eee = EnemySpawnInfo[]
function getAvailableEnemyPool(ctx: IRunContext, allEnemies: EnemyTemplate[]): EnemyTemplate[] {
  // 取得已遇過的敵人ID
  const encounteredIds = ctx.encounteredEnemyIds 
const currentChapter = ctx.currentChapter
  // 篩選：未遇過且當前章節可用
  return allEnemies.filter(
    (enemy) => !encounteredIds.includes(enemy.id) && enemy..includes(ctx.currentChapter)
  )
}
