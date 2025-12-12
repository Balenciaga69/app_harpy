import { ClassEffectRegistry } from '../builders/ClassEffectRegistry'
// TODO: 依賴外部模組 impl/effects，未來需抽象化
import { BloodPactEffect } from '@/impl/effects/BloodPactEffect'
import { ChargedCriticalEffect } from '@/impl/effects/Equipment/ChargedCriticalEffect'
import { LowHealthArmorEffect } from '@/impl/effects/Equipment/LowHealthArmorEffect'
import { ChargeEffect } from '@/impl/effects/NativeStatus/ChargeEffect'
import { ChillEffect } from '@/impl/effects/NativeStatus/ChillEffect'
import { ExampleHolyFireEffect } from '@/impl/effects/NativeStatus/HolyFireEffect'
import { PoisonEffect } from '@/impl/effects/NativeStatus/PoisonEffect'
/**
 * 註冊預設的 Class 效果
 *
 * 此函式應在應用初始化時調用，註冊所有內建的 Class 效果。
 * 讓 EffectBuilder 能夠正確建構這些效果實例。
 *
 * 使用範例：
 * ```ts
 * import { registerDefaultClassEffects } from '@/logic/effect/config'
 * registerDefaultClassEffects()
 * ```
 */
export function registerDefaultClassEffects(): void {
  const registry = ClassEffectRegistry.getInstance()
  // 裝備效果
  registry.register('effect_class_charged_critical', () => new ChargedCriticalEffect())
  registry.register('effect_class_low_health_armor', () => new LowHealthArmorEffect())
  // 原生狀態效果（接收初始層數作為參數）
  registry.register('effect_class_charge', (...args: unknown[]) => new ChargeEffect(args[0] as number))
  registry.register('effect_class_chill', (...args: unknown[]) => new ChillEffect(args[0] as number))
  registry.register('effect_class_holy_fire', (...args: unknown[]) => new ExampleHolyFireEffect(args[0] as number))
  registry.register('effect_class_poison', (...args: unknown[]) => new PoisonEffect(args[0] as number))
  // 特殊效果（Blood Pact 需要兩個參數：倍率與攻擊次數）
  // 這裡僅傳遞 rolledValue 作為倍率，攻擊次數固定為 3
  registry.register('effect_class_blood_pact', (...args: unknown[]) => new BloodPactEffect(args[0] as number, 3))
  // 未來可在此繼續註冊新效果
}
