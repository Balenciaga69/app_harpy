/* eslint-disable no-console */
import { CombatEngine } from '@/modules/combat/combat-engine/combat.engine'
import { Character } from '@/modules/combat/domain/character/character'
import { createDefaultAttributes } from '@/modules/combat/domain/character/models/attribute.core.model'
import { SimpleDamageUltimate } from '../ultimates'
import { ReplayEngine } from '@/modules/replay/replay.engine'
import { PlaybackController } from '@/modules/replay/controllers/playback.controller'
import { TimelineController } from '@/modules/replay/controllers/timeline.controller'
import { InMemoryResourceRegistry } from '@/modules/combat/infra/resource-registry'
/**
 * Simple replay system test
 * Demonstrates:
 * - Loading combat result into replay engine
 * - Basic playback control
 * - Event listening
 * - Timeline navigation
 */
export function runReplayTest() {
  console.log('=== Starting Replay System Test ===\n')
  // Create resource registry
  const registry = new InMemoryResourceRegistry()
  // Step 1: Create and run a simple combat
  console.log('Step 1: Running combat...')
  const player = new Character({
    name: 'Player',
    team: 'player',
    baseAttributes: createDefaultAttributes({
      maxHp: 1000,
      currentHp: 1000,
      attackDamage: 100,
      attackCooldown: 100,
      energyGainOnAttack: 10,
    }),
    ultimate: new SimpleDamageUltimate('Power Strike', 'Deal massive damage', 2.0),
    registry,
  })
  const enemy = new Character({
    name: 'Enemy',
    team: 'enemy',
    baseAttributes: createDefaultAttributes({
      maxHp: 800,
      currentHp: 800,
      attackDamage: 80,
      attackCooldown: 120,
      energyGainOnAttack: 8,
    }),
    ultimate: new SimpleDamageUltimate('Heavy Blow', 'Deal heavy damage', 1.8),
    registry,
  })
  const combatEngine = new CombatEngine({
    seed: 12345,
    playerTeam: [player],
    enemyTeam: [enemy],
    maxTicks: 10000,
    snapshotInterval: 50,
    enableLogging: true,
  })
  const result = combatEngine.start()
  console.log(`Combat finished in ${result.totalTicks} ticks`)
  console.log(`Winner: ${result.winner}`)
  console.log(`Snapshots captured: ${result.snapshots.length}`)
  console.log(`Log entries: ${result.logs.length}\n`)
  // Step 2: Load combat result into replay engine
  console.log('Step 2: Loading replay...')
  const replayEngine = new ReplayEngine({
    playbackSpeed: 1.0,
    msPerTick: 10,
    autoPlay: false,
  })
  // Subscribe to events
  replayEngine.on('replay:loaded', (event) => {
    const payload = event.payload as { totalTicks: number }
    console.log(`[Event] Loaded: ${payload.totalTicks} ticks`)
  })
  replayEngine.on('replay:started', (event) => {
    console.log(`[Event] Started at tick ${event.tick}`)
  })
  replayEngine.on('replay:paused', (event) => {
    console.log(`[Event] Paused at tick ${event.tick}`)
  })
  replayEngine.on('replay:ended', (event) => {
    console.log(`[Event] Ended at tick ${event.tick}`)
    console.log('\n=== Replay Test Complete ===')
  })
  let tickCount = 0
  replayEngine.on('replay:tick', (event) => {
    tickCount++
    // Only log every 100 ticks to avoid spam
    if (tickCount % 100 === 0) {
      const snapshot = replayEngine.getCurrentSnapshot()
      const logs = replayEngine.getLogsAtTick(event.tick)
      console.log(`[Tick ${event.tick}] Snapshot: ${snapshot?.tick ?? 'none'}, Logs: ${logs.length}`)
    }
  })
  replayEngine.load(result)
  // Step 3: Test playback control
  console.log('\nStep 3: Testing playback...')
  const playbackCtrl = new PlaybackController(replayEngine)
  const timelineCtrl = new TimelineController(replayEngine)
  console.log('Playing for 2 seconds...')
  replayEngine.play()
  setTimeout(() => {
    console.log('Pausing...')
    playbackCtrl.togglePlayPause()
    const progress = timelineCtrl.getCurrentProgress()
    console.log(`Current progress: ${(progress * 100).toFixed(2)}%`)
    // Get important moments
    const moments = timelineCtrl.getImportantMoments()
    console.log(`Important moments found: ${moments.length}`)
    moments.forEach((moment) => {
      console.log(`  - ${moment.type} at tick ${moment.tick}`)
    })
    // Resume playback
    console.log('\nResuming playback...')
    playbackCtrl.togglePlayPause()
  }, 2000)
}
