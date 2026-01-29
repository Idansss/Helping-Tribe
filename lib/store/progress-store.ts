import { create } from 'zustand'
import { ModuleProgress, Module } from '@/types'

interface ProgressState {
  modules: Module[]
  moduleProgresses: ModuleProgress[]
  currentModule: number | null
  setModules: (modules: Module[]) => void
  setModuleProgresses: (progresses: ModuleProgress[]) => void
  updateModuleProgress: (moduleId: string, progress: Partial<ModuleProgress>) => void
  getCompletionPercentage: () => number
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  modules: [],
  moduleProgresses: [],
  currentModule: null,
  
  setModules: (modules) => set({ modules }),
  
  setModuleProgresses: (progresses) => set({ moduleProgresses: progresses }),
  
  updateModuleProgress: (moduleId, progress) => {
    const state = get()
    const existingIndex = state.moduleProgresses.findIndex(mp => mp.module_id === moduleId)
    
    if (existingIndex >= 0) {
      const updated = [...state.moduleProgresses]
      updated[existingIndex] = { ...updated[existingIndex], ...progress }
      set({ moduleProgresses: updated })
    } else {
      set({
        moduleProgresses: [...state.moduleProgresses, progress as ModuleProgress]
      })
    }
  },
  
  getCompletionPercentage: () => {
    const state = get()
    const completedCount = state.moduleProgresses.filter(mp => mp.is_completed).length
    return Math.round((completedCount / state.modules.length) * 100)
  },
}))
