# EnemyGenerator 模組

## 簡介

- 負責根據難度生成敵人實例，包括：
  - 基於定義創建敵人角色實例。
  - 自動生成裝備和遺物。
  - 支援多敵人隊伍生成。
- 支援隨機種子確保可重現性。
- 最後更新時間：2025-12-14。

## 輸入與輸出

### 主要輸入

- IEnemyGenerationConfig：生成配置，包含難度、敵人數量、種子和偏好設定。

### 主要輸出

- IEnemyInstance[]：生成的敵人實例陣列，包含角色、裝備和遺物。

## 元件盤點

- EnemyGenerator：核心生成器，處理敵人實例的創建邏輯。
- EnemyDefinitionRegistry：敵人定義註冊表，管理敵人模板。
- 錯誤類別：EnemyGenerationFailedError、InvalidEnemyConfigError 等，處理生成異常。
- 常數與介面：EnemyGeneratorConstants 等，定義限制和預設值。

## 模組依賴誰?或被誰依賴?

- EnemyGenerator 模組依賴 game-play/character-manager 模組的角色實例工廠，features/item-generator 模組的物品生成，以及 seedrandom 和 nanoid 庫。
- EnemyGenerator 模組被 combat 模組依賴，用於戰鬥敵人生成。
