# EnemyGenerator 模組規格說明

## 簡介

- 負責根據難度係數生成敵人角色實例，包含完整的屬性、裝備和遺物配置
- 支援多敵人隊伍生成和職業標籤偏好設定
- 提供確定性生成機制，確保重播和測試的一致性
- 最後更新時間：2025-12-14

## 輸入與輸出

### 主要輸入

- 敵人生成配置（難度係數、隨機種子、敵人數量、威脅等級範圍）
- 敵人定義列表（職業、屬性範圍、裝備池）
- 物品生成器（用於生成裝備和遺物）
- 角色系統（用於實例化敵人角色）

### 主要輸出

- 敵人實例列表（包含角色實例、裝備、遺物）
- 生成結果狀態（成功/失敗、錯誤訊息）
- 威脅等級資訊（用於UI顯示）

## 元件盤點

### Interfaces 層

- IEnemyDefinition：敵人定義介面，描述敵人的基本屬性和生成規則
- IEnemyGenerationConfig：敵人生成配置介面，定義生成參數和約束條件
- IEnemyInstance：敵人實例介面，包含生成的完整敵人數據結構
- IEnemyGenerator：敵人生成器主要介面，定義生成操作方法

### Domain 層

- EnemyGeneratorError：敵人生成器基礎錯誤類別
- InvalidEnemyConfigError：無效生成配置錯誤
- EnemyGenerationFailedError：生成過程失敗錯誤
- EnemyGeneratorConstants：常數定義，包含生成限制和預設值

### App 層

- EnemyGenerator：敵人生成器實作，負責協調各元件完成敵人生成
- EnemyTemplateSelector：敵人模板選擇器，根據配置選擇合適的敵人模板
- EnemyAttributeScaler：敵人屬性調整器，根據難度係數調整敵人屬性
- EnemyEquipmentGenerator：敵人裝備生成器，負責生成敵人裝備和遺物

## 模組依賴誰或被誰依賴

### 依賴模組

- features/difficulty-scaler：使用難度係數計算，用於調整敵人屬性強度
- features/item-generator：使用物品生成器來生成裝備和遺物實例
- features/character：使用角色系統來實例化敵人角色和獲取職業定義
- game-play/character-manager：使用角色管理器來創建敵人實例

### 被依賴模組

- game-play/combat：使用敵人實例進行戰鬥計算
- game-play/encounter：使用敵人生成器來填充遭遇戰的敵人
- game-play/run：整合敵人生成到遊戲運行流程中

## 核心功能需求

### 敵人實例生成

- 根據難度係數生成敵人角色實例
- 支援單個或多個敵人實例生成
- 確保生成的敵人屬性符合遊戲平衡
- 提供確定性生成結果（使用隨機種子）

### 裝備遺物整合

- 根據難度係數生成敵人裝備和遺物
- 支援職業標籤影響裝備池選擇
- 裝備和遺物與玩家系統完全一致
- 動態調整裝備稀有度和遺物數量

### 職業標籤支援

- 支援根據職業標籤生成敵人
- 職業影響裝備池和屬性偏向
- 提供職業平衡和多樣性控制
- 支援自訂職業偏好設定

### 多樣性控制

- 避免重複生成相同的敵人組合
- 提供多樣化的敵人隊伍配置
- 支援威脅等級範圍控制
- 動態調整生成策略

## 進階需求

### 隨機種子支援

- 使用隨機種子確保生成確定性
- 支援重播和測試環境的一致性
- 種子可選，提供預設隨機行為
- 種子驗證和錯誤處理

### 難度調整機制

- 根據難度係數動態調整敵人屬性
- 支援裝備稀有度概率調整
- 遺物數量和品質隨難度變化
- 屬性強度線性或非線性調整

### 敵人模板系統

- 支援預定義敵人模板
- 模板包含基礎屬性和生成規則
- 支援模板擴充和自訂
- 模板驗證和相容性檢查

### 屬性平衡控制

- 確保敵人屬性符合遊戲設計
- 考慮玩家等級和進度進行平衡
- 提供屬性範圍驗證
- 支援平衡係數調整

## 介面需求

### IEnemyDefinition

- id: string（敵人定義唯一識別碼）
- name: string（敵人名稱）
- classId: string（對應職業ID）
- levelRange: { min: number; max: number }（等級範圍）
- threatLevel: number（威脅等級，1-10）
- tags: string[]（敵人標籤，用於生成邏輯）

### IEnemyGenerationConfig

- difficulty: number（難度係數）
- seed?: string（隨機種子，可選）
- enemyCount: number（敵人數量）
- allowedEnemyIds?: string[]（允許的敵人定義ID列表）
- minThreatLevel?: number（最小威脅等級）
- maxThreatLevel?: number（最大威脅等級）
- classPreferences?: Record<string, number>（職業偏好設定）

### IEnemyInstance

- character: ICharacterInstance（敵人角色實例）
- definitionId: string（敵人定義ID）
- difficulty: number（生成時的難度係數）
- equipmentIds: string[]（裝備實例ID列表）
- relicIds: string[]（遺物實例ID列表）
- threatLevel: number（威脅等級）

### IEnemyGenerator

- generateEnemies(config: IEnemyGenerationConfig): Promise<IEnemyInstance[]>

## 開發者的碎碎念

- EnemyGenerator 是遊戲戰鬥系統的核心，生成品質直接影響遊戲平衡
- 隨機種子支援對於重播系統至關重要，需確保種子管理的可靠性
- 敵人屬性平衡需要仔細調校，避免生成過強或過弱的敵人
- 裝備遺物整合要與玩家系統保持一致，確保公平性
- 多樣性控制是長期遊戲體驗的關鍵，需持續優化生成演算法
- 效能考量：生成過程應儘量高效，避免影響遊戲流暢性
- 測試友好性：支援模擬環境進行大量生成測試和平衡驗證</content>
  <parameter name="filePath">g:\Coding\app_harpy\packages\backend\.github\specs\features\enemy-generator.spec.md
