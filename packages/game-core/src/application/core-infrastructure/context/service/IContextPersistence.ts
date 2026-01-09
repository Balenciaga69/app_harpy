import { IAppContext } from '../interface/IAppContext'

/**
 * Interface for persisting application context
 * Implemented by backend infrastructure layer (e.g., ContextManager)
 */
export interface IContextPersistence {
  /**
   * Save the current context to persistent storage (cache/DB)
   * @param context The application context to save
   */
  saveContext(context: IAppContext): void
}
