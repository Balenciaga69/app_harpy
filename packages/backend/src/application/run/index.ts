import { EnemyTemplate } from '../../domain/entity/Enemy/Enemy'
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
