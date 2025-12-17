盤點以下問題在藍圖中
是否真的存在?
存在於哪份檔案?
我的解答屬於有效解答還是無效解答(沒回答到問題)?
甚至又衍伸新問題？
還是TradeOffs下不建議這樣做?

Q:
設計強調單向依賴（domain/app/adapter/infra），但 Affix 生成涉及多系統（池、難度、角色），可能形成隱藏耦合。e.g., 屬性聚合系統「不在乎 Affix」，但實際需解析 Modifier，這是否違反解耦？

A:
Affix Template 轉 Affix instance, Affix 轉 Modifier 都需要一層生成或轉換的專用類
以及你的看法告訴我

Q:
沒討論「屬性聚合系統」是否應該完全不認識 Affix，還是只認識 StatModifier。
A:
屬性聚合系統應該完全不認識 Affix, stat aggregation system 只認 stat modifier

Q:
屬性聚合來源於 StatModifier，但來源（Affix/Status/賽前變數）解析流程未明確。
A:
