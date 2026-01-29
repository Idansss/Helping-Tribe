'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VoiceNoteRecorderProps {
  moduleId?: string
  reflectionType?: string
  onSave?: (voiceNoteId: string) => void
}

export function VoiceNoteRecorder({ moduleId, reflectionType = 'general', onSave }: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setDuration(0)
    setIsPlaying(false)
  }

  const uploadRecording = async () => {
    if (!audioBlob) return

    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const fileName = `voice-notes/${user.id}/${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('voice-notes')
        .getPublicUrl(fileName)

      // Save to database
      const { data: voiceNote, error: dbError } = await supabase
        .from('voice_notes')
        .insert({
          user_id: user.id,
          module_id: moduleId || null,
          title: title || `Voice Note ${new Date().toLocaleDateString()}`,
          audio_url: urlData.publicUrl,
          duration_seconds: duration,
          reflection_type: moduleId ? 'module_reflection' : 'free_form'
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Cleanup
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      setAudioUrl(null)
      setAudioBlob(null)
      setTitle('')
      setDuration(0)

      if (onSave) {
        onSave(voiceNote.id)
      }

      alert('Voice note saved successfully!')
    } catch (error) {
      console.error('Error uploading voice note:', error)
      alert('Failed to save voice note. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Note Reflection</CardTitle>
        <CardDescription>
          Record a 2-minute voice note reflecting on this module
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!audioUrl ? (
          <>
            <div className="text-center py-8">
              {isRecording ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatDuration(duration)}</p>
                    <p className="text-sm text-muted-foreground">Recording...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Click to start recording</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-2">
              {!isRecording ? (
                <Button onClick={startRecording} size="lg">
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" size="lg">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Module 1 Reflection"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center justify-center gap-4 py-4">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <Button onClick={playRecording} variant="outline">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {formatDuration(duration)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={uploadRecording}
                disabled={isUploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Saving...' : 'Save Voice Note'}
              </Button>
              <Button
                onClick={deleteRecording}
                variant="outline"
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
