// This file centralizes all the string tokens used for dependency injection.
export const InjectionTokens = {
  ContextBatchRepository: 'IContextBatchRepository',
  ConfigStore: 'CONFIG_STORE',
  AppContext: 'IAppContext',
  ConfigStoreAccessor: 'IConfigStoreAccessor',
  ContextSnapshotAccessor: 'IContextSnapshotAccessor',
  ContextMutator: 'IContextMutator',
  UserRepository: 'IUserRepository',
  AccessTokenRepository: 'IAccessTokenRepository',
  RefreshTokenRepository: 'IRefreshTokenRepository',
  GuestRepository: 'IGuestRepository',
  RunRepository: 'IRunRepository',
  RedisClient: 'REDIS_CLIENT',
} as const
export type InjectionToken = (typeof InjectionTokens)[keyof typeof InjectionTokens]
