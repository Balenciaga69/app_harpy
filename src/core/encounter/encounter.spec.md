# Encounter 模組規格書 非常高的機率會refactor,因為這是一個初步的參考而已)

## 一、目標功能與範圍

### 核心目標

管理 RogueLite 遊戲中的關卡結構與遭遇生成，包含路線選擇、房間類型、敵人配置等。

### 會實現的功能

- 章節地圖生成（每 10 關為一個章節）
- 路線分歧與選擇（2～3 條路線）
- 房間類型定義與生成
- 敵人遭遇配置
- 事件遭遇生成
- Boss 關卡配置（第 5 關中型 Boss、第 10 關大型 Boss）
- 難度係數計算 (獨立功能與模組)
- 無盡模式支援（30 關後）

### 不會實現的功能

- 戰鬥執行（由 Combat 模組負責）
- 角色/敵人數值生成（由 Creature 模組負責）
- 裝備/遺物生成（由 Equipment/Reward 模組負責）
- 關卡流程控制（由 Run 模組負責）
- 商店邏輯（由 Shop 模組負責）
- 存讀檔（由 PersistentStorage 模組負責）

---

## 二、架構與元件關係

### 入口層

- `EncounterGenerator`：Facade，生成指定關卡的遭遇資料

### 地圖生成

- `ChapterMapBuilder`：建立章節地圖結構
- `PathBranchGenerator`：生成路線分歧節點
- `NodeTypeResolver`：決定每個節點的房間類型

### 房間類型

- `EnemyRoom`：一般敵人遭遇
- `EliteRoom`：菁英敵人遭遇（更強、更好獎勵）
- `EventRoom`：隨機事件（正面/正負抉擇）
- `MiniBossRoom`：中型 Boss（第 5 關）
- `BossRoom`：大型 Boss（第 10 關）

### 敵人配置

- `EnemyPoolSelector`：根據章節/難度選擇敵人池
- `EnemyFormationBuilder`：組建敵人隊伍配置

### 事件系統

- `EventPoolSelector`：根據進度選擇事件池
- `EventResolver`：解析事件選項與結果

### 難度調整

- `DifficultyScaler`：計算當前難度係數
- 無盡模式：30 關後難度持續線性成長

---

## 三、對外暴露的主要功能

### EncounterGenerator API

```
EncounterGenerator(config: EncounterConfig)
  .generateChapter(chapterIndex: number): ChapterMap
  .generateRoom(floor: number, nodeId: string): RoomData
```

### EncounterConfig 輸入

- `seed: string` — 隨機種子（確保可重現）
- `currentFloor: number` — 當前關卡數

### ChapterMap 輸出

- `chapterIndex: number` — 章節編號（0 起始）
- `nodes: MapNode[]` — 所有節點
- `paths: PathConnection[]` — 路線連結
- `startNodes: string[]` — 起始可選節點
- `bossNode: string` — Boss 節點 ID

### MapNode 結構

- `id: string` — 節點唯一識別
- `floor: number` — 所在層數（1～10）
- `type: RoomType` — 房間類型
- `isVisited: boolean` — 是否已造訪

### RoomType 枚舉

- `enemy` — 一般敵人
- `elite` — 菁英敵人
- `event` — 隨機事件
- `miniBoss` — 中型 Boss（第 5 關）
- `boss` — 大型 Boss（第 10 關）

### RoomData 結構

- `type: RoomType` — 房間類型
- `enemies?: EnemyConfig[]` — 敵人配置（戰鬥房間）
- `event?: EventData` — 事件資料（事件房間）
- `difficultyMultiplier: number` — 難度倍率

### EventData 結構

- `id: string` — 事件唯一識別
- `type: 'positive' | 'choice'` — 純正面或抉擇型
- `options: EventOption[]` — 可選選項

---

## 四、設計原則摘要

- Facade：EncounterGenerator 單一入口
- Builder：ChapterMapBuilder 建構複雜地圖結構
- Strategy：不同 RoomType 對應不同生成策略
- Seedable RNG：100% 可重現遭遇生成

---

## 五、與其他模組的互動

| 模組     | 互動方式                                  |
| -------- | ----------------------------------------- |
| Run      | 呼叫 Encounter 取得地圖與房間資料         |
| Combat   | 接收 EnemyConfig 作為戰鬥輸入             |
| Creature | 提供敵人模板供 EnemyFormationBuilder 使用 |
| Reward   | 根據 RoomType 決定獎勵等級                |
| Event    | 提供事件資料供 EventResolver 使用         |
