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

  const mockProfession = { id: 'warrior', name: 'Warrior' } as any // Mock ProfessionEntity
  const mockRelics: any[] = [] // Mock RelicEntity[]
  const mockUltimate = { id: 'ult-id', templateId: 'ult-template' } as any // Mock UltimateEntity

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
})
