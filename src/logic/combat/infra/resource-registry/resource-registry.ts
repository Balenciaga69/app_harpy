/**
 * Resource Registry Interface
 *
 * Central catalog for tracking and looking up game resources.
 * The registry only provides global lookup capability.
 *
 * Use cases:
 * - Cross-system resource queries (e.g., debugging, analytics)
 * - Avoiding duplicate registration
 * - Centralized resource lifecycle tracking
 *
 * Design: Uses 'unknown' type to avoid circular dependencies with domain models.
 * The actual implementation will handle type safety internally.
 *
 * Note: Equipment/Relic 已改為由 EquipmentManager/RelicManager 直接管理，
 * 不再需要透過 ResourceRegistry 追蹤。
 */
export interface IResourceRegistry {
  // === Character Catalog ===
  // Characters are registered when added to combat context
  registerCharacter(character: unknown): void
  unregisterCharacter(id: string): void
  getCharacter(id: string): unknown | undefined
  hasCharacter(id: string): boolean
  // === Effect Tracking ===
  // Effects are owned by Characters, registry only tracks for global queries
  registerEffect(effect: unknown): void
  unregisterEffect(id: string): void
  getEffect(id: string): unknown | undefined
  hasEffect(id: string): boolean
  // === Ultimate Catalog ===
  // Ultimates are typically stateless and can be shared
  registerUltimate(ultimate: unknown): void
  getUltimate(id: string): unknown | undefined
  hasUltimate(id: string): boolean
  // === Lifecycle ===
  /** Clear all registered resources (typically called after combat ends) */
  clear(): void
}
