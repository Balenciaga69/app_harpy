# Affix（詞綴 / Affix）

## 語意級（Designer）

### Affix 的核心定義

- Affix（詞綴）是一種靜態模板，用以描述會在遊戲中發生的效果與參數（例如：影響屬性、觸發行為或賦予狀態）。
- 模板不包含運行時邏輯；實際行為由生成層與運行時系統（生成系統、事件系統、屬性聚合系統等）協作實現。

### 詞綴的職責

- 詞綴模板（AffixTemplate / 詞綴模板）不應關心誰能擁有或裝備它，也不應該關心持有者可堆疊多少個。
- 詞綴的責任是定義行為與基礎數值，保持純粹，專注於效果定義。
- 生成條件與載體（例如 boss 專屬、某章節限定）應屬於生成系統與池（Affix Pool）管理，而非 AffixTemplate 本身。
- 生成服務（Item / Enemy）負責讀取上下文（Context）與分佈表，並執行生成行為。

### 誰關心 Affix

- 載體：物品、裝備、遺物是主要載體，終極寶石（Ultimate Gem）可由詞綴組合而成。
- 系統：詞綴生成系統（從 Affix Pool 根據 Weight 抽取並 Roll 數值）、狀態系統、屬性聚合系統、事件系統等。
- 實際表現：賽前變數的效果會以狀態實例或屬性修飾符（Modifier / StatModifier）注入，為短暫或被動效果。

### Q&A

#### Q: 詞綴是什麼？

- A: 簡短說明：見上方定義；詞綴為靜態模板，描述效果與參數（ID、Tags、EffectTemplateId 等），生成與運行時規則由其他系統處理。

#### Q: 修飾符是什麼？

- A: 運行時的純數值單元（Modifier / StatModifier），由 AffixInstance（詞綴實體）與 EffectTemplate 解析產生，在條件滿足時被屬性聚合系統使用（Add/Multi/More 等）。

#### Q: 詞綴實體（AffixInstance）如何生成？（簡述）

- A: 生成層從 Affix Pool 篩選符合上下文的 AffixTemplate → 檢查排他/家族規則 → Roll 數值 → 建立 AffixInstance（rolledValue）並注入目標（item/enemy/preCombat）。

## 架構級（Architect）

### 詞綴定義（名詞統一）

- AffixTemplate（詞綴模板）：靜態藍圖，定義觸發條件參考、行為類型與參數。
- AffixInstance（詞綴實體）：生成後的實例（例如：templateId、rolledValue、sourceId、metadata、uniqueCounter）。
- Modifier / StatModifier（修飾符 / 屬性修飾符）：由 AffixInstance 與 EffectTemplate 解析出的純數值修飾，用於屬性運算。

### 詞綴層次結構

- Affix 屬於戰鬥外的靜態資源；在戰鬥時計算屬性時，Affix 會被轉換為 1..n 個 Modifier 並送入聚合系統。

### 屬性聚合系統（設計要點）

- 聚合系統僅依賴 StatModifier，不直接認識 AffixTemplate 或 preCombat。
- 轉換器（Converter/Binder）由上層注入，負責把 AffixInstance 與 EffectTemplate 轉為 ModifierInstance；聚合系統維持穩定介面，便於擴充來源。

### 詞綴池（Affix Pool Table）

- 池表欄位範例：影響屬性、運算方式（Add / Multi / More）、Rolled Value 範圍、生效條件（例如低於 50%）、Tags、生成限制（如等級、關卡門檻）、Family / Exclusion。

## 代碼級（Engineer）

### 詞綴生成流程（步驟）

1. 從 Affix Pool 撈取符合條件的 AffixTemplate（考量 itemType、level、family、weight）。
2. 檢查排他機制（Exclusion Group）以避免矛盾或重複。
3. 根據權重（Weight）抽取並 Roll 數值（生成 rolledValue）。
4. 建立 AffixInstance 並將其塞入目標（ItemInstance / Enemy / PreCombatState）。

### 上帝測試詞綴生成器與附加器（測試 / 工具）

- 單一詞綴靜態屬性應完整定義：ID、Tags、MinMaxRange、CalcType、TargetStat 等。
- 建議提供一個「上帝模式」測試工具，能自由組合並附加任意詞綴到任何載體，用於邊界測試。
- 實作上：Affix 抽象允許任意組合，但正式環境需套用 Family/Exclusion/Context 規則以確保平衡與合理性。

### 設計建議（實作準則）

- 隔離依賴：Affix 生成涉及多系統，應明確隔離依賴以避免隱性耦合。
- 轉換器介面：設計專責資料轉換的介面（Converter/Binder），不在其中放業務規則。

---

## 範例的幾個 Affix

1. (賽前變數)：開局獲得 16 層充能 (異常狀態)
2. (敵人 A 詞綴) (普通)：每三次攻擊第三次傷害 x2.0
3. (敵人 A 詞綴) (Boss 特有)：每三次攻擊第三次傷害 x2.0 附加 2 層 Chill
4. (聖遺物詞綴):每次攻擊吸血 1% 攻擊最終造成傷害 (該遺物可疊加，最多 20 個)
5. (裝備、賽前):在生命值低於 10% 情況下復活率提高 20% 同時復活生命增加 15%
6. (賽前變數): 每當施放大招後，敵人閃避與護甲值將下降 10% 直至 0
7. (裝備): 每有一層 chill 攻擊力提升 5%
8. (裝備): 每有一層 chill 攻擊力 +12

---

## 實作注意要點（三行摘要）

- 事件驅動是關鍵：多數條件由 EventSystem（OnAttack、OnUltimate、OnDeath、OnCast）實作。
- 狀態/層數、不可逆與堆疊語義需明確（StateInstance 與可能的 ModifierTemplate 描述）。
- 保留「上帝測試」工具用於邊界測試；正式生成時應加強 Family/Exclusion/Context 規則以維持平衡。
