import { ModuleProgress, Module } from '@/types'

/**
 * Calculate overall course completion percentage
 */
export function calculateCompletionPercentage(
  moduleProgresses: ModuleProgress[],
  totalModules: number = 9
): number {
  const completedCount = moduleProgresses.filter(mp => mp.is_completed).length
  return Math.round((completedCount / totalModules) * 100)
}

/**
 * Determine which module should be unlocked next
 */
export function getNextUnlockedModule(
  modules: Module[],
  moduleProgresses: ModuleProgress[]
): number | null {
  // Module 1 is always unlocked
  if (modules.length === 0) return null
  
  // Check if Module 1 is completed
  const module1Progress = moduleProgresses.find(mp => {
    const module = modules.find(m => m.id === mp.module_id)
    return module?.week_number === 1
  })
  
  if (!module1Progress || !module1Progress.is_completed) {
    return 1
  }

  // Find the first incomplete module
  for (let week = 1; week <= 9; week++) {
    const module = modules.find(m => m.week_number === week)
    if (!module) continue

    const progress = moduleProgresses.find(mp => mp.module_id === module.id)
    
    if (!progress || !progress.is_completed) {
      return week
    }
  }

  return null // All modules completed
}

/**
 * Check if a module is unlocked based on sequential completion
 */
export function isModuleUnlocked(
  module: Module,
  modules: Module[],
  moduleProgresses: ModuleProgress[]
): boolean {
  // Module 1 is always unlocked
  if (module.week_number === 1) return true

  // Previous module must be completed
  const previousModule = modules.find(m => m.week_number === module.week_number - 1)
  if (!previousModule) return false

  const previousProgress = moduleProgresses.find(mp => mp.module_id === previousModule.id)
  return previousProgress?.is_completed ?? false
}
