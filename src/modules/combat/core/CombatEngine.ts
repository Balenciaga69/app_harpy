import { CombatContext } from './CombatContext'
import { TickerDriver } from '../tick/ticker.driver'
import { EventLogger } from '../logger/event.logger'
import type { CombatLogEntry } from '../logger/combat.log.model'
import { TickerProcessor } from '../tick/ticker.processor'
import { AbilitySystem } from '../ability/ability.system'
import type { CombatConfig } from './models/combatConfig.model'
import type {
  CombatResult,
  CombatOutcome,
  CombatSnapshot,
  KeyMoment,
  CharacterStats,
  CombatStatistics,
} from './models/combatResult.model'
import type { ICharacter } from '../character/interfaces/character.interface'
import type { CharacterId } from '../character/interfaces/character.interface'
import { createEmptyDamages } from '../damage/models/damage.event.model'
/**
 * 戰鬥引擎
 *
 * 負責協調整場戰鬥的運行:
 * 1. 初始化所有系統
 * 2. 設置戰鬥結束條件
 * 3. 運行戰鬥循環
 * 4. 收集並返回完整的戰鬥結果
 *
 * 主要用途: 生成一場戰鬥的完整過程和結果,供 UI 層回放使用
 */
export class CombatEngine {
  private context: CombatContext
  private ticker: TickerDriver
  private tickerSystem: TickerProcessor
  private abilitySystem: AbilitySystem
  private eventLogger: EventLogger
  private config: CombatConfig
  private startTime: number = 0
  private endTime: number = 0
  constructor(config: CombatConfig) {
    this.config = {
      maxTicks: 10000,
      snapshotInterval: 100,
      enableLogging: true,
      ...config,
    }
    // 1. 初始化戰鬥上下文
    this.context = new CombatContext(this.config.seed)
    // 2. 初始化核心系統
    this.ticker = new TickerDriver(this.context, this.config.maxTicks, this.config.snapshotInterval)
    this.tickerSystem = new TickerProcessor(this.context)
    this.abilitySystem = new AbilitySystem(this.context)
    this.eventLogger = new EventLogger(this.context.eventBus)
    // 3. 設置戰鬥結束條件
    this.ticker.setStopCondition(() => this.checkBattleEnd())
    // 4. 創建並添加所有角色
    this.setupCharacters()
  }
  /**
   * 啟動戰鬥並返回完整結果
   */
  public start(): CombatResult {
    this.startTime = Date.now()
    // 記錄戰鬥開始
    this.recordKeyMoment('battle-start', '戰鬥開始', [])
    // 運行戰鬥循環
    this.ticker.start()
    this.endTime = Date.now()
    // 記錄戰鬥結束
    this.recordKeyMoment('battle-end', '戰鬥結束', [])
    // 返回完整結果
    return this.buildCombatResult()
  }
  /**
   * 設置角色
   */
  private setupCharacters(): void {
    // 添加玩家隊伍
    this.config.playerTeam.forEach((character) => {
      this.context.addEntity(character)
    })
    // 添加敵人隊伍
    this.config.enemyTeam.forEach((character) => {
      this.context.addEntity(character)
    })
  }
  /**
   * 檢查戰鬥是否結束
   */
  private checkBattleEnd(): boolean {
    // 檢查玩家隊伍是否全滅
    const playerAlive = this.config.playerTeam.some((c) => !c.isDead)
    const enemyAlive = this.config.enemyTeam.some((c) => !c.isDead)
    // 一方全滅則戰鬥結束
    return !playerAlive || !enemyAlive
  }
  /**
   * 判定戰鬥結果
   */
  private determineOutcome(): { outcome: CombatOutcome; winner: 'player' | 'enemy' | null } {
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
    // 預設情況 (不應該發生)
    return { outcome: 'draw', winner: null }
  }
  /**
   * 獲取存活者
   */
  private getSurvivors(): ICharacter[] {
    return [...this.config.playerTeam, ...this.config.enemyTeam].filter((c) => !c.isDead)
  }
  /**
   * 創建戰鬥快照
   */
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
  /**
   * 記錄關鍵時刻
   */
  private recordKeyMoment(type: KeyMoment['type'], description: string, characterIds: CharacterId[]): void {
    // TODO: 實作關鍵時刻記錄
    // 可以通過監聽事件來自動記錄
    void type
    void description
    void characterIds
  }
  /**
   * 計算統計數據
   */
  private calculateStatistics(): CombatStatistics {
    const allCharacters = [...this.config.playerTeam, ...this.config.enemyTeam]
    const characterStats = new Map<CharacterId, CharacterStats>()
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
    // TODO: 從事件日誌中統計數據
    // 遍歷 eventLogger.getAllLogs() 來累計各項數據
    const totalDamage = Array.from(characterStats.values()).reduce((sum, stat) => sum + stat.damageDealt, 0)
    return {
      characterStats,
      effectsApplied: new Map(), // TODO: 統計效果觸發次數
      totalDamage,
      duration: this.context.getCurrentTick(),
    }
  }
  /**
   * 構建完整的戰鬥結果
   */
  private buildCombatResult(): CombatResult {
    const { outcome, winner } = this.determineOutcome()
    const survivors = this.getSurvivors()
    const totalTicks = this.context.getCurrentTick()
    // 收集日誌和快照
    const logs = this.eventLogger.getLogs() as CombatLogEntry[]
    const snapshots: CombatSnapshot[] = []
    // 生成快照 (每 snapshotInterval 個 Tick)
    const interval = this.config.snapshotInterval ?? 100
    for (let tick = 0; tick <= totalTicks; tick += interval) {
      snapshots.push(this.createSnapshot(tick))
    }
    // 計算統計數據
    const statistics = this.calculateStatistics()
    // TODO: 收集關鍵時刻
    const keyMoments: KeyMoment[] = [
      {
        tick: 0,
        type: 'battle-start',
        description: '戰鬥開始',
        characterIds: [],
      },
      {
        tick: totalTicks,
        type: 'battle-end',
        description: '戰鬥結束',
        characterIds: [],
      },
    ]
    return {
      outcome,
      winner,
      survivors,
      totalTicks,
      logs,
      snapshots,
      keyMoments,
      statistics,
      startedAt: this.startTime,
      endedAt: this.endTime,
    }
  }
  /**
   * 清理資源
   */
  public dispose(): void {
    this.tickerSystem.dispose()
    this.abilitySystem.dispose()
  }
}
