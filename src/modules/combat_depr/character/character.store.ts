import { create } from 'zustand'
import type { Character } from './character.model'
interface CharacterStore {
  characters: Map<string, Character>
  registerCharacter: (character: Character) => void
  getCharacter: (id: string) => Character | undefined
  clear: () => void
}
/** 角色註冊表 - 管理戰鬥中所有角色實例的查詢 */
export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: new Map(),
  registerCharacter: (character: Character) =>
    set((state) => {
      const newMap = new Map(state.characters)
      newMap.set(character.id, character)
      return { characters: newMap }
    }),
  getCharacter: (id: string) => get().characters.get(id),
  clear: () => set({ characters: new Map() }),
}))
