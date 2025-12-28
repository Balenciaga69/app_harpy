import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { AtCreatedInfo, WithCreatedInfo, WithSourceUnit } from '../../../../shared/models/BaseInstanceFields'
import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IStashContext } from '../interface/IStashContext'
// 用於創建 Record 的共通資訊
interface CommonInfoForCreateRecord extends WithCreatedInfo, WithSourceUnit {
  readonly difficulty: number
}
// 應用上下文服務介面
/**
 * 模板存取器：只暴露 ConfigStore，用於讀取所有靜態模板
 * 依賴此介面的服務：所有 AggregateService、所有 Factory
 */
export interface IConfigStoreAccessor {
  getConfigStore(): IAppContext['configStore']
}

/**
 * 狀態快照存取器：暴露當前 Run 的上下文與快速計算欄位
 * 依賴此介面的服務：狀態修改服務、遊戲邏輯決策服務
 */
export interface IContextSnapshotAccessor {
  getRunContext(): IRunContext
  getCharacterContext(): ICharacterContext
  getStashContext(): IStashContext
  getAllContexts(): IAppContext['contexts']
  getCurrentAtCreatedInfo(): AtCreatedInfo
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord
}

/**
 * 狀態更新器：暴露 setter，用於修改上下文
 * 依賴此介面的服務：業務邏輯執行服務（戰鬥、商店、倉庫等）
 */
export interface IContextMutator {
  setRunContext(ctx: IRunContext): void
  setCharacterContext(ctx: ICharacterContext): void
  setStashContext(ctx: IStashContext): void
}

/**
 * 完整應用上下文服務：結合讀、寫、快照計算
 * 只有真正需要完整操作的地方才依賴此介面
 */
export interface IAppContextService extends IConfigStoreAccessor, IContextSnapshotAccessor, IContextMutator {}
export class AppContextService implements IAppContextService {
  constructor(private appContext: IAppContext) {}
  // 取得動態上下文
  getAllContexts(): IAppContext['contexts'] {
    return this.appContext.contexts
  }
  // 取得靜態資料
  getConfigStore(): IAppContext['configStore'] {
    return this.appContext.configStore
  }
  // 設定 運行上下文
  setRunContext(ctx: IRunContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        runContext: ctx,
      },
    }
  }
  // 取得 運行上下文
  getRunContext(): IRunContext {
    return this.appContext.contexts.runContext
  }
  // 設定 角色上下文
  setCharacterContext(ctx: ICharacterContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        characterContext: ctx,
      },
    }
  }
  // 取得 角色上下文
  getCharacterContext(): ICharacterContext {
    return this.appContext.contexts.characterContext
  }
  // 設定 倉庫上下文
  setStashContext(ctx: IStashContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        stashContext: ctx,
      },
    }
  }
  // 取得 倉庫上下文
  getStashContext(): IStashContext {
    return this.appContext.contexts.stashContext
  }
  // 取得當前用於創建物件的 AtCreatedInfo
  getCurrentAtCreatedInfo(): AtCreatedInfo {
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const atCreated = { chapter: currentChapter, stage: currentStage, difficulty }
    return atCreated
  }
  // 取得用於建立 Record 的當前資訊
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord {
    const characterContext = this.getCharacterContext()
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const atCreated = { chapter: currentChapter, stage: currentStage, difficulty }
    return { difficulty, sourceUnitId: characterContext.id, atCreated }
  }
}
