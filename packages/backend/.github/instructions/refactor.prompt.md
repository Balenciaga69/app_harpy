- 我打算來調整 combat 模組
- 因為我安裝了 eslint-plugin-boundaries
- 我要讓內部遵循 單向依賴規則：箭頭永遠指向內層。
- infra -> interfaces -> app -> domain
- 我們用不到值物件、領域模型、聚合根這些DDD概念
- 我偏好 feature(舉例:combat,replay) 內有 sub-features 的結構
- sub-feature 內則遵循單向依賴規則
- 各 sub-feature 引用也應該遵循 單向依賴規則
- 實作永遠不引用實作(只引用介面)

以下是 Combat 檔案內容
(\_application/adapter) src\features\combat\CombatEffectServices.ts
(\_domain/character)(內部有大量違反依賴問題) src\features\combat\character\Character.ts
(\_domain/character) src\features\combat\character\CharacterBuilder.ts
(\_domain/character) src\features\combat\character\models\attribute-owner.ts
(\_domain/character) src\features\combat\character\models\character.ts
(\_domain/character) src\features\combat\character\models\effect-owner.ts
(\_domain/character) src\features\combat\character\models\ultimate-owner.ts

(\_application/result-builder) src\features\combat\combat-builders\ResultBuilder.ts
(\_application/result-builder) src\features\combat\combat-builders\utils\OutcomeAnalyzer.ts
(\_application/result-builder) src\features\combat\combat-builders\utils\StatisticsBuilder.ts
(\_application/result-builder) src\features\combat\combat-builders\utils\SurvivorCollector.ts
(\_application/engine) src\features\combat\combat-engine\CombatEngine.ts
(\_domain/engine) src\features\combat\combat-engine\models\character-stats.ts
(\_domain/engine) src\features\combat\combat-engine\models\combat-config.ts
(\_domain/engine) src\features\combat\combat-engine\models\combat-outcome.ts
(\_domain/engine) src\features\combat\combat-engine\models\combat-result-data.ts
(\_domain/engine) src\features\combat\combat-engine\models\combat-result.ts
(\_domain/engine) src\features\combat\combat-engine\models\combat-snapshot.ts
(\_domain/engine) src\features\combat\combat-engine\models\combat-statistics.ts
(\_domain/engine) src\features\combat\combat-engine\utils\PreMatchEffectApplicator.ts

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
src\features\combat\damage\DamageChain.ts
src\features\combat\damage\models\combat-hook.ts
src\features\combat\damage\models\damage-event.ts
src\features\combat\damage\steps\AfterApplyStep.ts
src\features\combat\damage\steps\ApplyDamageStep.ts
src\features\combat\damage\steps\BeforeApplyStep.ts
src\features\combat\damage\steps\BeforeDamageStep.ts
src\features\combat\damage\steps\CriticalStep.ts
src\features\combat\damage\steps\DamageModifyStep.ts
src\features\combat\damage\steps\DefenseCalculationStep.ts
src\features\combat\damage\steps\HitCheckStep.ts
src\features\combat\damage\utils\DamageCalculator.ts
src\features\combat\damage\utils\ResurrectionHandler.ts
src\features\combat\damage-steps\AfterApplyStep.ts
src\features\combat\damage-steps\ApplyDamageStep.ts
src\features\combat\damage-steps\BeforeApplyStep.ts
src\features\combat\damage-steps\BeforeDamageStep.ts
src\features\combat\damage-steps\collect-hooks.ts
src\features\combat\damage-steps\CriticalStep.ts
src\features\combat\damage-steps\DamageModifyStep.ts
src\features\combat\damage-steps\DamageStep.interface.ts
src\features\combat\damage-steps\DefenseCalculationStep.ts
src\features\combat\damage-steps\HitCheckStep.ts
src\features\combat\errors\combat-error.ts
src\features\combat\errors\combat-failure.ts
src\features\combat\errors\result.ts
src\features\combat\event-bus\EventBus.ts
src\features\combat\event-bus\models\combat-event-map.ts
src\features\combat\event-bus\models\event-payload.ts
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
src\features\combat\ultimate\ultimate-ability.ts
src\features\combat\ultimate\UltimateManager.ts
