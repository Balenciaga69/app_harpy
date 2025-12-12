- 我打算來調整 combat 模組
- 因為我安裝了 eslint-plugin-boundaries
- 我要讓內部遵循 單向依賴規則：箭頭永遠指向內層。
- infra -> interfaces -> app -> domain (此範本不考慮 presentation 層)
  - infra 可以透過 interfaces 與 app,domain 引用
  - infra 放置與基礎設施、外部資源、第三方整合有關的程式碼
  - interfaces 放置所有介面（interface）、型別（type）、契約（contract）、抽象類別
  - interfaces 理論上不會引用任何實作，且貧血。
  - app 放置應用層邏輯，負責協調，不包含任何業務與領域邏輯
  - app 可以引用 interfaces
  - domain 放置純業務邏輯、核心規則、演算法
  - domain 可以引用 interfaces
  - 所有實作都只 import interface，不 import 其他實作
- 我們用不到值物件、領域模型、聚合根這些DDD概念
- 我偏好 feature(舉例:combat,replay) 內有 分層概念，每層再來建立 sub-features folder 的結構
- sub-feature 內則遵循單向依賴規則
- 各 sub-feature 引用也應該遵循 單向依賴規則
- 實作永遠不引用實作(只引用介面)

以下是 Combat 檔案內容
[_infra/damage] 新增步驟工廠 DamageStepFactory.ts
[\_application/damage][須重構] src\features\combat\damage\DamageChain.ts
[_interfaces/damage] src\features\combat\damage\models\combat-hook.ts
[_interfaces/damage] src\features\combat\damage\models\damage-event.ts
[_domain/damage/step] src\features\combat\damage\steps\AfterApplyStep.ts
[_domain/damage/step] src\features\combat\damage\steps\ApplyDamageStep.ts
[_domain/damage/step] src\features\combat\damage\steps\BeforeApplyStep.ts
[_domain/damage/step] src\features\combat\damage\steps\BeforeDamageStep.ts
[_domain/damage/step] src\features\combat\damage\steps\CriticalStep.ts
[_domain/damage/step] src\features\combat\damage\steps\DamageModifyStep.ts
[_domain/damage/step] src\features\combat\damage\steps\DefenseCalculationStep.ts
[_domain/damage/step] src\features\combat\damage\steps\HitCheckStep.ts
[_domain/damage] src\features\combat\damage\utils\DamageCalculator.ts
[_domain/damage] src\features\combat\damage\utils\ResurrectionHandler.ts

[]src\features\combat\ultimate\ultimate-ability.ts
[]src\features\combat\ultimate\UltimateManager.ts
[]src\features\combat\errors\combat-error.ts
[]src\features\combat\errors\combat-failure.ts
[]src\features\combat\errors\result.ts
[]src\features\combat\event-bus\EventBus.ts
[]src\features\combat\event-bus\models\combat-event-map.ts
[]src\features\combat\event-bus\models\event-payload.ts
===請忽視以下檔案，尚未遷移至此===
src\features\combat\CombatEffectServices.ts
(內部有大量違反依賴問題) src\features\combat\character\Character.ts
src\features\combat\character\CharacterBuilder.ts
src\features\combat\character\models\attribute-owner.ts
src\features\combat\character\models\character.ts
src\features\combat\character\models\effect-owner.ts
src\features\combat\character\models\ultimate-owner.ts

src\features\combat\combat-builders\ResultBuilder.ts
src\features\combat\combat-builders\utils\OutcomeAnalyzer.ts
src\features\combat\combat-builders\utils\StatisticsBuilder.ts
src\features\combat\combat-builders\utils\SurvivorCollector.ts
src\features\combat\combat-engine\CombatEngine.ts
src\features\combat\combat-engine\models\character-stats.ts
src\features\combat\combat-engine\models\combat-config.ts
src\features\combat\combat-engine\models\combat-outcome.ts
src\features\combat\combat-engine\models\combat-result-data.ts
src\features\combat\combat-engine\models\combat-result.ts
src\features\combat\combat-engine\models\combat-snapshot.ts
src\features\combat\combat-engine\models\combat-statistics.ts
src\features\combat\combat-engine\utils\PreMatchEffectApplicator.ts

src\features\combat\config\attribute-constants.ts
src\features\combat\config\combat-constants.ts
src\features\combat\config\effect-constants.ts
src\features\combat\config\formula-constants.ts
src\features\combat\config\ultimate-constants.ts
src\features\combat\context\battle-state.ts
src\features\combat\context\BattleState.ts
src\features\combat\context\combat-context.ts
src\features\combat\context\CombatContext.ts

src\features\combat\coordination\TickActionSystem.ts
src\features\combat\coordination\utils\AttackExecutor.ts
src\features\combat\coordination\utils\CooldownManager.ts
src\features\combat\coordination\utils\DamageFactory.ts
src\features\combat\coordination\utils\EffectProcessor.ts
src\features\combat\coordination\utils\EnergyManager.ts

src\features\combat\logger\combat-log-entry.ts
src\features\combat\logger\EventLogger.ts
src\features\combat\resource-registry\InMemoryResourceRegistry.ts
src\features\combat\resource-registry\resource-registry.ts
src\features\combat\shared\interfaces\entity.interface.ts
src\features\combat\shared\models\snapshot.model.ts
src\features\combat\shared\utils\CharacterAccessor.ts
src\features\combat\shared\utils\CombatRandomGenerator.ts
src\features\combat\shared\utils\TypeGuardUtil.ts
src\features\combat\snapshot\SnapshotCollector.ts
src\features\combat\target-select-strategies\FirstAliveSelector.ts
src\features\combat\target-select-strategies\LowestHealthSelector.ts
src\features\combat\target-select-strategies\target-selector.ts
src\features\combat\tick\ticker.driver.ts
src\features\combat\tick-phases\AttackExecutionPhase.ts
src\features\combat\tick-phases\EffectTickPhase.ts
src\features\combat\tick-phases\EnergyRegenPhase.ts
src\features\combat\tick-phases\tick-phase.ts
