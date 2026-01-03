/**
 * CooldownManager
 *
 * Manages attack cooldowns for characters.
 */
export class CooldownManager {
  private nextAttackTick: Map<string, number> = new Map()
  /** Check if character can attack */
  canAttack(characterId: string, currentTick: number, cooldown: number, rng: () => number): boolean {
    const nextAttack = this.nextAttackTick.get(characterId)
    if (nextAttack === undefined) {
      const randomDelay = Math.floor(rng() * cooldown)
      this.nextAttackTick.set(characterId, currentTick + randomDelay)
      return false
    }
    return currentTick >= nextAttack
  }
  /** Update cooldown after attack */
  updateCooldown(characterId: string, currentTick: number, cooldown: number): void {
    const nextAttack = currentTick + cooldown
    this.nextAttackTick.set(characterId, nextAttack)
  }
  /** Clear all cooldowns */
  clear(): void {
    this.nextAttackTick.clear()
  }
}
