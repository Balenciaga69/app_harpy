# PowerShell script to update import statements after renaming interface files

$renameMap = @{
   'attribute-owner'    = 'IAttributeOwner'
   'character'          = 'ICharacter'
   'effect-owner'       = 'IEffectOwner'
   'ultimate-owner'     = 'IUltimateOwner'
   'character-stats'    = 'CharacterStats'
   'combat-config'      = 'CombatConfig'
   'combat-outcome'     = 'CombatOutcome'
   'combat-result-data' = 'CombatResultData'
   'combat-result'      = 'CombatResult'
   'combat-snapshot'    = 'CombatSnapshot'
   'combat-statistics'  = 'CombatStatistics'
   'battle-state'       = 'IBattleState'
   'combat-context'     = 'ICombatContext'
   'combat-hook'        = 'ICombatHook'
   'damage-event'       = 'DamageEvent'
   'damage-step'        = 'IDamageStep'
   'CombatFailure'      = 'FailureCode'  # Note: This might be wrong, but based on script
   'EventPayload'       = 'CombatStartPayload'  # Note: This might be wrong
   'combat-log-entry'   = 'CombatLogEntry'
   'resource-registry'  = 'IResourceRegistry'
   'entity.interface'   = 'IEntity'
   'snapshot.model'     = 'CharacterSnapshot'
   'target-selector'    = 'ITargetSelector'
   'tick-phase'         = 'ITickPhase'
   'IIUltimateManager'  = 'IUltimateManager'
}

function Update-Imports {
   param ([string]$filePath)
    
   $content = Get-Content $filePath -Raw
   $updated = $false
    
   foreach ($oldName in $renameMap.Keys) {
      $newName = $renameMap[$oldName]
      # Replace import paths like './oldName' to './newName'
      $pattern = "'\./$oldName'"
      $replacement = "'./$newName'"
      if ($content -match $pattern) {
         $content = $content -replace $pattern, $replacement
         $updated = $true
      }
      # Also handle double quotes
      $pattern = '"\./$oldName"'
      $replacement = '"./$newName"'
      if ($content -match $pattern) {
         $content = $content -replace $pattern, $replacement
         $updated = $true
      }
   }
    
   if ($updated) {
      Set-Content -Path $filePath -Value $content
      Write-Host "Updated imports in $filePath"
   }
}

Get-ChildItem -Path "src/features/combat/interfaces" -Recurse -Filter "*.ts" | ForEach-Object {
   Update-Imports -filePath $_.FullName
}