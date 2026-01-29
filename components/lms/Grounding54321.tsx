'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle } from 'lucide-react'

const steps = [
  { number: 5, sense: 'See', prompt: 'Name 5 things you can see around you' },
  { number: 4, sense: 'Touch', prompt: 'Name 4 things you can feel or touch' },
  { number: 3, sense: 'Hear', prompt: 'Name 3 things you can hear' },
  { number: 2, sense: 'Smell', prompt: 'Name 2 things you can smell' },
  { number: 1, sense: 'Taste', prompt: 'Name 1 thing you can taste' },
]

export function Grounding54321() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])

  const handleComplete = (stepIndex: number) => {
    if (!completed.includes(stepIndex)) {
      setCompleted([...completed, stepIndex])
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setCompleted([])
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">5-4-3-2-1 Grounding</h3>
        <p className="text-sm text-muted-foreground">
          Connect with your senses to anchor yourself in the present moment
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="text-6xl font-bold text-primary mb-2">
            {currentStepData.number}
          </div>
          <div className="text-xl font-semibold mb-2">
            {currentStepData.sense}
          </div>
          <p className="text-muted-foreground">
            {currentStepData.prompt}
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => handleComplete(currentStep)}
            variant={completed.includes(currentStep) ? 'default' : 'outline'}
            disabled={completed.includes(currentStep)}
          >
            {completed.includes(currentStep) ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completed
              </>
            ) : (
              'I\'ve Done This'
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep
                  ? 'bg-primary'
                  : completed.includes(index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!completed.includes(currentStep)}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline">
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
