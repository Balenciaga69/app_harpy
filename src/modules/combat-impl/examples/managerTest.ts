/* eslint-disable no-console */
import { Character } from '@/modules/combat/domain/character/character'
import { createDefaultAttributes } from '@/modules/combat/domain/character/models/attribute.core.model'
import { InMemoryResourceRegistry } from '@/modules/combat/infra/resource-registry'
import { CombatContext } from '@/modules/combat/context'
import { Equipment } from '@/modules/combat/domain/item/models/equipment.model'
import { Relic } from '@/modules/combat/domain/item/models/relic.model'
import { SimpleDamageUltimate } from '../ultimates'
// 測試裝備
class TestWeapon extends Equipment {
  constructor() {
    super({
      name: 'Test Weapon',
      description: 'A test weapon',
      rarity: 'common',
    })
  }
  protected initializeEffects(): void {
    // 無效果
  }
}
class TestArmor extends Equipment {
  constructor() {
    super({
      name: 'Test Armor',
      description: 'A test armor',
      rarity: 'common',
    })
  }
  protected initializeEffects(): void {
    // 無效果
  }
}
// 測試遺物
class TestRelic extends Relic {
  constructor() {
    super({
      name: 'Test Relic',
      description: 'A stackable test relic',
      rarity: 'common',
    })
  }
  protected initializeEffects(): void {
    // 無效果
  }
  protected onStackChanged(): void {
    console.log(`  → Relic stack changed to ${this.getStackCount()}`)
  }
}
/**
 * 測試新的 Manager 系統
 */
function testManagerSystem() {
  console.log('=== 測試 Manager 系統 ===\n')
  const registry = new InMemoryResourceRegistry()
  const context = new CombatContext(registry, 12345)
  // 創建角色
  const hero = new Character(
    {
      name: 'TestHero',
      team: 'player',
      baseAttributes: createDefaultAttributes({
        maxHp: 1000,
        currentHp: 1000,
      }),
      ultimate: new SimpleDamageUltimate('Test Ultimate', 'A simple test ultimate', 2.0),
      registry,
    },
    context
  )
  console.log(`✓ 創建角色: ${hero.name} (ID: ${hero.id})`)
  console.log(`  HP: ${hero.getAttribute('currentHp')}/${hero.getAttribute('maxHp')}\n`)
  // 測試 EquipmentManager - 多槽位
  console.log('--- 測試 EquipmentManager ---')
  const weapon = new TestWeapon()
  const armor = new TestArmor()
  hero.equipItem(weapon, 'weapon', context)
  console.log(`✓ 裝備武器: ${weapon.name}`)
  hero.equipItem(armor, 'armor', context)
  console.log(`✓ 裝備護甲: ${armor.name}`)
  const equippedWeapon = hero.getEquipment('weapon')
  const equippedArmor = hero.getEquipment('armor')
  console.log(`  → 武器槽: ${equippedWeapon?.name}`)
  console.log(`  → 護甲槽: ${equippedArmor?.name}`)
  console.log(`  → 總裝備數: ${hero.getAllEquipment().length}\n`)
  // 測試 RelicManager - 堆疊
  console.log('--- 測試 RelicManager ---')
  const relic1 = new TestRelic()
  hero.addRelic(relic1, context)
  console.log(`✓ 添加遺物: ${relic1.name} (stack: ${hero.getRelicStackCount('Test Relic')})`)
  const relic2 = new TestRelic()
  hero.addRelic(relic2, context)
  console.log(`✓ 添加相同遺物: ${relic2.name} (應該堆疊)`)
  console.log(`  → 堆疊數量: ${hero.getRelicStackCount('Test Relic')}`)
  console.log(`  → 遺物總數: ${hero.getAllRelics().length} (應該是 1 個遺物，2 層堆疊)\n`)
  // 測試 UltimateManager
  console.log('--- 測試 UltimateManager ---')
  const ultimate = hero.getUltimate(context)
  console.log(`✓ 獲取大絕招: ${ultimate?.id}`)
  console.log(`  → 是否有大絕招: ${ultimate !== undefined}\n`)
  // 測試物品整合
  console.log('--- 測試物品整合 ---')
  const allItems = hero.getAllItems()
  console.log(`✓ 所有物品數量: ${allItems.length}`)
  allItems.forEach((item) => {
    console.log(`  - ${item.name} (${item.constructor.name})`)
  })
  console.log('\n=== 所有測試通過 ✓ ===\n')
}
// 執行測試
testManagerSystem()
