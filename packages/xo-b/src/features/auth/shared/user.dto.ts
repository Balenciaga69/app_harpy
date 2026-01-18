import { Type } from 'class-transformer'
import { User } from '../user/model/user.entity'
export class UserDto implements User {
  id!: string
  username!: string
  passwordHash!: string
  @Type(() => Date)
  createdAt!: Date
  @Type(() => Date)
  updatedAt!: Date
  isActive!: boolean
}
