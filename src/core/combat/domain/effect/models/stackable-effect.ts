import type { IEffect } from './effect'
/**
 * Stackable effect interface
 * Used to implement effects with stack mechanics (holy fire, charge, chill, poison, etc.)
 */
export interface IStackableEffect extends IEffect {
  /** Current stacks */
  stacks: number
  /** Maximum stack limit (optional) */
  maxStacks?: number
  /** Add stacks */
  addStacks(amount: number): void
  /** Remove stacks */
  removeStacks(amount: number): void
  /** Set stacks */
  setStacks(amount: number): void
  /** Get current stacks */
  getStacks(): number
}
/**
 * Abstract base class for stackable effects
 * Provides basic implementation of stack management
 * Default cleanseOnRevive is true (status effects should be cleansed)
 */
export abstract class StackableEffect implements IStackableEffect {
  public stacks: number = 0
  public readonly id: string
  public readonly name: string
  public readonly maxStacks?: number
  public readonly cleanseOnRevive: boolean
  constructor(id: string, name: string, maxStacks?: number, cleanseOnRevive: boolean = true) {
    this.id = id
    this.name = name
    this.maxStacks = maxStacks
    this.cleanseOnRevive = cleanseOnRevive
  }
  /** Add stacks */
  addStacks(amount: number): void {
    this.stacks = Math.min(this.stacks + amount, this.maxStacks ?? Infinity)
  }
  /** Remove stacks */
  removeStacks(amount: number): void {
    this.stacks = Math.max(0, this.stacks - amount)
  }
  /** Set stacks */
  setStacks(amount: number): void {
    this.stacks = Math.max(0, Math.min(amount, this.maxStacks ?? Infinity))
  }
  /** Get current stacks */
  getStacks(): number {
    return this.stacks
  }
}
