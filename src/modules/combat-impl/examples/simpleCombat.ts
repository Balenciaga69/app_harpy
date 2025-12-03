/* eslint-disable no-console */
import { CombatEngine } from '@/modules/combat/combat-engine/combat.engine'
import { Character } from '@/modules/combat/domain/character/Character'
import { createDefaultAttributes } from '@/modules/combat/domain/attribute'
import { ThunderStrikeUltimate, BloodPactUltimate } from '../ultimates'
import { Stormblade, GuardiansPlate } from '../equipment'
import { PoisonVial } from '../relics'
import { InMemoryResourceRegistry } from '@/modules/combat/infra/resource-registry'
import { CombatContext } from '@/modules/combat/context'
/**
 * Simple combat test example (v0.5)
 * Demonstrates:
 * - Resource Registry pattern
 * - Equipment system (Stormblade, Guardian's Plate)
 * - Relic system (Poison Vial with stacking)
 * - Ultimate abilities (Thunder Strike, Blood Pact)
 * - Effect combinations and interactions
 */
function runSimpleCombat() {
  console.log('=== Starting Combat Test (v0.5) ===\n')
  // Create resource registry
  const registry = new InMemoryResourceRegistry()
  // Create temporary context for equipment initialization
  const tempContext = new CombatContext(registry, 12345)
  // Create player team with equipment, relics, and ultimates
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
    ultimate: new BloodPactUltimate(), // Sacrifice HP to empower next 3 attacks
    registry,
  })
  // Equip Warrior with Guardian's Plate (armor boost at low HP)
  warrior.equipItem(new GuardiansPlate(), 'armor', tempContext)
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
    ultimate: new ThunderStrikeUltimate(2.5), // Massive AOE lightning damage
    registry,
  })
  // Equip Archer with Stormblade (doubles crit chance when charged)
  // and 2 stacks of Poison Vial (apply poison on attacks)
  const poisonVial = new PoisonVial()
  poisonVial.addStack() // Stack to 2
  archer.equipItem(new Stormblade(), 'weapon', tempContext)
  archer.addRelic(poisonVial, tempContext)
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
    registry,
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
    registry,
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
  console.log("Warrior: Guardian's Plate (armor boost at low HP) + Blood Pact (sacrifice HP for damage)")
  console.log('Archer: Stormblade (crit boost when charged) + Poison Vial x2 (poison stacks) + Thunder Strike')
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
