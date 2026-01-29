'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

export function BreathingExercise() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    if (!isActive) return

    const phases = [
      { name: 'inhale' as const, duration: 4 },
      { name: 'hold' as const, duration: 7 },
      { name: 'exhale' as const, duration: 8 },
      { name: 'pause' as const, duration: 2 },
    ]

    let currentPhaseIndex = 0
    let currentCountdown = phases[0].duration

    const interval = setInterval(() => {
      currentCountdown--

      if (currentCountdown <= 0) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length
        currentCountdown = phases[currentPhaseIndex].duration
      }

      setPhase(phases[currentPhaseIndex].name)
      setCountdown(currentCountdown)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In'
      case 'hold':
        return 'Hold'
      case 'exhale':
        return 'Breathe Out'
      case 'pause':
        return 'Pause'
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'bg-purple-500'
      case 'hold':
        return 'bg-purple-500'
      case 'exhale':
        return 'bg-green-500'
      case 'pause':
        return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">4-7-8 Breathing</h3>
        <p className="text-sm text-muted-foreground">
          Inhale for 4, Hold for 7, Exhale for 8
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div
          className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000 ${getPhaseColor()} ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
        >
          <div className="text-white text-center">
            <div className="text-4xl font-bold">{countdown}</div>
            <div className="text-lg mt-2">{getPhaseText()}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {!isActive ? (
          <Button onClick={() => setIsActive(true)}>
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        ) : (
          <>
            <Button onClick={() => setIsActive(false)} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button
              onClick={() => {
                setIsActive(false)
                setPhase('inhale')
                setCountdown(4)
              }}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Find a comfortable position</p>
        <p>• Close your eyes if it helps</p>
        <p>• Focus on your breath</p>
      </div>
    </div>
  )
}
