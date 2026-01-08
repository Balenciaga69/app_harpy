import { TagType } from '../../../../../../shared/models/TagType'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
/**
 * 統計已裝備聖物的TAG出現次數
 * 純函數，無副作用
 */
export function countEquippedTagOccurrences(
  configStoreAccessor: IConfigStoreAccessor,
  contextSnapshot: IContextSnapshotAccessor
): Map<TagType, number> {
  const { characterContext } = contextSnapshot.getAllContexts()
  const { itemStore } = configStoreAccessor.getConfigStore()
  const equippedRelicIds = characterContext.relics.filter(Boolean).map((relic) => relic.templateId)
  const relicTemplates = itemStore.getManyItems(equippedRelicIds)
  const tagCounts = new Map<TagType, number>()
  for (const relic of relicTemplates) {
    for (const tag of relic.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  return tagCounts
}
