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
export interface IAppContextService {
  GetContexts(): IAppContext['contexts']
  GetConfig(): IAppContext['configStore']
  setRunContext(ctx: IRunContext): void
  getRunContext(): IRunContext
  setCharacterContext(ctx: ICharacterContext): void
  getCharacterContext(): ICharacterContext
  setStashContext(ctx: IStashContext): void
  getStashContext(): IStashContext
  getCurrentAtCreatedInfo(): AtCreatedInfo
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord
}
export class AppContextService implements IAppContextService {
  constructor(private appContext: IAppContext) {}
  // 取得動態上下文
  GetContexts(): IAppContext['contexts'] {
    return this.appContext.contexts
  }
  // 取得靜態資料
  GetConfig(): IAppContext['configStore'] {
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
