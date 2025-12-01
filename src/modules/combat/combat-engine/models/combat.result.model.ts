import type { ICharacter } from '../../domain/character'
import type { CombatLogEntry } from '../../logic/logger'
import type { CombatOutcome } from './combat.outcome.model'
import type { CombatSnapshot } from './combat.snapshot.model'
import type { CombatStatistics } from './combat.statistics.model'
/**
 * �԰����G
 *
 * �t�d�ʸ˧��㪺�԰��L�{�P���G�A�D�n�Ω� UI �^��C
 * �ϥβզX�Ҧ��N����¾�d�E�X�b�@�_�A��K���@�P�X�i�C
 */
export interface CombatResult {
  /** �԰����G */
  outcome: CombatOutcome
  /** �ӧQ�� */
  winner: 'player' | 'enemy' | null
  /** �s������ */
  survivors: ICharacter[]
  /** �԰� Tick �� */
  totalTicks: number
  /** ����ƥ��x�A�ѸԲӦ^��ϥ� */
  logs: CombatLogEntry[]
  /** �w���ַӡ]�Ω�ֳt����^ */
  snapshots: CombatSnapshot[]
  /** �έp�ƾ� */
  statistics: CombatStatistics
  /** �԰��}�l tick */
  startedAt: number
  /** �԰����� tick */
  endedAt: number
}
