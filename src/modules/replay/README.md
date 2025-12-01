# Replay System

The replay system provides timeline-based playback of combat results with full control over speed, seeking, and event inspection.

## Architecture

The replay system is built on a clean, event-driven architecture:

```
CombatEngine → CombatResult → ReplayEngine → Events → UI
```

### Key Components

- **ReplayEngine**: Core playback engine that manages state and emits events
- **PlaybackController**: High-level control for common actions (jump to start/end, find events)
- **TimelineController**: Timeline math and progress conversion
- **ReplayEventEmitter**: Lightweight pub/sub for replay events

## Quick Start

### Basic Usage

```typescript
import { ReplayEngine } from '@/modules/replay'
import { CombatEngine } from '@/modules/combat/combat-engine'

// 1. Run combat and get result
const combatEngine = new CombatEngine({
  /* config */
})
const result = combatEngine.start()

// 2. Create replay engine
const replayEngine = new ReplayEngine({
  playbackSpeed: 1.0,
  msPerTick: 10,
  autoPlay: false,
})

// 3. Subscribe to events
replayEngine.on('replay:tick', (event) => {
  const snapshot = replayEngine.getCurrentSnapshot()
  const logs = replayEngine.getLogsAtTick(event.tick)
  // Update UI with snapshot and logs
})

// 4. Load and play
replayEngine.load(result)
replayEngine.play()
```

### With Controllers

```typescript
import { PlaybackController, TimelineController } from '@/modules/replay'

const playbackCtrl = new PlaybackController(replayEngine)
const timelineCtrl = new TimelineController(replayEngine)

// Jump to important moments
playbackCtrl.jumpToNextUltimate()
playbackCtrl.jumpToNextDeath()

// Timeline navigation
const progress = timelineCtrl.getCurrentProgress() // 0-1
timelineCtrl.seekByProgress(0.5) // Jump to 50%

// Get important moments for timeline markers
const moments = timelineCtrl.getImportantMoments()
```

## API Reference

### ReplayEngine

#### Configuration

```typescript
interface ReplayConfig {
  playbackSpeed: number // Speed multiplier (0.5x, 1x, 2x, 4x)
  loop: boolean // Loop when reaching end
  msPerTick: number // Milliseconds per tick (default: 10ms)
  autoPlay: boolean // Auto-play on load
  enableInterpolation: boolean // Smooth animations (future feature)
}
```

#### Methods

- `load(result: CombatResult)`: Load combat result
- `play()`: Start/resume playback
- `pause()`: Pause playback
- `stop()`: Stop and reset to start
- `seek(tick: number)`: Jump to specific tick
- `setSpeed(speed: number)`: Change playback speed
- `getCurrentSnapshot()`: Get snapshot at current tick
- `getLogsInRange(start, end)`: Get logs in tick range
- `getLogsAtTick(tick)`: Get logs at specific tick
- `on(eventType, handler)`: Subscribe to events
- `off(eventType, handler)`: Unsubscribe
- `getState()`: Get current state
- `dispose()`: Cleanup resources

### Events

All events have this structure:

```typescript
interface ReplayEvent {
  type: ReplayEventType
  tick: number
  payload?: unknown
  timestamp: number
}
```

#### Event Types

- `replay:loaded`: Replay data loaded
- `replay:started`: Started playback
- `replay:paused`: Paused
- `replay:resumed`: Resumed from pause
- `replay:stopped`: Stopped and reset
- `replay:seeked`: Jumped to different tick
- `replay:ended`: Reached end
- `replay:tick`: Tick update (emitted every frame)
- `replay:speedChanged`: Speed changed

### PlaybackController

- `togglePlayPause()`: Toggle play/pause
- `jumpToStart()`: Jump to beginning
- `jumpToEnd()`: Jump to end
- `jumpToNextUltimate()`: Find and jump to next ultimate
- `jumpToPrevUltimate()`: Find and jump to previous ultimate
- `jumpToNextDeath()`: Jump to next death
- `jumpToPrevDeath()`: Jump to previous death
- `skipForward(ticks)`: Skip forward by N ticks
- `skipBackward(ticks)`: Skip backward by N ticks

### TimelineController

- `tickToProgress(tick)`: Convert tick to 0-1 progress
- `progressToTick(progress)`: Convert 0-1 progress to tick
- `getCurrentProgress()`: Get current progress (0-1)
- `seekByProgress(progress)`: Seek using 0-1 progress
- `getImportantMoments()`: Get all important events
- `getUltimateTicks()`: Get ticks with ultimates
- `getDeathTicks()`: Get ticks with deaths
- `getCriticalTicks()`: Get ticks with critical hits

## Design Principles

### Zero-Logic Replay

The replay system **does not re-execute** combat logic. It purely plays back recorded data:

- ✅ Reads snapshots and logs
- ✅ Emits events for UI
- ❌ Does NOT recalculate damage
- ❌ Does NOT re-run game logic

### Data Dependency

Replay depends only on data structures, not combat internals:

- Depends: `CombatResult`, `CombatSnapshot`, `CombatLogEntry`
- Does NOT depend: `CombatContext`, `Ticker`, `Character` instances

### Event-Driven

UI subscribes to events and reacts:

```typescript
replayEngine.on('replay:tick', (event) => {
  // UI updates based on current tick
})
```

## Examples

### Run the Test

```typescript
import { runReplayTest } from '@/modules/combat-impl/examples'

runReplayTest() // Runs combat and demonstrates replay
```

### Create Custom UI

```typescript
const replayEngine = new ReplayEngine()

replayEngine.on('replay:tick', (event) => {
  const snapshot = replayEngine.getCurrentSnapshot()

  // Update character HP bars
  snapshot?.characters.forEach((char) => {
    updateCharacterUI(char.id, {
      hp: char.currentHp,
      maxHp: char.maxHp,
      energy: char.currentEnergy,
    })
  })

  // Show floating damage numbers
  const logs = replayEngine.getLogsAtTick(event.tick)
  logs.forEach((log) => {
    if (log.eventType === 'entity:damage') {
      showDamageNumber(log.targetId, log.payload.finalDamage)
    }
  })
})

replayEngine.load(combatResult)
replayEngine.play()
```

## Performance Considerations

### Memory

For long combats (10000+ ticks), memory usage can be significant:

- Snapshots are captured every N ticks (configurable via `snapshotInterval`)
- Logs record every event
- Consider cleanup after replay ends: `replayEngine.dispose()`

### Rendering

At high speeds (4x), limit UI update rate:

```typescript
let lastRenderTime = 0
replayEngine.on('replay:tick', (event) => {
  const now = performance.now()
  if (now - lastRenderTime < 16) return // Limit to ~60fps
  lastRenderTime = now

  // Update UI
})
```

## Future Features (v0.5+)

- [ ] Interpolation between snapshots for smooth animations
- [ ] Export replay to video (MP4)
- [ ] Slow-motion analysis at critical moments
- [ ] AI commentary generation
- [ ] Side-by-side replay comparison

## Testing

Run the example test:

```bash
npm run dev
# Then in browser console:
import { runReplayTest } from '@/modules/combat-impl/examples'
runReplayTest()
```

Watch console output to see:

- Combat execution
- Replay loading
- Event emissions
- Playback control
- Timeline navigation
