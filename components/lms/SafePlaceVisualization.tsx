'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function SafePlaceVisualization() {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Find Your Safe Place',
      content: 'Close your eyes and imagine a place where you feel completely safe, calm, and peaceful. It can be real or imaginary.',
    },
    {
      title: 'Notice the Details',
      content: 'What do you see? What colors, shapes, and objects are there? Take your time to notice every detail.',
    },
    {
      title: 'Engage Your Senses',
      content: 'What sounds do you hear? What do you smell? What can you feel? Make this place as real as possible.',
    },
    {
      title: 'Feel the Safety',
      content: 'Notice how your body feels in this safe place. Feel the calm, the peace, the security. You are safe here.',
    },
    {
      title: 'Anchor This Feeling',
      content: 'Take a deep breath and know that you can return to this safe place anytime you need to. It\'s always here for you.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Safe Place Visualization</h3>
        <p className="text-sm text-muted-foreground">
          Create a mental sanctuary where you feel secure
        </p>
      </div>

      <div className="py-8">
        <div className="text-center mb-6">
          <Sparkles className="h-16 w-16 mx-auto text-primary mb-4" />
          <h4 className="text-xl font-semibold mb-2">
            {steps[step].title}
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            {steps[step].content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            onClick={() => setStep(Math.max(0, step - 1))}
            variant="outline"
            disabled={step === 0}
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === step ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <Button
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
          >
            {step === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
