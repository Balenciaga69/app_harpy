import {
  CharacterCoordinator,
  CombatCoordinator,
  EncounterCoordinator,
  ShopCoordinator,
  StorageCoordinator,
} from './coordinators'
import { RunNotInitializedError } from './errors'
import { RunFinalizer, RunInitializer } from './lifecycle'
import type { RunContext } from './models'
import { advanceProgress } from './models/run-progress'
import { RunState } from './models/run-state'
import type { RunStateType } from './models/run-state'
import { RunStateMachine } from './state-machine/RunStateMachine'
import {
  CharacterSelectionState,
  CombatState,
  EventState,
  GameOverState,
  MapViewState,
  PostCombatState,
  PreCombatState,
  ShopState,
  VictoryState,
} from './state-machine/states'
/**
 * Run 主控制器 (Facade Pattern)
 * 對外提供簡潔的介面，協調所有子系統
 */
export class RunOrchestrator {
  private context: RunContext | null = null
  private readonly stateMachine: RunStateMachine
  private readonly initializer: RunInitializer
  private readonly finalizer: RunFinalizer
  // Coordinators
  private readonly characterCoordinator: CharacterCoordinator
  private readonly encounterCoordinator: EncounterCoordinator
  private readonly combatCoordinator: CombatCoordinator
  private readonly shopCoordinator: ShopCoordinator
  private readonly storageCoordinator: StorageCoordinator
  constructor() {
    this.stateMachine = new RunStateMachine()
    this.initializer = new RunInitializer()
    this.finalizer = new RunFinalizer()
    this.characterCoordinator = new CharacterCoordinator()
    this.encounterCoordinator = new EncounterCoordinator()
    this.combatCoordinator = new CombatCoordinator()
    this.shopCoordinator = new ShopCoordinator()
    this.storageCoordinator = new StorageCoordinator()
    this.registerStateHandlers()
  }
  /**
   * 註冊所有狀態處理器
   */
  private registerStateHandlers(): void {
    this.stateMachine.registerHandler(RunState.CHARACTER_SELECTION, new CharacterSelectionState())
    this.stateMachine.registerHandler(RunState.MAP_VIEW, new MapViewState())
    this.stateMachine.registerHandler(RunState.PRE_COMBAT, new PreCombatState())
    this.stateMachine.registerHandler(RunState.COMBAT, new CombatState())
    this.stateMachine.registerHandler(RunState.POST_COMBAT, new PostCombatState())
    this.stateMachine.registerHandler(RunState.SHOP, new ShopState())
    this.stateMachine.registerHandler(RunState.EVENT, new EventState())
    this.stateMachine.registerHandler(RunState.GAME_OVER, new GameOverState())
    this.stateMachine.registerHandler(RunState.VICTORY, new VictoryState())
  }
  /**
   * 開始新的 Run
   */
  startNewRun(): void {
    this.context = this.initializer.createNewRun()
  }
  /**
   * 從檢查點載入 Run
   */
  async loadCheckpoint(checkpointId: string): Promise<void> {
    const savedContext = await this.storageCoordinator.loadCheckpoint(checkpointId)
    this.context = this.initializer.restoreFromCheckpoint(savedContext)
  }
  /**
   * 儲存檢查點
   */
  async saveCheckpoint(): Promise<void> {
    this.ensureInitialized()
    await this.storageCoordinator.saveCheckpoint(this.context!)
  }
  /**
   * 選擇角色
   */
  selectCharacter(characterId: string): void {
    this.ensureInitialized()
    this.characterCoordinator.selectCharacter(this.context!, characterId)
  }
  /**
   * 轉換到指定狀態
   */
  async transitionTo(newState: RunStateType): Promise<void> {
    this.ensureInitialized()
    await this.stateMachine.transitionTo(newState, this.context!)
  }
  /**
   * 推進進度
   */
  advanceNode(): void {
    this.ensureInitialized()
    this.context!.progress = advanceProgress(this.context!.progress)
  }
  /**
   * 取得當前狀態
   */
  getCurrentState(): RunStateType {
    this.ensureInitialized()
    return this.context!.state
  }
  /**
   * 取得當前進度
   */
  getCurrentProgress() {
    this.ensureInitialized()
    return this.context!.progress
  }
  /**
   * 取得完整 Context（唯讀）
   */
  getContext(): Readonly<RunContext> {
    this.ensureInitialized()
    return this.context!
  }
  /**
   * 增加金幣
   */
  addGold(amount: number): void {
    this.ensureInitialized()
    this.context!.gold += amount
  }
  /**
   * 扣除金幣
   */
  spendGold(amount: number): boolean {
    this.ensureInitialized()
    if (this.context!.gold < amount) {
      return false
    }
    this.context!.gold -= amount
    return true
  }
  /**
   * 結束 Run
   */
  endRun(isVictory: boolean): void {
    this.ensureInitialized()
    this.finalizer.finalize(this.context!, isVictory)
    this.context = null
  }
  /**
   * 確保已初始化
   */
  private ensureInitialized(): void {
    if (!this.context) {
      throw new RunNotInitializedError()
    }
  }
  /**
   * 取得 Coordinators（供進階使用）
   */
  getCoordinators() {
    return {
      character: this.characterCoordinator,
      encounter: this.encounterCoordinator,
      combat: this.combatCoordinator,
      shop: this.shopCoordinator,
      storage: this.storageCoordinator,
    }
  }
}
