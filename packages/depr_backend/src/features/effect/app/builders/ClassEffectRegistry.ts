import { ClassNotRegisteredError } from '../../domain/errors/EffectBuilderError'
import type { EffectConstructor } from '../../interfaces/IEffectConstructor'
export class ClassEffectRegistry {
  private static instance: ClassEffectRegistry
  private registry: Map<string, EffectConstructor> = new Map()
  private constructor() {}
  static getInstance(): ClassEffectRegistry {
    if (!ClassEffectRegistry.instance) {
      ClassEffectRegistry.instance = new ClassEffectRegistry()
    }
    return ClassEffectRegistry.instance
  }
  register(classId: string, constructor: EffectConstructor): void {
    this.registry.set(classId, constructor)
  }
  getConstructor(classId: string): EffectConstructor {
    const constructor = this.registry.get(classId)
    if (!constructor) {
      throw new ClassNotRegisteredError(classId)
    }
    return constructor
  }
  hasClass(classId: string): boolean {
    return this.registry.has(classId)
  }
  getAllClassIds(): string[] {
    return Array.from(this.registry.keys())
  }
  clear(): void {
    this.registry.clear()
  }
}
