import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { IRunContext } from '../../core-infrastructure/context/interface/IRunContext'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'

/* 協調 Run 初始化的應用程式服務 */
export class RunInitializationService {
  constructor(_appCtx: IAppContext) {
    // TODO: 存儲或使用 _appCtx
  }

  /* 初始化新的 Run */
  initializeNewRun(): {
    runContext: IRunContext
    characterContext: ICharacterContext
    stashContext: IStashContext
  } {
    // TODO: 實現完整的 Run 初始化邏輯
    // 步驟 1: 驗證帳戶和職業
    // 步驟 2: 創建 RunContext
    // 步驟 3: 創建 CharacterContext
    // 步驟 4: 創建 StashContext
    // 步驟 5: 生成關卡節點
    // 步驟 6: 分配初始 Ultimate 和物品

    throw new Error('TODO: 實現 initializeNewRun')
  }
}
