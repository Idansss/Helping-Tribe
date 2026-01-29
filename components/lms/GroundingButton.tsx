'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Heart, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BreathingExercise } from './BreathingExercise'
import { Grounding54321 } from './Grounding54321'
import { SafePlaceVisualization } from './SafePlaceVisualization'

export function GroundingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<'breathing' | '54321' | 'safe_place' | null>(null)
  const supabase = createClient()

  const handleOpen = () => {
    setIsOpen(true)
    // Track usage
    trackUsage('breathing') // Default to breathing
  }

  const trackUsage = async (toolType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('grounding_tool_usage')
        .insert({
          user_id: user.id,
          tool_type: toolType,
        })
    } catch (error) {
      console.error('Error tracking grounding tool usage:', error)
    }
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        variant="default"
        aria-label="I feel overwhelmed - Get help"
      >
        <Heart className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              You're Safe Here
            </DialogTitle>
            <DialogDescription>
              Take a moment to ground yourself. Choose a tool that feels right for you.
            </DialogDescription>
          </DialogHeader>

          {!selectedTool ? (
            <div className="space-y-3 py-4">
              <Button
                onClick={() => {
                  setSelectedTool('breathing')
                  trackUsage('breathing')
                }}
                variant="outline"
                className="w-full justify-start h-auto py-4"
              >
                <div className="text-left">
                  <div className="font-semibold">4-7-8 Breathing</div>
                  <div className="text-sm text-muted-foreground">
                    Calm your nervous system with guided breathing
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => {
                  setSelectedTool('54321')
                  trackUsage('54321')
                }}
                variant="outline"
                className="w-full justify-start h-auto py-4"
              >
                <div className="text-left">
                  <div className="font-semibold">5-4-3-2-1 Grounding</div>
                  <div className="text-sm text-muted-foreground">
                    Connect with your senses to anchor yourself
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => {
                  setSelectedTool('safe_place')
                  trackUsage('safe_place')
                }}
                variant="outline"
                className="w-full justify-start h-auto py-4"
              >
                <div className="text-left">
                  <div className="font-semibold">Safe Place Visualization</div>
                  <div className="text-sm text-muted-foreground">
                    Imagine a peaceful place where you feel secure
                  </div>
                </div>
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  If you're in crisis, please reach out to a trusted person or professional.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <Button
                onClick={() => setSelectedTool(null)}
                variant="ghost"
                size="sm"
                className="mb-4"
              >
                <X className="h-4 w-4 mr-2" />
                Back to Tools
              </Button>

              {selectedTool === 'breathing' && <BreathingExercise />}
              {selectedTool === '54321' && <Grounding54321 />}
              {selectedTool === 'safe_place' && <SafePlaceVisualization />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
