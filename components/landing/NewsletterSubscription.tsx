'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Check } from 'lucide-react'

const SUBSCRIBERS_STORAGE_KEY = 'ht-newsletter-subscribers'

export function NewsletterSubscription() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
      return
    }

    try {
      // Load existing subscribers
      const existingRaw = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY)
      const existing: Array<{ id: string; email: string; subscribedAt: string }> = existingRaw
        ? JSON.parse(existingRaw)
        : []

      // Check if email already exists
      if (existing.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
        setStatus('error')
        setMessage('This email is already subscribed.')
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 3000)
        return
      }

      // Add new subscriber
      const newSubscriber = {
        id: `sub-${Date.now()}`,
        email: email.trim(),
        subscribedAt: new Date().toISOString(),
      }

      const updated = [newSubscriber, ...existing]
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(updated))

      setStatus('success')
      setMessage('Thank you for subscribing!')
      setEmail('')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold mb-2 text-white">Newsletter</h3>
        <p className="text-sm text-white/80">
          Stay updated with the latest counseling training resources and community updates.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
            required
          />
        </div>
        <Button
          type="submit"
          className="bg-white text-[#4c1d95] hover:bg-slate-100 font-semibold whitespace-nowrap"
        >
          {status === 'success' ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Subscribed
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </form>
      {message && (
        <p
          className={`text-xs ${
            status === 'success'
              ? 'text-emerald-300'
              : status === 'error'
              ? 'text-red-300'
              : 'text-white/80'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
