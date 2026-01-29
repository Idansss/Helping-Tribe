'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, BookOpen, HeartHandshake, Laptop } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Education & Training',
    description:
      'Certificate courses, CPD workshops & webinars, and confidential case review circles that deepen your counseling practice.',
  },
  {
    icon: HeartHandshake,
    title: 'Community Programs',
    description:
      'Mobile mental health clinics, collaborative research projects, and advocacy campaigns that take support into communities.',
  },
  {
    icon: Users,
    title: 'Mentorship & Support',
    description:
      '1‑on‑1 career guidance and group supervision sessions so you are never practising in isolation.',
  },
  {
    icon: Laptop,
    title: 'Digital Resources',
    description:
      'Mental health talks podcast, resource library, and therapy toolkit to keep learning accessible anytime.',
  },
] as const

export function TribeExperienceSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4c1d95] mb-4">
            What We Offer
          </h2>
          <p className="text-lg text-gray-700">
            A full ecosystem for growing, supported helping professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border-2 border-[#f3e8ff] hover:border-[#4c1d95] transition-colors"
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-[#f3e8ff] flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-[#4c1d95]" />
                  </div>
                  <CardTitle className="text-xl text-[#4c1d95]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
