'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  BookOpen,
  HeartHandshake,
  Sparkles,
  Sprout,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { SITE_CONFIG } from '@/lib/brand/site-config'
import styles from './growth-orbit-visual.module.css'

type FeatureTone = 'teal' | 'violet'

type Feature = {
  id: 'learn' | 'reflect' | 'practise' | 'connect'
  title: string
  description: string
  icon: LucideIcon
  tone: FeatureTone
  positionClass: string
}

const FEATURES: readonly Feature[] = [
  {
    id: 'learn',
    title: 'Learn',
    description: 'Build knowledge with clarity.',
    icon: BookOpen,
    tone: 'teal',
    positionClass: styles.featureLearn,
  },
  {
    id: 'reflect',
    title: 'Reflect',
    description: 'Pause. Review. Grow deeper.',
    icon: Sparkles,
    tone: 'violet',
    positionClass: styles.featureReflect,
  },
  {
    id: 'practise',
    title: 'Practise',
    description: 'Apply with purpose. Strengthen skills.',
    icon: HeartHandshake,
    tone: 'teal',
    positionClass: styles.featurePractise,
  },
  {
    id: 'connect',
    title: 'Connect',
    description: 'Share. Collaborate. Learn together.',
    icon: Users,
    tone: 'violet',
    positionClass: styles.featureConnect,
  },
] as const

const SPARKS = [
  { top: '18%', left: '22%' },
  { top: '28%', left: '78%' },
  { top: '42%', left: '12%' },
  { top: '55%', left: '86%' },
  { top: '68%', left: '24%' },
  { top: '74%', left: '70%' },
  { top: '34%', left: '48%' },
  { top: '62%', left: '52%' },
  { top: '20%', left: '58%' },
  { top: '80%', left: '42%' },
] as const

function toneClass(tone: FeatureTone) {
  return tone === 'teal' ? styles.featureTeal : styles.featureViolet
}

function OrbitRings() {
  return (
    <svg
      className={`${styles.orbitSvg} ${styles.orbitDrift}`}
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="govOrbitTeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(94 234 212 / 0.55)" />
          <stop offset="50%" stopColor="rgb(104 196 184 / 0.15)" />
          <stop offset="100%" stopColor="rgb(167 139 250 / 0.4)" />
        </linearGradient>
        <linearGradient id="govOrbitSoft" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(196 181 253 / 0.45)" />
          <stop offset="100%" stopColor="rgb(153 246 228 / 0.25)" />
        </linearGradient>
      </defs>
      <ellipse
        cx="200"
        cy="200"
        rx="168"
        ry="108"
        stroke="url(#govOrbitTeal)"
        strokeWidth="1"
        transform="rotate(-18 200 200)"
        opacity="0.75"
      />
      <ellipse
        cx="200"
        cy="200"
        rx="128"
        ry="156"
        stroke="url(#govOrbitSoft)"
        strokeWidth="1"
        transform="rotate(28 200 200)"
        opacity="0.55"
      />
      <circle
        cx="200"
        cy="200"
        r="118"
        stroke="rgb(255 255 255 / 0.12)"
        strokeWidth="1"
        strokeDasharray="3 10"
      />
      <circle
        className={styles.nodeTravel}
        cx="200"
        cy="200"
        r="142"
        stroke="rgb(157 226 216 / 0.35)"
        strokeWidth="1.25"
        strokeDasharray="2 46"
      />
      <circle cx="318" cy="132" r="2.4" fill="rgb(157 226 216 / 0.9)" />
      <circle cx="92" cy="248" r="2" fill="rgb(196 181 253 / 0.85)" />
      <circle cx="268" cy="292" r="1.8" fill="rgb(255 255 255 / 0.7)" />
      <circle cx="140" cy="118" r="1.6" fill="rgb(94 234 212 / 0.8)" />
    </svg>
  )
}

function GrowthOrb() {
  return (
    <div className={styles.orbShell}>
      <div className={styles.orbStack} aria-hidden="true">
        <div className={`${styles.ribbon} ${styles.ribbonOuter}`} />
        <div className={`${styles.ribbon} ${styles.ribbonA}`} />
        <div className={`${styles.ribbon} ${styles.ribbonB}`} />
        <div className={`${styles.ribbon} ${styles.ribbonC}`}>
          <span className={styles.orbHighlight} />
        </div>
      </div>
      <div className={styles.orbCore}>
        <span className={styles.kicker}>Helping Tribe Academy</span>
        <strong className={styles.headline}>Grow with care.</strong>
        <span className={styles.subline}>Learn with structure.</span>
      </div>
    </div>
  )
}

/**
 * One card per feature, rendered once. The mobile chip grid and the floating
 * desktop cards are the same DOM node — only the CSS layout differs, so the
 * copy is not duplicated for search engines or assistive tech.
 */
function FeatureNode({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  return (
    <div className={`${styles.featureCard} ${toneClass(feature.tone)} ${feature.positionClass}`}>
      <div className={styles.featureTop}>
        <span className={styles.featureIcon}>
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className={styles.featureTitle}>{feature.title}</span>
      </div>
      <span className={styles.featureDesc}>{feature.description}</span>
    </div>
  )
}

function JourneyPill() {
  return (
    <p className={styles.journeyPill}>
      <span className={styles.journeyIcon} aria-hidden="true">
        <Sprout className="size-3.5" />
      </span>
      <span className={styles.journeyText}>
        A nine-week journey from knowledge to supported practice.
      </span>
    </p>
  )
}

export function GrowthOrbitVisual() {
  const stageRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [motionReady, setMotionReady] = useState(false)

  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setReduceMotion(motionMq.matches)
    syncMotion()
    setMotionReady(true)
    motionMq.addEventListener('change', syncMotion)

    const node = stageRef.current
    let observer: IntersectionObserver | undefined

    if (node) {
      observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting)
          if (entry.isIntersecting) setRevealed(true)
        },
        { threshold: 0.15, rootMargin: '48px' },
      )
      observer.observe(node)
    } else {
      setInView(true)
      setRevealed(true)
    }

    return () => {
      motionMq.removeEventListener('change', syncMotion)
      observer?.disconnect()
    }
  }, [])

  const shouldAnimate = motionReady && inView && !reduceMotion
  const academyLabel = SITE_CONFIG.organisation.shortName

  const resetPointerDepth = () => {
    const stage = stageRef.current
    if (!stage) return
    stage.style.setProperty('--gov-rotate-x', '0deg')
    stage.style.setProperty('--gov-rotate-y', '0deg')
    stage.style.setProperty('--gov-pointer-x', '50%')
    stage.style.setProperty('--gov-pointer-y', '45%')
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    const rotateX = (0.5 - y) * 7
    const rotateY = (x - 0.5) * 9

    event.currentTarget.style.setProperty('--gov-rotate-x', `${rotateX.toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--gov-rotate-y', `${rotateY.toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--gov-pointer-x', `${(x * 100).toFixed(1)}%`)
    event.currentTarget.style.setProperty('--gov-pointer-y', `${(y * 100).toFixed(1)}%`)
  }

  return (
    <figure
      ref={stageRef}
      className={styles.stage}
      data-animate={shouldAnimate ? 'true' : 'false'}
      data-revealed={revealed ? 'true' : 'false'}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerDepth}
      role="img"
      aria-label={`${academyLabel} learning journey: Learn, Reflect, Practise and Connect.`}
    >
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={styles.glowTeal} />
        <span className={styles.glowViolet} />
        <span className={styles.glowCore} />
      </div>
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.sparkField} aria-hidden="true">
        {SPARKS.map((spark, index) => (
          <span
            key={index}
            className={styles.spark}
            style={{ top: spark.top, left: spark.left }}
          />
        ))}
      </div>

      <div className={styles.orbStage}>
        <OrbitRings />
        <GrowthOrb />
      </div>

      <div className={styles.features} aria-hidden="true">
        {FEATURES.map((feature) => (
          <FeatureNode key={feature.id} feature={feature} />
        ))}
      </div>

      <JourneyPill />
    </figure>
  )
}
