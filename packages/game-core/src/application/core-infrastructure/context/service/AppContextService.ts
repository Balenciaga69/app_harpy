import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { AtCreatedInfo, WithCreatedInfo, WithSourceUnit } from '../../../../shared/models/BaseInstanceFields'
import { IAppContext } from '../interface/IAppContext'
import { ICharacterContext } from '../interface/ICharacterContext'
import { IRunContext } from '../interface/IRunContext'
import { IShopContext } from '../interface/IShopContext'
import { IStashContext } from '../interface/IStashContext'
// 用於創建 Record 的共通資訊
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
  /** 取得當前運行上下文( 章節、關卡、種子等 ) */
  getRunContext(): IRunContext
  /** 取得當前角色上下文( 職業、裝備、聖物等 ) */
  getCharacterContext(): ICharacterContext
  /** 取得當前倉庫上下文( 物品、容量等 ) */
  getStashContext(): IStashContext
  /** 取得當前商店上下文( 商店物品、刷新狀態等 ) */
  getShopContext(): IShopContext
  /** 一次取得所有上下文的快照 */
  getAllContexts(): IAppContext['contexts']
  /** 取得當前建立時機資訊( 章節、關卡、難度係數 ) */
  getCurrentAtCreatedInfo(): AtCreatedInfo
  /** 取得建立記錄所需的當前資訊( 難度、來源單位、建立時機 ) */
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord
  /** 取得當前 Run 狀態 */
  getRunStatus(): IRunContext['status']
}
/**
 * 上下文更新器：暴露狀態修改操作
 * 職責：提供修改各個上下文的方法，維持狀態一致性
 * 邊界：寫操作，維持不可變性( 通過重建 )，版本號由外部管理
 * 依賴此介面：業務邏輯執行服務( 戰鬥、商店、倉庫等 )、主流程協調器
 */
export interface IContextMutator {
  /** 更新運行上下文( 如進度、金幣、修飾符等 ) */
  setRunContext(ctx: IRunContext): void
  /** 更新角色上下文( 如屬性、裝備、聖物等 ) */
  setCharacterContext(ctx: ICharacterContext): void
  /** 更新倉庫上下文( 如物品、容量等 ) */
  setStashContext(ctx: IStashContext): void
  /** 更新商店上下文( 如商店物品、刷新狀態等 ) */
  setShopContext(ctx: IShopContext): void
}
/**
 * 完整應用上下文服務：結合讀、寫、快照計算
 * 職責：提供對應用上下文的完整操作能力
 * 邊界：應僅在需要完整操作的主流程或協調器中使用；一般服務應依賴細粒度介面
 * 注意：大多數服務應該只依賴此介面的子介面，而不是此介面本身，以保持依賴的清晰性
 */
export interface IAppContextService extends IConfigStoreAccessor, IContextSnapshotAccessor, IContextMutator {}
export class AppContextService implements IAppContextService {
  constructor(private appContext: IAppContext) {}
  /** 取得配置存儲，包含所有靜態模板 */
  getConfigStore(): IAppContext['configStore'] {
    return this.appContext.configStore
  }
  /** 一次取得所有上下文的快照( 運行、角色、倉庫 ) */
  getAllContexts(): IAppContext['contexts'] {
    return this.appContext.contexts
  }
  /** 取得當前運行上下文 */
  getRunContext(): IRunContext {
    return this.appContext.contexts.runContext
  }
  /** 更新運行上下文( 透過不可變重建 )*/
  setRunContext(ctx: IRunContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        runContext: ctx,
      },
    }
  }
  /** 取得當前角色上下文 */
  getCharacterContext(): ICharacterContext {
    return this.appContext.contexts.characterContext
  }
  /** 更新角色上下文( 透過不可變重建 )*/
  setCharacterContext(ctx: ICharacterContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        characterContext: ctx,
      },
    }
  }
  /** 取得當前倉庫上下文 */
  getStashContext(): IStashContext {
    return this.appContext.contexts.stashContext
  }
  /** 更新倉庫上下文( 透過不可變重建 )*/
  setStashContext(ctx: IStashContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        stashContext: ctx,
      },
    }
  }
  /** 取得當前商店上下文 */
  getShopContext(): IShopContext {
    return this.appContext.contexts.shopContext
  }
  /** 更新商店上下文( 透過不可變重建 )*/
  setShopContext(ctx: IShopContext): void {
    this.appContext = {
      ...this.appContext,
      contexts: {
        ...this.appContext.contexts,
        shopContext: ctx,
      },
    }
  }
  /**
   * 取得當前建立時機資訊
   */
  getCurrentAtCreatedInfo(): AtCreatedInfo {
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const atCreated = { chapter: currentChapter, stage: currentStage, difficulty }
    return atCreated
  }
  /**
   * 取得建立記錄所需的當前資訊
   */
  getCurrentInfoForCreateRecord(): CommonInfoForCreateRecord {
    const characterContext = this.getCharacterContext()
    const { currentChapter, currentStage } = this.getRunContext()
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const atCreated = { chapter: currentChapter, stage: currentStage, difficulty }
    return { difficulty, sourceUnitId: characterContext.id, atCreated }
  }
  /**
   * 取得當前 Run 狀態
   */
  getRunStatus(): IRunContext['status'] {
    return this.appContext.contexts.runContext.status
  }
  /** 取得 Run 的臨時上下文 */
  getTemporaryContext() {
    return this.appContext.contexts.runContext.temporaryContext
  }
}
