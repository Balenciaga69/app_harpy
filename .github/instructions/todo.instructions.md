# Combat & Replay 模組 v0.4

## 很急

## 需要討論(討論時你的視角是資深架構師)

### Item 與 Effect 與 Combat 的關係

- (item)ICombatItemView 介面存在，包含 effectTemplateIds (來自物品定義) 和 affixInstances (動態生成的詞綴實例)。CombatItemFactory 負責從 IItemDefinition + IAffixInstance[] 創建 ICombatItemView。
- EffectManager 管理 IEffect 實例，Character 在建構時注入 effects?: IEffect[]，並委派給 EffectManager (添加、移除、觸發鉤子如 onHpZero、triggerRevive)。
- (combat)Character 使用 EffectManager，並透過 CombatEffectServices (適配器) 提供服務 (如角色查詢、事件發射)。戰鬥中會觸發效果鉤子 (e.g., 血量歸零時 triggerHpZero)。
- ICombatItemView 未在 logic/combat 中使用。Character 建構時只接受靜態 effects 陣列，無從物品動態生成 effects 的邏輯。
- 設計原理是: Combat 不在乎有啥物品，只關心物品的Effect，我們會在戰鬥前就把各種裝備的 Effect 都準備好丟給 Character。
- EffectFactory 有 createFromCombatItem 方法，可從 ICombatItemView.affixInstances 生成 effects，但 未被任何地方調用。代碼中無物品 -> effects 的整合點。
  Effect System 被 Combat System 呼叫但僅限於已注入的 effects。無從物品生成新 effects 的機制。

### effectTemplateIds 與 affixInstances 的關係

- effectTemplateIds：來自 IItemDefinition.effectTemplateIds (e.g., 物品模板定義的靜態效果 ID，如 'effect_zeus_charge_interaction')。在 CombatItemFactory 中直接複製到 ICombatItemView。
- affixInstances：來自物品生成時的動態詞綴 (e.g., ItemGenerator 生成裝備/遺物時附加隨機詞綴)。IAffixInstance 包含 definitionId (詞綴定義 ID) 和 rolledValue (擲骰數值)。
- 關係缺失：ICombatItemView 同時有兩者，但無明確整合。effectTemplateIds 似乎是靜態效果，affixInstances 是動態詞綴，但如何結合未定義。EffectFactory 只處理 affixInstances，忽略 effectTemplateIds。

### 我個人的訴求(你可以反駁，或給我技術建議)

- 如果我要重構的話，我只打算重構 Item 模組，我不在乎其他模組的依賴關係。(那個之後npm run check 解決)
- Combat 絕對不會知道 Item 的存在，他只會知道 Effect。
- IItemDefinition(藍圖) 有 id,affixPoolIds,minAffixes,maxAffixes，但沒有 effectTemplateIds。
- Affix 有 id,effectTemplateId,minValue,maxValue,weight,tier,tags
- 基於 IAffixDefinition(藍圖) 能產出 IAffixInstance
- 不管是 Relic or Equipment 都是先有 Definition(藍圖) 再產出 Instance(實例)
- Relic or Equipment 的 Instance 會有 affixInstances
- Equipment 有 Slot 概念
- Relic 沒有 Slot 概念、有 Stackable,MaxStack 概念
- Relic or Equipment 都有 Rarity 概念、Affix 概念
- Definition -> Instance -> CombatItemView -> Effect 似乎沒解決
- Item 的文字敘述(名稱、描述) 似乎沒解決(我在思考該獨立處理還是融入Definition)

## 不急

## 未來統一實作

- 單元測試 (Jest) - 先不做
- 錯誤處理 (Try...Catch)

-
