# enemy（敵人）通用問答

## enemy 是什麼

- enemy（敵人）是遊戲中所有可遇見的敵對角色
- 擁有屬性、詞綴（affix）、大絕招（ultimate）
- 分為普通、精英、首領三種等級

## enemy 有哪些特性

- 不同等級會配置不同的詞綴與大絕招
- 敵人沒有物品或職業

# enemy 給設計師

## 如何設計 enemy

- 設計靜態 enemyTemplate（敵人模板），包含大絕招與詞綴模板
- 決定不同等級敵人的詞綴與大絕招配置
- 可設計不同章節出現的敵人，豐富遊戲內容

## 設計注意事項

- 敵人生成規則需考慮章節限制與重複出現
- 可設計特殊敵人只在特定章節出現

# enemy 給工程師

## 技術細節

- EnemyTemplate（敵人模板）由 Store 載入，定義敵人的靜態屬性、詞綴、大絕招配置
- EnemyRecord（敵人紀錄）代表已生成敵人的持久化資料，包含 templateId、難度係數等
- EnemyAggregate（敵人聚合根）由 Template + Record 組合而成，包含所有運行時行為
  - getUnitStats()：計算最終屬性
  - getAffixes()：取得詞綴
  - getUltimate()：取得大絕招
  - 根據難度係數動態計算所有數值
- EnemyAggregate 不被存入 DB，需要時由 Template + Record 動態組裝
- 由權重隨機選出符合條件的 EnemyTemplate
- 根據當前難度係數生成 EnemyAggregate，套用屬性、詞綴、大絕招
- 需支援章節過濾、重複排除等生成規則
