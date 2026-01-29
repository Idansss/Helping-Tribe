'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useLowData } from '@/lib/contexts/LowDataContext'
import { WifiOff } from 'lucide-react'

export function LowDataToggle() {
  const { isLowData, toggleLowData } = useLowData()

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[color-mix(in_srgb,var(--talent-primary)_16%,transparent)]">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-teal-100" />
        <Label htmlFor="low-data-mode" className="text-sm cursor-pointer text-white font-medium">
          Data Saver
        </Label>
      </div>
      <Switch
        id="low-data-mode"
        checked={isLowData}
        onCheckedChange={toggleLowData}
      />
    </div>
  )
}
