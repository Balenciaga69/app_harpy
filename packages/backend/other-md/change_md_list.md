1.幫我查找以下準備調整的內如下的內容是否存在或已經符合?符合就跳過。2.幫我潤飾美化，調整後，嘗試覆蓋 blueprint 相關部分內容3.並移除或覆蓋過去與此衝突的內容。
\*\*\* 美化需基於我的美化準則

- 修改規則
  - 嚴禁刪減或大幅簡化 避免長段落變得很簡短
  - 使用 Heading 12345 與 Bullet Points 來組織內容
  - 「動手腳」僅限於排版與結構，而非內文重寫。
  - 用詞很怪或不合理，標點符號很怪也幫我修正，否則不改。
  - 放錯區塊段落的內容也可以搬家換位置
  - 專有名詞（如 Template/Instance、Affix/Modifier）建議統一中英文標示方式。
  - 請調整排版

---

把 stat 設定中的
護甲 轉化成 減傷 (即減傷百分比)
閃避 命中 簡化成 閃避 (閃避率，會被某些異常影響)

---

我想詢問
RUN 該怎麼生成關卡
每一章節觸發一次生成函數嗎?
然後可以生成十個 template 塞到 LevelTemplates 內?
interface RunContext {
seed: string
chapterIndex: number
levelTemplatesByChapter: Record<number, LevelTemplate[]>
difficultyFactor: number
// ...other run state...
}
function generateChapterTemplates(run: RunContext, chapterIndex: number): LevelTemplate[] {
// deterministic RNG using run.seed + chapterIndex
// 1..10: set #5 elite, #10 boss, others based on probability
// apply generator weight / difficulty metadata
// persist into run.levelTemplatesByChapter[chapterIndex]
return []
}
// 玩家進入節點時使用 template 生成 instance
function createLevelInstanceFromTemplate(run: RunContext, chapterIndex: number, slotIndex: number) {
const template = run.levelTemplatesByChapter[chapterIndex][slotIndex]
// 若 template.type === 'normal'|'elite'|'boss' => 從 enemy pool 選擇，套用 difficultyFactor
// 若 event => 從 event pool 選擇
// 返回 LevelInstance
}
