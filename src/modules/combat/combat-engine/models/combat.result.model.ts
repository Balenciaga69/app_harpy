import type { ICharacter } from '../../character'
import type { CombatLogEntry } from '../../logger'
import type { CombatOutcome } from './combat.outcome.model'
import type { CombatSnapshot } from './combat.snapshot.model'
import type { CombatStatistics } from './combat.statistics.model'

/**
 * ?°é¬¥çµæ?
 *
 * ?…å«å®Œæ•´?„æˆ°é¬¥é?ç¨‹å?çµæ??¸æ?ï¼Œä? UI ?æ”¾ä½¿ç”¨??
 * ä½¿ç”¨çµ„å?æ¨¡å?å°‡ä??Œè·è²¬ç??¸æ?çµæ?çµ„å??¨ä?èµ·ã€?
 */
export interface CombatResult {
  /** ?°é¬¥çµæ? */
  outcome: CombatOutcome
  /** ?²å???*/
  winner: 'player' | 'enemy' | null
  /** å­˜æ´»??*/
  survivors: ICharacter[]
  /** ?°é¬¥ç¸?Tick ??*/
  totalTicks: number
  /** å®Œæ•´?„ä?ä»¶æ—¥èªŒï??¨æ–¼è©³ç´°?æ”¾ï¼?*/
  logs: CombatLogEntry[]
  /** å®šæ?å¿«ç…§ï¼ˆç”¨?¼å¿«?Ÿè·³è½‰ï? */
  snapshots: CombatSnapshot[]
  /** çµ±è??¸æ? */
  statistics: CombatStatistics
  /** ?°é¬¥?‹å??‚é???*/
  startedAt: number
  /** ?°é¬¥çµæ??‚é???*/
  endedAt: number
}

