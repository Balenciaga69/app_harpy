import type { ICharacter } from '../../character'
/**
 * 檢查物件是否為 ICharacter 類型
 */
export function isCharacter(entity: unknown): entity is ICharacter {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'getAttribute' in entity &&
    typeof (entity as Record<string, unknown>).getAttribute === 'function'
  )
}
