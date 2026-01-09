import { RelicRecord } from '../../../../domain/item/Item'
import { UltimateRecord } from '../../../../domain/ultimate/Ultimate'
import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { AffixRecordCreateParams, AffixRecordFactory } from '../../../content-generation/factory/AffixFactory'
import { RelicRecordFactory } from '../../../content-generation/factory/RelicFactory'
import { UltimateRecordFactory } from '../../../content-generation/factory/UltimateFactory'
import { IRunExternalAdapter } from './RunExternalAdapter'
import type { RunInitializationParams } from './RunInitializationService'
export function resolveStartingRelicIds(
  startRelicIds: ReadonlyArray<string>,
  requestedRelics?: string[] | undefined
): Result<string[], ApplicationErrorCode.初始化_起始聖物無效 | ApplicationErrorCode.初始化_起始聖物只能選一個> {
  if (!requestedRelics || requestedRelics.length === 0) {
    return Result.success([...startRelicIds])
  }
  if (requestedRelics.length > 1) return Result.fail(ApplicationErrorCode.初始化_起始聖物只能選一個)
  const allowed = new Set(startRelicIds)
  for (const id of requestedRelics) {
    if (!allowed.has(id)) return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
  }
  return Result.success(requestedRelics)
}
export function createRelicRecordsForInitialization(
  startingRelicIds: string[],
  external: IRunExternalAdapter,
  characterId: string
): Result<RelicRecord[], ApplicationErrorCode.初始化_起始聖物無效> {
  if (!startingRelicIds || startingRelicIds.length === 0) return Result.success([])
  const relicTemplates = startingRelicIds
    .map((id) => external.getRelic(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
  if (relicTemplates.length === 0) return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
  const affixIds = relicTemplates.flatMap((template) => template.affixIds ?? [])
  const initialAffixData: AffixRecordCreateParams = {
    atCreated: { chapter: 1, stage: 1, difficulty: DifficultyHelper.getDifficultyFactor(1, 1) },
    difficulty: DifficultyHelper.getDifficultyFactor(1, 1),
    sourceUnitId: characterId,
  }
  const affixRecords = AffixRecordFactory.createMany(affixIds, initialAffixData)
  const relicRecords = RelicRecordFactory.createMany(startingRelicIds, {
    ...initialAffixData,
    affixRecords,
  })
  return Result.success(relicRecords)
}
export function createUltimateRecordForInitialization(
  params: RunInitializationParams,
  profession: ReturnType<IRunExternalAdapter['getProfession']>,
  external: IRunExternalAdapter,
  characterId: string
): Result<UltimateRecord, ApplicationErrorCode.初始化_起始大絕招無效> {
  const startUltimateIds = profession?.startUltimateIds ?? []
  if (!startUltimateIds || startUltimateIds.length === 0) {
    return Result.fail(ApplicationErrorCode.初始化_起始大絕招無效)
  }
  const ultimateId = params.startingUltimateId ?? startUltimateIds[0]
  const ultimateTemplate = external.getUltimate(ultimateId)
  if (!ultimateTemplate) {
    return Result.fail(ApplicationErrorCode.初始化_起始大絕招無效)
  }
  const initialAffixData: AffixRecordCreateParams = {
    atCreated: { chapter: 1, stage: 1, difficulty: DifficultyHelper.getDifficultyFactor(1, 1) },
    difficulty: DifficultyHelper.getDifficultyFactor(1, 1),
    sourceUnitId: characterId,
  }
  const ultimateRecord = UltimateRecordFactory.createOne(ultimateId, {
    ...initialAffixData,
  })
  return Result.success(ultimateRecord)
}
