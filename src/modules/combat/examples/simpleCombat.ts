import { CombatEngine } from '../core/CombatEngine'
import { Character } from '../character/Character'
/**
 * 簡單的戰鬥測試範例
 * 驗證整個戰鬥系統能夠運行
 */
function runSimpleCombat() {
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
      attackCooldown: 10,
      criticalChance: 0.2,
      spellDamage: 0,
      spellCooldown: 0,
    },
  })
  warrior.attributes.setCurrentHp(100)
  const archer = new Character({
    name: '弓箭手',
    team: 'player',
    baseAttributes: {
      maxHp: 80,
      armor: 5,
      evasion: 0.15,
      accuracy: 0.98,
      attackDamage: 15,
      attackCooldown: 8,
      criticalChance: 0.3,
      spellDamage: 0,
      spellCooldown: 0,
    },
  })
  archer.attributes.setCurrentHp(80)
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
      attackCooldown: 12,
      criticalChance: 0.1,
      spellDamage: 0,
      spellCooldown: 0,
    },
  })
  goblin1.attributes.setCurrentHp(50)
  const goblin2 = new Character({
    name: '哥布林2',
    team: 'enemy',
    baseAttributes: {
      maxHp: 50,
      armor: 3,
      evasion: 0.05,
      accuracy: 0.85,
      attackDamage: 10,
      attackCooldown: 12,
      criticalChance: 0.1,
      spellDamage: 0,
      spellCooldown: 0,
    },
  })
  goblin2.attributes.setCurrentHp(50)
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
  console.log(`結果: ${result.outcome}`)
  console.log(`獲勝方: ${result.winner ?? '無'}`)
  console.log(`戰鬥時長: ${result.totalTicks} Ticks`)
  console.log(`總傷害: ${result.statistics.totalDamage.toFixed(2)}`)
  console.log(`事件日誌數量: ${result.logs.length}`)
  console.log(`快照數量: ${result.snapshots.length}`)
  console.log(`關鍵時刻數量: ${result.keyMoments.length}`)
  console.log('\n存活者:')
  result.survivors.forEach((char) => {
    const currentHp = char.attributes.get('currentHp')
    const maxHp = char.attributes.get('maxHp')
    console.log(`  - ${char.name}: ${currentHp.toFixed(1)}/${maxHp} HP`)
  })
  console.log('\n角色統計:')
  result.statistics.characterStats.forEach((stats) => {
    console.log(`  ${stats.name}:`)
    console.log(`    - 造成傷害: ${stats.damageDealt.toFixed(2)}`)
    console.log(`    - 受到傷害: ${stats.damageTaken.toFixed(2)}`)
    console.log(`    - 攻擊次數: ${stats.attackCount}`)
    console.log(`    - 暴擊次數: ${stats.criticalHits}`)
    console.log(`    - 存活: ${stats.survived ? '是' : '否'}`)
  })
  // 清理資源
  engine.dispose()
  console.log('\n=== 測試完成 ===')
  return result
}
// 執行測試
// if (require.main === module) {
//   runSimpleCombat()
// }
export { runSimpleCombat }
