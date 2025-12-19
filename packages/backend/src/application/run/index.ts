import { IRunContext } from '../../domain/run/IRunContext'

const enemyLevelInstanceGenerator = (ctx: IRunContext) => {
  // step1: 篩合理敵人函數
  // step2: 隨機選一位
  // step3: 套用難度係數與 level 資訊
  // step4: 回傳實體
}
// export interface EnemyLevelInstance {
//   id: string
//   type: 'ELITE' | 'BOSS' | 'NORMAL'
//   enemy: EnemyInstance
// }

// 過濾敵人條件: 沒打過 & 當前章節可用 (暫時先這樣 做成函數)
// 篩敵人條件 用 RandomHelper 按照權重 從可用敵人池中選一位
// 產生敵人實體 (套用 run ctx 中的資訊 與難度係數)
