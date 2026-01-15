export interface User {
  /** ID is a unique identification code for each user,
   * usually used for internal data association,
   * database primary key, log tracking, cross-system synchronization, etc.
   */
  id: string
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}
