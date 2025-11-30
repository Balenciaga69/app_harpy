import type { CombatContext } from '../../context'
import type { ICharacter } from '../../character'
import type { EventLogger } from '../../logger'
import type {
  CombatConfig,
  CombatOutcome,
  CombatResult,
  CombatSnapshot,
  CombatStatistics,
  CharacterStats,
} from '../models'
import type { CombatLogEntry } from '../../logger'
import { createEmptyDamages } from '../../damage'

/**
 * ResultBuilder：戰鬥結果構建器。
 *
 * 設計理念：
 * - 採用建造者模式分步構建複雜的 CombatResult 物件，將結果組裝邏輯從 CombatEngine 中分離。
 * - 使用組合模式將不同職責的數據（結果判定、快照收集、統計計算）組合在一起。
 * - 保持每個方法的單一職責，確保易於測試與維護。
 * - 支援固定間隔快照生成，未來可擴展為策略模式以支援不同的快照策略。
 *
 * 主要職責：
 * - 分析戰鬥結果並判定勝負（analyzeOutcome）。
 * - 獲取戰鬥結束時的存活角色列表（getSurvivors）。
 * - 按固定間隔收集戰鬥快照（collectSnapshots）。
 * - 初始化統計數據結構（目前為空殼，待未來實現 StatisticsCalculator）。
 * - 從 EventLogger 收集完整事件日誌。
 * - 組裝並返回完整的 CombatResult 物件。
 */
export class ResultBuilder {
  private context: CombatContext
  private config: CombatConfig
  private eventLogger: EventLogger
  private startTime: number
  private endTime: number

  constructor(
    context: CombatContext,
    config: CombatConfig,
    eventLogger: EventLogger,
    startTime: number,
    endTime: number
  ) {
    this.context = context
    this.config = config
    this.eventLogger = eventLogger
    this.startTime = startTime
    this.endTime = endTime
  }

  /** 構建完整的戰鬥結果 */
  build(): CombatResult {
    const { outcome, winner } = this.analyzeOutcome()
    const survivors = this.getSurvivors()
    const totalTicks = this.context.getCurrentTick()
    const logs = this.collectLogs()
    const snapshots = this.collectSnapshots(totalTicks)
    const statistics = this.buildStatistics()

    return {
      outcome,
      winner,
      survivors,
      totalTicks,
      logs,
      snapshots,
      statistics,
      startedAt: this.startTime,
      endedAt: this.endTime,
    }
  }

  /** 分析戰鬥結果 */
  private analyzeOutcome(): { outcome: CombatOutcome; winner: 'player' | 'enemy' | null } {
    const playerAlive = this.config.playerTeam.some((c) => !c.isDead)
    const enemyAlive = this.config.enemyTeam.some((c) => !c.isDead)
    const reachedMaxTicks = this.context.getCurrentTick() >= (this.config.maxTicks ?? 10000)

    if (playerAlive && !enemyAlive) {
      return { outcome: 'player-win', winner: 'player' }
    }
    if (!playerAlive && enemyAlive) {
      return { outcome: 'enemy-win', winner: 'enemy' }
    }
    if (!playerAlive && !enemyAlive) {
      return { outcome: 'draw', winner: null }
    }
    if (reachedMaxTicks) {
      return { outcome: 'timeout', winner: null }
    }

    // 預設情況（不應該發生）
    return { outcome: 'draw', winner: null }
  }

  /** 獲取存活者 */
  private getSurvivors(): ICharacter[] {
    return [...this.config.playerTeam, ...this.config.enemyTeam].filter((c) => !c.isDead)
  }

  /** 收集事件日誌 */
  private collectLogs(): CombatLogEntry[] {
    return this.eventLogger.getLogs() as CombatLogEntry[]
  }

  /** 收集快照（固定間隔策略） */
  private collectSnapshots(totalTicks: number): CombatSnapshot[] {
    const snapshots: CombatSnapshot[] = []
    const interval = this.config.snapshotInterval ?? 100

    // 按固定間隔生成快照
    for (let tick = 0; tick <= totalTicks; tick += interval) {
      snapshots.push(this.createSnapshot(tick))
    }

    return snapshots
  }

  /** 創建單個快照 */
  private createSnapshot(tick: number): CombatSnapshot {
    const allCharacters = [...this.config.playerTeam, ...this.config.enemyTeam]

    return {
      tick,
      characters: allCharacters.map((char) => ({
        id: char.id,
        name: char.name,
        currentHp: char.getAttribute('currentHp'),
        maxHp: char.getAttribute('maxHp'),
        isDead: char.isDead,
        effects: char.getAllEffects().map((e) => e.name),
      })),
    }
  }

  /** 構建統計數據（目前為空殼） */
  private buildStatistics(): CombatStatistics {
    const allCharacters = [...this.config.playerTeam, ...this.config.enemyTeam]
    const characterStats = new Map<string, CharacterStats>()

    // 初始化每個角色的統計
    allCharacters.forEach((char) => {
      characterStats.set(char.id, {
        characterId: char.id,
        name: char.name,
        damageDealt: 0,
        damageTaken: 0,
        elementalDamageDealt: createEmptyDamages(),
        elementalDamageTaken: createEmptyDamages(),
        kills: 0,
        survived: !char.isDead,
        attackCount: 0,
        criticalHits: 0,
        dodges: 0,
      })
    })

    // TODO: 統計計算邏輯
    // 需要從 eventLogger 的日誌中反推計算各項數據
    // 建議未來實現 StatisticsCalculator 類別

    const totalDamage = 0 // TODO: 從統計中計算

    return {
      characterStats,
      effectsApplied: new Map(), // TODO: 統計效果觸發次數
      totalDamage,
      duration: this.context.getCurrentTick(),
    }
  }
}
