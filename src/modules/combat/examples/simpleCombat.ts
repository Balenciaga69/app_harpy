/* eslint-disable no-console */
import { CombatEngine } from '../combat-engine/combat.engine'
import { ThunderStrikeUltimate } from '../coordination/models'
import { Character } from '../domain/character/character'
import { createDefaultAttributes } from '../domain/character/models/attribute.core.model'
/**
 * Simple combat test example (v0.3)
 * Validates energy system, ultimate ability mechanism, and new attribute system
 */
function runSimpleCombat() {
  console.log('=== Starting Combat Test (v0.3) ===\n')
  // Create player team
  const warrior = new Character({
    name: 'Warrior',
    team: 'player',
    baseAttributes: createDefaultAttributes({
      maxHp: 1200,
      currentHp: 1200,
      armor: 80,
      evasion: 50,
      accuracy: 150,
      attackDamage: 120,
      attackCooldown: 100, // 1 second per attack
      criticalChance: 0.1, // 10%
      energyGainOnAttack: 4, // About 25 attacks to unleash ultimate
    }),
    ultimate: new ThunderStrikeUltimate(2.5, 6),
  })
  const archer = new Character({
    name: 'Archer',
    team: 'player',
    baseAttributes: createDefaultAttributes({
      maxHp: 800,
      currentHp: 800,
      armor: 30,
      evasion: 120,
      accuracy: 180,
      attackDamage: 90,
      attackCooldown: 80, // 0.8 seconds per attack (faster attack speed)
      criticalChance: 0.15, // 15%
      criticalMultiplier: 2.0,
      energyGainOnAttack: 5, // About 20 attacks to unleash ultimate
    }),
  })
  // Create enemy team
  const goblin1 = new Character({
    name: 'Goblin1',
    team: 'enemy',
    baseAttributes: createDefaultAttributes({
      maxHp: 600,
      currentHp: 600,
      armor: 20,
      evasion: 80,
      accuracy: 120,
      attackDamage: 50,
      attackCooldown: 120, // 1.2 seconds per attack
    }),
  })
  const goblin2 = new Character({
    name: 'Goblin2',
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
  // Create combat engine
  const engine = new CombatEngine({
    seed: 12345, // Fixed seed for reproducible results
    playerTeam: [warrior, archer],
    enemyTeam: [goblin1, goblin2],
    maxTicks: 10000,
    snapshotInterval: 100,
    enableLogging: true,
  })
  // Start combat
  console.log('Combat begins...')
  console.log('Warrior: High HP and armor, strong attack power')
  console.log('Archer: Fast attack speed, high evasion, high crit rate')
  console.log('Energy accumulates to 100 to unleash ultimate ability\n')
  const result = engine.start()
  // Output combat results
  console.log('\n=== Combat Ended ===')
  console.log(`Winner: ${result.winner}`)
  console.log(`Total rounds: ${result.totalTicks} ticks`)
  console.log(`Survivors: ${result.survivors.map((s) => s.name).join(', ')}`)
  // Clean up resources
  engine.dispose()
  console.log('\n=== Test Completed ===')
  // Filter out tick events to reduce log volume
  result.logs = result.logs.filter((log) => !['tick:start', 'tick:end'].includes(log.eventType))
  return result
}
// Run test
// if (require.main === module) {
//   runSimpleCombat()
// }
export { runSimpleCombat }
