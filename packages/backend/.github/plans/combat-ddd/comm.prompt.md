聊天紀錄.md 是我們之前的對話
那麼我們來

- 閱讀以下檔案
- 剖析這些檔案內容是否有命名不夠好懂、分層依賴會出問題
- 提出改善建議 與 建議以 (infra/api/app/domain/shared\_橫跨層級的東西) 分層管理
- 你除了說明之外 最終也要返回一個格式的內容我舉例
- 不用刻意遵守 DDD 因為這會分服務 做豐富物件、實體、聚合根 會嚴重拖延進度
  有問題版本: (xxx層)(需更名為:)(有依賴問題) src\features\combat\...\xxx.ts
  無問題版本: (xxx層)src\features\combat\...\xxx.ts
  注意: 需更名為:... 指的不是檔案名稱，而是檔案內的類別、介面、型別等命名，是否太放飛，不精準，或者其他同事會看不懂
  src\features\combat\index.ts
  src\features\combat\adapters\CombatEffectServices.ts
  src\features\combat\adapters\index.ts
  src\features\combat\attribute\index.ts
  src\features\combat\character\Character.ts
  src\features\combat\character\CharacterBuilder.ts
  src\features\combat\character\index.ts
  src\features\combat\character\models\attribute-owner.ts
  src\features\combat\character\models\character.ts
  src\features\combat\character\models\effect-owner.ts
  src\features\combat\character\models\ultimate-owner.ts
  src\features\combat\combat-engine\CombatEngine.ts
  src\features\combat\combat-engine\index.ts
  src\features\combat\combat-engine\builders\index.ts
  src\features\combat\combat-engine\builders\ResultBuilder.ts
  src\features\combat\combat-engine\builders\utils\OutcomeAnalyzer.ts
  src\features\combat\combat-engine\builders\utils\StatisticsBuilder.ts
  src\features\combat\combat-engine\builders\utils\SurvivorCollector.ts
  src\features\combat\combat-engine\models\character-stats.ts
  src\features\combat\combat-engine\models\combat-config.ts
  src\features\combat\combat-engine\models\combat-outcome.ts
  src\features\combat\combat-engine\models\combat-result-data.ts
  src\features\combat\combat-engine\models\combat-result.ts
  src\features\combat\combat-engine\models\combat-snapshot.ts
  src\features\combat\combat-engine\models\combat-statistics.ts
  src\features\combat\combat-engine\models\index.ts
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
  src\features\combat\context\index.ts
  src\features\combat\coordination\index.ts
  src\features\combat\coordination\TickActionSystem.ts
  src\features\combat\coordination\phases\AttackExecutionPhase.ts
  src\features\combat\coordination\phases\EffectTickPhase.ts
  src\features\combat\coordination\phases\EnergyRegenPhase.ts
  src\features\combat\coordination\phases\index.ts
  src\features\combat\coordination\phases\tick-phase.ts
  src\features\combat\coordination\target-select-strategies\FirstAliveSelector.ts
  src\features\combat\coordination\target-select-strategies\LowestHealthSelector.ts
  src\features\combat\coordination\target-select-strategies\target-selector.ts
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
  src\features\combat\damage\steps\collect-hooks.ts
  src\features\combat\damage\steps\CriticalStep.ts
  src\features\combat\damage\steps\DamageModifyStep.ts
  src\features\combat\damage\steps\DamageStep.interface.ts
  src\features\combat\damage\steps\DefenseCalculationStep.ts
  src\features\combat\damage\steps\HitCheckStep.ts
  src\features\combat\damage\utils\DamageCalculator.ts
  src\features\combat\damage\utils\ResurrectionHandler.ts
  src\features\combat\errors\combat-error.ts
  src\features\combat\errors\combat-failure.ts
  src\features\combat\errors\result.ts
  src\features\combat\event-bus\EventBus.ts
  src\features\combat\event-bus\index.ts
  src\features\combat\event-bus\models\combat-event-map.ts
  src\features\combat\event-bus\models\event-payload.ts
  src\features\combat\logger\combat-log-entry.ts
  src\features\combat\logger\EventLogger.ts
  src\features\combat\resource-registry\index.ts
  src\features\combat\resource-registry\InMemoryResourceRegistry.ts
  src\features\combat\resource-registry\resource-registry.ts
  src\features\combat\shared\interfaces\entity.interface.ts
  src\features\combat\shared\models\index.ts
  src\features\combat\shared\models\snapshot.model.ts
  src\features\combat\shared\utils\CharacterAccessor.ts
  src\features\combat\shared\utils\CombatRandomGenerator.ts
  src\features\combat\shared\utils\TypeGuardUtil.ts
  src\features\combat\snapshot\index.ts
  src\features\combat\snapshot\SnapshotCollector.ts
  src\features\combat\tick\ticker.driver.ts
  src\features\combat\ultimate\index.ts
  src\features\combat\ultimate\ultimate-ability.ts
  sr
