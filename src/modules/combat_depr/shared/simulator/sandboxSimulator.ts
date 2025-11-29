import { Character } from '../../character/character.model'
import { useCharacterStore } from '../../character/character.store'
import { CombatEngine } from '../../combatEngine/combatEngine'
import { useCombatStatusStore } from '../../combatEngine/combatStatus.store'
import { useCombatLogStore } from '../../combatLog/combatLog.store'
import { useEventStore } from '../../eventCore/event.store'
import { Ticker } from '../../eventCore/ticker'
import { CreateEnemyACharacter, CreatePlayerCharacter } from './createItems'
export function SandboxSimulator() {
  // 1. 清空所有狀態
  useCharacterStore.getState().clear()
  useEventStore.getState().clear()
  useCombatLogStore.getState().clear()
  useCombatStatusStore.getState().setIsCombatOver(false)
  useCombatStatusStore.getState().setWinnerId(null)
  useCombatStatusStore.getState().setSeed(12345)
  // 2. 創建角色實例
  const player = new Character(CreatePlayerCharacter(), 'player')
  const enemyA = new Character(CreateEnemyACharacter(), 'enemyA')
  // 3. 註冊角色
  useCharacterStore.getState().registerCharacter(player)
  useCharacterStore.getState().registerCharacter(enemyA)
  // 4. 啟動戰鬥引擎
  const engine = new CombatEngine()
  engine.setupHandlers()
  // 5. 添加初始攻擊事件
  useEventStore.getState().addNormalEvent({
    type: 'attack',
    tick: player.stats.weapon!.cooldown,
    payload: { attackerId: 'player', targetId: 'enemyA' },
  })
  useEventStore.getState().addNormalEvent({
    type: 'attack',
    tick: enemyA.stats.weapon!.cooldown,
    payload: { attackerId: 'enemyA', targetId: 'player' },
  })
  // 6. 啟動時鐘
  const ticker = new Ticker()
  while (!useCombatStatusStore.getState().isCombatOver) {
    ticker.tick()
    if (useCombatStatusStore.getState().currentTick > 100 * 1000) break // 防止無限循環
  }
  // 7. 輸出結果
  const winnerId = useCombatStatusStore.getState().winnerId
  const combatLogs = useCombatLogStore.getState().getLogs()
  console.info('xZx 戰鬥狀態:', useCombatStatusStore.getState())
  console.info('xZx 角色狀態:', useCharacterStore.getState())
  console.info('xZx 戰鬥日誌:', combatLogs)
  console.info(`戰鬥結束！勝者: ${winnerId}，共記錄 ${combatLogs.length} 條日誌`)
}
