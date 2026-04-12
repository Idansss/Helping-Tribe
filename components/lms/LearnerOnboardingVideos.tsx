'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLearnerOnboardingVideos } from '@/lib/hooks/useLearnerOnboardingVideos'
import type { LearnerOnboardingVideo } from '@/lib/settings/learner-onboarding'
import { ExternalLink, Play } from 'lucide-react'

type LearnerOnboardingVideosProps = {
  title?: string
  description?: string
}

function resolveVideoEmbed(urlString: string) {
  try {
    const url = new URL(urlString)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const pathname = url.pathname

    if (/\.((mp4)|(webm)|(ogg))$/i.test(pathname)) {
      return { kind: 'video' as const, src: url.toString() }
    }

    if (host === 'youtu.be') {
      const videoId = pathname.replace(/^\/+/, '')
      if (videoId) {
        return {
          kind: 'iframe' as const,
          src: `https://www.youtube.com/embed/${videoId}`,
        }
      }
    }

    if (host.endsWith('youtube.com')) {
      const embedId = pathname.startsWith('/embed/')
        ? pathname.replace('/embed/', '')
        : url.searchParams.get('v')
      if (embedId) {
        return {
          kind: 'iframe' as const,
          src: `https://www.youtube.com/embed/${embedId}`,
        }
      }
    }

    if (host === 'vimeo.com') {
      const videoId = pathname.replace(/^\/+/, '')
      if (videoId) {
        return {
          kind: 'iframe' as const,
          src: `https://player.vimeo.com/video/${videoId}`,
        }
      }
    }

    if (host === 'player.vimeo.com') {
      return { kind: 'iframe' as const, src: url.toString() }
    }

    return { kind: 'external' as const, src: url.toString() }
  } catch {
    return { kind: 'external' as const, src: urlString }
  }
}

function VideoCard({
  badgeLabel,
  video,
}: {
  badgeLabel: string
  video: LearnerOnboardingVideo
}) {
  const embed = resolveVideoEmbed(video.url)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              {badgeLabel}
            </Badge>
          </div>
          <h3 className="text-base font-semibold text-slate-900">{video.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{video.description}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        {embed.kind === 'video' ? (
          <video
            controls
            preload="metadata"
            className="aspect-video h-full w-full bg-black"
            src={embed.src}
          />
        ) : embed.kind === 'iframe' ? (
          <iframe
            src={embed.src}
            title={video.title}
            className="aspect-video h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
            <Play className="h-8 w-8 text-teal-600" />
            <p className="max-w-sm text-sm text-slate-600">
              This video provider cannot be embedded directly here. Open it in a new tab.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Button asChild variant="outline" size="sm" className="text-xs">
          <a href={video.url} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Open video
          </a>
        </Button>
      </div>
    </div>
  )
}

export function LearnerOnboardingVideos({
  title = 'Start here',
  description = 'Watch these short onboarding videos before you continue with the portal and weekly activities.',
}: LearnerOnboardingVideosProps) {
  const { loading, settings } = useLearnerOnboardingVideos()
  const videos = [
    settings.welcomeVideo
      ? { badgeLabel: 'Welcome', video: settings.welcomeVideo }
      : null,
    settings.portalGuideVideo
      ? { badgeLabel: 'Portal guide', video: settings.portalGuideVideo }
      : null,
  ].filter(
    (
      value
    ): value is {
      badgeLabel: string
      video: LearnerOnboardingVideo
    } => Boolean(value)
  )

  if (loading || videos.length === 0) {
    return null
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {videos.map(({ badgeLabel, video }) => (
            <VideoCard
              key={badgeLabel}
              badgeLabel={badgeLabel}
              video={video}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
