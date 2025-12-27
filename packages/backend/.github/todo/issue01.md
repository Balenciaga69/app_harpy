事件是這樣的,
這是多個問題融合而成

1. CharacterService,Character 有糟糕代碼
2. 團隊探討了 Character 為何驗證是否可以裝備在 Character 的邏輯是 Character 負責?
3. Character.canEquipRelic 目前還很簡單但未來很複雜, 這樣要怎麼保證繼續寫在 Character內?
4. equipRelic canEquipRelic 為何要關心 RelicInstance 合理因為是內部使用 但 RelicTemplate 不合理吧? 語意與職責上
5. calculateCharacterDefaultStats 簡直是災難, 為了拿到 affix effect 需要用 類似 sql join id 的方式 取得, 這是設計初衷被破壞了嗎?

有一派觀點是說我們應該繼續保持 id 關聯的純粹與解耦合
另一派認為乾脆 affix , affix effect , instance ,template , relic 全部都給 character 這樣做根本不用煩惱這些 存檔在拔掉就好 讀檔則組裝
