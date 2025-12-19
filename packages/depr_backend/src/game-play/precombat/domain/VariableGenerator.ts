import Chance from 'chance'
import type { IVariableGenerator, IVariableGeneratorConfig, IPreCombatVariable } from '../interfaces'
import { VARIABLE_TEMPLATES } from './VariableTemplateLibrary'
import type { IVariableTemplate } from './VariableTemplate'
import { nanoid } from 'nanoid'

/**
 * 變數生成器實作
 */
export class VariableGenerator implements IVariableGenerator {
  /* 生成賽前變數 */
  generate(config: IVariableGeneratorConfig): IPreCombatVariable[] {
    const chance = new Chance(String(config.seed))
    const { encounterContext, variableCountRange } = config

    // 決定生成幾個變數
    const [minCount, maxCount] = variableCountRange
    const count = chance.integer({ min: minCount, max: maxCount })

    // 過濾符合難度要求的模板
    const eligibleTemplates = VARIABLE_TEMPLATES.filter(
      (t) => t.minDifficulty <= encounterContext.difficultyCoefficient
    )

    if (eligibleTemplates.length === 0) {
      return []
    }

    // 使用權重隨機選擇模板
    const selectedTemplates = this.selectTemplates(eligibleTemplates, count, chance)

    // 生成變數
    return selectedTemplates.map((template) => this.generateFromTemplate(template, encounterContext, chance))
  }

  /* 根據權重選擇模板 */
  private selectTemplates(templates: IVariableTemplate[], count: number, chance: Chance.Chance): IVariableTemplate[] {
    const selected: IVariableTemplate[] = []
    const available = [...templates]

    for (let i = 0; i < count && available.length > 0; i++) {
      const template = chance.weighted(
        available,
        available.map((t) => t.weight)
      )
      selected.push(template)
      // 移除已選擇的模板避免重複
      const index = available.indexOf(template)
      available.splice(index, 1)
    }

    return selected
  }

  /* 從模板生成變數 */
  private generateFromTemplate(
    template: IVariableTemplate,
    encounterContext: { difficultyCoefficient: number },
    chance: Chance.Chance
  ): IPreCombatVariable {
    const seedNumber = chance.integer({ min: 0, max: 999999 })
    const parameters = template.generateParameters(encounterContext.difficultyCoefficient, seedNumber)

    // 替換模板中的參數
    const description = this.interpolateTemplate(template.descriptionTemplate, parameters)
    const impactSummary = this.interpolateTemplate(template.impactSummaryTemplate, parameters)

    // 決定持續時間
    const [minDuration, maxDuration] = template.durationRange
    const durationTicks =
      minDuration === maxDuration ? minDuration : chance.integer({ min: minDuration, max: maxDuration })

    return {
      id: nanoid(),
      description,
      applyLogicIdentifier: template.applyLogicIdentifier,
      durationTicks,
      impactSummary,
      parameters,
    }
  }

  /* 模板參數替換 */
  private interpolateTemplate(template: string, parameters: Record<string, unknown>): string {
    let result = template
    Object.entries(parameters).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
    })
    return result
  }
}
