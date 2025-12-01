# Ultimate 系統設計討論報告

## 📋 會議資訊

- **日期**: 2025-12-01
- **參與者**: PM (產品經理) | Tech Lead (技術主管) | Client (業主)
- **議題**: Ultimate (大招) 系統在 Combat Module 中的定位與設計方向

---

## 🎯 討論目標

1. 明確 Ultimate 在遊戲機制中的定位
2. 確認 Ultimate 與其他系統 (Effect, Equipment) 的關係
3. 評估當前技術實作的合理性
4. 規劃未來擴展方向

---

## 💼 業主視角 (Client Perspective)

### 期望功能

> **業主**: "我希望玩家能感受到角色的獨特性，大招應該是角色的標誌性技能，能扭轉戰局。"

**核心需求**:

- ✅ 每個角色有獨特的大招技能
- ✅ 大招需要能量/條件觸發，不能無限使用
- ✅ 大招效果應該比普通攻擊更強大
- ✅ 玩家應該能透過遊戲進程解鎖/升級大招

### 遊戲性期望

1. **差異化**: 不同角色的大招應該有明顯區別 (傷害型、控場型、增益型)
2. **策略性**: 玩家需要判斷何時釋放大招 (能量管理)
3. **成長性**: 大招可以透過升級、裝備、聖物強化
4. **視覺衝擊**: 大招釋放應該有明顯的動畫/特效 (未來 UI 需求)

---

## 📊 產品經理視角 (PM Perspective)

### 系統定位分析

| 系統          | 性質     | 觸發方式  | 可替換性       | 數量限制        |
| ------------- | -------- | --------- | -------------- | --------------- |
| **Effect**    | 臨時狀態 | 被動/自動 | ✅ 動態增減    | ❌ 無限制       |
| **Equipment** | 永久屬性 | 被動生效  | ✅ 可裝備/卸下 | ⚠️ 受裝備欄限制 |
| **Ultimate**  | 主動技能 | 主動釋放  | ⚠️ **待定**    | ✅ 每角色 1 個  |

### 核心問題

**Q1: Ultimate 應該是「固定」還是「可替換」？**

**選項 A: 固定綁定角色** (類似 MOBA 英雄技能)

- ✅ 優點: 強化角色辨識度，設計更聚焦
- ❌ 缺點: 減少玩法多樣性，重複遊玩價值降低

**選項 B: 可替換插拔** (類似裝備系統)

- ✅ 優點: 玩法靈活，可透過技能書/道具解鎖新大招
- ❌ 缺點: 角色特色模糊，平衡性難度提高

**PM 建議**:

> **混合模式** - 每個角色有「預設大招」，但可透過稀有道具 (技能書) 替換為「變體大招」。
>
> 範例: 戰士預設「狂暴斬擊」，可替換為「雷霆衝擊」(同樣是傷害型，但機制不同)

---

**Q2: Ultimate 與 Effect 的關係？**

**現況觀察**:

```typescript
// ThunderStrikeUltimate 會施加 ChargeEffect
const chargeEffect = new ChargeEffect(this.chargeStacks)
caster.addEffect(chargeEffect, context)
```

**PM 觀點**:

- ✅ Ultimate 可以**觸發** Effect (如釋放大招後給自己上 Buff)
- ✅ Ultimate 可以**受益於** Effect (如充能效果提升大招傷害)
- ❌ Ultimate **不應該是** Effect (兩者觸發機制完全不同)

**結論**: Ultimate 是**效果的生產者**，而非效果本身。

---

**Q3: 能量系統如何設計？**

**當前問題**: 目前沒有能量/冷卻機制，大招可以無限釋放。

**建議方案**:

| 方案             | 機制                               | 範例遊戲            |
| ---------------- | ---------------------------------- | ------------------- |
| **能量條系統**   | 攻擊/受擊累積能量，滿 100 可釋放   | Overwatch, Valorant |
| **冷卻時間系統** | 釋放後進入冷卻，X 回合後可再次使用 | League of Legends   |
| **混合系統**     | 需要能量 + 冷卻都滿足              | Dota 2 (部分英雄)   |

**PM 建議**: 先實作**能量條系統** (簡單且符合業主期望)

---

## 🔧 技術主管視角 (Tech Lead Perspective)

### 當前實作分析

**現有架構**:

```typescript
// IUltimateOwner (Character 介面的一部分)
interface IUltimateOwner {
  getUltimate(): unknown | undefined // ❌ 類型不安全
  setUltimate(ultimate: unknown): void
}

// IUltimateAbility (策略介面)
interface IUltimateAbility {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly type: 'damage' | 'buff' | 'hybrid'
  execute(caster: ICharacter, context: CombatContext): void
}
```

**技術問題**:

1. ❌ **類型不安全**: `IUltimateOwner` 使用 `unknown`，失去 TypeScript 類型檢查
2. ⚠️ **能量系統缺失**: 無法限制大招使用頻率
3. ⚠️ **目標選擇耦合**: 每個 Ultimate 都要自己實作目標選擇邏輯 (重複代碼)
4. ✅ **策略模式正確**: 使用 `IUltimateAbility` 介面，符合開放封閉原則

### 技術建議

#### 修正 1: 修復類型安全

```typescript
import type { IUltimateAbility } from '../../../coordination'

export interface IUltimateOwner {
  getUltimate(): IUltimateAbility | undefined
  setUltimate(ultimate: IUltimateAbility): void
}
```

**理由**:

- ✅ 避免類型錯誤
- ✅ 提供 IDE 自動完成
- ✅ 不會造成循環依賴 (domain → coordination 是合理的單向依賴)

---

#### 修正 2: 引入能量系統

**選項 A: 能量屬性化** (簡單)

```typescript
// 在 AttributeCore 中加入
export const AttributeCore = {
  // ...existing attributes...
  ultimateEnergy: 0, // 當前能量
  ultimateMaxEnergy: 100, // 最大能量
  ultimateEnergyCost: 100, // 釋放消耗
} as const
```

**優點**:

- ✅ 無需新增系統，直接使用現有屬性機制
- ✅ Effect 可以修改能量相關屬性 (如「快速充能」Buff)

**缺點**:

- ❌ 能量與 HP/攻擊力混在一起，概念不清晰

---

**選項 B: 獨立能量管理器** (更乾淨)

```typescript
/** 能量管理器 */
class EnergyManager {
  private current: number = 0
  private max: number = 100

  /** 增加能量 */
  gain(amount: number): void {
    this.current = Math.min(this.current + amount, this.max)
  }

  /** 消耗能量 */
  consume(amount: number): boolean {
    if (this.current >= amount) {
      this.current -= amount
      return true
    }
    return false
  }

  /** 檢查是否可釋放 */
  canCast(cost: number): boolean {
    return this.current >= cost
  }
}

// Character 中加入
class Character {
  private energyManager: EnergyManager

  /** 檢查大招是否可釋放 */
  canCastUltimate(): boolean {
    const ultimate = this.getUltimate()
    return ultimate && this.energyManager.canCast(ultimate.energyCost)
  }
}
```

**優點**:

- ✅ 職責分離，符合單一職責原則
- ✅ 未來可擴展 (如冷卻系統、充能速率)

**缺點**:

- ❌ 增加複雜度

**Tech Lead 建議**: 先用**選項 A** (屬性化)，如果未來需求複雜化再重構為**選項 B**

---

#### 修正 3: 目標選擇器統一化

**問題範例**:

```typescript
// 每個 Ultimate 都要自己寫目標選擇
const enemyTeam = caster.team === 'player' ? 'enemy' : 'player'
const enemies = context.getEntitiesByTeam(enemyTeam)
const aliveEnemies = enemies.filter((e) => 'isDead' in e && !e.isDead)
const selector = new FirstAliveSelector()
const target = selector.selectTarget(caster, aliveEnemies)
```

**建議重構**:

```typescript
/** Ultimate 基礎類別 */
abstract class BaseUltimate implements IUltimateAbility {
  abstract readonly id: string
  abstract readonly name: string
  abstract readonly type: 'damage' | 'buff' | 'hybrid'

  /** 獲取敵方目標 */
  protected getEnemyTargets(caster: ICharacter, context: CombatContext): ICharacter[] {
    const enemyTeam = caster.team === 'player' ? 'enemy' : 'player'
    return context
      .getEntitiesByTeam(enemyTeam)
      .filter(isCharacter)
      .filter((c) => !c.isDead)
  }

  /** 獲取友方目標 */
  protected getAllyTargets(caster: ICharacter, context: CombatContext): ICharacter[] {
    return context
      .getEntitiesByTeam(caster.team)
      .filter(isCharacter)
      .filter((c) => !c.isDead)
  }

  abstract execute(caster: ICharacter, context: CombatContext): void
}

// 簡化實作
class ThunderStrikeUltimate extends BaseUltimate {
  execute(caster: ICharacter, context: CombatContext): void {
    const enemies = this.getEnemyTargets(caster, context)
    const target = new FirstAliveSelector().selectTarget(caster, enemies)
    // ...
  }
}
```

---

### 架構層級確認

**當前位置**: `coordination/ability/models/` ✅

**依賴檢查**:

```
Ultimate (coordination 層)
  ↓ 依賴
character, effect, damage, context (domain + logic 層)
```

**結論**: ✅ 依賴方向正確，無循環依賴

---

## 🎨 系統設計方向建議

### 短期目標 (v0.3)

1. **修復類型安全** ✅ 優先級: 🔴 高
   - 修正 `IUltimateOwner` 的 `unknown` 類型

2. **引入能量系統** ✅ 優先級: 🟡 中
   - 在 `AttributeCore` 加入能量相關屬性
   - 在 `AbilitySystem` 加入能量檢查邏輯

3. **重構目標選擇** ✅ 優先級: 🟢 低
   - 建立 `BaseUltimate` 抽象類別
   - 消除重複代碼

---

### 中期目標 (v0.4-v0.5)

1. **可替換大招系統**
   - 技能書道具系統 (可學習新大招)
   - 大招升級系統 (提升傷害/效果)

2. **大招類型擴展**
   - 控場型: 眩暈、減速、沉默
   - 增益型: 群體加攻、護盾、治療
   - 特殊型: 復活、時光倒流、傳送

3. **獨立能量管理器**
   - 如果能量機制變複雜 (多能量槽、充能速率),則重構為 `EnergyManager`

---

### 長期目標 (v1.0)

1. **大招連攜系統**
   - 多個角色大招組合觸發特殊效果

2. **大招自訂系統**
   - 玩家可調整大招參數 (傷害倍率 vs 冷卻時間)

3. **AI 大招決策**
   - 敵方 AI 判斷最佳大招釋放時機

---

## 📝 結論與行動項

### 會議共識

1. ✅ **Ultimate 定位**: 主動技能，可插拔 (類似裝備)，但每角色預設一個
2. ✅ **與 Effect 關係**: Ultimate 是效果的**生產者**，而非效果本身
3. ✅ **能量系統**: 先使用屬性化方案，未來視需求重構
4. ✅ **當前架構**: 基本合理，僅需修復類型安全問題

---

### Action Items

| 任務                         | 負責人    | 優先級 | 預計完成 |
| ---------------------------- | --------- | ------ | -------- |
| 修復 `IUltimateOwner` 類型   | Tech Lead | 🔴 高  | v0.3     |
| 引入能量屬性                 | Tech Lead | 🟡 中  | v0.3     |
| 建立 `BaseUltimate` 基礎類別 | Tech Lead | 🟢 低  | v0.4     |
| 設計技能書系統               | PM        | 🟡 中  | v0.4     |
| 大招 UI/特效設計             | UI/UX     | 🟢 低  | v0.5     |

---

### 風險提示

⚠️ **平衡性風險**: 可替換大招可能導致某些組合過強，需要持續調整
⚠️ **複雜度風險**: 能量系統、冷卻系統、升級系統疊加可能讓新手困惑
⚠️ **性能風險**: 如果大招特效過於複雜，可能影響戰鬥流暢度

---

## 📚 參考資料

- [策略模式 (Strategy Pattern)](https://refactoring.guru/design-patterns/strategy)
- [組合優於繼承 (Composition over Inheritance)](https://en.wikipedia.org/wiki/Composition_over_inheritance)
- [SOLID 原則](https://en.wikipedia.org/wiki/SOLID)

---

**文件版本**: v1.0  
**最後更新**: 2025-12-01  
**下次審查**: v0.3 釋出後
