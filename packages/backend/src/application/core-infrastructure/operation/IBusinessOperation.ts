import { Result } from '../../../shared/result/Result'
export interface IBusinessOperation<T> {
  validStatus(): this
  executeBusinessLogic(): this
  commitChanges(): Result<T, string>
}
