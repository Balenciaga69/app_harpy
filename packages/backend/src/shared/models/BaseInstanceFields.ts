import { AtCreatedInfo } from './AtCreatedInfo'

export interface BaseInstanceFields {
  readonly id: string
  readonly templateId: string
}

export interface WithCreatedAt {
  readonly atCreated: AtCreatedInfo
}

export interface WithSourceUnit {
  readonly sourceUnitId: string
}
