import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { AtCreatedInfo, WithCreatedInfo, WithSourceUnit } from '../../../../shared/models/BaseInstanceFields'
import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IShopContext } from '../interface/IShopContext'
import { IStashContext } from '../interface/IStashContext'

interface CommonInfoForCreateRecord extends WithCreatedInfo, WithSourceUnit {
  readonly difficulty: number
}
/**
 * 配置存儲訪問器：暴露靜態模板倉庫
 * 職責：提供對遊戲所有靜態模板的讀取訪問( 職業、物品、敵人、詞綴、大絕招等 )
 * 邊界：只讀，不涉及運行時狀態或修改
 * 依賴此介面：所有聚合根服務、所有工廠、內容生成服務
 */
export interface IConfigStoreAccessor {
  getConfigStore(): IAppContext['configStore']
}
/**
 * 上下文快照訪問器：暴露當前運行時狀態與快速計算欄位
 * 職責：提供當前 Run 的各個上下文快照與便利計算方法
 * 邊界：只讀，返回當前狀態的快照，不修改任何狀態
 * 依賴此介面：內容生成服務、遊戲邏輯決策服務、約束檢查服務
 */
export interface IContextSnapshotAccessor {
  getRunContext(): IRunContext

  getCharacterContext(): ICharacterContext

  getStashContext(): IStashContext

  getShopContext(): IShopContext

  getAllContexts(): IAppContext['contexts']

  getCurrentAtCreatedInfo(): AtCreatedInfo

  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord

  getRunStatus(): IRunContext['status']
}
/**
 * 上下文更新器：暴露狀態修改操作
 * 職責：提供修改各個上下文的方法，維持狀態一致性
 * 邊界：寫操作，維持不可變性( 通過重建 )，版本號由外部管理
 * 依賴此介面：業務邏輯執行服務( 戰鬥、商店、倉庫等 )、主流程協調器
 */
export interface IContextMutator {
  setRunContext(ctx: IRunContext): void

  setCharacterContext(ctx: ICharacterContext): void

  setStashContext(ctx: IStashContext): void

  setShopContext(ctx: IShopContext): void
}

export class AppContextHolder {
  private ctx: IAppContext
  constructor(initial: IAppContext) {
    this.ctx = initial
  }
  get(): IAppContext {
    return this.ctx
  }
  set(next: IAppContext): void {
    this.ctx = next
  }
}

export class ConfigStoreAccessorImpl implements IConfigStoreAccessor {
  constructor(private holder: AppContextHolder) {}
  getConfigStore(): IAppContext['configStore'] {
    return this.holder.get().configStore
  }
}

export class ContextSnapshotAccessorImpl implements IContextSnapshotAccessor {
  constructor(private holder: AppContextHolder) {}
  getRunContext(): IRunContext {
    return this.holder.get().contexts.runContext
  }
  getCharacterContext(): ICharacterContext {
    return this.holder.get().contexts.characterContext
  }
  getStashContext(): IStashContext {
    return this.holder.get().contexts.stashContext
  }
  getShopContext(): IShopContext {
    return this.holder.get().contexts.shopContext
  }
  getAllContexts(): IAppContext['contexts'] {
    return this.holder.get().contexts
  }
  getCurrentAtCreatedInfo(): AtCreatedInfo {
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    return { chapter: currentChapter, stage: currentStage, difficulty }
  }
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord {
    const characterContext = this.getCharacterContext()
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const atCreated = { chapter: currentChapter, stage: currentStage, difficulty }
    return { difficulty, sourceUnitId: characterContext.id, atCreated }
  }
  getRunStatus(): IRunContext['status'] {
    return this.getRunContext().status
  }

  getTemporaryContext() {
    return this.getRunContext().temporaryContext
  }
}

export class ContextMutatorImpl implements IContextMutator {
  constructor(private holder: AppContextHolder) {}
  setRunContext(ctx: IRunContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, runContext: ctx } })
  }
  setCharacterContext(ctx: ICharacterContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, characterContext: ctx } })
  }
  setStashContext(ctx: IStashContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, stashContext: ctx } })
  }
  setShopContext(ctx: IShopContext): void {
    const root = this.holder.get()
    this.holder.set({ ...root, contexts: { ...root.contexts, shopContext: ctx } })
  }
}
