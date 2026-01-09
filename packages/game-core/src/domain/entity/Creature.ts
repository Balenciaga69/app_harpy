import { I18nField } from '../../shared/models/I18nField'

export class CreatureEntity {
  readonly summonerId: string
  readonly id: string
  readonly template: CreatureTemplate
  constructor(summonerId: string, id: string, template: CreatureTemplate) {
    this.summonerId = summonerId
    this.id = id
    this.template = template
  }
}

export interface CreatureTemplate {
  id: string
  name: I18nField
  desc: I18nField
  duration: number
}
