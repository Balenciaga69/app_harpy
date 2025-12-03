# Combat Implementation Module

> Concrete implementations of combat entities (equipment, relics, ultimates, effects)

## Structure

```
combat-impl/
├── equipment/        # Equipment implementations
├── relics/           # Relic implementations
├── ultimates/        # Ultimate ability implementations
├── effects/          # Effect implementations
└── examples/         # Combat examples and demos
```

## Purpose

This module contains all concrete implementations, while the `combat` module only defines interfaces and core framework.

**Benefits**:

- Reduces token usage for AI code analysis
- Clear separation of framework vs content
- Easier to extend with DLCs or mods
- Better testability

## Usage

```typescript
import { Stormblade, PoisonVial } from '@/modules/combat-impl/equipment'
import { BloodPactUltimate } from '@/modules/combat-impl/ultimates'
import { PoisonEffect } from '@/modules/combat-impl/effects'
```
