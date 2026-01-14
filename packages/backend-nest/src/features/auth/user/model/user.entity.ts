export interface User {
  id: string // ID 是每個使用者的唯一識別碼，通常用於內部資料關聯、資料庫主鍵、日誌追蹤、跨系統同步等場合
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}
