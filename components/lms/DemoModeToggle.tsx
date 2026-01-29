'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Info } from 'lucide-react'

export function DemoModeToggle() {
  const [isDemoMode, setIsDemoMode] = useState(false)

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-white/70" />
        <Label htmlFor="demo-mode" className="text-sm cursor-pointer text-white/90 font-medium">
          Demo mode
        </Label>
      </div>
      <Switch
        id="demo-mode"
        checked={isDemoMode}
        onCheckedChange={setIsDemoMode}
      />
    </div>
  )
}
