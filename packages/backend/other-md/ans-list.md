幫我潤飾美化，調整後，嘗試加入 blueprint 相關內容
並移除或覆蓋過去與此衝突的內容。

- 移除 affix 對 family 相關敘述
- affix 詞綴本身不持有「當前是第幾次攻擊」的狀態 詞綴只負責查詢這些數值 。
- 在轉換詞綴效果時，建立專門的 EffectProcessor
- Class (職業) 改為 Profession

---

AilmentTemplate 由設計師定義，遊戲啟動時全量載入。
AilmentInstance 動態生成，儲存在角色/敵人戰鬥 Context。
行為規則（如每 tick 扣血、減速等）由 effectModule 決定，參數可用 params 傳遞。
