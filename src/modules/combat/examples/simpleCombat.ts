/* eslint-disable no-console */
import { CombatEngine } from '../combat-engine/combat.engine'
import { Character } from '../character/character'
import { ThunderStrikeUltimate } from '../ability'
/**
 * 簡單的戰鬥測試範例（v0.3）
 * 驗證能量系統與大招機制
 */
function runSimpleCombat() {
  console.log('=== 開始戰鬥測試 (v0.3) ===\n')
  // 創建玩家隊伍
  const warrior = new Character({
    name: '戰士',
    team: 'player',
    baseAttributes: {
      maxHp: 100,
      armor: 10,
      evasion: 0.1,
      accuracy: 0.95,
      attackDamage: 20,
      attackCooldown: 100,
      criticalChance: 0.2,
      criticalMultiplier: 1.5,
      maxEnergy: 100,
      energyRegen: 1,
      energyGainOnAttack: 10,
    },
    ultimate: new ThunderStrikeUltimate(2.5, 6),
  })
  warrior.setCurrentHpClamped(100)
  const archer = new Character({
    name: '弓箭手',
    team: 'player',
    baseAttributes: {
      maxHp: 80,
      armor: 5,
      evasion: 0.15,
      accuracy: 0.98,
      attackDamage: 15,
      attackCooldown: 80,
      criticalChance: 0.35,
      criticalMultiplier: 2.0,
      maxEnergy: 100,
      energyRegen: 1,
      energyGainOnAttack: 12,
    },
  })
  archer.setCurrentHpClamped(80)
  // 創建敵人隊伍
  const goblin1 = new Character({
    name: '哥布林1',
    team: 'enemy',
    baseAttributes: {
      maxHp: 50,
      armor: 3,
      evasion: 0.05,
      accuracy: 0.85,
      attackDamage: 8,
      attackCooldown: 120,
      criticalChance: 0.1,
      criticalMultiplier: 1.5,
      maxEnergy: 100,
      energyRegen: 1,
      energyGainOnAttack: 5,
    },
  })
  goblin1.setCurrentHpClamped(50)
  const goblin2 = new Character({
    name: '哥布林2',
    team: 'enemy',
    baseAttributes: {
      maxHp: 50,
      armor: 3,
      evasion: 0.05,
      accuracy: 0.85,
      attackDamage: 8,
      attackCooldown: 120,
      criticalChance: 0.1,
      criticalMultiplier: 1.5,
      maxEnergy: 100,
      energyRegen: 1,
      energyGainOnAttack: 5,
    },
  })
  goblin2.setCurrentHpClamped(50)
  // 創建戰鬥引擎
  const engine = new CombatEngine({
    seed: 12345, // 固定種子以確保可重現
    playerTeam: [warrior, archer],
    enemyTeam: [goblin1, goblin2],
    maxTicks: 10000,
    snapshotInterval: 100,
    enableLogging: true,
  })
  // 啟動戰鬥
  console.log('戰鬥開始...')
  console.log('弓箭手攻速較快 (80 ticks/攻擊)，能更快累積能量')
  console.log('能量累積至 100 即可釋放大招 (傷害 x3)\n')
  const result = engine.start()
  // 輸出戰鬥結果
  console.log('\n=== 戰鬥結束 ===')
  console.log(`勝利方: ${result.winner}`)
  console.log(`總回合數: ${result.totalTicks} ticks`)
  console.log(`存活者: ${result.survivors.map((s) => s.name).join(', ')}`)
  // 清理資源
  engine.dispose()
  console.log('\n=== 測試完成 ===')
  // 過濾掉 tick 事件以減少日誌量
  result.logs = result.logs.filter((log) => !['tick:start', 'tick:end'].includes(log.eventType))
  return result
}
// 執行測試
// if (require.main === module) {
//   runSimpleCombat()
// }
export { runSimpleCombat }
