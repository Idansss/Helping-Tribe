'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function WhatsAppPreferences() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [receiveQuizScores, setReceiveQuizScores] = useState(false)
  const [receiveStudyReminders, setReceiveStudyReminders] = useState(false)
  const [receiveAssignmentReminders, setReceiveAssignmentReminders] = useState(false)
  const [receiveWeeklyDigest, setReceiveWeeklyDigest] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('whatsapp_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setPhoneNumber(data.phone_number || '')
        setIsEnabled(data.is_enabled || false)
        setReceiveQuizScores(data.receive_quiz_scores || false)
        setReceiveStudyReminders(data.receive_study_reminders || false)
        setReceiveAssignmentReminders(data.receive_assignment_reminders || false)
        setReceiveWeeklyDigest(data.receive_weekly_digest || false)
      }
    } catch (error) {
      console.error('Error loading WhatsApp preferences:', error)
    }
  }

  const savePreferences = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your WhatsApp number')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Format phone number (E.164 format)
      const formattedNumber = formatPhoneNumber(phoneNumber)

      const { error } = await supabase
        .from('whatsapp_preferences')
        .upsert({
          user_id: user.id,
          phone_number: formattedNumber,
          is_enabled: isEnabled,
          receive_quiz_scores: receiveQuizScores,
          receive_study_reminders: receiveStudyReminders,
          receive_assignment_reminders: receiveAssignmentReminders,
          receive_weekly_digest: receiveWeeklyDigest,
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      toast.success('WhatsApp preferences saved!')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (number: string): string => {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '')
    
    // If starts with 0, replace with country code (assuming Nigeria +234)
    if (digits.startsWith('0')) {
      return `+234${digits.substring(1)}`
    }
    
    // If doesn't start with +, add it
    if (!digits.startsWith('234')) {
      return `+234${digits}`
    }
    
    return `+${digits}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          WhatsApp Notifications
        </CardTitle>
        <CardDescription>
          Receive reminders and updates via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="08012345678 or +2348012345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Include country code (e.g., +234 for Nigeria)
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enable-whatsapp">Enable WhatsApp Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Turn on to receive messages via WhatsApp
            </p>
          </div>
          <Switch
            id="enable-whatsapp"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        {isEnabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiz-scores">Quiz Scores</Label>
                <p className="text-xs text-muted-foreground">
                  Get your quiz results via WhatsApp
                </p>
              </div>
              <Switch
                id="quiz-scores"
                checked={receiveQuizScores}
                onCheckedChange={setReceiveQuizScores}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="study-reminders">Study Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Daily reminders to continue learning
                </p>
              </div>
              <Switch
                id="study-reminders"
                checked={receiveStudyReminders}
                onCheckedChange={setReceiveStudyReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="assignment-reminders">Assignment Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Reminders before assignment due dates
                </p>
              </div>
              <Switch
                id="assignment-reminders"
                checked={receiveAssignmentReminders}
                onCheckedChange={setReceiveAssignmentReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-xs text-muted-foreground">
                  Weekly summary of your progress
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={receiveWeeklyDigest}
                onCheckedChange={setReceiveWeeklyDigest}
              />
            </div>
          </div>
        )}

        <Button
          onClick={savePreferences}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
