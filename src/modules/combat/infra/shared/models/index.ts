/**
 * Infra Shared Models
 *
 * 這裡存放純資料模型 (Data Models)
 * - 不包含業務邏輯
 * - 不包含行為方法
 * - 可以被任何層級安全引用
 * - 主要用於資料傳遞、序列化、快照等
 */
export * from './entity.types'
export * from './snapshot.model'
