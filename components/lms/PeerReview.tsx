'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Star,
  ThumbsUp,
  MessageCircle,
  Send,
  CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface PeerReviewProps {
  assignmentId: string
  submissionId: string
  onReviewSubmitted?: () => void
}

interface Review {
  id: string
  reviewer_name: string
  rating: number
  strengths: string
  improvements: string
  created_at: string
}

export function PeerReview({ assignmentId, submissionId, onReviewSubmitted }: PeerReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isReviewing, setIsReviewing] = useState(false)
  const [rating, setRating] = useState(0)
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadReviews()
  }, [submissionId])

  async function loadReviews() {
    try {
      const { data } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id(full_name)
        `)
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })

      if (data) {
        setReviews(data.map((review: any) => ({
          id: review.id,
          reviewer_name: review.reviewer?.full_name || 'Anonymous',
          rating: review.rating,
          strengths: review.strengths,
          improvements: review.improvements,
          created_at: review.created_at,
        })))
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  async function handleSubmitReview() {
    if (rating === 0 || !strengths || !improvements) {
      alert('Please complete all fields')
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('peer_reviews')
        .insert({
          submission_id: submissionId,
          reviewer_id: user.id,
          rating,
          strengths,
          improvements,
        })

      if (error) throw error

      // Reset form
      setRating(0)
      setStrengths('')
      setImprovements('')
      setIsReviewing(false)
      
      // Reload reviews
      loadReviews()
      onReviewSubmitted?.()
    } catch (error: any) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-[#4c1d95]" />
          <h3 className="text-xl font-bold text-[#4c1d95]">Peer Reviews</h3>
        </div>
        {!isReviewing && (
          <Button
            onClick={() => setIsReviewing(true)}
            className="bg-[#4c1d95] hover:bg-[#5b21b6]"
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Leave a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {isReviewing && (
        <Card className="p-6 border-2 border-[#4c1d95]">
          <h4 className="font-semibold text-gray-900 mb-4">Share Your Feedback</h4>
          
          {/* Rating */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Overall Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8",
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              What did they do well? 💪
            </label>
            <Textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Be specific about what worked well in their submission..."
              className="min-h-[100px]"
            />
          </div>

          {/* Improvements */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              What could be improved? 🎯
            </label>
            <Textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Constructive suggestions for improvement..."
              className="min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || rating === 0 || !strengths || !improvements}
              className="bg-[#4c1d95] hover:bg-[#5b21b6] flex-1"
            >
              {submitting ? 'Submitting...' : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsReviewing(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Existing Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Reviews from Peers ({reviews.length})</h4>
          {reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">✓ Strengths:</p>
                  <p className="text-sm text-gray-700">{review.strengths}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">→ Suggestions:</p>
                  <p className="text-sm text-gray-700">{review.improvements}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reviews.length === 0 && !isReviewing && (
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet. Be the first to provide feedback!</p>
        </Card>
      )}
    </div>
  )
}
