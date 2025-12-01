# Combat 模組跨語言遷移性與模型依賴分析報告

**分析日期**: 2025-12-01  
**分析範圍**: `src/modules/combat/`  
**目的**: 評估代碼遷移到 Golang/C++ 的難度，並解決 models 資料夾依賴違反分層原則的問題

---

## 第一部分：跨語言遷移性分析

### 1.1 外部依賴盤點

#### ✅ 良好：依賴極少且可替換

Combat 模組僅依賴 **3 個外部 npm 套件**：

| 套件名稱     | 使用位置                              | 用途         | 遷移難度  | 替代方案                                                                       |
| ------------ | ------------------------------------- | ------------ | --------- | ------------------------------------------------------------------------------ |
| `nanoid`     | Character, Effects, Ultimates (11 處) | 生成唯一 ID  | ⭐ 極簡單 | Golang: `github.com/rs/xid`<br>C++: `boost::uuid` 或自實現                     |
| `seedrandom` | `infra/shared/utils/random.util.ts`   | 可重現隨機數 | ⭐⭐ 簡單 | Golang: `math/rand.NewSource(seed)`<br>C++: `std::mt19937` + seed              |
| `mitt`       | `infra/event-bus/event.bus.ts`        | 事件發佈訂閱 | ⭐⭐ 簡單 | Golang: 自實現 Channel-based EventBus<br>C++: Boost.Signals2 或自實現 Observer |

**結論**: 外部依賴少且都有成熟的替代方案，**遷移難度低**。

---

### 1.2 TypeScript 語法特性使用情況

#### ⚠️ 中等風險：部分高階特性需手動轉換

| 語法特性                | 使用頻率                                 | 遷移難度    | 說明                                            |
| ----------------------- | ---------------------------------------- | ----------- | ----------------------------------------------- |
| **Interface & Type**    | 極高                                     | ⭐ 簡單     | Golang 用 `interface{}`/泛型，C++ 用抽象類      |
| **Union Types**         | 中 (`ModifierType: 'add' \| 'multiply'`) | ⭐⭐ 中等   | Golang 用 `const`+`iota`，C++ 用 `enum class`   |
| **Mapped Types**        | 低 (`keyof`, `typeof`)                   | ⭐⭐⭐ 較難 | 需手動展開為具體類型                            |
| **Optional Properties** | 高 (`ultimate?: IUltimateAbility`)       | ⭐ 簡單     | Golang 用指標 `*T`，C++ 用 `std::optional<T>`   |
| **Readonly**            | 高                                       | ⭐ 簡單     | Golang 無原生支援(需文檔說明)，C++ 用 `const`   |
| **Type Guards**         | 中 (`isCharacter()`)                     | ⭐⭐ 中等   | Golang 用 Type Assertion，C++ 用 `dynamic_cast` |
| **Literal Types**       | 中 (`team: 'player' \| 'enemy'`)         | ⭐⭐ 中等   | 轉為枚舉                                        |

**高風險點**:

- `ModifierPriorityType = (typeof ModifierPriority)[keyof typeof ModifierPriority]` 這類複雜類型需手動重寫
- `Partial<T>`, `Required<T>` 等 Utility Types 需手動實現

---

### 1.3 設計模式與架構可移植性

#### ✅ 優秀：設計模式語言無關

| 設計模式                    | 使用位置                                    | 可移植性                                  |
| --------------------------- | ------------------------------------------- | ----------------------------------------- |
| **Strategy Pattern**        | IUltimateAbility, ITargetSelector           | ✅ 完美 (多態)                            |
| **Chain of Responsibility** | DamageChain 8-step pipeline                 | ✅ 完美                                   |
| **Observer Pattern**        | EventBus                                    | ✅ 完美 (Golang channel, C++ signal/slot) |
| **Facade Pattern**          | Character 封裝 Container/Calculator/Manager | ✅ 完美                                   |
| **Factory Pattern**         | DamageFactory                               | ✅ 完美                                   |
| **Dependency Injection**    | 通過 CombatContext 傳遞依賴                 | ✅ 完美                                   |

**結論**: 架構設計**完全語言無關**，核心邏輯可直接翻譯。

---

### 1.4 代碼結構可移植性

#### ✅ 優秀：清晰的分層與職責分離

```
Layer 0: infra/shared         → 任何語言都能實現 (工具函數)
Layer 1: infra/event-bus      → Golang: channel, C++: Boost.Signals2
Layer 2: context              → 簡單的容器類，易移植
Layer 3: domain (character, effect) → 純數據模型 + 業務邏輯，易移植
Layer 4: logic (damage, tick)  → 算法密集，語言無關
Layer 5: coordination (ability) → 協調邏輯，易移植
Layer 6: combat-engine        → 組裝邏輯，易移植
```

**潛在問題**:

1. ❌ **JavaScript 的動態特性**: 無，代碼使用 TypeScript 嚴格類型
2. ✅ **避免了 JS 特有語法**: 沒有使用 `with`, `eval`, Proxy, Reflect 等
3. ✅ **沒有依賴 Node.js API**: 完全瀏覽器環境代碼，無 `fs`, `path` 等

---

### 1.5 遷移風險評估總結

| 項目         | 風險等級        | 說明                                   |
| ------------ | --------------- | -------------------------------------- |
| 外部依賴     | 🟢 低           | 僅 3 個套件，都有替代方案              |
| 語法特性     | 🟡 中           | Mapped Types 需手動處理                |
| 設計模式     | 🟢 低           | 完全語言無關                           |
| 業務邏輯     | 🟢 低           | 純算法，無特殊 JS 特性                 |
| 數據結構     | 🟢 低           | Interface → Struct/Class               |
| 整體遷移難度 | 🟢 **低到中等** | 主要工作是語法轉換，核心邏輯可直接翻譯 |

**遷移工作量估算**:

- **Golang**: 約 60-80 小時 (有豐富標準庫支持)
- **C++**: 約 100-120 小時 (需處理記憶體管理，建議用智慧指標)

---

## 第二部分：Models 資料夾依賴違反分層問題

### 2.1 問題診斷

#### 當前違反分層的 Models 檔案

| 檔案路徑                                            | 違反情況                          | 依賴的高層模組                                                |
| --------------------------------------------------- | --------------------------------- | ------------------------------------------------------------- |
| `logic/damage/models/damage.event.model.ts`         | ❌ Logic 層依賴 Domain 層         | `import ICharacter from domain/character`                     |
| `logic/damage/models/combat.hook.interface.ts`      | ❌ Logic 層依賴 Context 層        | `import CombatContext from context`                           |
| `coordination/models/ultimate.ability.interface.ts` | ❌ Coordination 層依賴 Context 層 | `import CombatContext from context`                           |
| `coordination/models/thunder.strike.ultimate.ts`    | ❌ Coordination 層依賴 Context 層 | `import CombatContext from context`                           |
| `coordination/models/simple.damage.ultimate.ts`     | ❌ Coordination 層依賴 Context 層 | `import CombatContext from context`                           |
| `infra/event-bus/models/event.payload.model.ts`     | ❌ Infra 層依賴 Domain 層         | `import CharacterId, CharacterSnapshot from domain/character` |

**核心矛盾**:

- Models 應該是**純數據定義** (DTO/VO)，不應依賴業務邏輯
- 但 TypeScript 的 `interface` 可包含方法簽名，導致 Models 混入了行為定義

---

### 2.2 根本原因分析

#### 問題 1: Interface 既是數據契約又是行為契約

```typescript
// coordination/models/ultimate.ability.interface.ts
export interface IUltimateAbility {
  execute(context: CombatContext): void // ❌ 依賴 Context 層
}
```

**為什麼會這樣?**

- TypeScript 沒有 "純數據 interface" 和 "行為 interface" 的區分
- C# 有 `record` (純數據) 和 `interface` (行為契約) 的明確分離

#### 問題 2: 事件 Payload 需要引用實體類型

```typescript
// infra/event-bus/models/event.payload.model.ts
export interface EntityDamagePayload {
  sourceId: CharacterId // ❌ Infra 層依賴 Domain 層的類型
}
```

**為什麼會這樣?**

- Event Payload 需要傳遞實體 ID，但 `CharacterId` 定義在 Domain 層
- Infra 層 (更低層) 不應依賴 Domain 層 (更高層)

#### 問題 3: DamageEvent 需要引用 Character

```typescript
// logic/damage/models/damage.event.model.ts
export interface DamageEvent {
  source: ICharacter // ❌ Logic 層依賴 Domain 層
  target: ICharacter
}
```

**為什麼會這樣?**

- DamageEvent 在傷害計算鏈中傳遞，需要訪問角色屬性
- 但 `ICharacter` 定義在 Domain 層，Logic 層理論上不該依賴

---

### 2.3 業界解決方案對比

#### 方案 A: DDD 的分層依賴倒置 (Dependency Inversion)

```
Application Layer (combat-engine)
       ↓ depends on
Domain Layer (character, effect) ← interfaces here
       ↓ depends on
Infrastructure Layer (event-bus, context) ← implementations here
```

**優點**:

- 符合 SOLID 的 DIP 原則
- Domain 層不依賴任何外部層

**缺點**:

- 需要大量 interface，增加複雜度
- 不適合遊戲邏輯 (Domain 需要主動調用 Infrastructure)

---

#### 方案 B: 六邊形架構 (Ports & Adapters)

```
Core (domain) ← Ports (interfaces)
       ↓ implemented by
Adapters (infra, logic) → 依賴 Core 的 interfaces
```

**優點**:

- Core 完全獨立，易於測試

**缺點**:

- 過度設計，對小型戰鬥系統來說太重

---

#### 方案 C: 允許 Models 跨層共享 (Shared Kernel)

```
Shared Models Layer (跨所有層共享)
       ↓
Infra / Domain / Logic / Coordination
```

**優點**:

- 簡單直接，符合實際需求

**缺點**:

- 打破嚴格分層原則

---

### 2.4 推薦解決方案

#### ✅ 方案：Models 分類重組 + 有限例外原則

**核心思想**:

1. **區分 Data Models (純數據) 和 Contract Models (行為契約)**
2. **建立 `infra/models/` 作為共享數據層**
3. **允許特定 Models 向下依賴 (但需文檔說明)**

---

#### 實施步驟

##### Step 1: 建立共享 Models 層

```
src/modules/combat/
├── infra/
│   ├── models/           ← 新增：跨層共享的純數據模型
│   │   ├── entity.types.ts      # CharacterId, EntityId 等原始類型
│   │   ├── snapshot.model.ts    # CharacterSnapshot (純數據)
│   │   └── index.ts
│   ├── event-bus/
│   ├── shared/
│   └── config/
```

**規則**:

- `infra/models/` 僅包含**純數據定義** (無方法，僅屬性)
- 任何層都可以導入 `infra/models/`
- `infra/models/` **禁止依賴任何其他層**

---

##### Step 2: 重新分類現有 Models

| 檔案                | 類型     | 應放置位置                       | 理由                                            |
| ------------------- | -------- | -------------------------------- | ----------------------------------------------- |
| `CharacterId`       | 原始類型 | `infra/models/entity.types.ts`   | 純類型別名，無依賴                              |
| `CharacterSnapshot` | 數據快照 | `infra/models/snapshot.model.ts` | 純數據，無方法                                  |
| `ICharacter`        | 行為契約 | `domain/character/interfaces/`   | 包含方法，應留在 Domain                         |
| `DamageEvent`       | 流程數據 | `logic/damage/models/`           | ✅ **允許例外**：依賴 `ICharacter` (見下方說明) |
| `IUltimateAbility`  | 行為契約 | `coordination/models/`           | ✅ **允許例外**：依賴 `CombatContext`           |
| `ICombatHook`       | 行為契約 | `logic/damage/models/`           | ✅ **允許例外**：依賴 `CombatContext`           |

---

##### Step 3: 定義例外規則 (有限向下依賴)

**允許的例外情況**:

1. **Logic 層的 Models 可以依賴 Domain 層的 Interfaces**

   ```typescript
   // ✅ 允許
   // logic/damage/models/damage.event.model.ts
   import type { ICharacter } from '@/modules/combat/domain/character'
   ```

   **理由**: DamageEvent 是傷害計算的**流程數據載體**，必須攜帶角色引用。這不是循環依賴，因為 Domain 不會反向依賴 Logic 的 Models。

2. **Coordination 層的 Models 可以依賴 Context 層**

   ```typescript
   // ✅ 允許
   // coordination/models/ultimate.ability.interface.ts
   import type { CombatContext } from '@/modules/combat/context'
   ```

   **理由**: Ultimate 是**策略模式的契約**，需要訪問戰鬥上下文。Context 是 Infrastructure 的一部分，Coordination 依賴 Infra 是合理的。

3. **Event Payloads 可以依賴 Shared Models**
   ```typescript
   // ✅ 重構後允許
   // infra/event-bus/models/event.payload.model.ts
   import type { CharacterId, CharacterSnapshot } from '@/modules/combat/infra/models'
   ```
   **理由**: 移至 `infra/models/` 後，同層依賴，不違反分層。

---

##### Step 4: 文檔化依賴規則

創建 `dev_log/v0.2/模組依賴規則.md`:

```markdown
## Models 依賴規則

### 嚴格禁止

- ❌ Infra 層依賴 Domain/Logic/Coordination 層
- ❌ Domain 層依賴 Logic/Coordination 層
- ❌ Logic 層依賴 Coordination 層

### 有限例外 (需文檔說明)

- ✅ Logic Models 可依賴 Domain Interfaces (僅 `type` import)
- ✅ Coordination Models 可依賴 Context (Infrastructure)
- ✅ 任何層可依賴 Infra Models (共享數據層)

### Models 分類

- **Data Models** (infra/models/): 純數據，無方法，無依賴
- **Contract Models** (各層 models/): 行為契約，可依賴下層
- **Flow Models** (logic/damage/models/): 流程數據，可依賴 Domain interfaces
```

---

### 2.5 與 C# 項目引用的對比

#### C# 的限制

```csharp
// ProjectA.csproj
<ItemGroup>
  <ProjectReference Include="..\ProjectB\ProjectB.csproj" />
</ItemGroup>
```

- C# 的 Project Reference 是**編譯期強制**的單向依賴
- 如果 A 引用 B，B 就**無法**引用 A (否則編譯失敗)

#### TypeScript 的限制

```typescript
// TypeScript 的 import 僅在運行時檢查
import { X } from '../higherLayer' // ⚠️ 不會報錯，但違反設計原則
```

- TypeScript **沒有編譯期的項目引用限制**
- 只能通過 **ESLint 規則** 或 **文檔約定** 來強制

---

#### 如何在 TypeScript 中模擬 C# 的項目引用?

**方案 1: ESLint 規則限制 import 路徑**

```javascript
// eslint.config.js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        // Infra 層禁止引用上層
        {
          group: ['**/domain/**', '**/logic/**', '**/coordination/**', '**/combat-engine/**'],
          importNames: ['*'],
          message: 'Infra layer cannot depend on higher layers'
        },
        // Domain 層禁止引用 Logic/Coordination
        {
          group: ['**/logic/**', '**/coordination/**', '**/combat-engine/**'],
          importNames: ['*'],
          message: 'Domain layer cannot depend on Logic/Coordination layers'
        }
      ]
    }]
  }
}
```

**優點**: 自動化檢查  
**缺點**: 配置複雜，需要維護規則

---

**方案 2: Monorepo 分包 (使用 pnpm workspace)**

```json
// pnpm-workspace.yaml
packages:
  - 'packages/combat-infra'
  - 'packages/combat-domain'
  - 'packages/combat-logic'

// packages/combat-domain/package.json
{
  "dependencies": {
    "@app/combat-infra": "workspace:*"
  }
  // ❌ 不能引用 @app/combat-logic
}
```

**優點**: 物理隔離，編譯期檢查  
**缺點**: 過度工程，增加構建複雜度

---

**✅ 推薦: 方案 1 (ESLint) + 文檔約定**

理由:

- 不增加構建複雜度
- 自動化檢查依賴違反
- 通過 `// eslint-disable-next-line` 標註有限例外

---

### 2.6 最终建議

#### 對於當前 Combat 模組

**短期 (v0.3)**:

1. ✅ **接受現狀**: DamageEvent 依賴 ICharacter、Ultimate 依賴 Context 是合理的
2. ✅ **建立共享層**: 移動 `CharacterId`, `CharacterSnapshot` 至 `infra/models/`
3. ✅ **文檔化例外**: 在 README 中說明允許的依賴例外

**中期 (v0.4)**:

1. ⚙️ 引入 ESLint 規則限制跨層依賴
2. ⚙️ 使用 `dependency-cruiser` 工具生成依賴圖，定期檢查

**長期 (v1.0)**:

1. 🔄 如果遷移到後端，考慮使用 Golang 的 `internal` package 機制物理隔離層級

---

#### 對於跨語言遷移

**Golang 遷移建議**:

```
combat/
├── internal/              # 禁止外部導入
│   ├── infra/
│   ├── domain/
│   └── logic/
└── api/                   # 公開 API
    └── combat_engine.go
```

**C++ 遷移建議**:

```cpp
// 使用 namespace 和編譯單元分離
namespace combat::infra { ... }
namespace combat::domain { ... }
namespace combat::logic { ... }

// 通過 CMakeLists.txt 控制鏈接順序
add_library(combat_infra ...)
add_library(combat_domain ... combat_infra)  # domain 依賴 infra
```

---

## 補充報告：C# 多 csproj 架構下的 Models 依賴解決方案

**補充日期**: 2025-12-01  
**情境**: 假設立即遷移到 C#，使用多個 csproj 項目引用  
**問題**: C# 的 `<ProjectReference>` 強制單向依賴，無法允許「有限向下依賴」

---

### 3.1 C# 項目引用限制的現實

#### C# 的強制單向依賴

```xml
<!-- Combat.Logic.csproj -->
<ProjectReference Include="..\Combat.Domain\Combat.Domain.csproj" />
<!-- ❌ 無法反向引用：Combat.Domain 無法引用 Combat.Logic -->
```

**關鍵差異**:

- **TypeScript**: `import` 僅運行時檢查，可通過 ESLint 約束
- **C#**: `<ProjectReference>` 編譯期強制，**物理隔離**無法繞過

#### 當前依賴問題在 C# 中的表現

| 當前 TypeScript 依賴                                          | C# 多 csproj 下的問題                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `DamageEvent` (Logic) → `ICharacter` (Domain)                 | ❌ Logic.csproj 引用 Domain.csproj，但 Domain 無法引用 Logic                 |
| `IUltimateAbility` (Coordination) → `CombatContext` (Context) | ❌ Coordination.csproj 引用 Context.csproj，但 Context 無法引用 Coordination |
| `EventPayload` (Infra) → `CharacterId` (Domain)               | ❌ Infra.csproj 引用 Domain.csproj，但 Domain 無法引用 Infra                 |

**結論**: 「有限向下依賴」在 C# 中**會編譯失敗**，需要重新設計。

---

### 3.2 C# 架構重構方案

#### ✅ 方案 A: 完全依賴倒置 (推薦)

**核心思想**: Domain 層定義所有 Interface，Infrastructure 層提供實現

```
Combat.Domain.csproj (核心業務邏輯)
├── Interfaces/
│   ├── ICharacter.cs
│   ├── IUltimateAbility.cs        ← 移至此處
│   ├── IDamageEvent.cs            ← 移至此處
│   └── ICombatContext.cs          ← 移至此處
├── Models/
│   ├── Character.cs
│   ├── DamageEvent.cs             ← 實現 IDamageEvent
│   └── CharacterSnapshot.cs
└── Services/
    ├── CharacterService.cs
    └── EffectService.cs

Combat.Logic.csproj (業務邏輯)
├── Interfaces/
│   └── IDamageCalculator.cs       ← Logic 層的契約
├── Models/
│   └── DamageCalculation.cs       ← 純數據，無依賴
└── Services/
    ├── DamageCalculator.cs        ← 實現 IDamageCalculator
    └── DamageChain.cs

Combat.Coordination.csproj (協調層)
├── Interfaces/
│   └── IAbilitySystem.cs          ← Coordination 層的契約
├── Models/
│   └── AbilityExecution.cs        ← 純數據，無依賴
└── Services/
    ├── AbilitySystem.cs           ← 實現 IAbilitySystem
    └── UltimateManager.cs

Combat.Context.csproj (上下文)
├── Interfaces/
│   └── IEntityManager.cs          ← Context 層的契約
├── Models/
│   └── CombatState.cs             ← 純數據，無依賴
└── Services/
    ├── CombatContext.cs           ← 實現 ICombatContext
    └── EntityManager.cs           ← 實現 IEntityManager

Combat.Infra.csproj (基礎設施)
├── Interfaces/
│   └── IEventBus.cs               ← Infra 層的契約
├── Models/
│   ├── EntityTypes.cs             ← CharacterId, EntityId 等原始類型
│   └── EventPayload.cs            ← 事件載荷
└── Services/
    ├── EventBus.cs                ← 實現 IEventBus
    └── RandomGenerator.cs
```

**項目引用圖**:

```
Combat.Engine (頂層協調者)
    ↓ 引用所有
├── Combat.Coordination
│   ↓ 引用
├── Combat.Logic
│   ↓ 引用
├── Combat.Domain
│   ↓ 引用
├── Combat.Context
│   ↓ 引用
└── Combat.Infra
    (無引用)
```

**代碼示例**:

```csharp
// Combat.Domain/Interfaces/IDamageEvent.cs
namespace Combat.Domain.Interfaces
{
    public interface IDamageEvent
    {
        ICharacter Source { get; }
        ICharacter Target { get; }
        int Amount { get; set; }
        int FinalDamage { get; set; }
        bool IsUltimate { get; }
        bool IsTrueDamage { get; }
        bool IsCrit { get; }
    }
}

// Combat.Domain/Models/DamageEvent.cs
namespace Combat.Domain.Models
{
    public class DamageEvent : IDamageEvent
    {
        public ICharacter Source { get; }
        public ICharacter Target { get; }
        public int Amount { get; set; }
        public int FinalDamage { get; set; }
        public bool IsUltimate { get; }
        public bool IsTrueDamage { get; }
        public bool IsCrit { get; }

        public DamageEvent(ICharacter source, ICharacter target, int amount)
        {
            Source = source;
            Target = target;
            Amount = amount;
        }
    }
}

// Combat.Logic/Services/DamageCalculator.cs
namespace Combat.Logic.Services
{
    public class DamageCalculator : IDamageCalculator
    {
        private readonly ICombatContext _context;

        public DamageCalculator(ICombatContext context)
        {
            _context = context;
        }

        public IDamageEvent CalculateDamage(ICharacter source, ICharacter target, int baseDamage)
        {
            var damageEvent = new DamageEvent(source, target, baseDamage);
            // 計算邏輯...
            return damageEvent;
        }
    }
}
```

**優點**:

- ✅ **編譯期強制**: C# 項目引用確保單向依賴
- ✅ **完全解耦**: Domain 層不依賴任何其他層
- ✅ **易於測試**: 每個層都可以獨立測試
- ✅ **符合 DDD**: Domain 層定義業務契約

**缺點**:

- ❌ **複雜度增加**: 需要大量 Interface
- ❌ **文件同步**: Interface 變更需要同步多個實現
- ❌ **學習曲線**: 需要理解依賴倒置原則

---

#### ✅ 方案 B: 共享 Kernel + 事件驅動

**核心思想**: 建立共享數據層 + 事件解耦業務邏輯

```
Combat.Shared.csproj (共享數據層)
├── Models/
│   ├── EntityId.cs                ← CharacterId, EntityId
│   ├── CharacterSnapshot.cs       ← 純數據快照
│   ├── DamageData.cs              ← 傷害數據 (無行為)
│   └── AbilityData.cs             ← 能力數據 (無行為)
└── Events/
    ├── DamageCalculatedEvent.cs   ← 事件定義
    └── AbilityExecutedEvent.cs

Combat.Domain.csproj
├── Interfaces/
│   ├── ICharacter.cs
│   └── IEffect.cs
├── Models/
│   ├── Character.cs
│   └── Effect.cs
└── Services/
    ├── CharacterService.cs
    └── EffectManager.cs

Combat.Logic.csproj
├── Models/
│   └── DamageCalculation.cs       ← 純數據計算結果
├── Services/
│   ├── DamageCalculator.cs        ← 發佈 DamageCalculatedEvent
│   └── DamageChain.cs
└── Handlers/
    └── DamageCalculatedHandler.cs ← 處理事件

Combat.Coordination.csproj
├── Models/
│   └── AbilityExecution.cs        ← 純數據執行結果
├── Services/
│   ├── AbilitySystem.cs           ← 發佈 AbilityExecutedEvent
│   └── UltimateManager.cs
└── Handlers/
    └── AbilityExecutedHandler.cs  ← 處理事件
```

**事件驅動示例**:

```csharp
// Combat.Shared/Events/DamageCalculatedEvent.cs
namespace Combat.Shared.Events
{
    public class DamageCalculatedEvent
    {
        public EntityId SourceId { get; }
        public EntityId TargetId { get; }
        public int BaseDamage { get; }
        public int FinalDamage { get; }
        public bool IsCrit { get; }
        public DamageType Type { get; }

        public DamageCalculatedEvent(
            EntityId sourceId,
            EntityId targetId,
            int baseDamage,
            int finalDamage,
            bool isCrit,
            DamageType type)
        {
            SourceId = sourceId;
            TargetId = targetId;
            BaseDamage = baseDamage;
            FinalDamage = finalDamage;
            IsCrit = isCrit;
            Type = type;
        }
    }
}

// Combat.Logic/Services/DamageCalculator.cs
namespace Combat.Logic.Services
{
    public class DamageCalculator
    {
        private readonly IEventBus _eventBus;

        public DamageCalculator(IEventBus eventBus)
        {
            _eventBus = eventBus;
        }

        public void CalculateDamage(ICharacter source, ICharacter target, int baseDamage)
        {
            // 計算邏輯...
            int finalDamage = CalculateFinalDamage(source, target, baseDamage);
            bool isCrit = IsCriticalHit(source);

            // 發佈事件，不直接返回數據
            var damageEvent = new DamageCalculatedEvent(
                source.Id, target.Id, baseDamage, finalDamage, isCrit, DamageType.Physical);

            _eventBus.Publish(damageEvent);
        }
    }
}

// Combat.Coordination/Handlers/DamageCalculatedHandler.cs
namespace Combat.Coordination.Handlers
{
    public class DamageCalculatedHandler : IEventHandler<DamageCalculatedEvent>
    {
        private readonly ICombatContext _context;

        public void Handle(DamageCalculatedEvent @event)
        {
            // 處理傷害應用邏輯
            var target = _context.GetEntity(@event.TargetId);
            target.ApplyDamage(@event.FinalDamage);

            // 記錄日誌、觸發效果等...
        }
    }
}
```

**優點**:

- ✅ **完全解耦**: 通過事件通信，無直接依賴
- ✅ **易於擴展**: 新功能通過新增 Handler 實現
- ✅ **符合 CQRS**: 命令查詢責任分離

**缺點**:

- ❌ **複雜度高**: 事件流難以追蹤
- ❌ **調試困難**: 業務邏輯分散在多個 Handler
- ❌ **性能開銷**: 事件發佈有運行時成本

---

#### ✅ 方案 C: 組合優於繼承 + 工廠模式

**核心思想**: 使用組合模式將數據和行為分離

```
Combat.Domain.csproj
├── Interfaces/
│   ├── ICharacter.cs
│   └── ICharacterBehavior.cs      ← 行為契約
├── Models/
│   ├── CharacterData.cs           ← 純數據
│   └── CharacterSnapshot.cs
└── Behaviors/
    ├── CharacterBehavior.cs       ← 實現 ICharacterBehavior
    └── CharacterFactory.cs

Combat.Logic.csproj
├── Interfaces/
│   └── IDamageStrategy.cs         ← 傷害計算策略
├── Models/
│   └── DamageContext.cs           ← 計算上下文 (純數據)
└── Strategies/
    ├── PhysicalDamageStrategy.cs  ← 實現 IDamageStrategy
    └── MagicalDamageStrategy.cs

Combat.Coordination.csproj
├── Interfaces/
│   └── IAbilityStrategy.cs        ← 能力執行策略
├── Models/
│   └── AbilityContext.cs          ← 執行上下文 (純數據)
└── Strategies/
    ├── ThunderStrikeStrategy.cs   ← 實現 IAbilityStrategy
    └── SimpleDamageStrategy.cs
```

**組合模式示例**:

```csharp
// Combat.Domain/Interfaces/ICharacter.cs
namespace Combat.Domain.Interfaces
{
    public interface ICharacter
    {
        CharacterData Data { get; }
        ICharacterBehavior Behavior { get; }
        void Update();
        void ApplyDamage(int damage);
    }
}

// Combat.Domain/Interfaces/ICharacterBehavior.cs
namespace Combat.Domain.Interfaces
{
    public interface ICharacterBehavior
    {
        void OnDamageTaken(ICharacter character, int damage);
        void OnTurnStart(ICharacter character);
        void OnDeath(ICharacter character);
    }
}

// Combat.Domain/Models/CharacterData.cs
namespace Combat.Domain.Models
{
    public class CharacterData
    {
        public EntityId Id { get; }
        public string Name { get; }
        public int MaxHp { get; }
        public int CurrentHp { get; }
        public int Armor { get; }
        public int AttackDamage { get; }
        // ... 其他屬性
    }
}

// Combat.Logic/Interfaces/IDamageStrategy.cs
namespace Combat.Logic.Interfaces
{
    public interface IDamageStrategy
    {
        DamageResult CalculateDamage(DamageContext context);
    }
}

// Combat.Logic/Models/DamageContext.cs
namespace Combat.Logic.Models
{
    public class DamageContext
    {
        public CharacterData SourceData { get; }
        public CharacterData TargetData { get; }
        public int BaseDamage { get; }
        public DamageType Type { get; }
    }
}

// Combat.Logic/Models/DamageResult.cs
namespace Combat.Logic.Models
{
    public class DamageResult
    {
        public int FinalDamage { get; }
        public bool IsCrit { get; }
        public DamageType Type { get; }
    }
}
```

**優點**:

- ✅ **靈活性高**: 行為可以動態替換
- ✅ **易於測試**: 數據和行為分离
- ✅ **符合 SOLID**: 單一職責原則

**缺點**:

- ❌ **複雜度中等**: 需要理解組合模式
- ❌ **運行時開銷**: 策略查找有成本

---

### 3.3 推薦方案比較

| 方案                   | 複雜度 | 維護性 | 測試性 | 性能 | 適用場景                 |
| ---------------------- | ------ | ------ | ------ | ---- | ------------------------ |
| **完全依賴倒置**       | 高     | 高     | 高     | 中   | 企業級應用，長期維護     |
| **共享 Kernel + 事件** | 高     | 中     | 高     | 低   | 高併發系統，事件驅動架構 |
| **組合 + 策略**        | 中     | 高     | 高     | 中   | 遊戲系統，需要靈活性     |

**對於你的 Combat 系統**:

**✅ 推薦: 方案 A (完全依賴倒置)**

**理由**:

1. **架構一致性**: 與你現有的分層思想完全吻合
2. **業務清晰**: Domain 層定義業務規則，其他層實現細節
3. **遷移友好**: 從 TypeScript 到 C# 的概念映射清晰
4. **長期維護**: 一旦建立，依賴關係穩定，不易出錯

**遷移步驟**:

1. **Phase 1**: 將所有 Interface 移至 Domain 層
2. **Phase 2**: 將數據模型移至 Shared 層 (如果需要的話)
3. **Phase 3**: 重構各層實現為 Interface 的實現類
4. **Phase 4**: 使用依賴注入容器管理依賴關係

---

#### C# 具體實施建議

##### 項目結構示例

```
Combat.sln
├── Combat.Shared/          # 共享數據和事件
├── Combat.Infra/           # 基礎設施 (EventBus, Random)
├── Combat.Context/         # 戰鬥上下文
├── Combat.Domain/          # 領域模型和接口
├── Combat.Logic/           # 業務邏輯
├── Combat.Coordination/    # 協調層
└── Combat.Engine/          # 引擎入口
```

##### 依賴注入配置

```csharp
// Combat.Engine/Program.cs
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

// 註冊基礎設施
services.AddSingleton<IEventBus, EventBus>();
services.AddSingleton<IRandomGenerator, RandomGenerator>();

// 註冊上下文
services.AddSingleton<ICombatContext, CombatContext>();

// 註冊領域服務
services.AddTransient<ICharacterService, CharacterService>();
services.AddTransient<IEffectManager, EffectManager>();

// 註冊業務邏輯
services.AddTransient<IDamageCalculator, DamageCalculator>();
services.AddTransient<IDamageChain, DamageChain>();

// 註冊協調層
services.AddTransient<IAbilitySystem, AbilitySystem>();
services.AddTransient<IUltimateManager, UltimateManager>();

var serviceProvider = services.BuildServiceProvider();
```

##### 單元測試示例

```csharp
// Combat.Domain.Tests/CharacterTests.cs
[TestClass]
public class CharacterTests
{
    [TestMethod]
    public void Character_TakeDamage_ShouldReduceHp()
    {
        // Arrange
        var mockBehavior = new Mock<ICharacterBehavior>();
        var characterData = new CharacterData { MaxHp = 100, CurrentHp = 100 };
        var character = new Character(characterData, mockBehavior.Object);

        // Act
        character.ApplyDamage(30);

        // Assert
        Assert.AreEqual(70, character.Data.CurrentHp);
    }
}
```

---

### 3.5 總結：有限向下依賴理論在 C# 中的命運

**答案**: **會破滅，但有更好的替代方案**

**破滅的原因**:

- C# 的 `<ProjectReference>` 是**物理隔離**，無法像 TypeScript 那樣通過約定繞過
- 「有限向下依賴」在編譯期就會失敗

**更好的解決方案**:

- **完全依賴倒置**: Domain 層定義所有 Interface，其他層實現
- **事件驅動架構**: 通過事件解耦，直接數據依賴轉為間接事件依賴
- **組合模式**: 數據和行為分離，通過策略模式動態組合

**最終建議**:
對於遊戲系統，**完全依賴倒置**是最適合的，因為：

- 保持了你的分層理念
- 提供了編譯期保障
- 易於長期維護和擴展
- 概念上與 TypeScript 版本一致，遷移成本最低
