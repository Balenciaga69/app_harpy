import type { IEffect } from '../models/effect'
/**
 * 效果建構函式類型
 *
 * 接收參數並返回效果實例。
 * 參數通常來自詞綴實例的 rolledValue。
 */
export type EffectConstructor = (...args: unknown[]) => IEffect
