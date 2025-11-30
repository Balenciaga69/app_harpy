/* eslint-disable no-console */
import { CombatEngine } from '../combat-engine/combat.engine'
import { Character } from '../character/character'
/**
 * 簡單的戰鬥測試範例
 * 驗證整個戰鬥系統能夠運行
 */
function runSimpleCombat() {
  // eslint-disable-next-line no-console
  console.log('=== 開始戰鬥測試 ===\n')
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
      spellDamage: 0,
      spellCooldown: 0,
    },
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
      attackDamage: 10,
      attackCooldown: 150,
      criticalChance: 0.3,
      spellDamage: 0,
      spellCooldown: 0,
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
      attackDamage: 10,
      attackCooldown: 120,
      criticalChance: 0.1,
      spellDamage: 0,
      spellCooldown: 0,
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
      attackDamage: 10,
      attackCooldown: 120,
      criticalChance: 0.1,
      spellDamage: 0,
      spellCooldown: 0,
    },
  })
  goblin2.setCurrentHpClamped(50)
  // 創建戰鬥引擎
  const engine = new CombatEngine({
    seed: 12345, // 固定種子以確保可重現
    playerTeam: [warrior, archer],
    enemyTeam: [goblin1, goblin2],
    maxTicks: 1000,
    snapshotInterval: 50,
    enableLogging: true,
  })
  // 啟動戰鬥
  console.log('戰鬥開始...\n')
  const result = engine.start()
  // 輸出戰鬥結果
  console.log('=== 戰鬥結束 ===\n')
  // 清理資源
  engine.dispose()
  console.log('\n=== 測試完成 ===')
  result.logs = result.logs.filter((log) => !['tick:start', 'tick:end'].includes(log.eventType))
  return result
}
// 執行測試
// if (require.main === module) {
//   runSimpleCombat()
// }
export { runSimpleCombat }
