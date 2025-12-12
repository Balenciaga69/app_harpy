import type { ICharacter } from '@/app/combat/domain/character'
/**
 * Check if object is ICharacter type
 */
export function isCharacter(entity: unknown): entity is ICharacter {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'getAttribute' in entity &&
    typeof (entity as Record<string, unknown>).getAttribute === 'function'
  )
}
