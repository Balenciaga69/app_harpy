import type { IVariableTemplate } from './VariableTemplate'
import { VariableType } from './VariableTemplate'

/**
 * 預定義變數模板庫
 */
export const VARIABLE_TEMPLATES: IVariableTemplate[] = [
  {
    id: 'chill_startup',
    type: VariableType.STATUS_EFFECT,
    descriptionTemplate: '雙方開局受 {layers} 層冰緩',
    impactSummaryTemplate: '開局冰緩 ×{layers}',
    applyLogicIdentifier: 'apply_chill',
    durationRange: [-1, -1],
    minDifficulty: 0.1,
    weight: 10,
    generateParameters: (difficulty: number, seed: number) => ({
      layers: Math.floor(8 + difficulty * 20 + (seed % 10)),
      targets: 'both',
    }),
  },
  {
    id: 'revival_boost',
    type: VariableType.REVIVAL_RATE,
    descriptionTemplate: '雙方復活率提升 {percent}%',
    impactSummaryTemplate: '復活率 +{percent}%',
    applyLogicIdentifier: 'boost_revival_rate',
    durationRange: [-1, -1],
    minDifficulty: 0.2,
    weight: 8,
    generateParameters: (difficulty: number, seed: number) => ({
      percent: Math.floor(10 + difficulty * 30 + (seed % 15)),
      targets: 'both',
    }),
  },
  {
    id: 'ultimate_charge_boost',
    type: VariableType.ULTIMATE_CHARGE,
    descriptionTemplate: '雙方大招充能效率 ×{multiplier}',
    impactSummaryTemplate: '充能效率 ×{multiplier}',
    applyLogicIdentifier: 'multiply_ultimate_charge',
    durationRange: [-1, -1],
    minDifficulty: 0.15,
    weight: 9,
    generateParameters: (difficulty: number, seed: number) => {
      const base = 1.2 + difficulty * 0.5
      const variance = (seed % 20) / 100
      return {
        multiplier: Number((base + variance).toFixed(2)),
        targets: 'both',
      }
    },
  },
  {
    id: 'attack_speed_up',
    type: VariableType.ATTACK_COOLDOWN,
    descriptionTemplate: '雙方攻擊冷卻減少 {percent}%',
    impactSummaryTemplate: '攻速提升 {percent}%',
    applyLogicIdentifier: 'reduce_attack_cooldown',
    durationRange: [-1, -1],
    minDifficulty: 0.25,
    weight: 7,
    generateParameters: (difficulty: number, seed: number) => ({
      percent: Math.floor(15 + difficulty * 25 + (seed % 10)),
      targets: 'both',
    }),
  },
  {
    id: 'damage_amplify',
    type: VariableType.DAMAGE_MULTIPLIER,
    descriptionTemplate: '雙方傷害提升 {percent}%',
    impactSummaryTemplate: '傷害 +{percent}%',
    applyLogicIdentifier: 'amplify_damage',
    durationRange: [-1, -1],
    minDifficulty: 0.3,
    weight: 8,
    generateParameters: (difficulty: number, seed: number) => ({
      percent: Math.floor(20 + difficulty * 40 + (seed % 15)),
      targets: 'both',
    }),
  },
  {
    id: 'defense_boost',
    type: VariableType.DEFENSE_MULTIPLIER,
    descriptionTemplate: '雙方防禦提升 {percent}%',
    impactSummaryTemplate: '防禦 +{percent}%',
    applyLogicIdentifier: 'boost_defense',
    durationRange: [-1, -1],
    minDifficulty: 0.2,
    weight: 7,
    generateParameters: (difficulty: number, seed: number) => ({
      percent: Math.floor(15 + difficulty * 30 + (seed % 12)),
      targets: 'both',
    }),
  },
  {
    id: 'burn_startup',
    type: VariableType.STATUS_EFFECT,
    descriptionTemplate: '雙方開局受 {layers} 層燃燒',
    impactSummaryTemplate: '開局燃燒 ×{layers}',
    applyLogicIdentifier: 'apply_burn',
    durationRange: [-1, -1],
    minDifficulty: 0.35,
    weight: 6,
    generateParameters: (difficulty: number, seed: number) => ({
      layers: Math.floor(5 + difficulty * 15 + (seed % 8)),
      targets: 'both',
    }),
  },
  {
    id: 'bleed_startup',
    type: VariableType.STATUS_EFFECT,
    descriptionTemplate: '雙方開局受 {layers} 層流血',
    impactSummaryTemplate: '開局流血 ×{layers}',
    applyLogicIdentifier: 'apply_bleed',
    durationRange: [-1, -1],
    minDifficulty: 0.28,
    weight: 7,
    generateParameters: (difficulty: number, seed: number) => ({
      layers: Math.floor(6 + difficulty * 18 + (seed % 9)),
      targets: 'both',
    }),
  },
]
