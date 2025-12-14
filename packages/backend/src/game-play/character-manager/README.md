# CharacterManager 使用範例

## 基本概念

CharacterManager 負責角色實例的完整生命週期管理，包含創建、載入、儲存、選擇和面板數據整合。

## 架構概覽

- **interfaces/**: 所有介面定義
- **domain/**: 錯誤類別與常數
- **app/**: 核心業務邏輯實作
- **infra/**: 基礎設施實作（儲存等）

## 依賴注入範例

```typescript
import mitt from 'mitt'
import {
  CharacterManager,
  CharacterInstanceFactory,
  CharacterPanelCalculator,
  InMemoryCharacterStorage,
  type ICharacterManagerEvents,
} from './character-manager'

// 建立事件匯流排
const eventBus = mitt<ICharacterManagerEvents>()

// 建立儲存實例
const storage = new InMemoryCharacterStorage()

// 建立工廠依賴
const getCharacterDefinition = async (definitionId: string) => {
  // TODO: 從 Character 模組獲取定義
  return { id: definitionId, name: 'Warrior', className: 'Warrior' }
}

const createInventory = async () => {
  // TODO: 從 Inventory 模組創建背包
  return 'inventory-id-' + Date.now()
}

// 建立實例工廠
const instanceFactory = new CharacterInstanceFactory(getCharacterDefinition, createInventory)

// 建立面板計算器依賴
const getInventoryData = async (inventoryId: string) => {
  // TODO: 從 Inventory 模組獲取背包數據
  return { id: inventoryId, equipment: {}, relics: [] }
}

const calculateAttributes = async (characterId: string) => {
  // TODO: 從 AttributeCalculator 計算屬性
  return {}
}

// 建立面板計算器
const panelCalculator = new CharacterPanelCalculator(
  storage,
  getCharacterDefinition,
  getInventoryData,
  calculateAttributes
)

// 建立可用定義列表提供者
const getAvailableDefinitions = () => {
  // TODO: 從 Character 模組獲取所有可用定義
  return [
    { id: 'warrior', name: 'Warrior' },
    { id: 'mage', name: 'Mage' },
  ]
}

// 建立角色管理器
const characterManager = new CharacterManager(
  storage,
  instanceFactory,
  panelCalculator,
  eventBus,
  getAvailableDefinitions
)
```

## 使用範例

### 創建角色

```typescript
const character = await characterManager.createCharacter('warrior')
console.log('角色已創建:', character.id)
```

### 載入角色

```typescript
const character = await characterManager.loadCharacter('character-id')
console.log('角色已載入:', character.definitionId)
```

### 選擇角色

```typescript
const result = await characterManager.selectCharacter('character-id')
if (result.success) {
  console.log('角色已選擇:', result.character?.id)
} else {
  console.error('選擇失敗:', result.errorMessage)
}
```

### 獲取角色面板

```typescript
const panel = await characterManager.getCharacterPanel('character-id')
console.log('角色資訊:', panel.basicInfo)
console.log('角色屬性:', panel.attributes)
console.log('裝備:', panel.equipment)
console.log('遺物:', panel.relics)
```

### 監聽事件

```typescript
eventBus.on('character:created', ({ character }) => {
  console.log('角色創建事件:', character.id)
})

eventBus.on('character:selected', ({ character }) => {
  console.log('角色選擇事件:', character.id)
})

eventBus.on('character:updated', ({ characterId }) => {
  console.log('角色更新事件:', characterId)
})
```

## 錯誤處理

```typescript
import {
  CharacterNotFoundError,
  CharacterDefinitionNotFoundError,
  InvalidCharacterStateError,
} from './character-manager'

try {
  await characterManager.loadCharacter('non-existent-id')
} catch (error) {
  if (error instanceof CharacterNotFoundError) {
    console.error('角色不存在')
  } else if (error instanceof CharacterDefinitionNotFoundError) {
    console.error('角色定義不存在')
  } else if (error instanceof InvalidCharacterStateError) {
    console.error('無效的角色狀態')
  }
}
```

## 待完成項目

- Character 模組完成後，更新 `extractBaseAttributes` 方法
- Inventory 模組完成後，更新面板數據的裝備與遺物部分
- CharacterSheet 模組完成後，整合屬性計算
- PersistentStorage 完成後，替換 InMemoryCharacterStorage

## 注意事項

1. CharacterManager 是無狀態的，所有狀態都存在 Storage 中
2. 所有實作透過建構子注入，遵循依賴反轉原則
3. 事件驅動架構，便於其他模組監聽角色變更
4. InMemoryCharacterStorage 僅供開發測試使用，生產環境需使用持久化儲存
