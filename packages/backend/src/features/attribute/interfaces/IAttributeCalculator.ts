import { AttributeType } from './AttributeType'

export interface IAttributeCalculator {
  calculateAttribute(type: AttributeType): number
}
