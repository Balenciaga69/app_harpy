import { create } from 'zustand'
import { combatRandom } from '../shared/utils/random.util'
interface CombatStatusStore {
  winnerId: string | null
  setWinnerId: (id: string | null) => void
  isCombatOver: boolean
  setIsCombatOver: (status: boolean) => void
  currentTick: number
  incrementTick: () => void
  seed: string
  setSeed: (seed: string | number) => void
  resetWithSeed: (seed?: string | number) => void
}
export const useCombatStatusStore = create<CombatStatusStore>((set) => ({
  winnerId: null,
  setWinnerId: (id: string | null) => set({ winnerId: id }),
  isCombatOver: false,
  setIsCombatOver: (status: boolean) => set({ isCombatOver: status }),
  currentTick: 0,
  incrementTick: () => set((state) => ({ currentTick: state.currentTick + 1 })),
  seed: String(Date.now()),
  setSeed: (seed: string | number) => {
    const seedStr = String(seed)
    combatRandom.reset(seedStr)
    set({ seed: seedStr })
  },
  resetWithSeed: (seed?: string | number) => {
    const newSeed = seed ? String(seed) : String(Date.now())
    combatRandom.reset(newSeed)
    set({
      winnerId: null,
      isCombatOver: false,
      currentTick: 0,
      seed: newSeed,
    })
  },
}))
