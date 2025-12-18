import { AtAcquisitionInfo } from './AtAcquisitionInfo'

export interface BaseInstanceFields {
  readonly id: string
  readonly templateId: string
  readonly atAcquisition: AtAcquisitionInfo
}

export interface InstanceHasSourceUnit {
  readonly sourceUnitId: string
}
