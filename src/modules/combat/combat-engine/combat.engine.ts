import { AbilitySystem } from '../ability'
import { EventLogger } from '../logger'
import { TickerDriver, TickerProcessor } from '../tick'
import { SnapshotCollector } from '../snapshot'
import { CombatContext } from '../context'
import type { CombatConfig, CombatResult } from './models'
import { ResultBuilder } from './builders'
/**
 * CombatEngine：戰鬥執行引擎
 *
 * 設計理念：
 * - 作為戰鬥系統的精簡協調者，負責初始化並編排各個子系統（Ticker、Logger、Ability、Snapshot 等）
 * - 採用組合模式統一管理多個子系統的生命週期，確保資源的正確初始化與釋放
 * - 使用 ResultBuilder 分離結果構建邏輯，保持 CombatEngine 的職責單一
 * - 將戰鬥流程控制與結果彙總責任封裝在單一介面中，供上層調用
 *
 * 主要職責：
 * - 初始化戰鬥上下文與核心子系統（TickerDriver、TickerProcessor、AbilitySystem、EventLogger、SnapshotCollector）
 * - 配置戰鬥結束條件並設置角色到上下文中
 * - 啟動戰鬥循環並記錄開始/結束時間戳
 * - 委託 ResultBuilder 構建完整的 CombatResult 物件
 * - 提供資源清理接口（dispose），確保系統能優雅釋放事件監聽與資源
 */
export class CombatEngine {
  private context: CombatContext
  private ticker: TickerDriver
  private tickerSystem: TickerProcessor
  private abilitySystem: AbilitySystem
  private eventLogger: EventLogger
  private snapshotCollector: SnapshotCollector
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
    this.ticker = new TickerDriver(this.context, this.config.maxTicks)
    this.tickerSystem = new TickerProcessor(this.context)
    this.abilitySystem = new AbilitySystem(this.context)
    this.eventLogger = new EventLogger(this.context.eventBus)
    this.snapshotCollector = new SnapshotCollector(this.context, this.config.snapshotInterval)
    // 3. 設置戰鬥結束條件
    this.ticker.setStopCondition(() => this.checkBattleEnd())
    // 4. 創建並添加所有角色
    this.setupCharacters()
  }
  /** 啟動戰鬥並返回完整結果 */
  public start(): CombatResult {
    this.startTime = Date.now()
    this.ticker.start()
    this.endTime = Date.now()
    const resultBuilder = new ResultBuilder(
      this.context,
      this.config,
      this.eventLogger,
      this.snapshotCollector,
      this.startTime,
      this.endTime
    )
    return resultBuilder.build()
  }
  /** 設置角色 */
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
  /** 檢查戰鬥是否結束 */
  private checkBattleEnd(): boolean {
    const playerAlive = this.config.playerTeam.some((c) => !c.isDead)
    const enemyAlive = this.config.enemyTeam.some((c) => !c.isDead)
    return !playerAlive || !enemyAlive
  }
  /** 清理資源 */
  public dispose(): void {
    this.ticker.stop()
    this.tickerSystem.dispose()
    this.abilitySystem.dispose()
    this.snapshotCollector.dispose()
  }
}
