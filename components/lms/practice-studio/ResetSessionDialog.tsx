'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type ResetSessionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  personaName: string
  onConfirm: () => void
  loading?: boolean
  mode: 'reset' | 'switch'
  nextPersonaName?: string
}

export function ResetSessionDialog({
  open,
  onOpenChange,
  personaName,
  onConfirm,
  loading,
  mode,
  nextPersonaName,
}: ResetSessionDialogProps) {
  const isSwitch = mode === 'switch'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSwitch ? `Switch to ${nextPersonaName}?` : 'Reset this practice session?'}
          </DialogTitle>
          <DialogDescription className="space-y-2 text-sm leading-relaxed">
            {isSwitch ? (
              <>
                <span className="block">
                  Switching to {nextPersonaName} may replace the active conversation with {personaName} in
                  this workspace.
                </span>
                <span className="block">
                  Saved history for {personaName} remains available when you return, if session persistence
                  is enabled. Unsaved local-only messages may not carry over.
                </span>
              </>
            ) : (
              <>
                <span className="block">
                  This ends the active session with {personaName} and clears the conversation in this
                  workspace so you can begin again.
                </span>
                <span className="block">The previous session will be marked inactive.</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isSwitch ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={loading}
          >
            {isSwitch ? 'Switch Client' : 'Reset session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
