import { RelicEntity, RelicRecord, RelicTemplate } from '../../item/Item'
import { ProfessionEntity, ProfessionTemplate } from '../../profession/Profession'
import { UltimateEntity, UltimateRecord, UltimateTemplate } from '../../ultimate/Ultimate'
import { Character, CharacterRecord } from '../Character'
describe('Character', () => {
  const mockRecord: CharacterRecord = {
    id: 'test-id',
    name: 'TestChar',
    professionId: 'warrior',
    gold: 100,
    relics: [],
    ultimate: {
      id: 'ult-id',
      templateId: 'ult-template',
      pluginAffixRecord: [],
      sourceUnitId: 'unit-1',
      atCreated: { chapter: 1, stage: 1, difficulty: 1 },
    },
    loadCapacity: 50,
    currentLoad: 10,
  }
  const mockProfessionTemplate: ProfessionTemplate = {
    id: 'WARRIOR',
    name: 'Warrior' as any,
    desc: 'desc' as any,
    startUltimateIds: [],
    startRelicIds: [],
  }
  const mockProfession = new ProfessionEntity('warrior', mockProfessionTemplate, [], [])
  const mockRelicTemplate: RelicTemplate = {
    id: 'relic-1',
    name: 'Relic1' as any,
    desc: 'desc' as any,
    itemType: 'RELIC',
    rarity: 'COMMON',
    affixIds: [],
    tags: [],
    loadCost: 5,
    maxStacks: 2,
  }
  const mockRelicRecord: RelicRecord = {
    id: 'relic-1',
    itemType: 'RELIC',
    affixRecords: [],
    atCreated: { chapter: 1, stage: 1, difficulty: 1 },
    templateId: 'relic-1',
  }
  const mockRelic = new RelicEntity(mockRelicRecord, mockRelicTemplate, [])
  const mockRelic2Template: RelicTemplate = {
    id: 'relic-2',
    name: 'Relic2' as any,
    desc: 'desc' as any,
    itemType: 'RELIC',
    rarity: 'COMMON',
    affixIds: [],
    tags: [],
    loadCost: 60,
    maxStacks: 1,
  }
  const mockRelic2Record: RelicRecord = {
    id: 'relic-2',
    itemType: 'RELIC',
    affixRecords: [],
    atCreated: { chapter: 1, stage: 1, difficulty: 1 },
    templateId: 'relic-2',
  }
  const mockRelic2 = new RelicEntity(mockRelic2Record, mockRelic2Template, [])
  const mockRelics: ReadonlyArray<RelicEntity> = [mockRelic]
  const mockUltimateTemplate: UltimateTemplate = {
    id: 'ult-template',
    name: 'Ultimate' as any,
    desc: 'desc' as any,
    tags: [],
    energyCost: 0,
  }
  const mockUltimateRecord: UltimateRecord = {
    id: 'ult-id',
    atCreated: { chapter: 1, stage: 1, difficulty: 1 },
    sourceUnitId: 'unit-1',
    pluginAffixRecord: [],
    templateId: 'ult-template',
  }
  const mockUltimate = new UltimateEntity(mockUltimateRecord, mockUltimateTemplate, [])
  it('能正確建立角色並注入所有依賴', () => {
    const char = new Character(mockRecord, mockProfession, mockRelics, mockUltimate)
    expect(char.record).toBe(mockRecord)
    expect(char.profession).toBe(mockProfession)
    expect(char.relics).toEqual(mockRelics)
    expect(char.ultimate).toBe(mockUltimate)
  })
  it('能透過 getter 取得正確的角色資料', () => {
    const char = new Character(mockRecord, mockProfession, mockRelics, mockUltimate)
    expect(char.record.id).toBe('test-id')
    expect(char.record.name).toBe('TestChar')
  })
  it('能正確處理空的 relics 陣列', () => {
    const char = new Character(mockRecord, mockProfession, [], mockUltimate)
    expect(char.relics).toEqual([])
  })
  describe('角色行為方法', () => {
    it('能正確裝備聖物', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      const result = char.equipRelic(mockRelic)
      expect(result.isSuccess).toBe(true)
      expect(result.value?.relics.length).toBe(1)
    })
    it('裝備聖物時負重超載應失敗', () => {
      const overloadedChar = new Character({ ...mockRecord, currentLoad: 50 }, mockProfession, [], mockUltimate)
      const result = overloadedChar.equipRelic(mockRelic2)
      expect(result.isFailure).toBe(true)
    })
    it('裝備聖物時堆疊已滿應失敗', () => {
      const char = new Character(
        { ...mockRecord, relics: [mockRelic.record, mockRelic.record], currentLoad: mockRelic.template.loadCost * 2 },
        mockProfession,
        [mockRelic, mockRelic],
        mockUltimate
      )
      const result = char.equipRelic(mockRelic)
      expect(result.isFailure).toBe(true)
    })
    it('能正確卸下聖物', () => {
      const char = new Character(
        { ...mockRecord, relics: [mockRelic.record], currentLoad: mockRelic.template.loadCost },
        mockProfession,
        [mockRelic],
        mockUltimate
      )
      const result = char.unequipRelic('relic-1')
      expect(result.isSuccess).toBe(true)
      expect(result.value?.relics.length).toBe(0)
    })
    it('卸下不存在的聖物應失敗', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      const result = char.unequipRelic('not-exist')
      expect(result.isFailure).toBe(true)
    })
    it('能正確擴展負重容量', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      const result = char.expandLoadCapacity(10)
      expect(result.isSuccess).toBe(true)
      expect(result.value?.record.loadCapacity).toBe(60)
    })
    it('擴展負重容量為零或負數應失敗', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      expect(char.expandLoadCapacity(0).isFailure).toBe(true)
      expect(char.expandLoadCapacity(-5).isFailure).toBe(true)
    })
    it('能正確扣除金錢', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      const result = char.deductGold(50)
      expect(result.isSuccess).toBe(true)
      expect(result.value?.record.gold).toBe(50)
    })
    it('扣除金錢不足應失敗', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      const result = char.deductGold(200)
      expect(result.isFailure).toBe(true)
    })
    it('能正確增加金錢', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      const result = char.addGold(50)
      expect(result.isSuccess).toBe(true)
      expect(result.value?.record.gold).toBe(150)
    })
    it('能正確取得聖物', () => {
      const char = new Character(mockRecord, mockProfession, [mockRelic], mockUltimate)
      const result = char.getRelic('relic-1')
      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(mockRelic)
    })
    it('取得不存在聖物應失敗', () => {
      const char = new Character(mockRecord, mockProfession, [], mockUltimate)
      const result = char.getRelic('not-exist')
      expect(result.isFailure).toBe(true)
    })
    it('能正確判斷負重超載', () => {
      const char = new Character({ ...mockRecord, currentLoad: 50 }, mockProfession, [], mockUltimate)
      expect(char.isOverloaded(1)).toBe(true)
      expect(char.isOverloaded(0)).toBe(false)
    })
    it('能正確取得聖物堆疊數', () => {
      const char = new Character(
        { ...mockRecord, relics: [mockRelic.record, mockRelic.record], currentLoad: mockRelic.template.loadCost * 2 },
        mockProfession,
        [mockRelic, mockRelic],
        mockUltimate
      )
      expect(char.getCurrentStack('relic-1')).toBe(2)
      expect(char.getCurrentStack('relic-2')).toBe(0)
    })
    it('能正確計算 currentLoad', () => {
      const char = new Character(
        {
          ...mockRecord,
          relics: [mockRelic.record, mockRelic2.record],
          currentLoad: mockRelic.template.loadCost + mockRelic2.template.loadCost,
        },
        mockProfession,
        [mockRelic, mockRelic2],
        mockUltimate
      )
      expect(char.currentLoad).toBe(5 + 60)
    })
  })
})
