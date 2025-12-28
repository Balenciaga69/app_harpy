import { StashRecord } from '../../../../domain/stash/Stash'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface IStashContext extends WithRunIdAndVersion, StashRecord {}
