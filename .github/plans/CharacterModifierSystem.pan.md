## 簡介

CharacterModifierSystem 是一個負責計算角色最終屬性面板的模組。它將基於角色的基礎屬性、裝備、遺物等，生成靜態的屬性數據，供其他模組使用。

最後更新時間：2025/12/10

## 輸入與輸出

### 輸入

- 角色的基礎屬性值
- 裝備實例及其詞綴屬性
- 遺物實例及其堆疊數量

### 輸出

- 計算後的角色最終屬性面板

## 元件盤點

- AttributeCalculator：負責屬性加總與計算的核心邏輯
- EquipmentProcessor：解析裝備實例的詞綴屬性並轉換為屬性修飾器
- RelicProcessor：解析遺物實例的屬性並轉換為屬性修飾器
- ModifierAggregator：整合所有修飾器並應用到屬性管理器

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- src/domain/item：提供裝備與遺物的定義、實例與詞綴系統
- src/logic/attribute-system：提供屬性計算與管理邏輯
- src/logic/effect-system：提供效果處理邏輯（目前忽略 Buff，但可擴展使用）

### 被依賴的模組

- src/logic/combat：使用最終屬性面板進行戰鬥模擬
- src/未來某個角色面板顯示功能：顯示角色屬性面板

### 潛在煩惱思考

- 戰鬥在乎的是 RealTime 變化
- 角色面板在乎的是靜態數據(可以觸發一次計算)
