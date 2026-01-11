import { DomainErrorCode } from '../../../shared/result/ErrorCodes'
import { ItemRollRarityModifier } from '../../item/roll/ItemRollModifier'
import { IRunFields, Run } from '../Run'
import { ChapterInfo, RunStatus } from '../RunTypes'
describe('Run', () => {
  const createTestChapterInfo = (): ChapterInfo => ({
    stageNodes: {
      1: { nodeType: 'COMBAT' } as any,
      2: { nodeType: 'COMBAT' } as any,
    },
  })
  const createTestModifier = (): ItemRollRarityModifier => ({
    type: 'RARITY',
    rarity: 'COMMON',
    multiplier: 1.5,
    durationStages: 1,
  })
  const createTestRun = (overrides?: Partial<IRunFields>): Run => {
    const baseFields: IRunFields = {
      seed: 12345,
      currentChapter: 1,
      currentStage: 1,
      encounteredEnemyIds: [],
      chapters: {
        1: createTestChapterInfo(),
        2: createTestChapterInfo(),
        3: createTestChapterInfo(),
      },
      rollModifiers: [],
      remainingFailRetries: 3,
      status: 'IDLE',
      ...overrides,
    }
    return new Run(baseFields)
  }
  describe('基礎建構與取值', () => {
    it('應能正確建立 Run 實體', () => {
      const run = createTestRun()
      expect(run.seed).toBe(12345)
      expect(run.currentChapter).toBe(1)
      expect(run.currentStage).toBe(1)
      expect(run.remainingFailRetries).toBe(3)
      expect(run.status).toBe('IDLE')
    })
    it('encounteredEnemyIds 應回傳新陣列副本', () => {
      const run = createTestRun({ encounteredEnemyIds: ['enemy-1'] })
      const ids1 = run.encounteredEnemyIds
      const ids2 = run.encounteredEnemyIds
      expect(ids1).toEqual(ids2)
      expect(ids1).not.toBe(ids2)
    })
    it('rollModifiers 應回傳新陣列副本', () => {
      const modifier = createTestModifier()
      const run = createTestRun({ rollModifiers: [modifier] })
      const mods1 = run.rollModifiers
      const mods2 = run.rollModifiers
      expect(mods1).toEqual(mods2)
      expect(mods1).not.toBe(mods2)
    })
  })
  describe('deductRetry', () => {
    it('進行中 Run 且重試次數充足時應成功', () => {
      const run = createTestRun({ status: 'IDLE', remainingFailRetries: 3 })
      const result = run.deductRetry()
      expect(result.isSuccess).toBe(true)
      expect(result.value?.remainingFailRetries).toBe(2)
    })
    it('重試次數為 0 時應失敗', () => {
      const run = createTestRun({ status: 'IDLE', remainingFailRetries: 0 })
      const result = run.deductRetry()
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_重試次數不足)
    })
    it('Run 已結束時應失敗（即使重試次數充足）', () => {
      const run = createTestRun({ status: 'COMPLETED', remainingFailRetries: 3 })
      const result = run.deductRetry()
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('已結束狀態檢查優先於重試次數檢查', () => {
      const run = createTestRun({ status: 'COMPLETED', remainingFailRetries: 0 })
      const result = run.deductRetry()
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
  })
  describe('advanceToNextStage', () => {
    it('進行中 Run 且關卡數有效時應成功', () => {
      const run = createTestRun({ status: 'IDLE', currentStage: 1 })
      const result = run.advanceToNextStage(2)
      expect(result.isSuccess).toBe(true)
      expect(result.value?.currentStage).toBe(2)
    })
    it('目標關卡小於等於當前關卡時應失敗', () => {
      const run = createTestRun({ status: 'IDLE', currentStage: 5 })
      const result = run.advanceToNextStage(5)
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_無法前進到相同或較早關卡)
    })
    it('目標關卡低於當前關卡時應失敗', () => {
      const run = createTestRun({ status: 'IDLE', currentStage: 5 })
      const result = run.advanceToNextStage(3)
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_無法前進到相同或較早關卡)
    })
    it('Run 已結束時應失敗', () => {
      const run = createTestRun({ status: 'COMPLETED', currentStage: 5 })
      const result = run.advanceToNextStage(6)
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('已結束狀態檢查優先於關卡檢查', () => {
      const run = createTestRun({ status: 'COMPLETED', currentStage: 5 })
      const result = run.advanceToNextStage(5)
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
  })
  describe('changeStatus', () => {
    it('進行中 Run 應能改變狀態', () => {
      const run = createTestRun({ status: 'IDLE' })
      const result = run.changeStatus('IN_COMBAT')
      expect(result.isSuccess).toBe(true)
      expect(result.value?.status).toBe('IN_COMBAT')
    })
    it('Run 已結束時應失敗', () => {
      const run = createTestRun({ status: 'COMPLETED' })
      const result = run.changeStatus('IN_COMBAT')
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('從 COMPLETED 轉換任何狀態都應失敗', () => {
      const statuses: RunStatus[] = ['IDLE', 'PRE_COMBAT', 'IN_COMBAT', 'POST_COMBAT']
      statuses.forEach((status) => {
        const run = createTestRun({ status: 'COMPLETED' })
        const result = run.changeStatus(status)
        expect(result.isFailure).toBe(true)
        expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
      })
    })
  })
  describe('addEncounteredEnemy', () => {
    it('進行中 Run 且敵人未遭遇時應成功', () => {
      const run = createTestRun({ status: 'IDLE', encounteredEnemyIds: [] })
      const result = run.addEncounteredEnemy('enemy-1')
      expect(result.isSuccess).toBe(true)
      expect(result.value?.encounteredEnemyIds).toContain('enemy-1')
    })
    it('敵人已遭遇時應失敗', () => {
      const run = createTestRun({ status: 'IDLE', encounteredEnemyIds: ['enemy-1'] })
      const result = run.addEncounteredEnemy('enemy-1')
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_敵人已遭遇過)
    })
    it('Run 已結束時應失敗', () => {
      const run = createTestRun({ status: 'COMPLETED', encounteredEnemyIds: [] })
      const result = run.addEncounteredEnemy('enemy-1')
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('已結束狀態檢查優先於敵人遭遇檢查', () => {
      const run = createTestRun({ status: 'COMPLETED', encounteredEnemyIds: ['enemy-1'] })
      const result = run.addEncounteredEnemy('enemy-1')
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('應能新增多個未遭遇的敵人', () => {
      const run = createTestRun({ status: 'IDLE', encounteredEnemyIds: ['enemy-1'] })
      const result1 = run.addEncounteredEnemy('enemy-2')
      expect(result1.isSuccess).toBe(true)
      const result2 = result1.value?.addEncounteredEnemy('enemy-3')
      expect(result2?.isSuccess).toBe(true)
      expect(result2?.value?.encounteredEnemyIds).toEqual(['enemy-1', 'enemy-2', 'enemy-3'])
    })
  })
  describe('addRollModifier', () => {
    it('進行中 Run 應能新增 Modifier', () => {
      const modifier = createTestModifier()
      const run = createTestRun({ status: 'IDLE', rollModifiers: [] })
      const result = run.addRollModifier(modifier)
      expect(result.isSuccess).toBe(true)
      expect(result.value?.rollModifiers).toContain(modifier)
    })
    it('Run 已結束時應失敗', () => {
      const modifier = createTestModifier()
      const run = createTestRun({ status: 'COMPLETED', rollModifiers: [] })
      const result = run.addRollModifier(modifier)
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('應能新增多個 Modifier', () => {
      const mod1 = createTestModifier()
      const mod2: ItemRollRarityModifier = {
        type: 'RARITY',
        rarity: 'RARE',
        multiplier: 2.0,
        durationStages: 1,
      }
      const run = createTestRun({ status: 'IDLE', rollModifiers: [mod1] })
      const result = run.addRollModifier(mod2)
      expect(result.isSuccess).toBe(true)
      expect(result.value?.rollModifiers).toHaveLength(2)
      expect(result.value?.rollModifiers).toContain(mod2)
    })
  })
  describe('endRun', () => {
    it('進行中 Run 應能結束', () => {
      const run = createTestRun({ status: 'IN_COMBAT' })
      const result = run.endRun()
      expect(result.isSuccess).toBe(true)
      expect(result.value?.status).toBe('COMPLETED')
    })
    it('Run 已結束時應失敗', () => {
      const run = createTestRun({ status: 'COMPLETED' })
      const result = run.endRun()
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('從任何非 COMPLETED 狀態都能結束', () => {
      const statuses: RunStatus[] = ['IDLE', 'PRE_COMBAT', 'IN_COMBAT', 'POST_COMBAT']
      statuses.forEach((status) => {
        const run = createTestRun({ status })
        const result = run.endRun()
        expect(result.isSuccess).toBe(true)
        expect(result.value?.status).toBe('COMPLETED')
      })
    })
  })
  describe('不可變性', () => {
    it('修改後應回傳新 Run 實例', () => {
      const originalRun = createTestRun({ remainingFailRetries: 3 })
      const modifiedResult = originalRun.deductRetry()
      expect(modifiedResult.isSuccess).toBe(true)
      const modifiedRun = modifiedResult.value
      expect(modifiedRun).not.toBe(originalRun)
      expect(originalRun.remainingFailRetries).toBe(3)
      expect(modifiedRun?.remainingFailRetries).toBe(2)
    })
    it('原 Run 狀態應不受影響', () => {
      const run = createTestRun({ status: 'IDLE', currentStage: 5 })
      run.advanceToNextStage(6)
      expect(run.currentStage).toBe(5)
    })
  })
  describe('複合場景', () => {
    it('完整的遊戲流程應正常運作', () => {
      let run = createTestRun({ status: 'IDLE', remainingFailRetries: 2 })
      const addEnemyResult = run.addEncounteredEnemy('boss-1')
      expect(addEnemyResult.isSuccess).toBe(true)
      run = addEnemyResult.value!
      const changeStatusResult = run.changeStatus('IN_COMBAT')
      expect(changeStatusResult.isSuccess).toBe(true)
      run = changeStatusResult.value!
      const endRunResult = run.endRun()
      expect(endRunResult.isSuccess).toBe(true)
      run = endRunResult.value!
      const modifyEndedResult = run.addEncounteredEnemy('boss-2')
      expect(modifyEndedResult.isFailure).toBe(true)
      expect(modifyEndedResult.error).toBe(DomainErrorCode.Run_已結束無法更改)
    })
    it('所有修改方法都應在 Run 結束後失敗', () => {
      const endedRun = createTestRun({ status: 'COMPLETED' })
      const modifier = createTestModifier()
      expect(endedRun.deductRetry().isFailure).toBe(true)
      expect(endedRun.advanceToNextStage(2).isFailure).toBe(true)
      expect(endedRun.changeStatus('IDLE').isFailure).toBe(true)
      expect(endedRun.addEncounteredEnemy('enemy').isFailure).toBe(true)
      expect(endedRun.addRollModifier(modifier).isFailure).toBe(true)
      expect(endedRun.endRun().isFailure).toBe(true)
    })
  })
})
