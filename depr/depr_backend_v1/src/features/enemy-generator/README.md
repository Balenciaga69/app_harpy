# EnemyGenerator 模組

## 簡介

EnemyGenerator 是一個純運算模組，負責根據難度係數生成敵人角色實例，包含完整的屬性、裝備和遺物配置。

## 核心功能

- 根據難度係數生成敵人實例
- 支援多敵人隊伍生成
- 職業標籤偏好設定
- 隨機種子支援（確保可重現性）
- 威脅等級範圍控制
- 裝備與遺物自動生成

## 架構

`
enemy-generator/
 interfaces/     # 介面定義
 domain/         # 領域層（錯誤與常數）
 app/            # 應用層實作
`

## 使用範例

`	ypescript
import { 
  EnemyGenerator, 
  EnemyDefinitionRegistry 
} from './features/enemy-generator'

// 建立註冊表並註冊敵人定義
const registry = new EnemyDefinitionRegistry()
registry.register({
  id: 'goblin',
  name: 'Goblin Warrior',
  classId: 'warrior',
  levelRange: { min: 1, max: 5 },
  threatLevel: 3,
  tags: ['common', 'melee'],
})

// 建立生成器
const generator = new EnemyGenerator(
  registry,
  characterFactory,
  itemGenerator,
)

// 生成敵人
const enemies = await generator.generateEnemies({
  difficulty: 5.0,
  seed: 'test-seed-123',
  enemyCount: 3,
  minThreatLevel: 2,
  maxThreatLevel: 5,
})

console.log(`Generated ${enemies.length} enemies`)
`

## 依賴模組

- game-play/character-manager: 角色實例創建
- eatures/item-generator: 裝備與遺物生成
- seedrandom: 隨機數生成
- 
anoid: 唯一ID生成

## 設計原則

- 純運算模組，不共享 EventBus
- 無狀態設計，支援水平擴展
- 實作透過介面注入，遵循依賴反轉
- 使用隨機種子確保可重現性
- 一個檔案一個類別/介面

## 待完成項目

- 完整整合 ItemGenerator 生成裝備與遺物
- 實作屬性調整邏輯（EnemyAttributeScaler）
- 新增更多敵人模板
- 效能優化（批次生成）

## 注意事項

1. 所有生成結果應該是確定性的（使用相同種子）
2. 威脅等級範圍為 1-10
3. 敵人數量範圍為 1-10
4. 難度係數必須為非負數
5. 裝備和遺物數量隨難度係數增加
