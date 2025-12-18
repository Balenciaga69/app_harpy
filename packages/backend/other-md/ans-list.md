1.幫我查找以下準備調整的內如下的內容是否存在或已經符合?符合就跳過。2.幫我潤飾美化，調整後，嘗試覆蓋 blueprint 相關部分內容3.並移除或覆蓋過去與此衝突的內容。
美化需基於我的美化準則

- 修改規則
  - 嚴禁刪減或大幅簡化 避免長段落變得很簡短
  - 使用 Heading 12345 與 Bullet Points 來組織內容
  - 「動手腳」僅限於排版與結構，而非內文重寫。
  - 用詞很怪或不合理，標點符號很怪也幫我修正，否則不改。
  - 放錯區塊段落的內容也可以搬家換位置
  - 專有名詞（如 Template/Instance、Affix/Modifier）建議統一中英文標示方式。
  - 請調整排版

---

- 移除 affix 對 family 相關敘述
- affix 詞綴本身不持有「當前是第幾次攻擊」的狀態 詞綴只負責查詢這些數值 。
- 在轉換詞綴效果時，建立專門的 EffectProcessor
- Class (職業) 改為 Profession

---

AilmentTemplate 由設計師定義，遊戲啟動時全量載入。
AilmentInstance 動態生成，儲存在角色/敵人戰鬥 Context。
行為規則（如每 tick 扣血、減速等）由 effectModule 決定，參數可用 params 傳遞。

---

流程將在每章節開頭生成十關
第五關 = ELITE ENEMY
第十關 = BOSS ENEMY
其餘關卡 12%機率為事件 88%為 NORMAL 敵人

流程生成器會負責配置好這十關的關卡模板
當玩家點開關卡後會依照模板 Template 抽出(POOL)對應配置 生成 LEVEL INSTANCE
(EnemyLevel or EventLevel 不等)
