# 🎮 新增內容總結

## ✅ 已成功新增的遊戲內容

### 1. **遺物 - 堅毅之心** 💪
- **檔案**: `game-core/src/data/item/item.data.ts`
- **ID**: `relic_warrior_resolute_heart`
- **稀有度**: 普通 (COMMON)
- **效果**: +300 最大生命值
- **適用職業**: 戰士
- **負載成本**: 1
- **綁定詞綴**: `affix_warrior_hp_boost_1`

### 2. **技能 - 強大一擊** ⚡
- **檔案**: `game-core/src/data/ultimate/ultimate.data.ts`
- **ID**: `ult_warrior_mighty_blow`
- **能量消耗**: 50
- **傷害**: 500 點（對單一敵人）
- **目標**: 最低血量敵人
- **適用職業**: 戰士

### 3. **詞綴 - HP 提升** 📈
- **檔案**: `game-core/src/data/affix/affix.data.ts`
- **ID**: `affix_warrior_hp_boost_1`
- **效果**: 裝備時提升 300 點最大生命值
- **觸發條件**: ON_EQUIP
- **綁定效果**: `affix_effect_warrior_hp_boost_1`

### 4. **職業 - 戰士** 🗡️
- **檔案**: `game-core/src/data/profession/profession.data.ts`
- **ID**: `prof_warrior`
- **起始技能**: 強大一擊 (`ult_warrior_mighty_blow`)
- **起始遺物**: 堅毅之心 (`relic_warrior_resolute_heart`)
- **描述**: 力量與決心的化身。擁有強大的單體傷害技能，能承受更多傷害。

---

## 🔌 後端 API 端點

### 已新增的 5 個功能端點：

#### 1. **取得職業列表** 📋
```http
GET /api/run/professions
```
**回應**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prof_warrior",
      "name": { "tw": "戰士", "en": "Warrior" },
      "desc": { "tw": "力量與決心的化身...", "en": "An embodiment..." }
    }
  ]
}
```

#### 2. **建立新的 Run** 🎮
```http
POST /api/run/init
```
**請求**:
```json
{
  "professionId": "prof_warrior",
  "seed": 12345  // 可選
}
```
**回應**:
```json
{
  "success": true,
  "data": {
    "runId": "run-...",
    "professionId": "prof_warrior",
    "seed": 12345
  }
}
```

#### 3. **在商店購買物品** 🛍️
```http
POST /api/run/shop/buy
```
**請求**:
```json
{
  "runId": "run-...",
  "itemId": "item-id"
}
```
**回應**:
```json
{
  "success": true,
  "message": "購買成功",
  "data": {
    "runId": "run-...",
    "itemId": "item-id"
  }
}
```

#### 4. **賣出物品** 💰
```http
POST /api/run/shop/sell
```
**請求**:
```json
{
  "runId": "run-...",
  "itemId": "item-id"
}
```
**回應**:
```json
{
  "success": true,
  "message": "賣出成功",
  "data": {
    "runId": "run-...",
    "itemId": "item-id"
  }
}
```

#### 5. **刷新商店物品** 🔄
```http
POST /api/run/shop/refresh
```
**請求**:
```json
{
  "runId": "run-..."
}
```
**回應**:
```json
{
  "success": true,
  "message": "刷新成功",
  "data": {
    "runId": "run-..."
  }
}
```

---

## 📁 修改的檔案列表

### Game-Core 資料檔案
- ✅ `packages/game-core/src/data/item/item.data.ts`
- ✅ `packages/game-core/src/data/ultimate/ultimate.data.ts`
- ✅ `packages/game-core/src/data/affix/affix.data.ts`
- ✅ `packages/game-core/src/data/profession/profession.data.ts`

### Backend-Nest 服務層
- ✅ `packages/backend-nest/src/run/run.service.ts` (擴展 4 個新方法)
- ✅ `packages/backend-nest/src/run/run.controller.ts` (添加 4 個新端點)

### Backend-Nest DTO
- ✅ `packages/backend-nest/src/run/dto/BuyItemDto.ts`
- ✅ `packages/backend-nest/src/run/dto/SellItemDto.ts`
- ✅ `packages/backend-nest/src/run/dto/RefreshShopDto.ts`
- ✅ `packages/backend-nest/src/run/dto/GetProfessionsDto.ts`

---

## ✨ 技術細節

### Affix 效果綁定
遺物的 HP 提升效果通過 Affix 系統實現：
- 遺物綁定 `affix_warrior_hp_boost_1`
- 詞綴定義效果 `affix_effect_warrior_hp_boost_1`
- 效果在 `ON_EQUIP` 時觸發
- 使用 `STAT_MODIFY` 動作，ADD 操作，對 `maxHp` 添加 300

### Ultimate 技能
戰士的強大一擊使用基礎的 `polluteCards` 效果機制，為後續的傷害計算預留 `metadata` 欄位

### 職業初始化
戰士職業啟用時自動配備：
- 起始技能：強大一擊
- 起始遺物：堅毅之心

---

## 🧪 測試建議

1. **測試職業列表**
   ```bash
   curl http://localhost:3000/api/run/professions
   ```

2. **初始化戰士 Run**
   ```bash
   curl -X POST http://localhost:3000/api/run/init \
     -H "Content-Type: application/json" \
     -d '{"professionId":"prof_warrior"}'
   ```

3. **使用回傳的 `runId` 進行商店操作**
   ```bash
   curl -X POST http://localhost:3000/api/run/shop/buy \
     -H "Content-Type: application/json" \
     -d '{"runId":"...","itemId":"..."}'
   ```

---

## 🎯 下一步

所有 5 個功能現已實現並可測試！ 🚀

- game-core 已成功編譯 ✅
- backend-nest 已成功編譯 ✅
- 所有 API 端點已實現 ✅
