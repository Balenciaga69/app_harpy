export type PendingBet = {
  readonly betId: string
  readonly amount: number
  readonly target: string
  readonly status: 'pending' | 'resolved'
  readonly result?: 'won' | 'lost' | 'push'
  readonly payout?: number
}
// TODO: 將 PendingBet 整合到 RunState（包含持久化/序列化），並建立 BetService/BetHandler 以管理下注流程
