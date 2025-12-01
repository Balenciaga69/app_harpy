/* eslint-disable no-console */
import { CombatEngine } from '../combat-engine/combat.engine'
import { Character } from '../domain/character/character'
import { createDefaultAttributes } from '../domain/character/models/attribute.core.model'
import { ThunderStrikeUltimate } from '../coordination'
/**
 * 簡單的戰鬥測試範例（v0.3）
 * 驗證能量系統、大招機制與新的屬性系統
 */
function runSimpleCombat() {
  console.log('=== 開始戰鬥測試 (v0.3) ===\n')
  // 創建玩家隊伍
  const warrior = new Character({
    name: '戰士',
    team: 'player',
    baseAttributes: createDefaultAttributes({
      maxHp: 1200,
      currentHp: 1200,
      armor: 80,
      evasion: 50,
      accuracy: 150,
      attackDamage: 120,
      attackCooldown: 100, // 1 秒/次
      criticalChance: 0.1, // 10%
      energyGainOnAttack: 4, // 約 25 次攻擊釋放大招
    }),
    ultimate: new ThunderStrikeUltimate(2.5, 6),
  })
  const archer = new Character({
    name: '弓箭手',
    team: 'player',
    baseAttributes: createDefaultAttributes({
      maxHp: 800,
      currentHp: 800,
      armor: 30,
      evasion: 120,
      accuracy: 180,
      attackDamage: 90,
      attackCooldown: 80, // 0.8 秒/次（攻速較快）
      criticalChance: 0.15, // 15%
      criticalMultiplier: 2.0,
      energyGainOnAttack: 5, // 約 20 次攻擊釋放大招
    }),
  })
  // 創建敵人隊伍
  const goblin1 = new Character({
    name: '哥布林1',
    team: 'enemy',
    baseAttributes: createDefaultAttributes({
      maxHp: 600,
      currentHp: 600,
      armor: 20,
      evasion: 80,
      accuracy: 120,
      attackDamage: 50,
      attackCooldown: 120, // 1.2 秒/次
    }),
  })
  const goblin2 = new Character({
    name: '哥布林2',
    team: 'enemy',
    baseAttributes: createDefaultAttributes({
      maxHp: 600,
      currentHp: 600,
      armor: 20,
      evasion: 80,
      accuracy: 120,
      attackDamage: 50,
      attackCooldown: 120,
    }),
  })
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
  console.log('戰士: 高血量高護甲，攻擊力強')
  console.log('弓箭手: 攻速快，閃避高，暴擊率高')
  console.log('能量累積至 100 即可釋放大招\n')
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
